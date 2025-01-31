/* eslint-disable testing-library/no-wait-for-multiple-assertions */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AppHeader from "../AppHeader";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import Cookies from "js-cookie";

// Mock do react-router-dom
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    Link: ({ children, to, ...props }) => (
        <a href={to} {...props}>
            {children}
        </a>
    ),
}));

describe("AppHeader Component", () => {
    const mockTheme = createTheme();

    const renderWithTheme = (component) => {
        return render(<ThemeProvider theme={mockTheme}>{component}</ThemeProvider>);
    };

    const mockResponse = {
        name: "João Silva",
    };

    const mockOnMenuClick = jest.fn();

    let mockAxios;

    beforeAll(() => {
        mockAxios = new MockAdapter(axios);
    });

    afterEach(() => {
        mockAxios.reset();
        jest.clearAllMocks();
    });

    test("renderiza os elementos principais corretamente", () => {
        renderWithTheme(
            <AppHeader response={mockResponse} onMenuClick={mockOnMenuClick} />
        );

        // Verifica o ícone de menu
        const menuButton = screen.getByLabelText(/open drawer/i);
        expect(menuButton).toBeInTheDocument();

        // Verifica o link "Início"
        const inicioLink = screen.getByRole("link", { name: /início/i });
        expect(inicioLink).toBeInTheDocument();
        expect(inicioLink).toHaveAttribute("href", "/");

        // Verifica o ícone de perfil
        const accountButton = screen.getByLabelText(/account of current user/i);
        expect(accountButton).toBeInTheDocument();

        // Verifica o nome do usuário
        const userName = screen.getByText(/joão silva/i);
        expect(userName).toBeInTheDocument();
    });

    test("chama a função onMenuClick ao clicar no ícone de menu", () => {
        renderWithTheme(
            <AppHeader response={mockResponse} onMenuClick={mockOnMenuClick} />
        );

        const menuButton = screen.getByLabelText(/open drawer/i);
        fireEvent.click(menuButton);

        expect(mockOnMenuClick).toHaveBeenCalledTimes(1);
    });

    test("abre e fecha o menu de perfil corretamente", async () => {
        renderWithTheme(
            <AppHeader response={mockResponse} onMenuClick={mockOnMenuClick} />
        );
    
        const accountButton = screen.getByLabelText(/account of current user/i);
    
        // Abre o menu
        fireEvent.click(accountButton);
        const menuItem = screen.getByRole("menuitem", { name: /sair/i });
        expect(menuItem).toBeInTheDocument(); // O menu deve estar visível agora
    
        // Fecha o menu ao clicar fora (testando backdrop ou documento)
        fireEvent.click(document);
    });

    test("realiza logout corretamente", async () => {
        // Mock da resposta da API de logout
        mockAxios.onPost(`/api/logout`).reply(200);

        // Mock do Cookies.remove
        const removeCookie = jest.spyOn(Cookies, "remove");

        // Mock do window.location.href
        delete window.location;
        window.location = { href: jest.fn() };

        renderWithTheme(
            <AppHeader response={mockResponse} onMenuClick={mockOnMenuClick} />
        );

        const accountButton = screen.getByLabelText(/account of current user/i);
        fireEvent.click(accountButton);

        const logoutItem = screen.getByRole("menuitem", { name: /sair/i });
        fireEvent.click(logoutItem);

        await waitFor(() => {
            expect(mockAxios.history.post.length).toBe(1);
            // eslint-disable-next-line testing-library/no-wait-for-multiple-assertions
            expect(mockAxios.history.post[0].url).toBe(
                `/api/logout`
            );
        });

        expect(removeCookie).toHaveBeenCalledWith("LojaRoupa");
        expect(window.location.href).toBe("/login");
    });

    test("exibe erro no console ao falhar o logout", async () => {
        // Mock da resposta da API de logout com erro
        mockAxios.onPost(`/api/logout`).reply(500);

        // Mock do console.error
        const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});

        renderWithTheme(
            <AppHeader response={mockResponse} onMenuClick={mockOnMenuClick} />
        );

        const accountButton = screen.getByLabelText(/account of current user/i);
        fireEvent.click(accountButton);

        const logoutItem = screen.getByRole("menuitem", { name: /sair/i });
        fireEvent.click(logoutItem);

        await waitFor(() => {
            expect(mockAxios.history.post.length).toBe(1);
            // eslint-disable-next-line testing-library/no-wait-for-multiple-assertions
            expect(mockAxios.history.post[0].url).toBe(
                `/api/logout`
            );
        });

        expect(consoleError).toHaveBeenCalledWith(
            "Erro ao realizar logout:",
            expect.any(Error)
        );

        consoleError.mockRestore();
    });

});
