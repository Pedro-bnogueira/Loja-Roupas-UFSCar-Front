import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, IconButton, Snackbar, Alert
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { styled } from '@mui/system';
import DeleteDialog from "./DeleteDialog";
import CategoryForm from "./CategoryForm";

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

export default function CategoryList() {
  const [categories, setCategories] = useState([]);
  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [formData, setFormData] = useState({ name: "" });
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  useEffect(() => {
    fetchCategories();
  }, []);

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

  const handleCreateClick = () => {
    setFormData({ name: "" });
    setOpenFormDialog(true);
  };

  const handleSaveCategory = async (data) => {
    try {
      const response = await axios.post(`${url}/api/new/category`, data, { withCredentials: true });
      if (response.status === 201 && response.data.category) {
        setCategories([...categories, response.data.category]);
        setOpenFormDialog(false);
        handleSnackbarOpen("Categoria cadastrada com sucesso!", "success");
      } else {
        handleSnackbarOpen("Erro ao cadastrar categoria.", "error");
      }
    } catch (error) {
      console.log(error);
      handleSnackbarOpen("Ocorreu um erro ao salvar a categoria.", "error");
    }
  };

  const handleDeleteClick = (id) => {
    setSelectedCategoryId(id);
    setOpenDeleteDialog(true);
  };

  const handleDeleteCategory = async () => {
    try {
      const response = await axios.delete(`${url}/api/delete/category/${selectedCategoryId}`, { withCredentials: true });
      if (response.status === 200) {
        setCategories(categories.filter((c) => c.id !== selectedCategoryId));
        setOpenDeleteDialog(false);
        handleSnackbarOpen("Categoria removida com sucesso!", "success");
      } else {
        handleSnackbarOpen("Erro ao remover categoria.", "error");
      }
    } catch (error) {
      console.log(error);
      handleSnackbarOpen("Ocorreu um erro ao remover a categoria.", "error");
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
          Categorias
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
          Adicionar categoria
        </Button>
      </HeaderBox>

      <Paper variant="outlined">
        <TableContainer component={Paper} variant="outlined">
          <Table aria-label="Tabela de Categorias">
            <TableHead>
              <TableRow>
                <TableCell><strong>ID</strong></TableCell>
                <TableCell><strong>Nome</strong></TableCell>
                <TableCell><strong>Quantidade de Produtos</strong></TableCell>
                <TableCell><strong>Ações</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.id}</TableCell>
                  <TableCell>{c.name}</TableCell>
                  <TableCell>{c.productCount}</TableCell>
                  <TableCell>
                    <IconButton
                      color="error"
                      sx={{
                        backgroundColor: "#f9b5b5",
                        "&:hover": {
                          backgroundColor: "#f28a8a",
                        }
                      }}
                      onClick={() => handleDeleteClick(c.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {categories.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    Nenhuma categoria cadastrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Diálogo de Criação de Categoria */}
      <CategoryForm
        open={openFormDialog}
        onClose={() => setOpenFormDialog(false)}
        formData={formData}
        onSave={handleSaveCategory}
      />

      {/* Diálogo de confirmação para exclusão */}
      <DeleteDialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        onConfirm={handleDeleteCategory}
        title="Deseja mesmo excluir esta categoria?"
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
