import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

const url = process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL : "";

// Dados simulados de estoque:
const inventoryData = [
  { id: 1, name: 'Camiseta Básica', brand: 'Marca X', color: 'Preto', size: 'M', stockQuantity: 100, price: 29.90 },
  { id: 2, name: 'Calça Jeans', brand: 'Marca Y', color: 'Azul', size: '42', stockQuantity: 50, price: 89.90 },
  { id: 3, name: 'Jaqueta de Couro', brand: 'Marca Z', color: 'Marrom', size: 'G', stockQuantity: 10, price: 199.90 },
];

// Cálculo do valor de estoque: quantidade * preço
// Isso pode ser alterado conforme a lógica necessária.
export default function InventoryList() {
  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    fetchInventory();
  }, []);
  
  const fetchInventory = async () => {
    try {
      const response = await axios.get(`${url}/api/get/stock`, { withCredentials: true });
      if (response.status === 200 && response.data.stock) {
        setInventory(response.data.stock);
      }
    } catch (error) {
      console.error(error);
    }
  };

  console.log(inventory)
  return (
    <Box sx={{ paddingX: 2 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, fontFamily: 'Montserrat, sans-serif', mb: 2 }}>
        Controle de Estoque
      </Typography>

      <Paper variant="outlined">
        <TableContainer component={Paper} variant="outlined">
          <Table aria-label="Tabela de Controle de Estoque">
            <TableHead>
              <TableRow>
                <TableCell><strong>Código do Produto</strong></TableCell>
                <TableCell><strong>Nome</strong></TableCell>
                <TableCell><strong>Marca</strong></TableCell>
                <TableCell><strong>Cor</strong></TableCell>
                <TableCell><strong>Tamanho</strong></TableCell>
                <TableCell><strong>Quantidade em Estoque</strong></TableCell>
                <TableCell><strong>Valor do Estoque (R$)</strong></TableCell>
                <TableCell><strong>Ações</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {inventory.map((item) => {
                const stockValue = (item.quantity * item.product.price).toFixed(2);
                return (
                  <TableRow key={item.id}>
                    <TableCell>{item.productId}</TableCell>
                    <TableCell>{item.product.name}</TableCell>
                    <TableCell>{item.product.brand}</TableCell>
                    <TableCell>{item.product.color}</TableCell>
                    <TableCell>{item.product.size}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>R$ {stockValue}</TableCell>
                    <TableCell>
                      <Tooltip title="Editar Estoque">
                        <IconButton
                          color="primary"
                          sx={{
                            backgroundColor: "#b3f1ba",
                            "&:hover": {
                              backgroundColor: "#8ade93",
                            }
                          }}
                          onClick={() => alert(`Editar estoque do produto ID ${item.id}`)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
              {inventoryData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    Nenhum produto em estoque.
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
