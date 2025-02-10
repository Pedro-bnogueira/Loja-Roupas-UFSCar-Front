/* eslint-disable testing-library/no-wait-for-multiple-assertions */
// ProductForm.test.js
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ProductForm from "../ProductForm";
import { ThemeProvider, createTheme } from "@mui/material/styles";

// Create a minimal theme to wrap the component
const theme = createTheme();
const renderWithTheme = (ui, options) =>
  render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>, options);

const initialData = {
  name: "Test Product",
  brand: "Test Brand",
  price: 123.45,
  size: "M",
  color: "Red",
  categoryName: "Category 1",
  alertThreshold: 10,
};

const categories = [
  { id: 1, name: "Category 1" },
  { id: 2, name: "Category 2" },
];

describe("ProductForm Component", () => {
  test("renders with provided formData", () => {
    renderWithTheme(
      <ProductForm
        open={true}
        onClose={() => {}}
        mode="create"
        formData={initialData}
        onSave={() => {}}
        categories={categories}
      />
    );

    // Query text fields by label (using regex to ignore case/whitespace)
    expect(screen.getByLabelText(/Nome/i)).toHaveValue(initialData.name);
    expect(screen.getByLabelText(/Marca/i)).toHaveValue(initialData.brand);
    // Assume NumericFormat displays the formatted price as "R$ 123,45"
    expect(screen.getByLabelText(/Preço/i)).toHaveValue("R$ 123,45");
    expect(screen.getByLabelText(/Tamanho/i)).toHaveValue(initialData.size);
    expect(screen.getByLabelText(/Cor/i)).toHaveValue(initialData.color);
    expect(screen.getByLabelText(/Alerta de Estoque Mínimo/i)).toHaveValue(initialData.alertThreshold);
    // For the category field, query the combobox (which is how MUI renders a Select)
    const categoryCombo = screen.getByRole("combobox");
    expect(categoryCombo).toHaveTextContent(initialData.categoryName);
  });

  test("displays error messages on invalid submit", async () => {
    const emptyData = {
      name: "",
      brand: "",
      price: null,
      size: "",
      color: "",
      categoryName: "",
      alertThreshold: "",
    };

    renderWithTheme(
      <ProductForm
        open={true}
        onClose={() => {}}
        mode="create"
        formData={emptyData}
        onSave={() => {}}
        categories={categories}
      />
    );

    // Use getByRole to select the submit button unambiguously
    fireEvent.click(screen.getByRole("button", { name: /^Adicionar$/i }));

    await waitFor(() => {
      expect(screen.getByText(/O nome é obrigatório\./i)).toBeInTheDocument();
      expect(screen.getByText(/A marca é obrigatória\./i)).toBeInTheDocument();
      expect(screen.getByText(/O preço é obrigatório\./i)).toBeInTheDocument();
      expect(screen.getByText(/O tamanho é obrigatório\./i)).toBeInTheDocument();
      expect(screen.getByText(/A cor é obrigatória\./i)).toBeInTheDocument();
    });
  });

  test("calls onSave with correct data when form is valid", async () => {
    const onSaveMock = jest.fn();

    renderWithTheme(
      <ProductForm
        open={true}
        onClose={() => {}}
        mode="create"
        formData={initialData}
        onSave={onSaveMock}
        categories={categories}
      />
    );

    // Simulate updating the "Nome" field using a regex query
    fireEvent.change(screen.getByLabelText(/Nome/i), {
      target: { value: "Updated Product" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^Adicionar$/i }));

    await waitFor(() => {
      expect(onSaveMock).toHaveBeenCalledTimes(1);
      expect(onSaveMock).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Updated Product",
          brand: initialData.brand,
          price: initialData.price,
          size: initialData.size,
          color: initialData.color,
          categoryName: initialData.categoryName,
          alertThreshold: initialData.alertThreshold,
        })
      );
    });
  });

  test("calls onClose when Cancel button is clicked", () => {
    const onCloseMock = jest.fn();

    renderWithTheme(
      <ProductForm
        open={true}
        onClose={onCloseMock}
        mode="create"
        formData={initialData}
        onSave={() => {}}
        categories={categories}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Cancelar/i }));
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  test("updates state when inputs are changed", () => {
    renderWithTheme(
      <ProductForm
        open={true}
        onClose={() => {}}
        mode="create"
        formData={initialData}
        onSave={() => {}}
        categories={categories}
      />
    );

    const nameInput = screen.getByLabelText(/Nome/i);
    fireEvent.change(nameInput, { target: { value: "New Name" } });
    expect(nameInput).toHaveValue("New Name");
  });

  test("resets form when formData prop changes or dialog reopens", () => {
    const { rerender } = renderWithTheme(
      <ProductForm
        open={true}
        onClose={() => {}}
        mode="edit"
        formData={initialData}
        onSave={() => {}}
        categories={categories}
      />
    );

    const nameInput = screen.getByLabelText(/Nome/i);
    fireEvent.change(nameInput, { target: { value: "Changed Name" } });
    expect(nameInput).toHaveValue("Changed Name");

    const newData = { ...initialData, name: "Reset Name" };
    rerender(
      <ThemeProvider theme={theme}>
        <ProductForm
          open={true}
          onClose={() => {}}
          mode="edit"
          formData={newData}
          onSave={() => {}}
          categories={categories}
        />
      </ThemeProvider>
    );

    expect(screen.getByLabelText(/Nome/i)).toHaveValue("Reset Name");
  });
});
