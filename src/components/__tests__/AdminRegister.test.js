// src/components/__tests__/AdminRegister.test.js

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminRegister from '../AdminRegister';
import axios from 'axios';

// Mock do axios
jest.mock('axios');

describe('AdminRegister Component', () => {
  beforeEach(() => {
    // Limpa todos os mocks antes de cada teste
    jest.clearAllMocks();
  });

  test('renderiza o formulário corretamente', () => {
    render(<AdminRegister />);
    
    // Verifica se todos os campos estão presentes
    expect(screen.getByLabelText(/Nome:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Senha:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nível de Acesso:/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cadastrar/i })).toBeInTheDocument();
  });

  test('submete o formulário com sucesso', async () => {
    // Mock da resposta do axios para sucesso
    axios.post.mockResolvedValueOnce({ status: 201 });

    render(<AdminRegister />);

    // Preenche os campos do formulário
    fireEvent.change(screen.getByLabelText(/Nome:/i), { target: { value: 'João' } });
    fireEvent.change(screen.getByLabelText(/Email:/i), { target: { value: 'joao@example.com' } });
    fireEvent.change(screen.getByLabelText(/Senha:/i), { target: { value: 'senha123' } });
    fireEvent.change(screen.getByLabelText(/Nível de Acesso:/i), { target: { value: 'admin' } });

    // Submete o formulário
    fireEvent.click(screen.getByRole('button', { name: /Cadastrar/i }));

    // Espera pela mensagem de sucesso
    await waitFor(() => {
      expect(screen.getByText(/Usuário cadastrado com sucesso!/i)).toBeInTheDocument();
    });

    // Verifica se os campos foram limpos
    expect(screen.getByLabelText(/Nome:/i)).toHaveValue('');
    expect(screen.getByLabelText(/Email:/i)).toHaveValue('');
    expect(screen.getByLabelText(/Senha:/i)).toHaveValue('');
    expect(screen.getByLabelText(/Nível de Acesso:/i)).toHaveValue('user');
  });

  test('exibe mensagem de erro quando o servidor retorna erro', async () => {
    // Mock da resposta do axios para erro
    axios.post.mockRejectedValueOnce({
      response: { data: { message: 'Email já está em uso.' } },
    });

    render(<AdminRegister />);

    // Preenche os campos do formulário
    fireEvent.change(screen.getByLabelText(/Nome:/i), { target: { value: 'Maria' } });
    fireEvent.change(screen.getByLabelText(/Email:/i), { target: { value: 'maria@example.com' } });
    fireEvent.change(screen.getByLabelText(/Senha:/i), { target: { value: 'senha456' } });
    fireEvent.change(screen.getByLabelText(/Nível de Acesso:/i), { target: { value: 'user' } });

    // Submete o formulário
    fireEvent.click(screen.getByRole('button', { name: /Cadastrar/i }));

    // Espera pela mensagem de erro
    await waitFor(() => {
      expect(screen.getByText(/Email já está em uso./i)).toBeInTheDocument();
    });

    // Verifica que os campos não foram limpos
    expect(screen.getByLabelText(/Nome:/i)).toHaveValue('Maria');
    expect(screen.getByLabelText(/Email:/i)).toHaveValue('maria@example.com');
    expect(screen.getByLabelText(/Senha:/i)).toHaveValue('senha456');
    expect(screen.getByLabelText(/Nível de Acesso:/i)).toHaveValue('user');
  });

  test('exibe mensagem de erro em caso de falha de rede', async () => {
    // Mock da resposta do axios para erro de rede
    axios.post.mockRejectedValueOnce(new Error('Network Error'));

    render(<AdminRegister />);

    // Preenche os campos do formulário
    fireEvent.change(screen.getByLabelText(/Nome:/i), { target: { value: 'Carlos' } });
    fireEvent.change(screen.getByLabelText(/Email:/i), { target: { value: 'carlos@example.com' } });
    fireEvent.change(screen.getByLabelText(/Senha:/i), { target: { value: 'senha789' } });
    fireEvent.change(screen.getByLabelText(/Nível de Acesso:/i), { target: { value: 'user' } });

    // Submete o formulário
    fireEvent.click(screen.getByRole('button', { name: /Cadastrar/i }));

    // Espera pela mensagem de erro genérica
    await waitFor(() => {
      expect(screen.getByText(/Ocorreu um erro. Por favor, tente novamente./i)).toBeInTheDocument();
    });

    // Verifica que os campos não foram limpos
    expect(screen.getByLabelText(/Nome:/i)).toHaveValue('Carlos');
    expect(screen.getByLabelText(/Email:/i)).toHaveValue('carlos@example.com');
    expect(screen.getByLabelText(/Senha:/i)).toHaveValue('senha789');
    expect(screen.getByLabelText(/Nível de Acesso:/i)).toHaveValue('user');
  });

  test('valida campos obrigatórios', async () => {
    render(<AdminRegister />);

    // Submete o formulário sem preencher os campos
    fireEvent.click(screen.getByRole('button', { name: /Cadastrar/i }));

    // Verifica se os campos obrigatórios exibem mensagens de erro do HTML5
    const nomeInput = screen.getByLabelText(/Nome:/i);
    const emailInput = screen.getByLabelText(/Email:/i);
    const senhaInput = screen.getByLabelText(/Senha:/i);

    expect(nomeInput).toBeInvalid();
    expect(emailInput).toBeInvalid();
    expect(senhaInput).toBeInvalid();
  });
});
