// src/components/InventoryList.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Tooltip,
    Button,
    Stack,
    Snackbar,
    Alert,
    TextField,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    InputAdornment,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import LocalMallIcon from "@mui/icons-material/LocalMall";
import SearchIcon from "@mui/icons-material/Search";
import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

import TransactionForm from "./TransactionForm";
import ReturnExchangeForm from "./ReturnExchangeForm";
import { formatMoneyToFloat } from "../utils/formatMoneyToFloat"; // Certifique-se que esta função está correta
import theme from "../assets/theme";

const url = process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL : "";

export default function InventoryList() {
    const [inventory, setInventory] = useState([]);
    const [products, setProducts] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [filteredInventory, setFilteredInventory] = useState([]); // Para busca e filtro
    const [searchText, setSearchText] = useState(""); // Campo de busca geral
    const [filterField, setFilterField] = useState(""); // Campo/atributo a filtrar
    const [filterValue, setFilterValue] = useState(""); // Valor do filtro
    // Estados para barra de funcionalidade da tabela
    const [filterOptions, setFilterOptions] = useState([]); // Opções para filterValue
    const [isNumericFilter, setIsNumericFilter] = useState(false); // Identifica se o filtro é numérico
    const [openTransactionForm, setOpenTransactionForm] = useState(false);
    const [openExchangeForm, setOpenExchangeForm] = useState(false);
    const [transactionType, setTransactionType] = useState("in"); // 'in' (compra) ou 'out' (venda)
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success",
    });

    // Carregar Estoque e Produtos
    useEffect(() => {
        fetchInventory();
        fetchProducts();
        fetchTransactions();
    }, []);

    // Carregar tranascoes para troca e devolucoes
    useEffect(() => {
        fetchTransactions();
    }, [openExchangeForm]);

    // Sempre que inventory mudar, atualiza filteredInventory também
    useEffect(() => {
        setFilteredInventory(inventory);
    }, [inventory]);

    const fetchInventory = async () => {
        try {
            const response = await axios.get(`${url}/api/get/stock`, {
                withCredentials: true,
            });
            if (response.status === 200 && response.data.stock) {
                setInventory(response.data.stock);
            }
        } catch (error) {
            console.error(error);
            handleSnackbarOpen("Erro ao buscar estoque.", "error");
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await axios.get(`${url}/api/get/products`, {
                withCredentials: true,
            });
            if (response.status === 200 && response.data.products) {
                setProducts(response.data.products);
            }
        } catch (error) {
            console.error(error);
            handleSnackbarOpen("Erro ao buscar produtos.", "error");
        }
    };

    const fetchTransactions = async () => {
        try {
            const response = await axios.get(`${url}/api/get/transactions`, {
                withCredentials: true,
            });

            if (response.status === 200 && response.data.transactions) {
                // Filtrar transações para incluir somente aquelas do tipo "out"
                // e que ainda não tiveram devoluções
                const filteredTransactions = response.data.transactions.filter(
                    (transaction) =>
                        transaction.type === "out" && !transaction.isReturned
                );

                setTransactions(filteredTransactions);
            }
        } catch (error) {
            console.error(error);
            handleSnackbarOpen("Erro ao buscar produtos.", "error");
        }
    };

    // Busca Geral e Filtro por Atributos
    // Busca geral: filtra em todas as colunas
    useEffect(() => {
        applySearchAndFilter();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchText, filterField, filterValue]);

    useEffect(() => {
        if (filterField) {
            const options = getFilterOptions(filterField);
            setFilterOptions(options);
            setFilterValue(""); // Reset filterValue quando filterField muda
            setIsNumericFilter(isFieldNumeric(filterField));
        } else {
            setFilterOptions([]);
            setFilterValue("");
            setIsNumericFilter(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterField, inventory]);

    const isFieldNumeric = (field) => {
        const numericFields = ["productId", "quantity"];
        return numericFields.includes(field);
    };

    const getFilterOptions = (field) => {
        const optionsSet = new Set();

        inventory.forEach((item) => {
            let value = null;

            if (field.startsWith("product.")) {
                const subField = field.split(".")[1];
                if (item.product && item.product[subField] !== undefined) {
                    value = item.product[subField];
                }
            } else {
                if (item[field] !== undefined) {
                    value = item[field];
                }
            }

            if (value !== null) {
                // Normalizar o valor: remover espaços extras e converter para minúsculas
                const normalizedValue = value.toString().trim();
                optionsSet.add(normalizedValue);
            }
        });

        return Array.from(optionsSet).sort();
    };

    const applySearchAndFilter = () => {
        let data = [...inventory];

        // Filtro por atributo (filterField e filterValue)
        if (filterField && filterValue) {
            data = data.filter((item) => {
                if (filterField.startsWith("product.")) {
                    const field = filterField.split(".")[1]; // ex. "brand"
                    return item.product[field]
                        ?.toString()
                        .toLowerCase()
                        .includes(filterValue.toLowerCase());
                } else {
                    return item[filterField]
                        ?.toString()
                        .toLowerCase()
                        .includes(filterValue.toLowerCase());
                }
            });
        }

        // Busca geral
        if (searchText) {
            data = data.filter((item) => {
                const valuesToSearch = [
                    item.productId,
                    item.product?.name,
                    item.product?.brand,
                    item.product?.color,
                    item.product?.size,
                    item.quantity,
                ];
                const rowString = valuesToSearch.join(" ").toLowerCase();
                return rowString.includes(searchText.toLowerCase());
            });
        }

        setFilteredInventory(data);
    };

    // Exportar para PDF e Excel
    const handleExportPDF = () => {
        const doc = new jsPDF("p", "pt");
        doc.setFontSize(13);
        doc.text("Relatório de Estoque", 40, 40);

        // Cabeçalhos e dados para autoTable
        const headers = [
            [
                "Cód. Prod.",
                "Nome",
                "Marca",
                "Cor",
                "Tamanho",
                "Qtd",
                "Valor R$",
            ],
        ];
        const rows = filteredInventory.map((item) => {
            const stockValue = (
                item.quantity * formatMoneyToFloat(item.product.price)
            ).toFixed(2);
            return [
                item.productId,
                item.product.name,
                item.product.brand,
                item.product.color,
                item.product.size,
                item.quantity,
                stockValue,
            ];
        });

        doc.autoTable({
            head: headers,
            body: rows,
            startY: 60,
            margin: { left: 40, right: 40 },
            styles: { fontSize: 12, halign: "center" },
            headStyles: { fillColor: [41, 128, 185] },
        });

        doc.save("estoque.pdf");
    };

    const handleExportExcel = () => {
        const sheetData = [
            [
                "Cód. Prod.",
                "Nome",
                "Marca",
                "Cor",
                "Tamanho",
                "Qtd",
                "Valor R$",
            ],
            ...filteredInventory.map((item) => {
                const stockValue = (
                    item.quantity * formatMoneyToFloat(item.product.price)
                ).toFixed(2);
                return [
                    item.productId,
                    item.product.name,
                    item.product.brand,
                    item.product.color,
                    item.product.size,
                    item.quantity,
                    stockValue,
                ];
            }),
        ];

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(sheetData);
        XLSX.utils.book_append_sheet(wb, ws, "Estoque");
        XLSX.writeFile(wb, "estoque.xlsx");
    };

    // Transações: abrir modal e salvar
    const handleOpenTransactionForm = (type) => {
        setTransactionType(type);
        setOpenTransactionForm(true);
    };
    const handleCloseTransactionForm = () => {
        setOpenTransactionForm(false);
    };

    // Trocas: abrir modal e salvar
    const handleOpenExchangeForm = () => {
        setOpenExchangeForm(true);
    };
    const handleCloseExchangeForm = () => {
        setOpenExchangeForm(false);
    };

    const handleSaveTransaction = (newTransaction) => {
        const { type, productId, quantity } = newTransaction;
        console.log(type);
        console.log(productId);
        console.log(quantity);
    
        setFilteredInventory((prevInventory) => {
            const updatedInventory = prevInventory.map((item) => {
                if (item.productId === productId) {
                    let updatedQuantity;
        
                    if (type === "in" || type === "return" || type === "exchange_in") {
                        updatedQuantity = item.quantity + quantity;
                    } else if (type === "out" || type === "exchange_out") {
                        updatedQuantity = item.quantity - quantity;
                    } else {
                        // Tipo de transação inválido
                        handleSnackbarOpen(
                            "Tipo de transação inválido.",
                            "error"
                        );
                        return item;
                    }
        
                    // Certifique-se de que a quantidade nunca seja negativa
                    if (updatedQuantity < 0) {
                        handleSnackbarOpen(
                            "Estoque insuficiente para realizar a transação.",
                            "error"
                        );
                        return item;
                    }
        
                    return { ...item, quantity: updatedQuantity };
                }
                return item;
            });
        
            // Se o produto não existir no estoque, adiciona um novo item para transações de entrada
            if (!prevInventory.some((item) => item.productId === productId) &&
                (type === "in" || type === "return" || type === "exchange_in")) {
                const product = products.find((p) => p.id === productId);
                if (product) {
                    updatedInventory.push({
                        productId: product.id,
                        product: product,
                        quantity: quantity,
                    });
                } else {
                    handleSnackbarOpen(
                        "Produto selecionado não encontrado.",
                        "error"
                    );
                }
            }
        
            return updatedInventory;
        });
        
        // Fecha os modais
        setOpenTransactionForm(false);
        setOpenExchangeForm(false);        
    };
    

    // Funções de Snackbar
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

    return (
        <Box sx={{ paddingX: 2 }}>
            <Typography
                variant="h4"
                sx={{
                    fontWeight: 700,
                    fontFamily: "Montserrat, sans-serif",
                    mb: 2,
                }}
            >
                Controle de Estoque
            </Typography>

            {/* Botões de Exportação e Ações */}
            <Stack
                direction="row"
                spacing={2}
                sx={{ mb: 2 }}
                alignItems="center"
            >
                <Button
                    variant="contained"
                    color="success"
                    startIcon={<AddShoppingCartIcon />}
                    onClick={() => handleOpenTransactionForm("in")}
                >
                    Registrar Compra
                </Button>

                <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<LocalMallIcon />}
                    onClick={() => handleOpenTransactionForm("out")}
                >
                    Registrar Venda
                </Button>
                <Button
                    variant="contained"
                    startIcon={<CurrencyExchangeIcon />}
                    onClick={() => handleOpenExchangeForm()}
                    sx={{ backgroundColor: theme.palette.tertiary.dark }}
                >
                    Trocas e Devoluções
                </Button>
            </Stack>

            {/* Filtros e Busca */}
            <Stack
                direction="row"
                spacing={2}
                sx={{ mb: 2 }}
                alignItems="center"
            >
                {/* Busca Geral */}
                <TextField
                    label="Pesquisar"
                    variant="outlined"
                    size="small"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                />

                {/* Filtro por Atributo */}
                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Filtro</InputLabel>
                    <Select
                        value={filterField}
                        label="Atributo"
                        onChange={(e) => setFilterField(e.target.value)}
                    >
                        {/* Atributos possíveis:
                - productId, quantity (no item)
                - product.brand, product.color, product.name, product.size
            */}
                        <MenuItem value="">Nenhum</MenuItem>
                        <MenuItem value="productId">Cód. Produto</MenuItem>
                        <MenuItem value="product.name">Nome</MenuItem>
                        <MenuItem value="product.brand">Marca</MenuItem>
                        <MenuItem value="product.color">Cor</MenuItem>
                        <MenuItem value="product.size">Tamanho</MenuItem>
                        <MenuItem value="quantity">Quantidade</MenuItem>
                    </Select>
                </FormControl>

                {/* Filtro por Valor */}
                {filterField &&
                    (isNumericFilter ? (
                        <TextField
                            label="Filtro"
                            variant="outlined"
                            size="small"
                            value={filterValue}
                            onChange={(e) => setFilterValue(e.target.value)}
                            type="number"
                            sx={{ minWidth: 150 }}
                        />
                    ) : (
                        <FormControl size="small" sx={{ minWidth: 150 }}>
                            <InputLabel>Valor</InputLabel>
                            <Select
                                value={filterValue}
                                label="Valor"
                                onChange={(e) => setFilterValue(e.target.value)}
                            >
                                <MenuItem value="">
                                    <em>Nenhum</em>
                                </MenuItem>
                                {filterOptions.map((option, index) => (
                                    <MenuItem key={index} value={option}>
                                        {option}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    ))}
                <Button
                    variant="outlined"
                    color="primary"
                    onClick={handleExportPDF}
                >
                    Exportar PDF
                </Button>

                <Button
                    variant="outlined"
                    color="primary"
                    onClick={handleExportExcel}
                >
                    Exportar Excel
                </Button>
            </Stack>

            {/* Tabela de Estoque */}
            <Paper variant="outlined">
                <TableContainer component={Paper} variant="outlined">
                    <Table aria-label="Tabela de Controle de Estoque">
                        <TableHead>
                            <TableRow>
                                <TableCell>
                                    <strong>Código do Produto</strong>
                                </TableCell>
                                <TableCell>
                                    <strong>Nome</strong>
                                </TableCell>
                                <TableCell>
                                    <strong>Marca</strong>
                                </TableCell>
                                <TableCell>
                                    <strong>Cor</strong>
                                </TableCell>
                                <TableCell>
                                    <strong>Tamanho</strong>
                                </TableCell>
                                <TableCell>
                                    <strong>Quantidade em Estoque</strong>
                                </TableCell>
                                <TableCell>
                                    <strong>Valor do Estoque (R$)</strong>
                                </TableCell>
                                <TableCell>
                                    <strong>Ações</strong>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredInventory.map((item) => {
                                const stockValue = (
                                    item.quantity * item.product.price
                                ).toFixed(2);
                                return (
                                    <TableRow key={item.id}>
                                        <TableCell>{item.productId}</TableCell>
                                        <TableCell>
                                            {item.product.name}
                                        </TableCell>
                                        <TableCell>
                                            {item.product.brand}
                                        </TableCell>
                                        <TableCell>
                                            {item.product.color}
                                        </TableCell>
                                        <TableCell>
                                            {item.product.size}
                                        </TableCell>
                                        <TableCell>{item.quantity}</TableCell>
                                        <TableCell>R$ {stockValue}</TableCell>
                                        <TableCell>
                                            <Tooltip title="Editar Estoque">
                                                <IconButton
                                                    color="primary"
                                                    sx={{
                                                        backgroundColor:
                                                            "#b3f1ba",
                                                        "&:hover": {
                                                            backgroundColor:
                                                                "#8ade93",
                                                        },
                                                    }}
                                                    onClick={() =>
                                                        alert(
                                                            `Editar estoque do produto ID ${item.productId}`
                                                        )
                                                    }
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                            {filteredInventory.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={8} align="center">
                                        Nenhum produto encontrado.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Modal para registrar compra/venda */}
            <TransactionForm
                open={openTransactionForm}
                onClose={handleCloseTransactionForm}
                type={transactionType} // 'in' ou 'out'
                products={products} // Para listar produtos existentes
                onSave={handleSaveTransaction}
                setSnackbar={setSnackbar}
            />

            {/* Modal para registrar troca/devolucao */}
            <ReturnExchangeForm
                open={openExchangeForm}
                onClose={handleCloseExchangeForm}
                transactions={transactions}
                products={products}
                onSave={handleSaveTransaction}
                setSnackbar={setSnackbar}
            />

            {/* Snackbar para Feedback */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert
                    onClose={handleSnackbarClose}
                    severity={snackbar.severity}
                    sx={{ width: "100%" }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
