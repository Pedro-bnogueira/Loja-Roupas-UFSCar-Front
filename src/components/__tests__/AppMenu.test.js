/* eslint-disable testing-library/no-node-access */
import React from 'react';
import { render, screen } from '@testing-library/react';
import AppMenu from '../AppMenu';
import { AuthContext } from '../../context/AuthContext';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

// Mock do logo import
jest.mock('../../assets/img/logo.png', () => 'logo.png');

describe('AppMenu Component', () => {
  const mockSetOpen = jest.fn();

  const renderComponent = (user) => {
    render(
      <AuthContext.Provider value={{ user }}>
        <MemoryRouter>
          <AppMenu open={true} setOpen={mockSetOpen} />
        </MemoryRouter>
      </AuthContext.Provider>
    );
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders logo and title correctly', () => {
    renderComponent({ name: 'Test User', accessLevel: 'user' });

    // Verifica se o logo está presente
    const logo = screen.getByAltText('Logo');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', 'logo.png');

    // Verifica se o título está presente
    const title = screen.getByText('Loja de Roupas UFSCar');
    expect(title).toBeInTheDocument();
  });

  test('renders all menu items for admin user', () => {
    renderComponent({ name: 'Admin User', accessLevel: 'admin' });

    // Verifica se todos os itens do menu estão presentes
    expect(screen.getByText('Início')).toBeInTheDocument();
    expect(screen.getByText('Produtos')).toBeInTheDocument();
    expect(screen.getByText('Estoque')).toBeInTheDocument();
    expect(screen.getByText('Administração')).toBeInTheDocument();
  });

  test('renders only non-admin menu items for regular user', () => {
    renderComponent({ name: 'Regular User', accessLevel: 'user' });

    // Verifica se os itens não-admin estão presentes
    expect(screen.getByText('Início')).toBeInTheDocument();
    expect(screen.getByText('Produtos')).toBeInTheDocument();
    expect(screen.getByText('Estoque')).toBeInTheDocument();

    // Verifica se o item admin não está presente
    expect(screen.queryByText('Administração')).not.toBeInTheDocument();
  });

  test('does not render menu items if user is not authenticated', () => {
    renderComponent(null);

    // Verifica se apenas os itens não-admin estão presentes
    expect(screen.getByText('Início')).toBeInTheDocument();
    expect(screen.getByText('Produtos')).toBeInTheDocument();
    expect(screen.getByText('Estoque')).toBeInTheDocument();

    // Verifica se o item admin não está presente
    expect(screen.queryByText('Administração')).not.toBeInTheDocument();
  });

  test('navigates to correct link when menu item is clicked', () => {
    renderComponent({ name: 'Test User', accessLevel: 'user' });

    // Verifica se o link "Início" aponta para "/"
    const inicioLink = screen.getByText('Início');
    expect(inicioLink.closest('a')).toHaveAttribute('href', '/');

    // Verifica se o link "Produtos" aponta para "/products"
    const produtosLink = screen.getByText('Produtos');
    expect(produtosLink.closest('a')).toHaveAttribute('href', '/products');

    // Verifica se o link "Estoque" aponta para "/estoque"
    const estoqueLink = screen.getByText('Estoque');
    expect(estoqueLink.closest('a')).toHaveAttribute('href', '/estoque');
  });

  test('admin menu item navigates to /adm/users', () => {
    renderComponent({ name: 'Admin User', accessLevel: 'admin' });

    // Verifica se o link "Administração" aponta para "/adm/users"
    const adminLink = screen.getByText('Administração');
    expect(adminLink.closest('a')).toHaveAttribute('href', '/adm/users');
  });
});
