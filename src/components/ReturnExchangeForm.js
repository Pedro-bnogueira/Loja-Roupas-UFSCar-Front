import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    Card,
    CardContent,
    Typography,
    Snackbar,
    Alert,
} from "@mui/material";
import { NumericFormat } from "react-number-format";
import axios from "axios";
import { format } from "date-fns";

export default function ReturnExchangeForm({
    open,
    onClose,
    transactions,
    onSave,
    setSnackbar,
}) {
    const [type, setType] = useState("");
    const [transactionId, setTransactionId] = useState("");
    const [product, setProduct] = useState("");
    const [brand, setBrand] = useState("");
    const [color, setColor] = useState("");
    const [size, setSize] = useState("");
    const [buyer, setBuyer] = useState("");
    const [transactionDate, setTransactionDate] = useState("");
    const [transactionPrice, setTransactionPrice] = useState("");
    const [quantity, setQuantity] = useState("");
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (!open) {
            // Limpar os campos quando o modal fecha
            setType("");
            setTransactionId("");
            setProduct("");
            setBrand("");
            setColor("");
            setSize("");
            setQuantity("");
            setBuyer("");
            setTransactionDate("");
            setTransactionPrice("");
            setErrors({});
        }
    }, [open]);

    // Atualiza selectedTransaction quando transactionId muda
    useEffect(() => {
        if (transactionId) {
            const foundTransaction = transactions.find((t) => t.id === transactionId);
            if (foundTransaction) {
                setSelectedTransaction(foundTransaction);
                console.log("Transação selecionada:", foundTransaction);
            } else {
                setSelectedTransaction(null);
                console.log("Transação não encontrada para ID:", transactionId);
            }
        } else {
            setSelectedTransaction(null);
            console.log("Nenhuma transação selecionada.");
        }
    }, [transactionId, transactions]);


    const validate = () => {
        const tempErrors = {};
        if (!type) tempErrors.type = "Selecione um tipo.";
        if (!transactionId) tempErrors.transactionId = "Selecione um id.";
        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleSaveReturn = async () => {
        if (!validate()) return;

        try {
            const response = await axios.post(
                `${process.env.REACT_APP_API_URL}/api/return/register`,
                {transactionId},
                { withCredentials: true }
            );

            if (response.status === 201 && response.data.transactionHistory) {
                // Atualiza o estado local com a transação retornada pelo backend
                onSave(response.data.transactionHistory);

                // Exemplo: Mostrar um Snackbar de sucesso
                setSnackbar({
                    open: true,
                    message: "Transação de devolução registrada com sucesso!",
                    severity: "success",
                });

            } else {
                // Tratar erros retornados pelo backend
                setSnackbar({
                    open: true,
                    message: "Erro ao registrar a transação de devolução.",
                    severity: "error",
                });
                console.error("Erro ao registrar transação de devolução: ", response.data);
            }
        } catch (error) {
            // Tratar erros de requisição
            setSnackbar({
                open: true,
                message: "Erro ao registrar a transação.",
                severity: "error",
            });
            console.error("Erro ao registrar transação:", error);
        }
    };

    const handleSaveExchange = async () => {
        if (!validate()) return;

        try {
            const response = await axios.post(
                `${process.env.REACT_APP_API_URL}/api/return/register`,
                transactionId,
                { withCredentials: true }
            );

            if (response.status === 201 && response.data.transactionHistory) {
                // Atualiza o estado local com a transação retornada pelo backend
                onSave(response.data.transactionHistory);

                // Exemplo: Mostrar um Snackbar de sucesso
                setSnackbar({
                    open: true,
                    message: "Transação de devolução registrada com sucesso!",
                    severity: "success",
                });

            } else {
                // Tratar erros retornados pelo backend
                setSnackbar({
                    open: true,
                    message: "Erro ao registrar a transação de devolução.",
                    severity: "error",
                });
                console.error("Erro ao registrar transação de devolução: ", response.data);
            }
        } catch (error) {
            // Tratar erros de requisição
            setSnackbar({
                open: true,
                message: "Erro ao registrar a transação.",
                severity: "error",
            });
            console.error("Erro ao registrar transação:", error);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>Trocas e Devoluções</DialogTitle>
            <DialogContent>
                <Box
                    component="form"
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 3,
                        marginTop: 1,
                    }}
                    noValidate
                    autoComplete="off"
                >
                    <Grid container spacing={2}>
                        {/* Tipo */}
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth error={!!errors.type}>
                                <InputLabel>Tipo</InputLabel>
                                <Select
                                    value={type}
                                    label="Tipo"
                                    onChange={(e) => setType(e.target.value)}
                                >
                                    <MenuItem value="troca">Troca</MenuItem>
                                    <MenuItem value="devolucao">
                                        Devolução
                                    </MenuItem>
                                </Select>
                                {errors.type && (
                                    <Typography variant="caption" color="error">
                                        {errors.type}
                                    </Typography>
                                )}
                            </FormControl>
                        </Grid>

                        {/* ID Transação */}
                        <Grid item xs={12} sm={6}>
                            <FormControl
                                fullWidth
                                error={!!errors.transactionId}
                            >
                                <InputLabel>ID Transação</InputLabel>
                                <Select
                                    value={transactionId}
                                    label="ID Transação"
                                    onChange={(e) =>
                                        setTransactionId(e.target.value)
                                    }
                                >
                                    <MenuItem value="">
                                        <em>Nenhum</em>
                                    </MenuItem>
                                    {transactions.map((t) => (
                                        <MenuItem key={t.id} value={t.id}>
                                            {t.id}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {errors.transactionId && (
                                    <Typography variant="caption" color="error">
                                        {errors.transactionId}
                                    </Typography>
                                )}
                            </FormControl>
                        </Grid>
                    </Grid>

                    {/* Detalhes da Transação Selecionada */}
                    {selectedTransaction && (
                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Detalhes da Transação
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="subtitle2">
                                            Produto
                                        </Typography>
                                        <Typography variant="body1">
                                            {selectedTransaction.product.name}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="subtitle2">
                                            Marca
                                        </Typography>
                                        <Typography variant="body1">
                                            {selectedTransaction.product.brand}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="subtitle2">
                                            Cor
                                        </Typography>
                                        <Typography variant="body1">
                                            {selectedTransaction.product.color}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="subtitle2">
                                            Tamanho
                                        </Typography>
                                        <Typography variant="body1">
                                            {selectedTransaction.product.size}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="subtitle2">
                                            Quantidade
                                        </Typography>
                                        <Typography variant="body1">
                                            {selectedTransaction.quantity}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="subtitle2">
                                            Fornecedor/Comprador
                                        </Typography>
                                        <Typography variant="body1">
                                            {
                                                selectedTransaction.supplierOrBuyer
                                            }
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="subtitle2">
                                            Data da Transação
                                        </Typography>
                                        <Typography variant="body1">
                                            {selectedTransaction.transactionDate
                                                ? format(
                                                      new Date(
                                                          selectedTransaction.transactionDate
                                                      ),
                                                      "dd/MM/yyyy HH:mm:ss"
                                                  )
                                                : "Data inválida"}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="subtitle2">
                                            Preço da Transação
                                        </Typography>
                                        <Typography variant="body1">
                                            R${" "}
                                            {parseFloat(
                                                selectedTransaction.transactionPrice
                                            ).toFixed(2)}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="subtitle2">
                                            Usuário Responsável
                                        </Typography>
                                        <Typography variant="body1">
                                            {selectedTransaction.user?.name ||
                                                ""}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary">
                    Cancelar
                </Button>
                <Button
                    onClick={type === "devolucao"
                    ? handleSaveReturn
                    : handleSaveExchange}
                    variant="contained"
                    color="primary"
                    disabled={!selectedTransaction || !type}
                >
                    {type === "devolucao"
                        ? "Registrar Devolução"
                        : "Registrar Troca"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
