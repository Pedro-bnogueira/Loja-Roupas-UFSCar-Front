import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";
import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    Snackbar,
    Alert,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";

import DeleteDialog from "../../components/DeleteDialog";
import UserForm from "../../components/UserForm";

const url = process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL : "";

function UserList() {
    const navigate = useNavigate();
    const token = Cookies.get("LojaRoupa");
    const [authenticated, setAuthenticated] = useState(false);
    const [users, setUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [loading, setLoading] = useState(true);

    // Diálogo de exclusão
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    // Diálogo de criação/edição
    const [openFormDialog, setOpenFormDialog] = useState(false);
    const [formMode, setFormMode] = useState("create"); // "create" ou "edit"
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        accessLevel: "user",
    });

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success",
    });

    useEffect(() => {
        // Para obter todos os usuários, usamos POST /get/users conforme seu backend
        axios.post(`${url}/api/get/users`, {}, {
            withCredentials: true,
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((response) => {
                if (response.status === 200 && response.data.users) {
                    setUsers(response.data.users);
                    setAuthenticated(true);
                    setLoading(false);
                } else {
                    navigate("/login");
                }
            })
            .catch(() => {
                navigate("/login");
            });
    }, [navigate, token]);

    if (!authenticated) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="100vh"
            >
                <CircularProgress />
            </Box>
        );
    }

    // Função para remover um usuário
    async function removeUser(id) {
        try {
            const response = await axios.post(
                `${url}/api/delete/user/${id}`, 
                {}, // body vazio
                {
                    headers: { Authorization: `Bearer ${token}` },
                    withCredentials: true,
                }
            );
            if (response.status === 200) {
                setUsers(users.filter((u) => u.id !== id));
                setOpenDeleteDialog(false);
                handleSnackbarOpen("Usuário removido com sucesso!", "success");
            } else {
                handleSnackbarOpen("Erro ao remover usuário.", "error");
            }
        } catch (error) {
            console.log(error);
            handleSnackbarOpen("Ocorreu um erro ao remover o usuário.", "error");
        }
    }

    // Abrir o formulário para criar um novo usuário
    const handleCreateClick = () => {
        setFormMode("create");
        setFormData({
            name: "",
            email: "",
            password: "",
            accessLevel: "user",
        });
        setOpenFormDialog(true);
    };

    // Abrir o formulário para editar um usuário
    const handleEditClick = (user) => {
        setFormMode("edit");
        setSelectedUserId(user.id);
        setFormData({
            name: user.name,
            email: user.email,
            password: "", // Não exibimos a senha atual
            accessLevel: user.accessLevel,
        });
        setOpenFormDialog(true);
    };

    // Salvar as alterações do formulário (criar/editar)
    const handleSaveUser = async (data) => {
        try {
            if (formMode === "create") {
                const response = await axios.post(
                    `${url}/api/new/user`,
                    data,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                        withCredentials: true,
                    }
                );
                if (response.status === 201 && response.data.user) {
                    setUsers([...users, response.data.user]);
                    setOpenFormDialog(false);
                    handleSnackbarOpen("Usuário cadastrado com sucesso!", "success");
                } else {
                    handleSnackbarOpen("Erro ao cadastrar usuário.", "error");
                }
            } else {
                const response = await axios.post(
                    `${url}/api/edit/user/${selectedUserId}`,
                    data,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                        withCredentials: true,
                    }
                );
                if (response.status === 200 && response.data.user) {
                    setUsers(
                        users.map((u) =>
                            u.id === selectedUserId ? { ...u, ...response.data.user } : u
                        )
                    );
                    setOpenFormDialog(false);
                    handleSnackbarOpen("Usuário atualizado com sucesso!", "success");
                } else {
                    handleSnackbarOpen("Erro ao atualizar usuário.", "error");
                }
            }
        } catch (error) {
            console.log(error);
            handleSnackbarOpen("Ocorreu um erro ao salvar o usuário.", "error");
        }
    };

    // Função para abrir o Snackbar
    const handleSnackbarOpen = (message, severity = "success") => {
        setSnackbar({
            open: true,
            message,
            severity,
        });
    };

    // Função para fechar o Snackbar
    const handleSnackbarClose = () => {
        setSnackbar({
            ...snackbar,
            open: false,
        });
    };

    return (
        <>
            <Box sx={{ marginTop: 10, paddingX: 2 }}>
                <Typography variant="h4" align="center" gutterBottom>
                    Gerenciamento de Usuários
                </Typography>
                <Box display="flex" justifyContent="flex-end" mb={2}>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={handleCreateClick}
                    >
                        Adicionar Usuário
                    </Button>
                </Box>
                <Paper>
                    <TableContainer component={Paper}>
                        <Table aria-label="Tabela de Usuários">
                            <TableHead>
                                <TableRow sx={{ bgcolor: "primary.main" }}>
                                    <TableCell sx={{ color: "primary.contrastText" }}>#</TableCell>
                                    <TableCell sx={{ color: "primary.contrastText" }}>Nome</TableCell>
                                    <TableCell sx={{ color: "primary.contrastText" }}>Email</TableCell>
                                    <TableCell sx={{ color: "primary.contrastText" }}>Nível de Acesso</TableCell>
                                    <TableCell sx={{ color: "primary.contrastText" }} align="center">Ações</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {users &&
                                    users.map((usr, index) => (
                                        <TableRow key={usr.id}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{usr.name}</TableCell>
                                            <TableCell>{usr.email}</TableCell>
                                            <TableCell>{usr.accessLevel}</TableCell>
                                            <TableCell align="center">
                                                <IconButton
                                                    color="error"
                                                    onClick={() => {
                                                        setSelectedUserId(usr.id);
                                                        setOpenDeleteDialog(true);
                                                    }}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                                <IconButton
                                                    color="primary"
                                                    onClick={() => handleEditClick(usr)}
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </Box>

            {/* Diálogo de confirmação para exclusão */}
            <DeleteDialog
                open={openDeleteDialog}
                onClose={() => setOpenDeleteDialog(false)}
                onConfirm={() => removeUser(selectedUserId)}
                title="Deseja mesmo excluir este usuário?"
                description="Esta ação não pode ser desfeita."
            />

            {/* Diálogo para Criação/Edição de Usuário */}
            <UserForm
                open={openFormDialog}
                onClose={() => setOpenFormDialog(false)}
                mode={formMode}
                formData={formData}
                onSave={handleSaveUser}
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

export default UserList;
