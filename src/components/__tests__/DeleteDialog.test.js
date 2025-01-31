import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import DeleteDialog from "../DeleteDialog";
import '@testing-library/jest-dom';

describe("DeleteDialog Component", () => {
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();
  const title = "Confirmar Deleção";
  const description = "Tem certeza que deseja excluir este item?";

  const renderComponent = (open = true) => {
    return render( // <-- Retornando o resultado do render()
      <DeleteDialog
        open={open}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        title={title}
        description={description}
      />
    );
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders the dialog when open is true", () => {
    renderComponent(true);

    expect(screen.getByText(title)).toBeInTheDocument();
    expect(screen.getByText(description)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Não/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Sim/i })).toBeInTheDocument();
  });

  test("does not render the dialog when open is false", () => {
    renderComponent(false);

    expect(screen.queryByText(title)).not.toBeInTheDocument();
    expect(screen.queryByText(description)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Não/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Sim/i })).not.toBeInTheDocument();
  });

  test("calls onClose when 'Não' button is clicked", () => {
    renderComponent(true);

    fireEvent.click(screen.getByRole("button", { name: /Não/i }));

    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  test("calls onConfirm when 'Sim' button is clicked", () => {
    renderComponent(true);

    fireEvent.click(screen.getByRole("button", { name: /Sim/i }));

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  test("matches snapshot when open", () => {
    const { asFragment } = renderComponent(true); // Agora funciona corretamente
    expect(asFragment()).toMatchSnapshot();
  });

  test("matches snapshot when closed", () => {
    const { asFragment } = renderComponent(false); // Agora funciona corretamente
    expect(asFragment()).toMatchSnapshot();
  });
});
