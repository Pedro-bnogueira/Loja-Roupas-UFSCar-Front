import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  TextField, Button, Box, FormControl, InputLabel, Select, MenuItem 
} from "@mui/material";
import { NumericFormat } from 'react-number-format';
import axios from 'axios'

export default function TransactionForm({ open, onClose, type, products, onSave, setSnackbar }) {
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [supplierOrBuyer, setSupplierOrBuyer] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) {
      // Limpar os campos quando o modal fecha
      setProductId("");
      setQuantity("");
      setPrice("");
      setSupplierOrBuyer("");
      setErrors({});
    }
  }, [open]);

  const validate = () => {
    const tempErrors = {};
    if (!productId) tempErrors.productId = "Selecione um produto.";
    if (!quantity || isNaN(quantity) || Number(quantity) <= 0) 
      tempErrors.quantity = "Informe uma quantidade válida.";
    if (!price || isNaN(price) || Number(price) <= 0) 
      tempErrors.price = "Informe um preço válido.";
    if (!supplierOrBuyer.trim()) {
      tempErrors.supplierOrBuyer = type === 'in'
        ? "Informe o fornecedor."
        : "Informe o comprador.";
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
  
    const transactionData = {
      type,                  // 'in' ou 'out'
      productId: Number(productId),
      quantity: Number(quantity),
      transactionPrice: Number(price), // Alinhado com o backend
      supplierOrBuyer: supplierOrBuyer.trim(),
    };
  
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/movement/register`,
        transactionData,
        { withCredentials: true } 
      );
  
      if (response.status === 201 && response.data.transactionHistory) {
        // Atualiza o estado local com a transação retornada pelo backend
        onSave(response.data.transactionHistory);
        
        // Mostrar um Snackbar de sucesso
        setSnackbar({
          open: true,
          message: 'Transação registrada com sucesso!',
          severity: 'success',
        });
  
      } else {
        // Tratar erros retornados pelo backend
        setSnackbar({
          open: true,
          message: 'Erro ao registrar a transação.',
          severity: 'error',
        });
        console.error("Erro ao registrar transação: ", response.data);
      }
    } catch (error) {
      // Tratar erros de requisição
      setSnackbar({
        open: true,
        message: 'Erro ao registrar a transação.',
        severity: 'error',
      });
      console.error("Erro ao registrar transação:", error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {type === "in" ? "Registrar Compra" : "Registrar Venda"}
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
          {/* Produto */}
          <FormControl fullWidth error={!!errors.productId}>
            <InputLabel id="produto-label">Produto</InputLabel>
            <Select
              labelId="produto-label"
              value={productId}
              label="Produto"
              onChange={(e) => setProductId(e.target.value)}
              inputProps={{ 'aria-label': 'Produto' }}
            >
              {products.map((prod) => (
                <MenuItem key={prod.id} value={prod.id}>
                  {prod.name} (ID: {prod.id})
                </MenuItem>
              ))}
            </Select>
            {errors.productId && (
              <span style={{ color: 'red', fontSize: 12 }}>{errors.productId}</span>
            )}
          </FormControl>

          {/* Quantidade */}
          <TextField
            label="Quantidade"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            fullWidth
            error={!!errors.quantity}
            helperText={errors.quantity}
            inputProps={{ min: 1, 'aria-label': 'Quantidade' }}
          />

          {/* Preço */}
          <NumericFormat
            customInput={TextField}
            label="Preço Total (R$)"
            value={price}
            onValueChange={(values) => {
              const { floatValue } = values;
              setPrice(floatValue);
            }}
            thousandSeparator="."
            decimalSeparator=","
            prefix="R$ "
            decimalScale={2}
            fixedDecimalScale={true}
            fullWidth
            error={!!errors.price}
            helperText={errors.price}
            required
            inputProps={{ 'aria-label': 'Preço Total (R$)' }}
          />

          {/* Fornecedor/Comprador */}
          <TextField
            label={type === 'in' ? "Fornecedor" : "Comprador"}
            value={supplierOrBuyer}
            onChange={(e) => setSupplierOrBuyer(e.target.value)}
            fullWidth
            error={!!errors.supplierOrBuyer}
            helperText={errors.supplierOrBuyer}
            required
            inputProps={{ 'aria-label': type === 'in' ? "Fornecedor" : "Comprador" }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancelar
        </Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
}