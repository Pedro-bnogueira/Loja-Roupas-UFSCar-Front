import React from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';   // Ícone para Saída
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'; // Ícone para Entrada

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
              </TableRow>
            </TableHead>
            <TableBody>
              {transactionsData.map((t) => (
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
                  <TableCell>{t.productName}</TableCell>
                  <TableCell>{t.brand}</TableCell>
                  <TableCell>{t.color}</TableCell>
                  <TableCell>{t.size}</TableCell>
                  <TableCell>{t.supplierOrBuyer}</TableCell>
                  <TableCell>{t.quantity}</TableCell>
                  <TableCell>R$ {parseFloat(t.price).toFixed(2)}</TableCell>
                  <TableCell>{t.date}</TableCell>
                </TableRow>
              ))}
              {transactionsData.length === 0 && (
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