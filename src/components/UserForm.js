import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    MenuItem,
    Box,
} from "@mui/material";

const UserForm = ({ open, onClose, mode, formData, onSave }) => {
    const [data, setData] = useState({ ...formData });
    const [errors, setErrors] = useState({});

    // Sincroniza o estado interno com as props formData
    useEffect(() => {
        setData({ ...formData });
        setErrors({});
    }, [formData, open]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData({ ...data, [name]: value });
    };

    const validate = () => {
        let tempErrors = {};
        if (!data.name.trim()) tempErrors.name = "O nome é obrigatório.";
        if (!data.email.trim()) tempErrors.email = "O email é obrigatório.";
        if (mode === "create" && !data.password.trim()) {
            tempErrors.password = "A senha é obrigatória no cadastro.";
        }
        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validate()) return;
        onSave(data);
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>
                {mode === "create" ? "Adicionar Usuário" : "Editar Usuário"}
            </DialogTitle>
            <DialogContent>
                <Box
                    component="form"
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        marginTop: 1,
                    }}
                    noValidate
                    autoComplete="off"
                >
                    <TextField
                        label="Nome"
                        name="name"
                        value={data.name}
                        onChange={handleChange}
                        fullWidth
                        error={!!errors.name}
                        helperText={errors.name}
                        required
                    />
                    <TextField
                        label="Email"
                        name="email"
                        type="email"
                        value={data.email}
                        onChange={handleChange}
                        fullWidth
                        error={!!errors.email}
                        helperText={errors.email}
                        required
                    />
                    <TextField
                        label="Senha"
                        name="password"
                        type="password"
                        value={data.password}
                        onChange={handleChange}
                        fullWidth
                        error={!!errors.password}
                        helperText={errors.password}
                        required={mode === "create"}
                    />
                    <TextField
                        label="Nível de Acesso"
                        name="accessLevel"
                        select
                        value={data.accessLevel}
                        onChange={handleChange}
                        fullWidth
                        required
                    >
                        <MenuItem value="user">Usuário</MenuItem>
                        <MenuItem value="admin">Administrador</MenuItem>
                        <MenuItem value="guest">Convidado</MenuItem>
                    </TextField>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Cancelar
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    color="primary"
                >
                    {mode === "create" ? "Adicionar" : "Salvar"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default UserForm;
