// src/components/ProductForm.js

import React, { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box } from "@mui/material";

const ProductForm = ({ open, onClose, mode, formData, onSave }) => {
    const [data, setData] = useState({ ...formData });
    const [errors, setErrors] = useState({});

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
        if (!data.code.trim()) tempErrors.code = "O código é obrigatório.";
        if (!data.name.trim()) tempErrors.name = "O nome é obrigatório.";
        if (!data.category.trim()) tempErrors.category = "A categoria é obrigatória.";
        if (!data.price || isNaN(data.price)) tempErrors.price = "O preço é obrigatório e deve ser um número.";
        if (!data.stock || isNaN(data.stock)) tempErrors.stock = "O estoque é obrigatório e deve ser um número.";

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
                {mode === "create" ? "Adicionar Produto" : "Editar Produto"}
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
                        label="Código"
                        name="code"
                        value={data.code}
                        onChange={handleChange}
                        fullWidth
                        error={!!errors.code}
                        helperText={errors.code}
                        required
                    />
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
                        label="Categoria"
                        name="category"
                        value={data.category}
                        onChange={handleChange}
                        fullWidth
                        error={!!errors.category}
                        helperText={errors.category}
                        required
                    />
                    <TextField
                        label="Preço"
                        name="price"
                        type="number"
                        value={data.price}
                        onChange={handleChange}
                        fullWidth
                        error={!!errors.price}
                        helperText={errors.price}
                        required
                    />
                    <TextField
                        label="Estoque"
                        name="stock"
                        type="number"
                        value={data.stock}
                        onChange={handleChange}
                        fullWidth
                        error={!!errors.stock}
                        helperText={errors.stock}
                        required
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Cancelar
                </Button>
                <Button onClick={handleSubmit} variant="contained" color="primary">
                    {mode === "create" ? "Adicionar" : "Salvar"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ProductForm;
