import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import TransactionForm from '../TransactionForm';

// Mock do axios para controlar as respostas da chamada de API
jest.mock('axios');

describe('TransactionForm', () => {
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();
  const mockSetSnackbar = jest.fn();

  const mockProducts = [
    { id: 1, name: 'Produto A' },
    { id: 2, name: 'Produto B' },
  ];

  const defaultProps = {
    open: true,
    onClose: mockOnClose,
    type: 'in', // 'in' para registrar compra, 'out' para registrar venda
    products: mockProducts,
    onSave: mockOnSave,
    setSnackbar: mockSetSnackbar,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar corretamente o título de acordo com o tipo (compra ou venda)', () => {
    // Teste para tipo "in"
    const { rerender } = render(<TransactionForm {...defaultProps} type="in" />);
    expect(screen.getByText('Registrar Compra')).toBeInTheDocument();

    // Teste para tipo "out"
    rerender(<TransactionForm {...defaultProps} type="out" />);
    expect(screen.getByText('Registrar Venda')).toBeInTheDocument();
  });

  it('deve exibir os campos iniciais corretamente', () => {
    render(<TransactionForm {...defaultProps} />);

    // Verifica se os campos estão na tela
    expect(screen.getByLabelText('Produto')).toBeInTheDocument();
    expect(screen.getByLabelText('Quantidade')).toBeInTheDocument();
    expect(screen.getByLabelText('Preço Total (R$)')).toBeInTheDocument();
    expect(screen.getByLabelText('Fornecedor')).toBeInTheDocument(); // pois o tipo é 'in'
  });

  it('deve chamar onClose ao clicar no botão "Cancelar"', async () => {
    render(<TransactionForm {...defaultProps} />);

    const cancelButton = screen.getByRole('button', { name: /cancelar/i });
    await userEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('não deve enviar o formulário se os campos obrigatórios não forem preenchidos', async () => {
    render(<TransactionForm {...defaultProps} />);

    // Clica em salvar sem preencher nada
    const saveButton = screen.getByRole('button', { name: /salvar/i });
    await userEvent.click(saveButton);

    // Verifica as mensagens de erro
    expect(await screen.findByText('Selecione um produto.')).toBeInTheDocument();
    expect(screen.getByText('Informe uma quantidade válida.')).toBeInTheDocument();
    expect(screen.getByText('Informe um preço válido.')).toBeInTheDocument();
    expect(screen.getByText('Informe o fornecedor.')).toBeInTheDocument();

    // Garante que não chamou a API
    expect(axios.post).not.toHaveBeenCalled();
    // E também não chamou o onSave
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('deve exibir erros de validação se os campos forem inválidos (quantidade e preço <= 0)', async () => {
    render(<TransactionForm {...defaultProps} />);

    // Selecionar um produto
    const produtoSelect = screen.getByLabelText('Produto');
    await userEvent.click(produtoSelect);

    // Seleciona "Produto A" (ID: 1)
    const produtoAOption = screen.getByText(/produto a \(id: 1\)/i);
    await userEvent.click(produtoAOption);

    // Digitar quantidade inválida (0)
    const quantidadeInput = screen.getByLabelText('Quantidade');
    await userEvent.type(quantidadeInput, '0');

    // Digitar preço inválido (0)
    const precoInput = screen.getByLabelText('Preço Total (R$)');
    // Aqui podemos usar fireEvent.change por ser NumericFormat
    fireEvent.change(precoInput, { target: { value: '0' } });

    // Digitar fornecedor (qualquer valor para não falhar nesse campo)
    const fornecedorInput = screen.getByLabelText('Fornecedor');
    await userEvent.type(fornecedorInput, 'Fornecedor Teste');

    // Clicar em Salvar
    const saveButton = screen.getByRole('button', { name: /salvar/i });
    await userEvent.click(saveButton);

    // Verifica mensagens de erro
    expect(await screen.findByText('Informe uma quantidade válida.')).toBeInTheDocument();
    expect(screen.getByText('Informe um preço válido.')).toBeInTheDocument();

    // API não é chamada
    expect(axios.post).not.toHaveBeenCalled();
  });

  it('deve fazer a chamada de API com dados corretos e chamar onSave quando o back-end retornar sucesso', async () => {
    // Mock da resposta de sucesso
    axios.post.mockResolvedValue({
      status: 201,
      data: {
        transactionHistory: {
          id: 999,
          productId: 1,
          quantity: 10,
          transactionPrice: 100,
          supplierOrBuyer: 'Fornecedor Teste',
        },
      },
    });

    render(<TransactionForm {...defaultProps} />);

    // Preencher produto
    const produtoSelect = screen.getByLabelText('Produto');
    await userEvent.click(produtoSelect);
    await userEvent.click(screen.getByText(/produto a \(id: 1\)/i));

    // Preencher quantidade
    const quantidadeInput = screen.getByLabelText('Quantidade');
    await userEvent.type(quantidadeInput, '10');

    // Preencher preço (usaremos fireEvent para simular mudança no campo NumericFormat)
    const precoInput = screen.getByLabelText('Preço Total (R$)');
    fireEvent.change(precoInput, { target: { value: '100' } });

    // Preencher fornecedor
    const fornecedorInput = screen.getByLabelText('Fornecedor');
    await userEvent.type(fornecedorInput, 'Fornecedor Teste');

    // Clicar em Salvar
    const saveButton = screen.getByRole('button', { name: /salvar/i });
    await userEvent.click(saveButton);

    // Verificar se chamou axios.post com os dados corretos
    expect(axios.post).toHaveBeenCalledWith(
      `${process.env.REACT_APP_API_URL}/api/movement/register`,
      {
        type: 'in',
        productId: 1,
        quantity: 10,
        transactionPrice: 100,
        supplierOrBuyer: 'Fornecedor Teste',
      },
      { withCredentials: true }
    );

    expect(mockOnSave).toHaveBeenCalledWith({
      id: 999,
      productId: 1,
      quantity: 10,
      transactionPrice: 100,
      supplierOrBuyer: 'Fornecedor Teste',
    });

    // Verifica se setSnackbar foi chamado corretamente
    expect(mockSetSnackbar).toHaveBeenCalledWith({
      open: true,
      message: 'Transação registrada com sucesso!',
      severity: 'success',
    });
  });

  it('deve exibir mensagem de erro e não chamar onSave ao receber erro do backend', async () => {
    // Mock de erro do backend (status diferente de 201)
    axios.post.mockResolvedValue({
      status: 400,
      data: { error: 'Erro ao registrar transação.' },
    });

    render(<TransactionForm {...defaultProps} />);

    // Preencher todos os campos corretamente
    const produtoSelect = screen.getByLabelText('Produto');
    await userEvent.click(produtoSelect);
    await userEvent.click(screen.getByText(/produto a \(id: 1\)/i));

    const quantidadeInput = screen.getByLabelText('Quantidade');
    await userEvent.type(quantidadeInput, '10');

    const precoInput = screen.getByLabelText('Preço Total (R$)');
    fireEvent.change(precoInput, { target: { value: '100' } });

    const fornecedorInput = screen.getByLabelText('Fornecedor');
    await userEvent.type(fornecedorInput, 'Fornecedor Teste');

    const saveButton = screen.getByRole('button', { name: /salvar/i });
    await userEvent.click(saveButton);

    expect(mockSetSnackbar).toHaveBeenCalledWith({
      open: true,
      message: 'Erro ao registrar a transação.',
      severity: 'error',
    });

    // onSave não deve ser chamado
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('deve exibir mensagem de erro caso a chamada de API retorne rejeição (ex.: erro de rede)', async () => {
    // Mock de erro de rede
    axios.post.mockRejectedValue(new Error('Network Error'));

    render(<TransactionForm {...defaultProps} />);

    // Preencher todos os campos corretamente
    const produtoSelect = screen.getByLabelText('Produto');
    await userEvent.click(produtoSelect);
    await userEvent.click(screen.getByText(/produto a \(id: 1\)/i));

    const quantidadeInput = screen.getByLabelText('Quantidade');
    await userEvent.type(quantidadeInput, '10');

    const precoInput = screen.getByLabelText('Preço Total (R$)');
    fireEvent.change(precoInput, { target: { value: '100' } });

    const fornecedorInput = screen.getByLabelText('Fornecedor');
    await userEvent.type(fornecedorInput, 'Fornecedor Teste');

    const saveButton = screen.getByRole('button', { name: /salvar/i });
    await userEvent.click(saveButton);

    expect(mockSetSnackbar).toHaveBeenCalledWith({
      open: true,
      message: 'Erro ao registrar a transação.',
      severity: 'error',
    });

    // onSave não deve ser chamado
    expect(mockOnSave).not.toHaveBeenCalled();
  });
});