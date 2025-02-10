/* eslint-disable testing-library/no-node-access */
/* eslint-disable testing-library/no-wait-for-multiple-assertions */
/* eslint-disable testing-library/prefer-find-by */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ProductList from "../ProductList";
import axios from "axios";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";

// --- Mocks ---
jest.mock("axios");

jest.mock("jspdf", () => {
  return jest.fn().mockImplementation(() => ({
    setFontSize: jest.fn(),
    text: jest.fn(),
    autoTable: jest.fn(),
    save: jest.fn(),
  }));
});

jest.mock("xlsx", () => {
  return {
    utils: {
      book_new: jest.fn().mockReturnValue({}),
      aoa_to_sheet: jest.fn().mockReturnValue({}),
      book_append_sheet: jest.fn(),
    },
    writeFile: jest.fn(),
  };
});

// Create a minimal MUI theme for rendering
const theme = createTheme();
const renderWithTheme = (ui) =>
  render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);

// Sample mock data
const productsMock = [
  {
    id: 1,
    name: "Product A",
    brand: "Brand A",
    price: 100,
    size: "M",
    color: "Red",
    category: { name: "Category 1" },
    alertThreshold: 5,
  },
  {
    id: 2,
    name: "Product B",
    brand: "Brand B",
    price: 200,
    size: "L",
    color: "Blue",
    category: { name: "Category 2" },
    alertThreshold: 3,
  },
];

const categoriesMock = [
  { id: 1, name: "Category 1" },
  { id: 2, name: "Category 2" },
];

describe("ProductList Page", () => {
  beforeEach(() => {
    axios.get.mockReset();
    axios.post.mockReset();
    axios.put.mockReset();
    axios.delete.mockReset();
    jsPDF.mockClear();
    XLSX.writeFile.mockClear();
  });

  test("renders header, export buttons, and Add product button and displays products", async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes("/api/get/products")) {
        return Promise.resolve({
          status: 200,
          data: { products: productsMock },
        });
      }
      if (url.includes("/api/get/categories")) {
        return Promise.resolve({
          status: 200,
          data: { categories: categoriesMock },
        });
      }
      return Promise.reject();
    });

    renderWithTheme(<ProductList />);
    expect(screen.getByText(/Produtos cadastrados/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^Adicionar produto$/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Exportar PDF/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Exportar Excel/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Product A")).toBeInTheDocument();
      expect(screen.getByText("Product B")).toBeInTheDocument();
    });
  });

  test("shows 'Nenhum produto cadastrado.' when there are no products", async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes("/api/get/products")) {
        return Promise.resolve({ status: 200, data: { products: [] } });
      }
      if (url.includes("/api/get/categories")) {
        return Promise.resolve({ status: 200, data: { categories: categoriesMock } });
      }
      return Promise.reject();
    });
    renderWithTheme(<ProductList />);
    await waitFor(() => {
      expect(screen.getByText(/Nenhum produto cadastrado\./i)).toBeInTheDocument();
    });
  });

  test("opens ProductForm dialog when 'Adicionar produto' button is clicked", async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes("/api/get/products")) {
        return Promise.resolve({
          status: 200,
          data: { products: productsMock },
        });
      }
      if (url.includes("/api/get/categories")) {
        return Promise.resolve({
          status: 200,
          data: { categories: categoriesMock },
        });
      }
      return Promise.reject();
    });

    renderWithTheme(<ProductList />);
    await waitFor(() => expect(screen.getByText("Product A")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /^Adicionar produto$/i }));
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /Adicionar Produto/i })
      ).toBeInTheDocument();
    });
  });

  test("opens ProductForm dialog in edit mode when Edit icon is clicked", async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes("/api/get/products")) {
        return Promise.resolve({
          status: 200,
          data: { products: productsMock },
        });
      }
      if (url.includes("/api/get/categories")) {
        return Promise.resolve({
          status: 200,
          data: { categories: categoriesMock },
        });
      }
      return Promise.reject();
    });
    renderWithTheme(<ProductList />);
    await waitFor(() => expect(screen.getByText("Product A")).toBeInTheDocument());
    const rows = screen.getAllByRole("row");
    const productRow = rows[1]; // header row is index 0
    // Assume the first button in the row is the Edit button.
    const editButton = productRow.querySelector("button");
    fireEvent.click(editButton);
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /Editar Produto/i })).toBeInTheDocument();
    });
  });

  test("opens DeleteDialog when Delete icon is clicked", async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes("/api/get/products")) {
        return Promise.resolve({
          status: 200,
          data: { products: productsMock },
        });
      }
      if (url.includes("/api/get/categories")) {
        return Promise.resolve({
          status: 200,
          data: { categories: categoriesMock },
        });
      }
      return Promise.reject();
    });
    renderWithTheme(<ProductList />);
    await waitFor(() => expect(screen.getByText("Product A")).toBeInTheDocument());
    const rows = screen.getAllByRole("row");
    const productRow = rows[1];
    const actionButtons = productRow.querySelectorAll("button");
    const deleteButton = actionButtons[1]; // assume second button is Delete
    fireEvent.click(deleteButton);
    await waitFor(() => {
      expect(screen.getByText(/Deseja mesmo excluir este produto\?/i)).toBeInTheDocument();
    });
  });

  test("filters products by search input", async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes("/api/get/products")) {
        return Promise.resolve({
          status: 200,
          data: { products: productsMock },
        });
      }
      if (url.includes("/api/get/categories")) {
        return Promise.resolve({
          status: 200,
          data: { categories: categoriesMock },
        });
      }
      return Promise.reject();
    });
    renderWithTheme(<ProductList />);
    await waitFor(() => expect(screen.getByText("Product A")).toBeInTheDocument());
    const searchInput = screen.getByLabelText(/Pesquisar/i);
    fireEvent.change(searchInput, { target: { value: "Brand B" } });
    await waitFor(() => {
      expect(screen.queryByText("Product A")).not.toBeInTheDocument();
      expect(screen.getByText("Product B")).toBeInTheDocument();
    });
  });

  test("filters products by attribute and value", async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes("/api/get/products")) {
        return Promise.resolve({
          status: 200,
          data: { products: productsMock },
        });
      }
      if (url.includes("/api/get/categories")) {
        return Promise.resolve({
          status: 200,
          data: { categories: categoriesMock },
        });
      }
      return Promise.reject();
    });
  
    renderWithTheme(<ProductList />);
    await waitFor(() => expect(screen.getByText("Product A")).toBeInTheDocument());
  
    // Recupera o select de atributo usando o papel "combobox"
    let comboboxes = screen.getAllByRole("combobox");
    // Inicialmente, somente o select de atributo está renderizado
    expect(comboboxes.length).toBe(1);
    const attributeSelect = comboboxes[0];
  
    // Abre o select de atributo e seleciona a opção "Marca"
    fireEvent.mouseDown(attributeSelect);
    await waitFor(() => {
      expect(screen.getByRole("option", { name: "Marca" })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("option", { name: "Marca" }));
  
    // Após selecionar o atributo, o select para o valor é renderizado (total de 2 comboboxes)
    await waitFor(() => {
      comboboxes = screen.getAllByRole("combobox");
      expect(comboboxes.length).toBe(2);
    });
    // O segundo combobox corresponde ao filtro por valor
    const valueSelect = screen.getAllByRole("combobox")[1];
  
    // Abre o select de valor e escolhe a opção "Brand A"
    fireEvent.mouseDown(valueSelect);
    await waitFor(() => {
      expect(screen.getByRole("option", { name: "Brand A" })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("option", { name: "Brand A" }));
  
    // Verifica se apenas os produtos com a marca "Brand A" permanecem visíveis
    await waitFor(() => {
      expect(screen.getByText("Product A")).toBeInTheDocument();
      expect(screen.queryByText("Product B")).not.toBeInTheDocument();
    });
  });

  test("calls export functions when export buttons are clicked", async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes("/api/get/products")) {
        return Promise.resolve({
          status: 200,
          data: { products: productsMock },
        });
      }
      if (url.includes("/api/get/categories")) {
        return Promise.resolve({
          status: 200,
          data: { categories: categoriesMock },
        });
      }
      return Promise.reject();
    });
    renderWithTheme(<ProductList />);
    await waitFor(() => expect(screen.getByText("Product A")).toBeInTheDocument());

    const exportPDFButton = screen.getByRole("button", { name: /Exportar PDF/i });
    fireEvent.click(exportPDFButton);
    await waitFor(() => {
      expect(jsPDF).toHaveBeenCalled();
    });

    const exportExcelButton = screen.getByRole("button", { name: /Exportar Excel/i });
    fireEvent.click(exportExcelButton);
    await waitFor(() => {
      expect(XLSX.writeFile).toHaveBeenCalled();
    });
  });
});
