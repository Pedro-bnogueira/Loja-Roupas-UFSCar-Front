import React, { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import PriceField from "../utils/formatMonetary";

const ProductForm = ({ open, onClose, mode, formData, onSave, categories }) => {
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
        if (!data.name.trim()) tempErrors.name = "O nome é obrigatório.";
        if (!data.brand.trim()) tempErrors.brand = "A marca é obrigatória.";
        if (!data.price || isNaN(data.price)) tempErrors.price = "O preço é obrigatório e deve ser um número.";
        if (!data.size.trim()) tempErrors.size = "O tamanho é obrigatório.";
        if (!data.color.trim()) tempErrors.color = "A cor é obrigatória.";

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
                        label="Marca"
                        name="brand"
                        value={data.brand}
                        onChange={handleChange}
                        fullWidth
                        error={!!errors.brand}
                        helperText={errors.brand}
                        required
                    />
                    <PriceField
                        data={data}
                        handleChange={handleChange}
                        errors={errors}
                    />
                    <TextField
                        label="Tamanho"
                        name="size"
                        value={data.size}
                        onChange={handleChange}
                        fullWidth
                        error={!!errors.size}
                        helperText={errors.size}
                        required
                    />
                    <TextField
                        label="Cor"
                        name="color"
                        value={data.color}
                        onChange={handleChange}
                        fullWidth
                        error={!!errors.color}
                        helperText={errors.color}
                        required
                    />

                    {/* Campo de seleção de categoria */}
                    <FormControl fullWidth>
                        <InputLabel>Categoria</InputLabel>
                        <Select
                            name="categoryName"
                            value={data.categoryName}
                            label="Categoria"
                            onChange={handleChange}
                        >
                            <MenuItem value="">Sem categoria</MenuItem>
                            {categories.map(cat => (
                                <MenuItem key={cat.id} value={cat.name}>
                                    {cat.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
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
