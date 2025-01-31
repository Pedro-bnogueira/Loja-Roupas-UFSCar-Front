import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CategoryForm from "../CategoryForm";
import "@testing-library/jest-dom";

describe("CategoryForm Component", () => {
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();
  const initialFormData = { name: "" };
  const filledFormData = { name: "Roupas de Verão" };

  const renderComponent = (formData = initialFormData, open = true) => {
    render(
      <CategoryForm
        open={open}
        onClose={mockOnClose}
        formData={formData}
        onSave={mockOnSave}
      />
    );
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders the dialog with correct title when open", async () => {
    renderComponent();
    await screen.findByText("Adicionar Categoria");
  });

  test("does not render the dialog when open is false", () => {
    renderComponent(initialFormData, false);
    expect(screen.queryByText("Adicionar Categoria")).not.toBeInTheDocument();
  });

  test("renders the category name input field", async () => {
    renderComponent();
    const nameInput = await screen.findByRole("textbox", { name: /Nome da Categoria/i });
    expect(nameInput).toBeInTheDocument();
    expect(nameInput).toHaveValue("");
  });

  test("displays error message when submitting empty category name", async () => {
    renderComponent();
    const addButton = await screen.findByRole("button", { name: /Adicionar/i });
    fireEvent.click(addButton);

    expect(await screen.findByText("O nome da categoria é obrigatório.")).toBeInTheDocument();
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  test("calls onSave with correct data when submitting valid category name", async () => {
    renderComponent();

    const nameInput = await screen.findByRole("textbox", { name: /Nome da Categoria/i });
    fireEvent.change(nameInput, { target: { value: "Roupas de Verão" } });

    const addButton = await screen.findByRole("button", { name: /Adicionar/i });
    fireEvent.click(addButton);

    await waitFor(() => expect(mockOnSave).toHaveBeenCalledWith({ name: "Roupas de Verão" }));
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  test("calls onClose when clicking the cancel button", async () => {
    renderComponent();
    const cancelButton = await screen.findByRole("button", { name: /Cancelar/i });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  test("resets form data and errors when formData prop changes", async () => {
    const { rerender } = render(
      <CategoryForm open={true} onClose={mockOnClose} formData={initialFormData} onSave={mockOnSave} />
    );

    const addButton = await screen.findByRole("button", { name: /Adicionar/i });
    fireEvent.click(addButton);
    expect(await screen.findByText("O nome da categoria é obrigatório.")).toBeInTheDocument();

    rerender(<CategoryForm open={true} onClose={mockOnClose} formData={filledFormData} onSave={mockOnSave} />);

    const nameInput = await screen.findByRole("textbox", { name: /Nome da Categoria/i });
    expect(nameInput).toHaveValue("Roupas de Verão");

    expect(screen.queryByText("O nome da categoria é obrigatório.")).not.toBeInTheDocument();
  });

  test("does not call onSave if validation fails after changing input", async () => {
    renderComponent();

    const nameInput = await screen.findByRole("textbox", { name: /Nome da Categoria/i });
    fireEvent.change(nameInput, { target: { value: "   " } });

    const addButton = await screen.findByRole("button", { name: /Adicionar/i });
    fireEvent.click(addButton);

    expect(await screen.findByText("O nome da categoria é obrigatório.")).toBeInTheDocument();
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  test("allows submitting the form multiple times with valid data", async () => {
    renderComponent();

    const nameInput = await screen.findByRole("textbox", { name: /Nome da Categoria/i });
    const addButton = await screen.findByRole("button", { name: /Adicionar/i });

    fireEvent.change(nameInput, { target: { value: "Roupas de Inverno" } });
    fireEvent.click(addButton);
    await waitFor(() => expect(mockOnSave).toHaveBeenCalledWith({ name: "Roupas de Inverno" }));

    jest.clearAllMocks();

    fireEvent.change(nameInput, { target: { value: "Acessórios" } });
    fireEvent.click(addButton);
    await waitFor(() => expect(mockOnSave).toHaveBeenCalledWith({ name: "Acessórios" }));
  });
});
