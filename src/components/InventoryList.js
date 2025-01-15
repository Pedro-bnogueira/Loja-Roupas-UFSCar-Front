import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, IconButton, Tooltip, 
  Button, Stack, Snackbar, Alert 
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import LocalMallIcon from '@mui/icons-material/LocalMall';

import TransactionForm from "./TransactionForm";
import DeleteDialog from "./DeleteDialog"; // Se você quiser permitir deletar transações ou estoque
import { formatMoneyToFloat } from "../utils/formatMoneyToFloat"; // Certifique-se que esta função está correta

const url = process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL : "";

export default function InventoryList() {
  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);
  const [openTransactionForm, setOpenTransactionForm] = useState(false);
  const [transactionType, setTransactionType] = useState("in"); // 'in' (compra) ou 'out' (venda)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  useEffect(() => {
    fetchInventory();
    fetchProducts();
  }, []);
  
  const fetchInventory = async () => {
    try {
      const response = await axios.get(`${url}/api/get/stock`, { withCredentials: true });
      if (response.status === 200 && response.data.stock) {
        setInventory(response.data.stock);
      }
    } catch (error) {
      console.error(error);
      handleSnackbarOpen("Erro ao buscar estoque.", "error");
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${url}/api/get/products`, { withCredentials: true });
      if (response.status === 200 && response.data.products) {
        setProducts(response.data.products);
      }
    } catch (error) {
      console.error(error);
      handleSnackbarOpen("Erro ao buscar produtos.", "error");
    }
  };

  // Abre o formulário de transação (compra ou venda)
  const handleOpenTransactionForm = (type) => {
    setTransactionType(type);
    setOpenTransactionForm(true);
  };

  // Fecha o formulário de transação
  const handleCloseTransactionForm = () => {
    setOpenTransactionForm(false);
  };

  // Ao salvar a transação, atualizamos o estoque local
  const handleSaveTransaction = (newTransaction) => {
    const { type, productId, quantity } = newTransaction;

    // Atualiza o estoque local
    const updatedInventory = inventory.map(item => {
      if (item.productId === productId) {
        const updatedQuantity = type === 'in'
          ? item.quantity + quantity
          : item.quantity - quantity;
        return { ...item, quantity: updatedQuantity };
      }
      return item;
    });
    setInventory(updatedInventory);

    // Mostra feedback
    handleSnackbarOpen(`Transação de ${type === 'in' ? 'compra' : 'venda'} registrada com sucesso!`, "success");

    // Fecha o modal
    setOpenTransactionForm(false);
  };

  const handleSnackbarOpen = (message, severity = "success") => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const handleSnackbarClose = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  return (
    <Box sx={{ paddingX: 2 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, fontFamily: 'Montserrat, sans-serif', mb: 2 }}>
        Controle de Estoque
      </Typography>

      {/* Botões para registrar compra e venda */}
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddShoppingCartIcon />}
          onClick={() => handleOpenTransactionForm("in")}
        >
          Registrar Compra
        </Button>

        <Button 
          variant="contained" 
          color="secondary" 
          startIcon={<LocalMallIcon />}
          onClick={() => handleOpenTransactionForm("out")}
        >
          Registrar Venda
        </Button>
      </Stack>

      <Paper variant="outlined">
        <TableContainer component={Paper} variant="outlined">
          <Table aria-label="Tabela de Controle de Estoque">
            <TableHead>
              <TableRow>
                <TableCell><strong>Código do Produto</strong></TableCell>
                <TableCell><strong>Nome</strong></TableCell>
                <TableCell><strong>Marca</strong></TableCell>
                <TableCell><strong>Cor</strong></TableCell>
                <TableCell><strong>Tamanho</strong></TableCell>
                <TableCell><strong>Quantidade em Estoque</strong></TableCell>
                <TableCell><strong>Valor do Estoque (R$)</strong></TableCell>
                <TableCell><strong>Ações</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {inventory.map((item) => {
                const stockValue = (item.quantity * item.product.price).toFixed(2);
                return (
                  <TableRow key={item.id}>
                    <TableCell>{item.productId}</TableCell>
                    <TableCell>{item.product.name}</TableCell>
                    <TableCell>{item.product.brand}</TableCell>
                    <TableCell>{item.product.color}</TableCell>
                    <TableCell>{item.product.size}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>R$ {stockValue}</TableCell>
                    <TableCell>
                      <Tooltip title="Editar Estoque">
                        <IconButton
                          color="primary"
                          sx={{
                            backgroundColor: "#b3f1ba",
                            "&:hover": {
                              backgroundColor: "#8ade93",
                            }
                          }}
                          onClick={() => alert(`Editar estoque do produto ID ${item.productId}`)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
              {inventory.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    Nenhum produto em estoque.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Modal para registrar compra/venda */}
      <TransactionForm
        open={openTransactionForm}
        onClose={handleCloseTransactionForm}
        type={transactionType}  // 'in' ou 'out'
        products={products}   // Para listar produtos existentes
        onSave={handleSaveTransaction}
        setSnackbar={setSnackbar}
      />

      {/* Snackbar para Feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
