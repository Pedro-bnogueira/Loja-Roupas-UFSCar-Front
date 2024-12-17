import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, IconButton, Snackbar, Alert } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { styled } from '@mui/system';
import ProductForm from "../../components/ProductForm";
import DeleteDialog from "../../components/DeleteDialog";

const url = process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL : "";

// Cabeçalho personalizado com título e botão
const HeaderBox = styled('div')(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: theme.spacing(2),
  marginTop: theme.spacing(4),
  padding: `0 ${theme.spacing(2)}`,
}));

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    category: "",
    price: "",
    stock: "",
  });
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  useEffect(() => {
    // Carregar a lista de produtos do backend
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${url}/api/get/products`, { withCredentials: true });
      if (response.status === 200 && response.data.products) {
        setProducts(response.data.products);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateClick = () => {
    setFormMode("create");
    setFormData({
      code: "",
      name: "",
      category: "",
      price: "",
      stock: "",
    });
    setOpenFormDialog(true);
  };

  const handleEditClick = (product) => {
    setFormMode("edit");
    setSelectedProductId(product.id);
    setFormData({
      code: product.code || "",
      name: product.name || "",
      category: product.category || "",
      price: product.price || "",
      stock: product.stock || "",
    });
    setOpenFormDialog(true);
  };

  const handleSaveProduct = async (data) => {
    try {
      if (formMode === "create") {
        const response = await axios.post(`${url}/api/new/product`, data, { withCredentials: true });
        if (response.status === 201 && response.data.product) {
          setProducts([...products, response.data.product]);
          setOpenFormDialog(false);
          handleSnackbarOpen("Produto cadastrado com sucesso!", "success");
        } else {
          handleSnackbarOpen("Erro ao cadastrar produto.", "error");
        }
      } else {
        const response = await axios.put(`${url}/edit/product/${selectedProductId}`, data, { withCredentials: true });
        if (response.status === 200 && response.data.product) {
          setProducts(products.map((p) => p.id === selectedProductId ? { ...p, ...response.data.product } : p));
          setOpenFormDialog(false);
          handleSnackbarOpen("Produto atualizado com sucesso!", "success");
        } else {
          handleSnackbarOpen("Erro ao atualizar produto.", "error");
        }
      }
    } catch (error) {
      console.log(error);
      handleSnackbarOpen("Ocorreu um erro ao salvar o produto.", "error");
    }
  };

  const handleDeleteClick = (id) => {
    setSelectedProductId(id);
    setOpenDeleteDialog(true);
  };

  const handleDeleteProduct = async () => {
    try {
      const response = await axios.delete(`${url}/api/delete/product/${selectedProductId}`, { withCredentials: true });
      if (response.status === 200) {
        setProducts(products.filter((p) => p.id !== selectedProductId));
        setOpenDeleteDialog(false);
        handleSnackbarOpen("Produto removido com sucesso!", "success");
      } else {
        handleSnackbarOpen("Erro ao remover produto.", "error");
      }
    } catch (error) {
      console.log(error);
      handleSnackbarOpen("Ocorreu um erro ao remover o produto.", "error");
    }
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
    <Box sx={{ marginTop: 10, paddingX: 2 }}>
      <HeaderBox>
        <Typography variant="h4" sx={{ fontWeight: 700, fontFamily: 'Montserrat, sans-serif' }}>
          Produtos cadastrados
        </Typography>
        <Button
          variant="contained"
          color="success"
          onClick={handleCreateClick}
          sx={{
            fontWeight: 600,
            textTransform: "none"
          }}
        >
          Adicionar produto +
        </Button>
      </HeaderBox>

      <Paper variant="outlined">
        <TableContainer component={Paper} variant="outlined">
          <Table aria-label="Tabela de Produtos">
            <TableHead>
              <TableRow>
                <TableCell><strong>Código</strong></TableCell>
                <TableCell><strong>Nome</strong></TableCell>
                <TableCell><strong>Categoria</strong></TableCell>
                <TableCell><strong>Preço</strong></TableCell>
                <TableCell><strong>Estoque</strong></TableCell>
                <TableCell><strong>Ações</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((p, index) => (
                <TableRow key={p.id}>
                  <TableCell>{p.code}</TableCell>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>{p.category}</TableCell>
                  <TableCell>R$ {parseFloat(p.price).toFixed(2)}</TableCell>
                  <TableCell>{p.stock}</TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      sx={{
                        backgroundColor: "#b3f1ba", // verde claro para edit
                        marginRight: 1,
                        "&:hover": {
                          backgroundColor: "#8ade93",
                        }
                      }}
                      onClick={() => handleEditClick(p)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      sx={{
                        backgroundColor: "#f9b5b5", // vermelho claro para delete
                        "&:hover": {
                          backgroundColor: "#f28a8a",
                        }
                      }}
                      onClick={() => handleDeleteClick(p.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Diálogo de Criação/Edição de Produto */}
      <ProductForm
        open={openFormDialog}
        onClose={() => setOpenFormDialog(false)}
        mode={formMode}
        formData={formData}
        onSave={handleSaveProduct}
      />

      {/* Diálogo de confirmação para exclusão */}
      <DeleteDialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        onConfirm={handleDeleteProduct}
        title="Deseja mesmo excluir este produto?"
        description="Esta ação não pode ser desfeita."
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
