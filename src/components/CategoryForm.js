import React, { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box } from "@mui/material";

const CategoryForm = ({ open, onClose, formData, onSave }) => {
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
        if (!data.name.trim()) tempErrors.name = "O nome da categoria é obrigatório.";
        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validate()) return;
        onSave(data);
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Adicionar Categoria</DialogTitle>
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
                        label="Nome da Categoria"
                        name="name"
                        value={data.name}
                        onChange={handleChange}
                        fullWidth
                        error={!!errors.name}
                        helperText={errors.name}
                        required
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Cancelar
                </Button>
                <Button onClick={handleSubmit} variant="contained" color="primary">
                    Adicionar
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CategoryForm;