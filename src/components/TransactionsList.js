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
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward"; // Ícone para Saída
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward"; // Ícone para Entrada
import ReplayIcon from "@mui/icons-material/Replay"; // Ícone para devoluções
import SwapHorizIcon from "@mui/icons-material/SwapHoriz"; // Ícone para trocas
import SearchIcon from "@mui/icons-material/Search";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { format } from "date-fns";

const url = process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL : "";

export default function TransactionsList() {
    const [transactions, setTransactions] = useState([]);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success",
    });
    // Estados para barra de funcionalidade da tabela
    const [filteredTransactions, setFilteredTransactions] = useState([]); // Para busca e filtro
    const [searchText, setSearchText] = useState(""); // Campo de busca geral
    const [filterField, setFilterField] = useState(""); // Campo/atributo a filtrar
    const [filterValue, setFilterValue] = useState(""); // Valor do filtro
    const [filterOptions, setFilterOptions] = useState([]); // Opções para filterValue
    const [isNumericFilter, setIsNumericFilter] = useState(false); // Identifica se o filtro é numérico

    useEffect(() => {
        fetchTransactions();
    }, []);

    // Sempre que transactions mudar, atualiza filteredTransactions também
    useEffect(() => {
        setFilteredTransactions(transactions);
    }, [transactions]);

    const fetchTransactions = async () => {
        try {
            const response = await axios.get(`${url}/api/get/transactions`, {
                withCredentials: true,
            });
            if (response.status === 200 && response.data.transactions) {
                setTransactions(response.data.transactions);
            }
        } catch (error) {
            console.error("Erro ao buscar transações:", error);
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

    console.log(transactions);

    // Funções de filtragem

    // Identifica se o campo selecionado é numérico
    const isFieldNumeric = (field) => {
        const numericFields = [
            "id",
            "productId",
            "quantity",
            "price",
            "transactionPrice",
        ];
        return numericFields.includes(field);
    };

    // Obtém as opções únicas para o campo de filtro selecionado

    const getFilterOptions = (field) => {
        const optionsSet = new Set();

        transactions.forEach((item) => {
            let value = null;

            if (field.startsWith("product.")) {
                const subField = field.split(".")[1];
                if (item.Product && item.Product[subField] !== undefined) {
                    value = item.Product[subField];
                }
            } else if (field.startsWith("user.")) {
                const subField = field.split(".")[1];
                if (item.user && item.user[subField] !== undefined) {
                    value = item.user[subField];
                }
            } else {
                if (item[field] !== undefined) {
                    value = item[field];
                }
            }

            if (value !== null) {
                if (field === "transactionDate") {
                    // Apenas armazena a data formatada no conjunto
                    const formattedDate = format(new Date(value), "dd/MM/yyyy");
                    optionsSet.add(formattedDate);
                } else {
                    const normalizedValue = value.toString().trim();
                    optionsSet.add(normalizedValue);
                }
            }
        });

        return Array.from(optionsSet).sort();
    };

    // Aplica a busca e o filtro nas transações
    const applySearchAndFilter = () => {
        let data = [...transactions];

        if (filterField && filterValue) {
            data = data.filter((item) => {
                let valueToCompare = null;

                if (filterField.startsWith("product.")) {
                    const field = filterField.split(".")[1];
                    valueToCompare = item.Product ? item.Product[field] : null;
                } else if (filterField.startsWith("user.")) {
                    const field = filterField.split(".")[1];
                    valueToCompare = item.user ? item.user[field] : null;
                } else if (filterField === "transactionDate") {
                    valueToCompare = format(
                        new Date(item.transactionDate),
                        "dd/MM/yyyy"
                    );
                } else {
                    valueToCompare = item[filterField];
                }

                return valueToCompare
                    ?.toString()
                    .toLowerCase()
                    .includes(filterValue.toLowerCase());
            });
        }

        if (searchText) {
            data = data.filter((item) => {
                const valuesToSearch = [
                    item.id,
                    item.Product?.name,
                    item.Product?.brand,
                    item.Product?.color,
                    item.Product?.size,
                    item.quantity,
                    format(
                        new Date(item.transactionDate),
                        "dd/MM/yyyy HH:mm:ss"
                    ), // Para busca geral
                ];
                const rowString = valuesToSearch.join(" ").toLowerCase();
                return rowString.includes(searchText.toLowerCase());
            });
        }

        setFilteredTransactions(data);
    };

    // UseEffect para aplicar busca e filtro sempre que houver mudanças
    useEffect(() => {
        applySearchAndFilter();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchText, filterField, filterValue, transactions]);

    // UseEffect para atualizar as opções de filtro quando o campo de filtro muda
    useEffect(() => {
        if (filterField) {
            const options = getFilterOptions(filterField);
            setFilterOptions(options);
            setFilterValue(""); // Reseta o valor do filtro quando o campo muda
            setIsNumericFilter(isFieldNumeric(filterField));
        } else {
            setFilterOptions([]);
            setFilterValue("");
            setIsNumericFilter(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterField, transactions]);

    // Funções de exportação

    // Exportar para PDF
    const handleExportPDF = () => {
        // PDF em orientação paisagem para maior largura
        const doc = new jsPDF("l", "pt");
        doc.setFontSize(10);
        doc.text("Relatório de Transações", 20, 30);
      
        const headers = [
          [
            "Tipo",
            "Código da Transação",
            "Código do Produto",
            "Nome",
            "Marca",
            "Cor",
            "Tamanho",
            "Fornecedor/Comprador",
            "Quantidade",
            "Preço da Transação (R$)",
            "Data da Transação",
            "Usuário Responsável",
          ],
        ];
      
        const rows = filteredTransactions.map((item) => {
          const stockValue = parseFloat(item.transactionPrice).toFixed(2);
          const formattedDate = format(
            new Date(item.transactionDate),
            "dd/MM/yyyy HH:mm:ss"
          );
          const typeIcon =
            item.type === "in"
              ? "Entrada"
              : item.type === "out"
              ? "Saída"
              : item.type === "return"
              ? "Devolução"
              : item.type === "exchange_in"
              ? "Devolução da troca"
              : "Saída da troca";
          return [
            typeIcon,
            item.id,
            item.productId,
            item.Product?.name || "",
            item.Product?.brand || "",
            item.Product?.color || "",
            item.Product?.size || "",
            item.supplierOrBuyer || "",
            item.quantity,
            `R$ ${stockValue}`,
            formattedDate,
            item.user?.name || "",
          ];
        });
      
        doc.autoTable({
          head: headers,
          body: rows,
          startY: 40,
          margin: { left: 20, right: 20 },
          styles: {
            fontSize: 8,        // Tamanho de fonte reduzido para caber mais conteúdo
            overflow: "linebreak", // Permite quebra de linha automática
          },
          headStyles: { fillColor: [41, 128, 185] },
          columnStyles: {
            0: { cellWidth: 40 },   // Tipo
            1: { cellWidth: 60 },   // Código da Transação
            2: { cellWidth: 60 },   // Código do Produto
            3: { cellWidth: 80 },   // Nome
            4: { cellWidth: 60 },   // Marca
            5: { cellWidth: 50 },   // Cor
            6: { cellWidth: 50 },   // Tamanho
            7: { cellWidth: 100 },  // Fornecedor/Comprador (reduzido para liberar espaço)
            8: { cellWidth: 60 },   // Quantidade
            9: { cellWidth: 60 },   // Preço da Transação
            10: { cellWidth: 90 },  // Data da Transação
            11: { cellWidth: 90 },  // Usuário Responsável
          },
        });
      
        doc.save("transacoes.pdf");
      };
      
      

    // Exportar para Excel
    const handleExportExcel = () => {
        const sheetData = [
            [
                "Tipo",
                "Código da Transação",
                "Código do Produto",
                "Nome",
                "Marca",
                "Cor",
                "Tamanho",
                "Fornecedor/Comprador",
                "Quantidade",
                "Preço da Transação (R$)",
                "Data da Transação",
                "Usuário Responsável",
            ],
            ...filteredTransactions.map((item) => {
                const stockValue = parseFloat(item.transactionPrice).toFixed(2);
                const formattedDate = format(
                    new Date(item.transactionDate),
                    "dd/MM/yyyy HH:mm:ss"
                );
                const typeIcon =
                    item.type === "in"
                        ? "Entrada"
                        : item.type === "out"
                        ? "Saída"
                        : item.type === "return"
                        ? "Devolução"
                        : item.type === "exchange_in"
                        ? "Devolução da troca"
                        : "Saída da troca"
                return [
                    typeIcon,
                    item.id,
                    item.productId,
                    item.Product?.name || "",
                    item.Product?.brand || "",
                    item.Product?.color || "",
                    item.Product?.size || "",
                    item.supplierOrBuyer || "",
                    item.quantity,
                    `R$ ${stockValue}`,
                    formattedDate,
                    item.user?.name || "",
                ];
            }),
        ];

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(sheetData);
        XLSX.utils.book_append_sheet(wb, ws, "Transações");
        XLSX.writeFile(wb, "transacoes.xlsx");
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
                Histórico de Transações
            </Typography>
            {/* Barra de Funcionalidades: Busca, Filtro e Exportação */}
            <Stack
                direction="row"
                spacing={2}
                sx={{ mb: 2 }}
                alignItems="center"
                flexWrap="wrap"
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
                    sx={{ minWidth: 200 }}
                />

                {/* Filtro por Atributo */}
                <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel id="filter-field-label">Filtro</InputLabel>
                    <Select
                        labelId="filter-field-label"
                        value={filterField}
                        label="Atributo"
                        onChange={(e) => setFilterField(e.target.value)}
                    >
                        <MenuItem value="">Nenhum</MenuItem>
                        <MenuItem value="id">ID da Transação</MenuItem>
                        <MenuItem value="productId">Código do Produto</MenuItem>
                        <MenuItem value="product.name">
                            Nome do Produto
                        </MenuItem>
                        <MenuItem value="product.brand">
                            Marca do Produto
                        </MenuItem>
                        <MenuItem value="product.color">
                            Cor do Produto
                        </MenuItem>
                        <MenuItem value="product.size">
                            Tamanho do Produto
                        </MenuItem>
                        <MenuItem value="supplierOrBuyer">
                            Fornecedor/Comprador
                        </MenuItem>
                        <MenuItem value="quantity">Quantidade</MenuItem>
                        <MenuItem value="transactionPrice">
                            Preço da Transação
                        </MenuItem>
                        <MenuItem value="transactionDate">
                            Data da Transação
                        </MenuItem>
                        <MenuItem value="user.name">
                            Usuário Responsável
                        </MenuItem>
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
                            sx={{ minWidth: 200 }}
                        />
                    ) : (
                        <FormControl size="small" sx={{ minWidth: 200 }}>
                            <InputLabel id="filter-value-label">Valor</InputLabel>
                            <Select
                                labelId="filter-value-label"
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

                {/* Botões de Exportação */}
                <Button
                    variant="outlined"
                    color="primary"
                    onClick={handleExportPDF}
                    sx={{ minWidth: 150 }}
                >
                    Exportar PDF
                </Button>

                <Button
                    variant="outlined"
                    color="primary"
                    onClick={handleExportExcel}
                    sx={{ minWidth: 150 }}
                >
                    Exportar Excel
                </Button>
            </Stack>
            <Paper variant="outlined">
                <TableContainer component={Paper} variant="outlined">
                    <Table aria-label="Tabela de Histórico de Transações">
                        <TableHead>
                            <TableRow>
                                <TableCell>
                                    <strong>Tipo</strong>
                                </TableCell>
                                <TableCell>
                                    <strong>Código da Transação</strong>
                                </TableCell>
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
                                    <strong>Fornecedor/Comprador</strong>
                                </TableCell>
                                <TableCell>
                                    <strong>Quantidade</strong>
                                </TableCell>
                                <TableCell>
                                    <strong>Preço da Transação (R$)</strong>
                                </TableCell>
                                <TableCell>
                                    <strong>Data da Transação</strong>
                                </TableCell>
                                <TableCell>
                                    <strong>Usuário Responsável</strong>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredTransactions.map((t) => {
                                // Determinar o ícone e a cor com base no tipo
                                let IconComponent;
                                let iconColor;
                                let typeLabel;

                                switch (t.type) {
                                    case "in":
                                        IconComponent = ArrowDownwardIcon;
                                        iconColor = "green";
                                        typeLabel = "Entrada";
                                        break;
                                    case "out":
                                        IconComponent = ArrowUpwardIcon;
                                        iconColor = "red";
                                        typeLabel = "Saída";
                                        break;
                                    case "return":
                                        IconComponent = ReplayIcon;
                                        iconColor = "orange"; 
                                        typeLabel = "Devolução";
                                        break;
                                    case "exchange_in":
                                        IconComponent = SwapHorizIcon;
                                        iconColor = "green"; 
                                        typeLabel = "Devolução da troca";
                                        break;
                                    case "exchange_out":
                                        IconComponent = SwapHorizIcon;
                                        iconColor = "red"; 
                                        typeLabel = "Saída da troca";
                                        break;
                                    default:
                                        IconComponent = null;
                                        typeLabel = "Desconhecido";
                                }

                                return (
                                    <TableRow key={t.id}>
                                        <TableCell>
                                            {IconComponent ? (
                                                <IconComponent
                                                    sx={{ color: iconColor }}
                                                    titleAccess={typeLabel}
                                                />
                                            ) : (
                                                <Typography variant="body2">
                                                    {typeLabel}
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell>{t.id}</TableCell>
                                        <TableCell>{t.productId}</TableCell>
                                        <TableCell>{t.Product.name}</TableCell>
                                        <TableCell>{t.Product.brand}</TableCell>
                                        <TableCell>{t.Product.color}</TableCell>
                                        <TableCell>{t.Product.size}</TableCell>
                                        <TableCell>
                                            {t.supplierOrBuyer}
                                        </TableCell>
                                        <TableCell>{t.quantity}</TableCell>
                                        <TableCell>
                                            R${" "}
                                            {parseFloat(
                                                t.transactionPrice
                                            ).toFixed(2)}
                                        </TableCell>
                                        <TableCell>
                                            {t.transactionDate
                                                ? format(
                                                      new Date(
                                                          t.transactionDate
                                                      ),
                                                      "dd/MM/yyyy HH:mm:ss"
                                                  )
                                                : "Data inválida"}
                                        </TableCell>
                                        <TableCell>{t.user.name}</TableCell>
                                    </TableRow>
                                );
                            })}
                            {filteredTransactions.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={12} align="center">
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
