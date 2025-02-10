/* eslint-disable testing-library/no-container */
/* eslint-disable testing-library/no-node-access */
/* eslint-disable testing-library/prefer-find-by */
/* eslint-disable testing-library/no-wait-for-multiple-assertions */
// src/components/__tests__/InventoryList.test.js

import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  configure,
  within,
} from '@testing-library/react';
import InventoryList from '../InventoryList';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import '@testing-library/jest-dom';

configure({ transitionDuration: 0 });

// Mocks dos componentes filhos
jest.mock('../TransactionForm', () => ({
  open,
  onClose,
  type,
  products,
  onSave,
  setSnackbar,
}) => (
  <div data-testid="transaction-form">
    <button onClick={() => onSave({ type, productId: 101, quantity: 5 })}>
      Salvar Transação
    </button>
    <button onClick={onClose}>Fechar Transação</button>
  </div>
));

jest.mock('../ReturnExchangeForm', () => ({
  open,
  onClose,
  transactions,
  products,
  onSave,
  setSnackbar,
}) => (
  <div data-testid="return-exchange-form">
    <button onClick={() => onSave({ type: 'return', productId: 1, quantity: 2 })}>
      Salvar Troca/Devolução
    </button>
    <button onClick={onClose}>Fechar Troca/Devolução</button>
  </div>
));

jest.mock('../../utils/formatMoneyToFloat', () => ({
  formatMoneyToFloat: jest.fn((money) => parseFloat(money)),
}));

describe('InventoryList Component', () => {
  let mockAxios;

  beforeAll(() => {
    mockAxios = new MockAdapter(axios);
  });

  afterEach(() => {
    mockAxios.reset();
    jest.clearAllMocks();
  });

  test('fetches and displays inventory on mount', async () => {
    // Mock das requisições de API
    mockAxios.onGet('/api/get/stock').reply(200, {
      stock: [
        {
          id: 1,
          productId: 101,
          product: {
            name: 'Camisa Polo',
            brand: 'Marca A',
            color: 'Azul',
            size: 'M',
            price: 50.0,
          },
          quantity: 20,
        },
        {
          id: 2,
          productId: 102,
          product: {
            name: 'Calça Jeans',
            brand: 'Marca B',
            color: 'Preto',
            size: 'L',
            price: 80.0,
          },
          quantity: 15,
        },
      ],
    });
    mockAxios.onGet('/api/get/products').reply(200, {
      products: [
        { id: 101, name: 'Camisa Polo', brand: 'Marca A', color: 'Azul', size: 'M', price: 50.0 },
        { id: 102, name: 'Calça Jeans', brand: 'Marca B', color: 'Preto', size: 'L', price: 80.0 },
      ],
    });
    // Para transações, retornamos array vazio
    mockAxios.onGet('/api/get/transactions').reply(200, { transactions: [] });

    render(<InventoryList />);

    await waitFor(() => {
      expect(screen.getByText(/Camisa Polo/i)).toBeInTheDocument();
      expect(screen.getByText(/Calça Jeans/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Código do Produto/i)).toBeInTheDocument();
    expect(screen.getByText(/Quantidade em Estoque/i)).toBeInTheDocument();
  });

  test('displays message when no inventory is present', async () => {
    mockAxios.onGet('/api/get/stock').reply(200, { stock: [] });
    mockAxios.onGet('/api/get/products').reply(200, { products: [] });
    mockAxios.onGet('/api/get/transactions').reply(200, { transactions: [] });

    render(<InventoryList />);

    await waitFor(() => {
      expect(screen.getByText(/Nenhum produto encontrado/i)).toBeInTheDocument();
    });
  });

  test('opens TransactionForm dialog when "Registrar Compra" is clicked', () => {
    render(<InventoryList />);
    fireEvent.click(screen.getByRole('button', { name: /Registrar Compra/i }));
    expect(screen.getByTestId('transaction-form')).toBeInTheDocument();
  });

  test('opens ReturnExchangeForm dialog when "Trocas e Devoluções" is clicked', () => {
    render(<InventoryList />);
    fireEvent.click(screen.getByRole('button', { name: /Trocas e Devoluções/i }));
    expect(screen.getByTestId('return-exchange-form')).toBeInTheDocument();
  });

  test('handles adding a new transaction and updates inventory', async () => {
    // Mock das requisições iniciais
    mockAxios.onGet('/api/get/stock').reply(200, {
      stock: [
        {
          id: 1,
          productId: 101,
          product: {
            name: 'Camisa Polo',
            brand: 'Marca A',
            color: 'Azul',
            size: 'M',
            price: 50.0,
          },
          quantity: 20,
        },
      ],
    });
    mockAxios.onGet('/api/get/products').reply(200, {
      products: [
        { id: 101, name: 'Camisa Polo', brand: 'Marca A', color: 'Azul', size: 'M', price: 50.0 },
      ],
    });
    mockAxios.onGet('/api/get/transactions').reply(200, { transactions: [] });
    // Para chamadas não usadas, retorna 201
    mockAxios.onPost('/api/new/category').reply(201, {});

    render(<InventoryList />);

    await waitFor(() => {
      expect(screen.getByText(/Camisa Polo/i)).toBeInTheDocument();
    });

    // Abre o formulário de transação de compra
    const addTransactionButton = screen.getByRole('button', { name: /Registrar Compra/i });
    fireEvent.click(addTransactionButton);

    // No mock do TransactionForm, o botão "Salvar Transação" chama onSave({ type, productId: 1, quantity: 5 })
    const saveButton = screen.getByRole('button', { name: /Salvar Transação/i });
    fireEvent.click(saveButton);

    // Verifica se o estoque foi atualizado: 20 + 5 = 25
    await waitFor(() => {
      const quantityCell = screen.getAllByRole('cell', { name: '25' });
      expect(quantityCell[0]).toBeInTheDocument();
      expect(screen.getByText(/R\$ ?1250[,.]00/)).toBeInTheDocument();
    });
  });

  test('displays Snackbar on API fetch error', async () => {
    // Simula erro apenas na requisição de estoque; as demais retornam resposta válida
    mockAxios.onGet('/api/get/stock').reply(500);
    mockAxios.onGet('/api/get/products').reply(200, { products: [] });
    mockAxios.onGet('/api/get/transactions').reply(200, { transactions: [] });

    render(<InventoryList />);

    const alertElement = await waitFor(() => screen.getByRole('alert'));
    expect(alertElement).toHaveTextContent(/Erro ao buscar estoque/i);
  });

  test('closes Snackbar when close button is clicked', async () => {
    // Simula erro apenas na requisição de estoque
    mockAxios.onGet('/api/get/stock').reply(500);
    mockAxios.onGet('/api/get/products').reply(200, { products: [] });
    mockAxios.onGet('/api/get/transactions').reply(200, { transactions: [] });

    render(<InventoryList />);

    const alertElement = await waitFor(() => screen.getByRole('alert'));
    expect(alertElement).toHaveTextContent(/Erro ao buscar estoque/i);

    // Procura, dentro do alerta, o botão de fechar (com aria-label "Close")
    const closeButton = within(alertElement).getByRole('button', { name: /Close/i });
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  test('filters inventory based on search text', async () => {
    mockAxios.onGet('/api/get/stock').reply(200, {
      stock: [
        { id: 1, productId: 101, product: { name: 'Camisa Polo' }, quantity: 20 },
        { id: 2, productId: 102, product: { name: 'Calça Jeans' }, quantity: 15 },
      ],
    });
    mockAxios.onGet('/api/get/products').reply(200, {
      products: [
        { id: 101, name: 'Camisa Polo' },
        { id: 102, name: 'Calça Jeans' },
      ],
    });
    mockAxios.onGet('/api/get/transactions').reply(200, { transactions: [] });

    render(<InventoryList />);

    await waitFor(() => {
      expect(screen.getByText(/Camisa Polo/i)).toBeInTheDocument();
      expect(screen.getByText(/Calça Jeans/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/Pesquisar/i), {
      target: { value: 'Camisa' },
    });

    expect(screen.getByText(/Camisa Polo/i)).toBeInTheDocument();
    expect(screen.queryByText(/Calça Jeans/i)).not.toBeInTheDocument();
  });

  test('filters inventory based on selected attribute and value', async () => {
    mockAxios.onGet('/api/get/stock').reply(200, {
      stock: [
        {
          id: 1,
          productId: 101,
          product: { name: 'Camisa Polo', brand: 'Marca A' },
          quantity: 20,
        },
        {
          id: 2,
          productId: 102,
          product: { name: 'Calça Jeans', brand: 'Marca B' },
          quantity: 15,
        },
      ],
    });
    mockAxios.onGet('/api/get/products').reply(200, {
      products: [
        { id: 101, name: 'Camisa Polo', brand: 'Marca A' },
        { id: 102, name: 'Calça Jeans', brand: 'Marca B' },
      ],
    });
    mockAxios.onGet('/api/get/transactions').reply(200, { transactions: [] });

    const { container } = render(<InventoryList />);

    await waitFor(() => {
      expect(screen.getByText(/Camisa Polo/i)).toBeInTheDocument();
    });

  // Find filter controls container
  const filterContainer = container.querySelector(
    'div.MuiBox-root:has(div.MuiFormControl-root)'
  );

  // Find attribute filter
  const attributeLabel = within(filterContainer).getByText('Atributo');
  const filterFormControl = attributeLabel.closest('div.MuiFormControl-root');
  
  // Open and select attribute
  const filterButton = within(filterFormControl).getByRole('combobox');
  fireEvent.mouseDown(filterButton);
  const brandOption = await screen.findByRole('option', { name: /Marca/i });
  fireEvent.click(brandOption);

  // Find value filter - look for the SECOND FormControl in the filter container
  const valueFormControls = within(filterContainer).getAllByRole('combobox');
  const valueButton = valueFormControls[1]; // First is attribute, second is value
  
  // Open and select value
  fireEvent.mouseDown(valueButton);
  const brandAOption = await screen.findByRole('option', { name: /Marca A/i });
  fireEvent.click(brandAOption);

  // Verify filtered results
    await waitFor(() => {
      expect(screen.getByText(/Camisa Polo/i)).toBeInTheDocument();
      expect(screen.queryByText(/Calça Jeans/i)).not.toBeInTheDocument();
    });
  });
});
