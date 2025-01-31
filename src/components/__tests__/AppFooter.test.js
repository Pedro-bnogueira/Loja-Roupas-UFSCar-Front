import React from 'react';
import { render, screen } from '@testing-library/react';
import AppFooter from '../AppFooter';
import { ThemeProvider, createTheme } from '@mui/material/styles';

describe('AppFooter Component', () => {
  const renderWithTheme = (component) => {
    const theme = createTheme();
    return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
  };

  test('renderiza o footer corretamente', () => {
    renderWithTheme(<AppFooter />);

    // Verifica se o elemento footer está presente
    const footer = screen.getByRole('contentinfo'); // 'footer' tem role 'contentinfo'
    expect(footer).toBeInTheDocument();

    // Verifica se o texto "Desenvolvido por" está presente
    expect(screen.getByText(/Desenvolvido por/i)).toBeInTheDocument();

    // Verifica se o link "Trupe da Diária 🍂 🥃" está presente
    const linkElement = screen.getByText(/Trupe da Diária 🍂 🥃/i);
    expect(linkElement).toBeInTheDocument();
  });

  test('aplica estilos corretamente', () => {
    renderWithTheme(<AppFooter />);

    const footer = screen.getByRole('contentinfo');

    // Verifica se o footer possui o estilo de fundo correto
    expect(footer).toHaveStyle('background-color: #f8f9fa');

    // Verifica se o footer possui a borda superior
    expect(footer).toHaveStyle('border-top: 1px solid #e0e0e0');

    // Verifica o padding e altura
    expect(footer).toHaveStyle('padding: 16px');
    expect(footer).toHaveStyle('height: 60px');
  });
});
