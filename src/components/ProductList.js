import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, IconButton, Snackbar, Alert
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { styled } from '@mui/system';
import ProductForm from "./ProductForm";
import DeleteDialog from "./DeleteDialog";
import { formatMoneyToFloat } from "../utils/formatMoneyToFloat";

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
  const [categories, setCategories] = useState([]); // Armazenar categorias para o select
  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    price: "",
    size: "",
    color: "",
    categoryName: ""
  });
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
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

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${url}/api/get/categories`, { withCredentials: true });
      if (response.status === 200 && response.data.categories) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error(error);
    }
  };

  console.log(categories)

  const handleCreateClick = () => {
    setFormMode("create");
    setFormData({
      name: "",
      brand: "",
      price: "",
      size: "",
      color: "",
      categoryName: ""
    });
    setOpenFormDialog(true);
  };

  const handleEditClick = (product) => {
    setFormMode("edit");
    setSelectedProductId(product.id);

    // Verifica se existe categoria
    const currentCategoryName = product.category ? product.category.name : "";

    setFormData({
      name: product.name || "",
      brand: product.brand || "",
      price: product.price || "",
      size: product.size || "",
      color: product.color || "",
      categoryName: currentCategoryName,
    });
    setOpenFormDialog(true);
  };

  const handleSaveProduct = async (data) => {
    try {
      // Aqui transformaremos o categoryName em categoryId
      let categoryId = null;
      if (data.categoryName) {
        const foundCategory = categories.find(cat => cat.name === data.categoryName);
        if (foundCategory) {
          categoryId = foundCategory.id;
        }
      }
      console.log(data.price)
      const payload = {
        name: data.name,
        brand: data.brand,
        price: data.price,
        size: data.size,
        color: data.color,
        category: data.categoryName
      };

      if (formMode === "create") {
        const response = await axios.post(`${url}/api/new/product`, payload, { withCredentials: true });
        if (response.status === 201 && response.data.product) {
          setProducts([...products, response.data.product]);
          setOpenFormDialog(false);
          handleSnackbarOpen("Produto cadastrado com sucesso!", "success");
        } else {
          handleSnackbarOpen("Erro ao cadastrar produto.", "error");
        }
      } else {
        const response = await axios.put(`${url}/api/update/product/${selectedProductId}`, payload, { withCredentials: true });
        if (response.status === 200 && response.data.editedProduct) {
          setProducts(products.map((p) => p.id === selectedProductId ? { ...p, ...response.data.editedProduct } : p));
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
    <>
      <HeaderBox>
        <Typography variant="h4" sx={{ fontWeight: 700, fontFamily: 'Montserrat, sans-serif' }}>
          Produtos cadastrados
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleCreateClick}
          sx={{
            fontWeight: 600,
            textTransform: "none"
          }}
          startIcon={<AddIcon />}
        >
          Adicionar produto
        </Button>
      </HeaderBox>

      <Paper variant="outlined">
        <TableContainer component={Paper} variant="outlined">
          <Table aria-label="Tabela de Produtos">
            <TableHead>
              <TableRow>
                <TableCell><strong>ID</strong></TableCell>
                <TableCell><strong>Nome</strong></TableCell>
                <TableCell><strong>Marca</strong></TableCell>
                <TableCell><strong>Preço</strong></TableCell>
                <TableCell><strong>Tamanho</strong></TableCell>
                <TableCell><strong>Cor</strong></TableCell>
                <TableCell><strong>Categoria</strong></TableCell>
                <TableCell><strong>Ações</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.id}</TableCell>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>{p.brand}</TableCell>
                  <TableCell>R$ {parseFloat(p.price).toFixed(2)}</TableCell>
                  <TableCell>{p.size}</TableCell>
                  <TableCell>{p.color}</TableCell>
                  <TableCell>{p.category ? p.category.name : ""}</TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      sx={{
                        backgroundColor: "#b3f1ba", 
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
                        backgroundColor: "#f9b5b5", 
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
              {products.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    Nenhum produto cadastrado.
                  </TableCell>
                </TableRow>
              )}
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
        categories={categories} // Passando as categorias para o form
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
    </>
  );
}
