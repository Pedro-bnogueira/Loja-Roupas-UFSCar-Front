/* eslint-disable testing-library/no-wait-for-multiple-assertions */
/* eslint-disable testing-library/no-node-access */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CategoryList from '../CategoryList';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import '@testing-library/jest-dom';

// Mock dos componentes filhos
jest.mock('../CategoryForm', () => ({ open, onClose, formData, onSave }) => (
  <div data-testid="category-form">
    <button onClick={() => onSave({ name: 'Nova Categoria' })}>Salvar Categoria</button>
    <button onClick={onClose}>Fechar Formulário</button>
  </div>
));

jest.mock('../DeleteDialog', () => ({ open, onClose, onConfirm, title, description }) => (
  <div data-testid="delete-dialog">
    <button onClick={onConfirm}>Confirmar Deleção</button>
    <button onClick={onClose}>Cancelar Deleção</button>
  </div>
));

describe('CategoryList Component', () => {
  let mockAxios;

  beforeAll(() => {
    mockAxios = new MockAdapter(axios);
  });

  afterEach(() => {
    mockAxios.reset();
    jest.clearAllMocks();
  });

  test('fetches and displays categories on mount', async () => {
    mockAxios.onGet(`/api/get/categories`).reply(200, {
      categories: [
        { id: 1, name: 'Roupas', productCount: 10 },
        { id: 2, name: 'Acessórios', productCount: 5 },
      ],
    });

    render(<CategoryList />);

    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Nome')).toBeInTheDocument();
    expect(screen.getByText('Quantidade de Produtos')).toBeInTheDocument();
    expect(screen.getByText('Ações')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Roupas')).toBeInTheDocument();
      expect(screen.getByText('Acessórios')).toBeInTheDocument();
    });
  });

  test('displays message when there are no categories', async () => {
    mockAxios.onGet(`/api/get/categories`).reply(200, { categories: [] });

    render(<CategoryList />);

    await waitFor(() => {
      expect(screen.getByText('Nenhuma categoria cadastrada.')).toBeInTheDocument();
    });
  });

  test('opens CategoryForm dialog when "Adicionar categoria" is clicked', () => {
    render(<CategoryList />);

    fireEvent.click(screen.getByRole('button', { name: /Adicionar categoria/i }));

    expect(screen.getByTestId('category-form')).toBeInTheDocument();
  });

  test('closes CategoryForm dialog when "Cancelar" is clicked', () => {
    render(<CategoryList />);

    // Abre o formulário de categoria (o dialog será renderizado)
    fireEvent.click(screen.getByRole('button', { name: /Adicionar categoria/i }));

    // Clica no botão "Cancelar"
    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }));

    // Verifica se o diálogo foi fechado corretamente
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });


  test('adds a new category and displays it in the table', async () => {
    mockAxios.onGet(`/api/get/categories`).reply(200, { categories: [] });
    mockAxios.onPost(`/api/new/category`).reply(201, {
      category: { id: 3, name: 'Nova Categoria', productCount: 0 },
    });

    render(<CategoryList />);

    fireEvent.click(screen.getByRole('button', { name: /Adicionar categoria/i }));
    fireEvent.click(screen.getByRole('button', { name: /Salvar Categoria/i }));

    await waitFor(() => {
      expect(screen.getByText('Nova Categoria')).toBeInTheDocument();
    });

    expect(screen.getByText('Categoria cadastrada com sucesso!')).toBeInTheDocument();
  });

  test('opens DeleteDialog when delete button is clicked', async () => {
    mockAxios.onGet(`/api/get/categories`).reply(200, {
      categories: [{ id: 1, name: 'Roupas', productCount: 10 }],
    });

    render(<CategoryList />);

    await waitFor(() => {
      expect(screen.getByText('Roupas')).toBeInTheDocument();
    });

    const deleteButton = screen.getByTestId('DeleteIcon').closest('button');
    fireEvent.click(deleteButton);

    expect(screen.getByTestId('delete-dialog')).toBeInTheDocument();
  });

  test('deletes a category and removes it from the table', async () => {
    mockAxios.onGet(`/api/get/categories`).reply(200, {
      categories: [{ id: 1, name: 'Roupas', productCount: 10 }],
    });

    mockAxios.onDelete(`/api/delete/category/1`).reply(200);

    render(<CategoryList />);

    await waitFor(() => {
      expect(screen.getByText('Roupas')).toBeInTheDocument();
    });

    const deleteButton = screen.getByTestId('DeleteIcon').closest('button');
    fireEvent.click(deleteButton);
    fireEvent.click(screen.getByRole('button', { name: /Confirmar Deleção/i }));

    await waitFor(() => {
      expect(screen.queryByText('Roupas')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Categoria removida com sucesso!')).toBeInTheDocument();
  });

  test('displays error Snackbar when adding a category fails', async () => {
    mockAxios.onGet(`/api/get/categories`).reply(200, { categories: [] });
    mockAxios.onPost(`/api/new/category`).reply(500);

    render(<CategoryList />);

    fireEvent.click(screen.getByRole('button', { name: /Adicionar categoria/i }));
    fireEvent.click(screen.getByRole('button', { name: /Salvar Categoria/i }));

    await waitFor(() => {
      expect(screen.getByText((text) => text.includes('Ocorreu um erro ao salvar a categoria'))).toBeInTheDocument();
    });
  });

  test('displays error Snackbar when deleting a category fails', async () => {
    mockAxios.onGet(`/api/get/categories`).reply(200, {
      categories: [{ id: 1, name: 'Roupas', productCount: 10 }],
    });

    mockAxios.onDelete(`/api/delete/category/1`).reply(500);

    render(<CategoryList />);

    await waitFor(() => {
      expect(screen.getByText('Roupas')).toBeInTheDocument();
    });

    const deleteButton = screen.getByTestId('DeleteIcon').closest('button');
    fireEvent.click(deleteButton);
    fireEvent.click(screen.getByRole('button', { name: /Confirmar Deleção/i }));

    await waitFor(() => {
      expect(screen.getByText('Ocorreu um erro ao remover a categoria.')).toBeInTheDocument();
    });
  });

  test('closes Snackbar when clicked', async () => {
    mockAxios.onGet(`/api/get/categories`).reply(200, { categories: [] });

    render(<CategoryList />);

    fireEvent.click(screen.getByRole('button', { name: /Adicionar categoria/i }));
    mockAxios.onPost(`/api/new/category`).reply(201, {
      category: { id: 2, name: 'Nova Categoria', productCount: 0 },
    });
    fireEvent.click(screen.getByRole('button', { name: /Salvar Categoria/i }));

    await waitFor(() => {
      expect(screen.getByText('Categoria cadastrada com sucesso!')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByLabelText('Close'));

    await waitFor(() => {
      expect(screen.queryByText('Categoria cadastrada com sucesso!')).not.toBeInTheDocument();
    });
  });
});
