// components/ReturnExchangeForm.jsx

import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
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
    IconButton,
    TextField
} from "@mui/material";
import { AddCircle, RemoveCircle } from "@mui/icons-material";
import axios from "axios";
import { format } from "date-fns";

export default function ReturnExchangeForm({
    open,
    onClose,
    transactions,
    products,
    onSave,
    setSnackbar,
}) {
    const [type, setType] = useState(""); // 'troca' ou 'devolucao'
    const [transactionId, setTransactionId] = useState("");
    const [newProducts, setNewProducts] = useState([{ productId: "", quantity: 1 }]); // Array de novos produtos para troca
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (!open) {
            // Limpar os campos quando o modal fecha
            setType("");
            setTransactionId("");
            setNewProducts([{ productId: "", quantity: 1 }]);
            setSelectedTransaction(null);
            setErrors({});
        } else {
            // Quando o modal abre, filtrar produtos disponíveis se for troca
            if (type === "troca") {
                // Excluir o produto original da lista de novos produtos
                if (selectedTransaction) {
                    setNewProducts([{ productId: "", quantity: 1 }]);
                }
            }
        }
    }, [open]);
    console.log(newProducts)
    // Atualiza selectedTransaction quando transactionId muda
    useEffect(() => {
        if (transactionId) {
            const foundTransaction = transactions.find(
                (t) => t.id === transactionId
            );
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

    // Carregar produtos disponíveis para troca (excluindo o original)
    useEffect(() => {
        if (type === "troca" && selectedTransaction) {
            // Filtrar produtos para não incluir o produto original
            const available = products.filter(
                (p) => p.id !== selectedTransaction.productId
            );
            setNewProducts([{ productId: "", quantity: 1 }]); // Resetar a lista de novos produtos
        }
    }, [type, selectedTransaction, products]);

    const validate = () => {
        const tempErrors = {};
        if (!type) tempErrors.type = "Selecione um tipo.";
        if (!transactionId) tempErrors.transactionId = "Selecione um ID de Transação.";
        if (type === "troca") {
            newProducts.forEach((np, index) => {
                if (!np.productId) {
                    tempErrors[`newProductId_${index}`] = "Selecione um produto.";
                }
                if (!np.quantity || np.quantity < 1) {
                    tempErrors[`newQuantity_${index}`] = "Quantidade deve ser pelo menos 1.";
                }
            });

            // Verificar se o total dos novos produtos é igual ao original
            const originalTotal = parseFloat(selectedTransaction.transactionPrice);
            const newTotal = newProducts.reduce((acc, curr) => {
                const product = products.find((p) => p.id === curr.productId);
                if (product) {
                    return acc + parseFloat(product.price) * parseInt(curr.quantity, 10);
                }
                return acc;
            }, 0);

            if (newTotal !== originalTotal) {
                tempErrors.total = "A soma total dos novos produtos deve ser igual ao valor da transação original.";
            }
        }
        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleAddNewProduct = () => {
        setNewProducts([...newProducts, { productId: "", quantity: 1 }]);
    };

    const handleRemoveNewProduct = (index) => {
        const updatedProducts = newProducts.filter((_, i) => i !== index);
        setNewProducts(updatedProducts);
    };

    const handleNewProductChange = (index, field, value) => {
        const updatedProducts = newProducts.map((product, i) => {
            if (i === index) {
                return { ...product, [field]: value };
            }
            return product;
        });
        setNewProducts(updatedProducts);
    };

    const handleSaveReturn = async () => {
        if (!validate()) return;

        try {
            const response = await axios.post(
                `${process.env.REACT_APP_API_URL}/api/return/register`,
                { transactionId },
                { withCredentials: true }
            );

            if (response.status === 201 && response.data.transactionHistory) {
                // Atualiza o estado local com a transação retornada pelo backend
                onSave(response.data.transactionHistory);

                // Mostrar um Snackbar de sucesso
                setSnackbar({
                    open: true,
                    message: "Transação de devolução registrada com sucesso!",
                    severity: "success",
                });

                // Fechar o modal
                onClose();
            } else {
                // Tratar erros retornados pelo backend
                setSnackbar({
                    open: true,
                    message: "Erro ao registrar a transação de devolução.",
                    severity: "error",
                });
                console.error(
                    "Erro ao registrar transação de devolução: ",
                    response.data
                );
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
                `${process.env.REACT_APP_API_URL}/api/exchange/register`,
                { transactionId, newProducts },
                { withCredentials: true }
            );

            if (response.status === 201) {
                // Atualiza o estado local com todas as transações criadas
                console.log(response.data.transactions)
                if (response.data.transactions && Array.isArray(response.data.transactions)) {
                    response.data.transactions.map((transaction) => {
                        onSave(transaction); // Executa onSave para cada transação
                    });
                }

                // Mostrar um Snackbar de sucesso
                setSnackbar({
                    open: true,
                    message: "Transação de troca registrada com sucesso!",
                    severity: "success",
                });

                // Fechar o modal
                onClose();
            } else {
                // Tratar erros retornados pelo backend
                setSnackbar({
                    open: true,
                    message: response.data.message,
                    severity: "error",
                });
                console.error(
                    "Erro ao registrar transação de troca: ",
                    response.data
                );
            }
        } catch (error) {
            let errorMessage = "Erro ao registrar transação de troca."; // Mensagem padrão
        
            // Verifica se há uma mensagem de erro no `response.data`
            if (error.response && error.response.data && error.response.data.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                // Captura mensagens de erro genéricas (ex.: erros de rede)
                errorMessage = error.message;
            }
        
            // Exibe o Snackbar com a mensagem apropriada
            setSnackbar({
                open: true,
                message: errorMessage,
                severity: "error",
            });
        
            // Log do erro completo no console para depuração
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
                                    <MenuItem value="devolucao">Devolução</MenuItem>
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
                            <FormControl fullWidth error={!!errors.transactionId}>
                                <InputLabel>ID Transação</InputLabel>
                                <Select
                                    value={transactionId}
                                    label="ID Transação"
                                    onChange={(e) => setTransactionId(e.target.value)}
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
                                        <Typography variant="subtitle2">Produto</Typography>
                                        <Typography variant="body1">
                                            {selectedTransaction.product.name}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="subtitle2">Marca</Typography>
                                        <Typography variant="body1">
                                            {selectedTransaction.product.brand}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="subtitle2">Cor</Typography>
                                        <Typography variant="body1">
                                            {selectedTransaction.product.color}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="subtitle2">Tamanho</Typography>
                                        <Typography variant="body1">
                                            {selectedTransaction.product.size}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="subtitle2">Quantidade</Typography>
                                        <Typography variant="body1">
                                            {selectedTransaction.quantity}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="subtitle2">Fornecedor/Comprador</Typography>
                                        <Typography variant="body1">
                                            {selectedTransaction.supplierOrBuyer}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="subtitle2">Data da Transação</Typography>
                                        <Typography variant="body1">
                                            {selectedTransaction.transactionDate
                                                ? format(
                                                      new Date(selectedTransaction.transactionDate),
                                                      "dd/MM/yyyy HH:mm:ss"
                                                  )
                                                : "Data inválida"}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="subtitle2">Preço da Transação</Typography>
                                        <Typography variant="body1">
                                            R$ {parseFloat(selectedTransaction.transactionPrice).toFixed(2)}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="subtitle2">Usuário Responsável</Typography>
                                        <Typography variant="body1">
                                            {selectedTransaction.user?.name || ""}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    )}
                    {/* Novo Produto(s) para Troca */}
                    {type === "troca" && selectedTransaction && (
                        <Box>
                            <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                Selecionar Novo(s) Produto(s)
                                <Typography
                                    variant="body1"
                                    color={
                                        selectedTransaction &&
                                        newProducts.reduce((acc, curr) => {
                                            const product = products.find((p) => p.id === curr.productId);
                                            return acc + (product ? parseFloat(product.price) * parseInt(curr.quantity || 0, 10) : 0);
                                        }, 0) === parseFloat(selectedTransaction.transactionPrice)
                                            ? "green"
                                            : "error"
                                    }
                                    sx={{ fontWeight: 600 }}
                                >
                                    {selectedTransaction
                                        ? (() => {
                                            const totalOriginal = parseFloat(selectedTransaction.transactionPrice);
                                            const totalSelected = newProducts.reduce((acc, curr) => {
                                                const product = products.find((p) => p.id === curr.productId);
                                                return acc + (product ? parseFloat(product.price) * parseInt(curr.quantity || 0, 10) : 0);
                                            }, 0);

                                            if (totalSelected === totalOriginal) {
                                                return "Valor atingido! Pronto para registrar.";
                                            } else if (totalSelected < totalOriginal) {
                                                const remaining = (totalOriginal - totalSelected).toFixed(2);
                                                return `Faltam R$ ${remaining}`;
                                            } else {
                                                const excess = (totalSelected - totalOriginal).toFixed(2);
                                                return `Excesso de R$ ${excess}`;
                                            }
                                        })()
                                        : "Selecione uma transação"}
                                </Typography>
                            </Typography>
                            {newProducts.map((np, index) => (
                                <Grid container spacing={2} key={index} alignItems="center" sx={{marginTop: 1}}>
                                    <Grid item xs={12} sm={5}>
                                        <FormControl fullWidth error={!!errors[`newProductId_${index}`]}>
                                            <InputLabel>Novo Produto</InputLabel>
                                            <Select
                                                value={np.productId}
                                                label="Novo Produto"
                                                onChange={(e) =>
                                                    handleNewProductChange(index, "productId", e.target.value)
                                                }
                                            >
                                                <MenuItem value="">
                                                    <em>Nenhum</em>
                                                </MenuItem>
                                                {products
                                                    .filter(
                                                        (p) =>
                                                            p.id !== selectedTransaction.productId
                                                    )
                                                    .map((p) => (
                                                        <MenuItem key={p.id} value={p.id}>
                                                            [{p.id}] {p.name} - {p.brand} - R$ {parseFloat(p.price).toFixed(2)}
                                                        </MenuItem>
                                                    ))}
                                            </Select>
                                            {errors[`newProductId_${index}`] && (
                                                <Typography variant="caption" color="error">
                                                    {errors[`newProductId_${index}`]}
                                                </Typography>
                                            )}
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} sm={5}>
                                        <FormControl fullWidth error={!!errors[`newQuantity_${index}`]}>
                                            <TextField
                                                type="number"
                                                label="Quantidade"
                                                value={np.quantity}
                                                onChange={(e) =>
                                                    handleNewProductChange(index, "quantity", e.target.value)
                                                }
                                                inputProps={{ min: 1 }}
                                            />
                                            {errors[`newQuantity_${index}`] && (
                                                <Typography variant="caption" color="error">
                                                    {errors[`newQuantity_${index}`]}
                                                </Typography>
                                            )}
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} sm={2}>
                                        <IconButton
                                            color="error"
                                            onClick={() => handleRemoveNewProduct(index)}
                                            disabled={newProducts.length === 1}
                                        >
                                            <RemoveCircle />
                                        </IconButton>
                                        {index === newProducts.length - 1 && (
                                            <IconButton color="primary" onClick={handleAddNewProduct}>
                                                <AddCircle />
                                            </IconButton>
                                        )}
                                    </Grid>
                                </Grid>
                            ))}

                            {/* Erro de total */}
                            {errors.total && (
                                <Typography variant="caption" color="error">
                                    {errors.total}
                                </Typography>
                            )}
                        </Box>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary">
                    Cancelar
                </Button>
                <Button
                    onClick={
                        type === "devolucao"
                            ? handleSaveReturn
                            : handleSaveExchange
                    }
                    variant="contained"
                    color="primary"
                    disabled={
                        !selectedTransaction ||
                        !type ||
                        (type === "troca" &&
                            (newProducts.some(np => !np.productId || np.quantity < 1) ||
                                newProducts.reduce((acc, curr) => {
                                    const product = products.find(p => p.id === curr.productId);
                                    return acc + (product ? parseFloat(product.price) * parseInt(curr.quantity, 10) : 0);
                                }, 0) !== parseFloat(selectedTransaction.transactionPrice)))
                    }
                >
                    {type === "devolucao"
                        ? "Registrar Devolução"
                        : "Registrar Troca"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
