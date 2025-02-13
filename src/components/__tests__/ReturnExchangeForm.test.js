/* eslint-disable testing-library/prefer-presence-queries */
/* eslint-disable testing-library/no-node-access */
/* eslint-disable testing-library/no-wait-for-multiple-assertions */
/* eslint-disable testing-library/prefer-find-by */
import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import ReturnExchangeForm from "../ReturnExchangeForm";
import axios from "axios";
import { ThemeProvider, createTheme } from "@mui/material/styles";

// Automatically mock axios.
jest.mock("axios");

// Para testes, define a API como string vazia para endpoints relativos.
process.env.REACT_APP_API_URL = "";

const theme = createTheme();
const renderWithTheme = (ui) =>
  render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

// Função helper para recuperar o primeiro InputLabel (evitando matching com legendas, etc.)
const getLabel = (text) =>
  screen.getAllByText(text, { selector: "label.MuiInputLabel-root" })[0];

// Dados mock para transações e produtos.
const transactionsMock = [
  {
    id: "txn1",
    productId: 101,
    transactionPrice: "100",
    Product: {
      name: "Product A",
      brand: "Brand A",
      color: "Red",
      size: "M",
      price: "100",
    },
    quantity: 1,
    supplierOrBuyer: "Supplier A",
    transactionDate: "2020-01-01T12:00:00Z",
    user: { name: "User A" },
  },
];

const productsMock = [
  {
    id: 101,
    name: "Product A",
    brand: "Brand A",
    price: "100",
    size: "M",
    color: "Red",
  },
  {
    id: 102,
    name: "Product B",
    brand: "Brand B",
    price: "50",
    size: "L",
    color: "Blue",
  },
];

const onSaveMock = jest.fn();
const onCloseMock = jest.fn();
const setSnackbarMock = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

describe("ReturnExchangeForm Component", () => {
  test("renders dialog when open is true and displays fields", () => {
    renderWithTheme(
      <ReturnExchangeForm
        open={true}
        onClose={onCloseMock}
        transactions={transactionsMock}
        products={productsMock}
        onSave={onSaveMock}
        setSnackbar={setSnackbarMock}
      />
    );
    // Verifica se o título do diálogo e os labels principais são renderizados.
    expect(screen.getByText(/Trocas e Devoluções/i)).toBeInTheDocument();
    expect(getLabel("Tipo")).toBeInTheDocument();
    expect(getLabel("ID Transação")).toBeInTheDocument();
  });

  test("clears fields when dialog is closed", async () => {
    // Renderiza o diálogo aberto inicialmente.
    const { rerender } = renderWithTheme(
      <ReturnExchangeForm
        open={true}
        onClose={onCloseMock}
        transactions={transactionsMock}
        products={productsMock}
        onSave={onSaveMock}
        setSnackbar={setSnackbarMock}
      />
    );
    // Simula a seleção do tipo "Troca".
    const typeLabel = getLabel("Tipo");
    const typeSelect = within(typeLabel.parentElement).getByRole("combobox");
    fireEvent.mouseDown(typeSelect);
    await waitFor(() => {
      expect(screen.getByRole("option", { name: "Troca" })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("option", { name: "Troca" }));
    // Simula o fechamento do diálogo re-renderizando com open = false.
    rerender(
      <ThemeProvider theme={theme}>
        <ReturnExchangeForm
          open={false}
          onClose={onCloseMock}
          transactions={transactionsMock}
          products={productsMock}
          onSave={onSaveMock}
          setSnackbar={setSnackbarMock}
        />
      </ThemeProvider>
    );
    // Verifica que o diálogo não está visível.
    await waitFor(() => {
      const dialog = screen.queryByRole("dialog");
      expect(dialog).not.toBeVisible();
    });
  });

  test("calls handleSaveReturn and triggers onSave for devolução", async () => {
    axios.post.mockResolvedValue({
      status: 201,
      data: { transactionHistory: { id: "newTxn", transactionPrice: "100" } },
    });
    renderWithTheme(
      <ReturnExchangeForm
        open={true}
        onClose={onCloseMock}
        transactions={transactionsMock}
        products={productsMock}
        onSave={onSaveMock}
        setSnackbar={setSnackbarMock}
      />
    );
    // Seleciona "Devolução".
    const typeLabel = getLabel("Tipo");
    const typeSelect = within(typeLabel.parentElement).getByRole("combobox");
    fireEvent.mouseDown(typeSelect);
    await waitFor(() => {
      expect(screen.getByRole("option", { name: "Devolução" })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("option", { name: "Devolução" }));
    // Seleciona uma transação no campo "ID Transação".
    const txnLabel = getLabel("ID Transação");
    const txnSelect = within(txnLabel.parentElement).getByRole("combobox");
    fireEvent.mouseDown(txnSelect);
    await waitFor(() => {
      expect(screen.getByRole("option", { name: transactionsMock[0].id })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("option", { name: transactionsMock[0].id }));
    // Clica no botão para registrar a devolução.
    const saveButton = screen.getByRole("button", { name: /Registrar Devolução/i });
    fireEvent.click(saveButton);
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `/api/return/register`,
        { transactionId: transactionsMock[0].id },
        { withCredentials: true }
      );
      expect(onSaveMock).toHaveBeenCalledWith({ id: "newTxn", transactionPrice: "100" });
      expect(setSnackbarMock).toHaveBeenCalledWith({
        open: true,
        message: "Transação de devolução registrada com sucesso!",
        severity: "success",
      });
      expect(onCloseMock).toHaveBeenCalled();
    });
  });

  test("calls handleSaveExchange and triggers onSave for troca", async () => {
    // Prepara uma transação para troca.
    const transactionForExchange = {
      id: "txn2",
      productId: 101,
      transactionPrice: "100",
      Product: { name: "Product A", brand: "Brand A", color: "Red", size: "M", price: "100" },
      quantity: 1,
      supplierOrBuyer: "Supplier A",
      transactionDate: "2020-01-01T12:00:00Z",
      user: { name: "User A" },
    };
    const productsForExchange = [
      { id: 101, name: "Product A", brand: "Brand A", price: "100", size: "M", color: "Red" },
      { id: 102, name: "Product B", brand: "Brand B", price: "50", size: "L", color: "Blue" },
    ];
    axios.post.mockResolvedValue({
      status: 201,
      data: { transactions: [{ id: "txn_exchange", transactionPrice: "100" }] },
    });
    renderWithTheme(
      <ReturnExchangeForm
        open={true}
        onClose={onCloseMock}
        transactions={[transactionForExchange]}
        products={productsForExchange}
        onSave={onSaveMock}
        setSnackbar={setSnackbarMock}
      />
    );
    // Seleciona "Troca".
    const typeLabel = getLabel("Tipo");
    const typeSelect = within(typeLabel.parentElement).getByRole("combobox");
    fireEvent.mouseDown(typeSelect);
    await waitFor(() => {
      expect(screen.getByRole("option", { name: "Troca" })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("option", { name: "Troca" }));
    // Seleciona a transação no campo "ID Transação".
    const txnLabel = getLabel("ID Transação");
    const txnSelect = within(txnLabel.parentElement).getByRole("combobox");
    fireEvent.mouseDown(txnSelect);
    await waitFor(() => {
      expect(screen.getByRole("option", { name: transactionForExchange.id })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("option", { name: transactionForExchange.id }));
    // Para troca, o campo "Novo Produto" é exibido.
    const novoProdutoLabel = getLabel("Novo Produto");
    const novoProdutoSelect = within(novoProdutoLabel.parentElement).getByRole("combobox");
    fireEvent.mouseDown(novoProdutoSelect);
    await waitFor(() => {
      // O produto original (id: 101) é excluído; espera-se ver uma opção para Product B (id: 102)
      expect(screen.getByRole("option", { name: /\[102\]/i })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("option", { name: /\[102\]/i }));
    // Altera a "Quantidade" para que o total (50 * 2) seja igual ao valor original (100).
    const quantityInput = screen.getByLabelText("Quantidade");
    fireEvent.change(quantityInput, { target: { value: "2" } });
    // Clica no botão para registrar a troca.
    const saveButton = screen.getByRole("button", { name: /Registrar Troca/i });
    fireEvent.click(saveButton);
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `/api/exchange/register`,
        { transactionId: transactionForExchange.id, newProducts: [{ productId: 102, quantity: "2" }] },
        { withCredentials: true }
      );
      expect(onSaveMock).toHaveBeenCalledWith({ id: "txn_exchange", transactionPrice: "100" });
      expect(setSnackbarMock).toHaveBeenCalledWith({
        open: true,
        message: "Transação de troca registrada com sucesso!",
        severity: "success",
      });
      expect(onCloseMock).toHaveBeenCalled();
    });
  });
});
