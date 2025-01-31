/* eslint-disable testing-library/no-debugging-utils */
/* eslint-disable testing-library/no-wait-for-multiple-assertions */
// src/components/__tests__/InventoryList.test.js

import React from 'react';
import { render, screen, fireEvent, waitFor, configure, within  } from '@testing-library/react';
import InventoryList from '../InventoryList';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import '@testing-library/jest-dom';

configure({ transitionDuration: 0 });

// Mock dos componentes filhos
jest.mock('../TransactionForm', () => ({ open, onClose, type, products, onSave, setSnackbar }) => (
  <div data-testid="transaction-form">
    <button onClick={() => onSave({ type, productId: 1, quantity: 5 })}>Salvar Transação</button>
    <button onClick={onClose}>Fechar Transação</button>
  </div>
));

jest.mock('../ReturnExchangeForm', () => ({ open, onClose, transactions, products, onSave, setSnackbar }) => (
  <div data-testid="return-exchange-form">
    <button onClick={() => onSave({ type: 'return', productId: 1, quantity: 2 })}>Salvar Troca/Devolução</button>
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

  test('handles exporting inventory to PDF and Excel', async () => {
    mockAxios.onGet('/api/get/stock').reply(200, {
      stock: [{ id: 1, productId: 101, product: { name: 'Camisa Polo', price: 50.0 }, quantity: 20 }],
    });

    render(<InventoryList />);

    await waitFor(() => {
      expect(screen.getByText(/Camisa Polo/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Exportar PDF/i }));
    fireEvent.click(screen.getByRole('button', { name: /Exportar Excel/i }));
  });

  test('filters inventory based on search text', async () => {
    mockAxios.onGet('/api/get/stock').reply(200, {
      stock: [
        { id: 1, productId: 101, product: { name: 'Camisa Polo' }, quantity: 20 },
        { id: 2, productId: 102, product: { name: 'Calça Jeans' }, quantity: 15 },
      ],
    });

    render(<InventoryList />);

    await waitFor(() => {
      expect(screen.getByText(/Camisa Polo/i)).toBeInTheDocument();
      expect(screen.getByText(/Calça Jeans/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/Pesquisar/i), { target: { value: 'Camisa' } });

    expect(screen.getByText(/Camisa Polo/i)).toBeInTheDocument();
    expect(screen.queryByText(/Calça Jeans/i)).not.toBeInTheDocument();
  });

  test('displays Snackbar on API fetch error', async () => {
    mockAxios.onGet('/api/get/stock').reply(500);

    render(<InventoryList />);

    const alertElement = await waitFor(() => {
      return screen.getByRole('alert'); 
    });

    const alertText = within(alertElement).getByText(
      /Erro ao buscar estoque./i
    );
    
    expect(alertText).toBeInTheDocument();
  });

});
