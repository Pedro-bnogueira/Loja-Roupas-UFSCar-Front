
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserForm from '../UserForm'; // Ajuste o path conforme sua estrutura

describe('UserForm Component', () => {
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();

  const defaultProps = {
    open: true,
    onClose: mockOnClose,
    onSave: mockOnSave,
    mode: 'create',
    formData: {
      name: '',
      email: '',
      password: '',
      accessLevel: 'user',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar corretamente no modo "create"', () => {
    render(<UserForm {...defaultProps} />);

    // Título
    expect(screen.getByText(/adicionar usuário/i)).toBeInTheDocument();

    // Botão principal
    expect(screen.getByRole('button', { name: /adicionar/i })).toBeInTheDocument();

    // Campos (usamos regex para ignorar o * que o MUI adiciona)
    expect(screen.getByLabelText(/nome/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument(); // label no modo create
    expect(screen.getByLabelText(/nível de acesso/i)).toBeInTheDocument();
  });

  it('deve renderizar corretamente no modo "edit"', () => {
    render(
      <UserForm
        {...defaultProps}
        mode="edit"
        formData={{
          name: 'Usuário de Teste',
          email: 'teste@example.com',
          password: '',
          accessLevel: 'admin',
        }}
      />
    );

    // Título
    expect(screen.getByText(/editar usuário/i)).toBeInTheDocument();

    // Botão principal
    expect(screen.getByRole('button', { name: /salvar/i })).toBeInTheDocument();

    expect(screen.getByLabelText(/nome/i)).toHaveValue('Usuário de Teste');
    expect(screen.getByLabelText(/email/i)).toHaveValue('teste@example.com');
    // No modo "edit" deve exibir "Nova Senha"
    expect(screen.getByLabelText(/nova senha/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/administrador/i)).toBeInTheDocument();
  });

  it('deve chamar onClose ao clicar em "Cancelar"', async () => {
    render(<UserForm {...defaultProps} />);
    const cancelButton = screen.getByRole('button', { name: /cancelar/i });

    await userEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('deve exibir erros de validação se campos obrigatórios estiverem vazios (modo create)', async () => {
    render(<UserForm {...defaultProps} />);

    // Clica em "Adicionar" sem preencher nada
    const addButton = screen.getByRole('button', { name: /adicionar/i });
    await userEvent.click(addButton);

    // Espera pelas mensagens de erro
    expect(await screen.findByText('O nome é obrigatório.')).toBeInTheDocument();
    expect(screen.getByText('O email é obrigatório.')).toBeInTheDocument();
    expect(screen.getByText('A senha é obrigatória no cadastro.')).toBeInTheDocument();

    // onSave não deve ter sido chamado
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('deve exibir erros de validação se campos obrigatórios estiverem vazios (modo edit)', async () => {
    render(
      <UserForm
        {...defaultProps}
        mode="edit"
        formData={{
          name: '',
          email: '',
          password: '', // no modo edit não é obrigatório
          accessLevel: 'user',
        }}
      />
    );

    // Clica em "Salvar"
    const saveButton = screen.getByRole('button', { name: /salvar/i });
    await userEvent.click(saveButton);

    // Verifica se aparecem as mensagens de erro para nome e email
    expect(await screen.findByText('O nome é obrigatório.')).toBeInTheDocument();
    expect(screen.getByText('O email é obrigatório.')).toBeInTheDocument();

    // Mas não deve exibir erro de senha obrigatória (no edit)
    expect(screen.queryByText('A senha é obrigatória no cadastro.')).not.toBeInTheDocument();

    // onSave não deve ter sido chamado
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('deve chamar onSave com os dados corretos quando o formulário estiver válido (modo create)', async () => {
    render(<UserForm {...defaultProps} />);

    // Preenche os campos (usamos /nome/i em vez de "Nome")
    await userEvent.type(screen.getByLabelText(/nome/i), 'Novo Usuário');
    await userEvent.type(screen.getByLabelText(/email/i), 'novo@teste.com');
    await userEvent.type(screen.getByLabelText(/senha/i), 'senha123');

    // O select
    const accessLevelSelect = screen.getByLabelText(/nível de acesso/i);
    await userEvent.click(accessLevelSelect);
    // Seleciona "Administrador"
    const adminOption = screen.getByRole('option', { name: /administrador/i });
    await userEvent.click(adminOption);

    // Clica em Adicionar
    const addButton = screen.getByRole('button', { name: /adicionar/i });
    await userEvent.click(addButton);

    // onSave deve ter sido chamado com os dados
    expect(mockOnSave).toHaveBeenCalledTimes(1);
    expect(mockOnSave).toHaveBeenCalledWith({
      name: 'Novo Usuário',
      email: 'novo@teste.com',
      password: 'senha123',
      accessLevel: 'admin',
    });
  });

  it('deve permitir salvar sem senha no modo edit', async () => {
    render(
      <UserForm
        {...defaultProps}
        mode="edit"
        formData={{
          name: 'Usuário Existente',
          email: 'exemplo@teste.com',
          password: '', // Sem senha
          accessLevel: 'user',
        }}
      />
    );

    // Clica em "Salvar"
    const saveButton = screen.getByRole('button', { name: /salvar/i });
    await userEvent.click(saveButton);

    // Deve chamar onSave com esses dados
    expect(mockOnSave).toHaveBeenCalledTimes(1);
    expect(mockOnSave).toHaveBeenCalledWith({
      name: 'Usuário Existente',
      email: 'exemplo@teste.com',
      password: '',
      accessLevel: 'user',
    });
  });
});
