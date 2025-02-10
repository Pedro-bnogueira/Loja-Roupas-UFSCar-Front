/* eslint-disable testing-library/prefer-presence-queries */
/* eslint-disable testing-library/no-wait-for-multiple-assertions */
/**
 * @file TransactionsList.test.js
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import TransactionsList from '../TransactionsList';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

// Mock do axios
jest.mock('axios');

// Mock do jsPDF e XLSX para evitar gerar arquivos de verdade
jest.mock('jspdf', () => {
  return jest.fn().mockImplementation(() => ({
    setFontSize: jest.fn(),
    text: jest.fn(),
    autoTable: jest.fn(),
    save: jest.fn(),
  }));
});

jest.mock('xlsx', () => ({
  utils: {
    book_new: jest.fn(() => ({})),
    aoa_to_sheet: jest.fn(),
    book_append_sheet: jest.fn(),
  },
  writeFile: jest.fn(),
}));

describe('TransactionsList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar o título e campos iniciais corretamente', async () => {
    axios.get.mockResolvedValue({ data: { transactions: [] }, status: 200 });

    render(<TransactionsList />);

    // Título
    expect(
      screen.getByRole('heading', { name: /histórico de transações/i })
    ).toBeInTheDocument();

    // Campos de busca e filtro
    expect(screen.getByLabelText(/pesquisar/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/filtro/i)).toBeInTheDocument();

    // Botões de exportação
    expect(screen.getByRole('button', { name: /exportar pdf/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /exportar excel/i })).toBeInTheDocument();
  });

  it('deve buscar transações na montagem e exibi-las na tabela', async () => {
    const mockData = [
      {
        id: 1,
        type: 'in',
        productId: 101,
        product: {
          name: 'Camiseta Oversized',
          brand: 'Brand A',
          color: 'Preto',
          size: 'G',
        },
        quantity: 50,
        transactionPrice: 500.0,
        supplierOrBuyer: 'Fornecedor X',
        transactionDate: new Date('2023-01-01T12:00:00Z').toISOString(),
        user: { name: 'Funcionário A' },
      },
      {
        id: 2,
        type: 'out',
        productId: 102,
        product: {
          name: 'Calça Jeans',
          brand: 'Brand B',
          color: 'Azul',
          size: '42',
        },
        quantity: 10,
        transactionPrice: 300.0,
        supplierOrBuyer: 'Cliente Y',
        transactionDate: new Date('2023-01-02T15:00:00Z').toISOString(),
        user: { name: 'Funcionário B' },
      },
    ];

    axios.get.mockResolvedValue({
      status: 200,
      data: { transactions: mockData },
    });

    render(<TransactionsList />);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/get/transactions'),
        { withCredentials: true }
      );
    });

    // Verifica se os itens aparecem na tabela
    expect(await screen.findByText('1')).toBeInTheDocument(); // ID 1
    expect(screen.getByText('101')).toBeInTheDocument(); // Código do Produto
    expect(screen.getByText('Camiseta Oversized')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();

    expect(screen.getByText('2')).toBeInTheDocument(); // ID 2
    expect(screen.getByText('102')).toBeInTheDocument();
    expect(screen.getByText('Calça Jeans')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('deve exibir mensagem de erro (setSnackbar) se a busca de transações falhar', async () => {
    axios.get.mockRejectedValue(new Error('Network Error'));
    // Cria o spy antes de renderizar o componente
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<TransactionsList />);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });

  it('deve filtrar e pesquisar corretamente', async () => {
    const mockData = [
      {
        id: 1,
        type: 'in',
        productId: 101,
        product: {
          name: 'Blusa Moletom',
          brand: 'Loja 1',
          color: 'Cinza',
          size: 'M',
        },
        quantity: 5,
        transactionPrice: 150.0,
        supplierOrBuyer: 'Fornecedor A',
        transactionDate: new Date('2023-02-01T10:00:00Z').toISOString(),
        user: { name: 'User A' },
      },
      {
        id: 2,
        type: 'out',
        productId: 102,
        product: {
          name: 'Blusa Moletom',
          brand: 'Loja 2',
          color: 'Preto',
          size: 'M',
        },
        quantity: 8,
        transactionPrice: 240.0,
        supplierOrBuyer: 'Fornecedor B',
        transactionDate: new Date('2023-02-02T11:00:00Z').toISOString(),
        user: { name: 'User B' },
      },
    ];

    axios.get.mockResolvedValue({
      status: 200,
      data: { transactions: mockData },
    });

    render(<TransactionsList />);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });

    // Ambos devem aparecer inicialmente
    expect(await screen.findByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();

    // BUSCA GERAL: digitar 'Loja 1'
    const searchInput = screen.getByLabelText(/pesquisar/i);
    await userEvent.type(searchInput, 'Loja 1');

    // Agora só deve sobrar a transação de ID 1
    await waitFor(() => {
      expect(screen.queryByText('1')).toBeInTheDocument();
      expect(screen.queryByText('2')).not.toBeInTheDocument();
    });

    // Limpar a busca (volta a lista completa)
    await userEvent.clear(searchInput);
    expect(screen.queryByText('2')).toBeInTheDocument();

    // FILTRO: selecionar "Fornecedor/Comprador"
    const filterSelect = screen.getByLabelText('Filtro');
    await userEvent.click(filterSelect);

    // Seleciona o item do menu (usando role="option")
    const fornecedorOption = screen.getByRole('option', {
      name: /fornecedor\/comprador/i,
    });
    await userEvent.click(fornecedorOption);

    // Agora deve aparecer o segundo select com label "Valor"
    const filterValueSelect = screen.getByLabelText('Valor');
    await userEvent.click(filterValueSelect);

    // Verifica que existem 2 opções: "Fornecedor A" e "Fornecedor B"
    const fornecedorAOption = screen.getByRole('option', { name: 'Fornecedor A' });
    const fornecedorBOption = screen.getByRole('option', { name: 'Fornecedor B' });
    expect(fornecedorAOption).toBeInTheDocument();
    expect(fornecedorBOption).toBeInTheDocument();

    // Selecionar "Fornecedor A"
    await userEvent.click(fornecedorAOption);

    // Agora só deve sobrar a transação de ID 1
    expect(await screen.findByText('1')).toBeInTheDocument();
    expect(screen.queryByText('2')).not.toBeInTheDocument();
  });

  it('deve chamar funções de exportação (PDF e Excel) ao clicar nos botões', async () => {
    axios.get.mockResolvedValue({ status: 200, data: { transactions: [] } });

    render(<TransactionsList />);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled();
    });

    // Botão PDF
    const pdfButton = screen.getByRole('button', { name: /exportar pdf/i });
    await userEvent.click(pdfButton);

    expect(jsPDF).toHaveBeenCalled();
    const docInstance = jsPDF.mock.results[0].value;
    expect(docInstance.save).toHaveBeenCalledWith('transacoes.pdf');

    // Botão Excel
    const excelButton = screen.getByRole('button', { name: /exportar excel/i });
    await userEvent.click(excelButton);

    expect(XLSX.utils.book_new).toHaveBeenCalled();
    expect(XLSX.writeFile).toHaveBeenCalledWith(expect.any(Object), 'transacoes.xlsx');
  });
});
