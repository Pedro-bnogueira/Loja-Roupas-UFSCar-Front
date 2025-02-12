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
import SearchIcon from "@mui/icons-material/Search";

import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { styled } from "@mui/system";
import ProductForm from "./ProductForm";
import DeleteDialog from "./DeleteDialog";

const url = process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL : "";

// Cabeçalho personalizado com título e botão
const HeaderBox = styled("div")(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(4),
    padding: `0 ${theme.spacing(2)}`,
}));

export default function ProductList() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]); // Armazenar categorias para o select
    const [openFormDialog, setOpenFormDialog] = useState(false);
    const [formMode, setFormMode] = useState("create");
    const [formData, setFormData] = useState({
        name: "",
        brand: "",
        price: "",
        size: "",
        color: "",
        categoryName: "",
        alertThreshold: "",
    });
    const [selectedProductId, setSelectedProductId] = useState(null);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success",
    });
    // Estados para barra de funcionalidade da tabela
    const [filteredProducts, setFilteredProducts] = useState([]); // Para busca e filtro
    const [searchText, setSearchText] = useState(""); // Campo de busca geral
    const [filterField, setFilterField] = useState(""); // Campo/atributo a filtrar
    const [filterValue, setFilterValue] = useState(""); // Valor do filtro
    const [filterOptions, setFilterOptions] = useState([]); // Opções para filterValue
    const [isNumericFilter, setIsNumericFilter] = useState(false); // Identifica se o filtro é numérico

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

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
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${url}/api/get/categories`, {
                withCredentials: true,
            });
            if (response.status === 200 && response.data.categories) {
                setCategories(response.data.categories);
            }
        } catch (error) {
            console.error(error);
        }
    };

    console.log(categories);

    const handleCreateClick = () => {
        setFormMode("create");
        setFormData({
            name: "",
            brand: "",
            price: "",
            size: "",
            color: "",
            categoryName: "",
            alertThreshold: "",
        });
        setOpenFormDialog(true);
    };

    const handleEditClick = (product) => {
        setFormMode("edit");
        setSelectedProductId(product.id);

        // Verifica se existe categoria
        const currentCategoryName = product.category
            ? product.category.name
            : "";

        setFormData({
            name: product.name || "",
            brand: product.brand || "",
            price: product.price || "",
            size: product.size || "",
            color: product.color || "",
            categoryName: currentCategoryName,
            alertThreshold: product.alertThreshold,
        });
        setOpenFormDialog(true);
    };

    const handleSaveProduct = async (data) => {
        try {
            // Aqui transformaremos o categoryName em categoryId
            let categoryId = null;
            if (data.categoryName) {
                const foundCategory = categories.find(
                    (cat) => cat.name === data.categoryName
                );
                if (foundCategory) {
                    categoryId = foundCategory.id;
                }
            }
            console.log(data.price);
            const payload = {
                name: data.name,
                brand: data.brand,
                price: data.price,
                size: data.size,
                color: data.color,
                category: data.categoryName,
                alertThreshold: data.alertThreshold ? parseInt(data.alertThreshold) : null
            };

            if (formMode === "create") {
                const response = await axios.post(
                    `${url}/api/new/product`,
                    payload,
                    { withCredentials: true }
                );
                if (response.status === 201 && response.data.product) {
                    setProducts([...products, response.data.product]);
                    setOpenFormDialog(false);
                    handleSnackbarOpen(
                        "Produto cadastrado com sucesso!",
                        "success"
                    );
                } else {
                    handleSnackbarOpen("Erro ao cadastrar produto.", "error");
                }
            } else {
                const response = await axios.put(
                    `${url}/api/update/product/${selectedProductId}`,
                    payload,
                    { withCredentials: true }
                );
                if (response.status === 200 && response.data.editedProduct) {
                    setProducts(
                        products.map((p) =>
                            p.id === selectedProductId
                                ? { ...p, ...response.data.editedProduct }
                                : p
                        )
                    );
                    setOpenFormDialog(false);
                    handleSnackbarOpen(
                        "Produto atualizado com sucesso!",
                        "success"
                    );
                } else {
                    handleSnackbarOpen("Erro ao atualizar produto.", "error");
                }
            }
        } catch (error) {
            console.log(error);
            handleSnackbarOpen("Ocorreu um erro ao salvar o produto.", "error");
        }
    };

    const handleDeleteClick = (id) => {
        setSelectedProductId(id);
        setOpenDeleteDialog(true);
    };

    const handleDeleteProduct = async () => {
        try {
            const response = await axios.delete(
                `${url}/api/delete/product/${selectedProductId}`,
                { withCredentials: true }
            );
            if (response.status === 200) {
                setProducts(products.filter((p) => p.id !== selectedProductId));
                setOpenDeleteDialog(false);
                handleSnackbarOpen("Produto removido com sucesso!", "success");
            } else {
                handleSnackbarOpen("Erro ao remover produto.", "error");
            }
        } catch (error) {
            console.log(error);
            handleSnackbarOpen(
                "Ocorreu um erro ao remover o produto.",
                "error"
            );
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

    // Funções para filtragem da tabela

    // Identifica se o campo selecionado é numérico
    const isFieldNumeric = (field) => {
        const numericFields = ["id", "price", "alertThreshold"];
        return numericFields.includes(field);
    };

    // Obtém as opções únicas para o campo de filtro selecionado
    const getFilterOptions = (field) => {
        const optionsSet = new Set();

        products.forEach((item) => {
            let value = null;

            if (field.startsWith("category.")) {
                const subField = field.split(".")[1];
                if (item.category && item.category[subField] !== undefined) {
                    value = item.category[subField];
                }
            } else {
                if (item[field] !== undefined) {
                    value = item[field];
                }
            }

            if (value !== null) {
                // Normalizar o valor: remover espaços extras e padronizar capitalização
                const normalizedValue = value.toString().trim();
                optionsSet.add(normalizedValue);
            }
        });

        return Array.from(optionsSet).sort();
    };

    // Aplica a busca e o filtro nos produtos
    const applySearchAndFilter = () => {
        let data = [...products];

        // Filtro por atributo (filterField e filterValue)
        if (filterField && filterValue) {
            data = data.filter((item) => {
                if (filterField.startsWith("category.")) {
                    const field = filterField.split(".")[1]; // ex. "name"
                    return item.category[field]
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
                    item.id,
                    item.name,
                    item.brand,
                    item.price,
                    item.size,
                    item.color,
                    item.category?.name,
                ];
                const rowString = valuesToSearch.join(" ").toLowerCase();
                return rowString.includes(searchText.toLowerCase());
            });
        }

        setFilteredProducts(data);
    };

    // UseEffect para aplicar busca e filtro sempre que houver mudanças
    useEffect(() => {
        applySearchAndFilter();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchText, filterField, filterValue, products]);

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
    }, [filterField, products]);

    // Funções de exportação
    const handleExportPDF = () => {
        const doc = new jsPDF("p", "pt");
        doc.setFontSize(13);
        doc.text("Relatório de Produtos", 40, 40);

        // Cabeçalhos e dados para autoTable
        const headers = [
            ["ID", "Nome", "Marca", "Preço", "Tamanho", "Cor", "Categoria", "Quantidade Mínima de Estoque"],
        ];
        const rows = filteredProducts.map((item) => {
            const formattedPrice = parseFloat(item.price).toFixed(2);
            return [
                item.id,
                item.name,
                item.brand,
                `R$ ${formattedPrice}`,
                item.size,
                item.color,
                item.category ? item.category.name : "",
                item.alertThreshold,
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

        doc.save("produtos.pdf");
    };

    const handleExportExcel = () => {
        const sheetData = [
            ["ID", "Nome", "Marca", "Preço", "Tamanho", "Cor", "Categoria", " Quantidade Mínima de Estoque"],
            ...filteredProducts.map((item) => {
                const formattedPrice = parseFloat(item.price).toFixed(2);
                return [
                    item.id,
                    item.name,
                    item.brand,
                    `R$ ${formattedPrice}`,
                    item.size,
                    item.color,
                    item.category ? item.category.name : "",
                    item.alertThreshold,
                ];
            }),
        ];

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(sheetData);
        XLSX.utils.book_append_sheet(wb, ws, "Produtos");
        XLSX.writeFile(wb, "produtos.xlsx");
    };

    return (
        <>
            <HeaderBox>
                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: 700,
                        fontFamily: "Montserrat, sans-serif",
                    }}
                >
                    Produtos cadastrados
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleCreateClick}
                    sx={{
                        fontWeight: 600,
                        textTransform: "none",
                    }}
                    startIcon={<AddIcon />}
                >
                    Adicionar produto
                </Button>
            </HeaderBox>

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
                - id, price (no produto)
                - name, brand, color, size, category.name
            */}
                        <MenuItem value="">Nenhum</MenuItem>
                        <MenuItem value="id">ID</MenuItem>
                        <MenuItem value="name">Nome</MenuItem>
                        <MenuItem value="brand">Marca</MenuItem>
                        <MenuItem value="price">Preço</MenuItem>
                        <MenuItem value="size">Tamanho</MenuItem>
                        <MenuItem value="color">Cor</MenuItem>
                        <MenuItem value="category.name">Categoria</MenuItem>
                        <MenuItem value="alertThreshold"> Quantidade Mínima de Estoque</MenuItem>
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

                {/* Botões de Exportação */}
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
            <Paper variant="outlined">
                <TableContainer component={Paper} variant="outlined">
                    <Table aria-label="Tabela de Produtos">
                        <TableHead>
                            <TableRow>
                                <TableCell>
                                    <strong>ID</strong>
                                </TableCell>
                                <TableCell>
                                    <strong>Nome</strong>
                                </TableCell>
                                <TableCell>
                                    <strong>Marca</strong>
                                </TableCell>
                                <TableCell>
                                    <strong>Preço</strong>
                                </TableCell>
                                <TableCell>
                                    <strong>Tamanho</strong>
                                </TableCell>
                                <TableCell>
                                    <strong>Cor</strong>
                                </TableCell>
                                <TableCell>
                                    <strong>Categoria</strong>
                                </TableCell>
                                <TableCell>
                                    <strong>Quantidade Mínima de Estoque</strong>
                                </TableCell>
                                <TableCell>
                                    <strong>Ações</strong>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredProducts.map((p) => (
                                <TableRow key={p.id}>
                                    <TableCell>{p.id}</TableCell>
                                    <TableCell>{p.name}</TableCell>
                                    <TableCell>{p.brand}</TableCell>
                                    <TableCell>
                                        R$ {parseFloat(p.price).toFixed(2)}
                                    </TableCell>
                                    <TableCell>{p.size}</TableCell>
                                    <TableCell>{p.color}</TableCell>
                                    <TableCell>
                                        {p.category ? p.category.name : ""}
                                    </TableCell>
                                    <TableCell>
                                        {p.alertThreshold || "-"}
                                    </TableCell>
                                    <TableCell>
                                        <IconButton
                                            color="primary"
                                            sx={{
                                                backgroundColor: "#b3f1ba",
                                                marginRight: 1,
                                                "&:hover": {
                                                    backgroundColor: "#8ade93",
                                                },
                                            }}
                                            onClick={() => handleEditClick(p)}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            color="error"
                                            sx={{
                                                backgroundColor: "#f9b5b5",
                                                "&:hover": {
                                                    backgroundColor: "#f28a8a",
                                                },
                                            }}
                                            onClick={() =>
                                                handleDeleteClick(p.id)
                                            }
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredProducts.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={8} align="center">
                                        Nenhum produto cadastrado.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Diálogo de Criação/Edição de Produto */}
            <ProductForm
                open={openFormDialog}
                onClose={() => setOpenFormDialog(false)}
                mode={formMode}
                formData={formData}
                onSave={handleSaveProduct}
                categories={categories} // Passando as categorias para o form
            />

            {/* Diálogo de confirmação para exclusão */}
            <DeleteDialog
                open={openDeleteDialog}
                onClose={() => setOpenDeleteDialog(false)}
                onConfirm={handleDeleteProduct}
                title="Deseja mesmo excluir este produto?"
                description="Esta ação não pode ser desfeita."
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
        </>
    );
}
