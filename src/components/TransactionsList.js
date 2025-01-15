import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';   // Ícone para Saída
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'; // Ícone para Entrada
import { format } from 'date-fns';

const url = process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL : "";

// Dados simulados de transações:
// type: 'in' para entrada, 'out' para saída
const transactionsData = [
  {
    id: 1,
    type: 'in',
    productId: 1,
    productName: 'Camiseta Básica',
    brand: 'Marca X',
    color: 'Preto',
    size: 'M',
    supplierOrBuyer: 'Fornecedor ABC',
    quantity: 20,
    price: 29.90, // preço total da transação
    date: '2023-10-05 14:30'
  },
  {
    id: 2,
    type: 'out',
    productId: 2,
    productName: 'Calça Jeans',
    brand: 'Marca Y',
    color: 'Azul',
    size: '42',
    supplierOrBuyer: 'Cliente Fulano',
    quantity: 5,
    price: 89.90, 
    date: '2023-10-06 10:00'
  },
  {
    id: 3,
    type: 'in',
    productId: 3,
    productName: 'Jaqueta de Couro',
    brand: 'Marca Z',
    color: 'Marrom',
    size: 'G',
    supplierOrBuyer: 'Fornecedor XYZ',
    quantity: 2,
    price: 399.80, // supondo que cada uma custa 199.90
    date: '2023-10-07 09:20'
  },
];



export default function TransactionsList() {
  const [transactions, setTransactions] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  useEffect(() => {
    fetchTransactions();
  }, []);
  
  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`${url}/api/get/transactions`, { withCredentials: true });
      if (response.status === 200 && response.data.transactions) {
        setTransactions(response.data.transactions);
      }
    } catch (error) {
      console.error(error);
      handleSnackbarOpen("Erro ao buscar estoque.", "error");
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
console.log(transactions)
  return (
    <Box sx={{ paddingX: 2 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, fontFamily: 'Montserrat, sans-serif', mb: 2 }}>
        Histórico de Transações
      </Typography>

      <Paper variant="outlined">
        <TableContainer component={Paper} variant="outlined">
          <Table aria-label="Tabela de Histórico de Transações">
            <TableHead>
              <TableRow>
                <TableCell><strong>Tipo</strong></TableCell>
                <TableCell><strong>Código da Transação</strong></TableCell>
                <TableCell><strong>Código do Produto</strong></TableCell>
                <TableCell><strong>Nome</strong></TableCell>
                <TableCell><strong>Marca</strong></TableCell>
                <TableCell><strong>Cor</strong></TableCell>
                <TableCell><strong>Tamanho</strong></TableCell>
                <TableCell><strong>Fornecedor/Comprador</strong></TableCell>
                <TableCell><strong>Quantidade</strong></TableCell>
                <TableCell><strong>Preço da Transação (R$)</strong></TableCell>
                <TableCell><strong>Data da Transação</strong></TableCell>
                <TableCell><strong>Usuário Responsável</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    {t.type === 'in' ? (
                      <ArrowDownwardIcon sx={{ color: 'green' }} titleAccess="Entrada" />
                    ) : (
                      <ArrowUpwardIcon sx={{ color: 'red' }} titleAccess="Saída" />
                    )}
                  </TableCell>
                  <TableCell>{t.id}</TableCell>
                  <TableCell>{t.productId}</TableCell>
                  <TableCell>{t.product.name}</TableCell>
                  <TableCell>{t.product.brand}</TableCell>
                  <TableCell>{t.product.color}</TableCell>
                  <TableCell>{t.product.size}</TableCell>
                  <TableCell>{t.supplierOrBuyer}</TableCell>
                  <TableCell>{t.quantity}</TableCell>
                  <TableCell>R$ {parseFloat(t.transactionPrice).toFixed(2)}</TableCell>
                  <TableCell>{format(new Date(t.transactionDate), 'dd/MM/yyyy HH:mm:ss')}</TableCell>
                  <TableCell>{t.user.name}</TableCell>
                </TableRow>
              ))}
              {transactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={11} align="center">
                    Nenhuma transação registrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}