import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    CircularProgress,
    useTheme,
    IconButton,
} from "@mui/material";
import { Line, Bar, Doughnut, Pie } from "react-chartjs-2";
import "chart.js/auto";
import {
    ShoppingCart,
    AttachMoney,
    People,
    Sync,
    LocalMall,
    ChevronLeft,
    ChevronRight,
} from "@mui/icons-material";

const Dashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [chartPage, setChartPage] = useState(0);
    const theme = useTheme();

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_API_URL}/api/dashboard`,
                    { withCredentials: true }
                );
                if (response.data) {
                    const validatedData = {
                        ...response.data,
                        salesOverTime: response.data.salesOverTime || [],
                        purchasesOverTime:
                            response.data.purchasesOverTime || [],
                        topProduct: response.data.topProduct || null,
                        totalSales: response.data.totalSales || 0,
                        totalPurchases: response.data.totalPurchases || 0,
                        totalExchanges: response.data.totalExchanges || 0,
                        totalReturns: response.data.totalReturns || 0,
                        totalUsers: response.data.totalUsers || 0,
                    };
                    setDashboardData(validatedData);
                    setUserRole(response.data.userRole);
                }
                setLoading(false);
            } catch (error) {
                console.error("Erro ao carregar o dashboard:", error);
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);
    console.log(dashboardData);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(value);
    };

    const formatMonth = (monthString) => {
        const [year, month] = monthString.split("-");
        const monthNames = [
            "Jan",
            "Fev",
            "Mar",
            "Abr",
            "Mai",
            "Jun",
            "Jul",
            "Ago",
            "Set",
            "Out",
            "Nov",
            "Dez",
        ];
        return `${monthNames[parseInt(month) - 1]} ${year}`;
    };

    const chartPages = [
        [
            { id: 1, cols: 8, component: 'line' },
            { id: 2, cols: 4, component: 'product' }
        ],
        [
            { id: 3, cols: 4, component: 'returns' },
            { id: 4, cols: 4, component: 'inventory' },
            // Só adiciona o gráfico de usuários se for admin
            ...(userRole === "admin" ? [{ id: 5, cols: 4, component: 'users' }] : [])
        ]
    ];

    const renderChart = (component) => {
        if (!dashboardData) return null;

        switch (component) {
            case "line":
                return (
                    <Card
                        sx={{ borderRadius: 4, boxShadow: 3, height: "100%" }}
                    >
                        <CardContent>
                            <Typography
                                variant="h5"
                                sx={{
                                    mb: 2,
                                    color: theme.palette.primary.dark,
                                }}
                            >
                                Desempenho Mensal
                            </Typography>
                            <Line
                                data={{
                                    labels: dashboardData.salesOverTime.map(
                                        (d) => formatMonth(d.month)
                                    ),
                                    datasets: [
                                        {
                                            label: "Vendas",
                                            data: dashboardData.salesOverTime.map(
                                                (d) => d.total
                                            ),
                                            borderColor:
                                                theme.palette.primary.main,
                                            backgroundColor:
                                                theme.palette.primary.light +
                                                "80",
                                            tension: 0.4,
                                            fill: true,
                                        },
                                        {
                                            label: "Compras",
                                            data: dashboardData.purchasesOverTime.map(
                                                (d) => d.total
                                            ),
                                            borderColor:
                                                theme.palette.secondary.main,
                                            backgroundColor:
                                                theme.palette.secondary.main +
                                                "80",
                                            tension: 0.4,
                                            fill: true,
                                        },
                                    ],
                                }}
                                options={{
                                    responsive: true,
                                    plugins: {
                                        legend: { position: "top" },
                                        tooltip: {
                                            callbacks: {
                                                label: (context) => {
                                                    const label =
                                                        context.dataset.label ||
                                                        "";
                                                    const value =
                                                        context.parsed.y || 0;
                                                    return `${label}: ${formatCurrency(
                                                        value
                                                    )}`;
                                                },
                                            },
                                        },
                                    },
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                            grid: {
                                                color: theme.palette.grey[200],
                                            },
                                            ticks: {
                                                callback: (value) =>
                                                    formatCurrency(value),
                                            },
                                        },
                                    },
                                }}
                            />
                        </CardContent>
                    </Card>
                );

            case "product":
                return (
                    <Card
                        sx={{ borderRadius: 4, boxShadow: 3, height: "100%" }}
                    >
                        <CardContent>
                            <Typography
                                variant="h5"
                                sx={{
                                    mb: 2,
                                    color: theme.palette.primary.dark,
                                }}
                            >
                                Produto em Destaque
                            </Typography>
                            {dashboardData.topProduct ? (
                                <Box textAlign="center">
                                    <LocalMall
                                        sx={{
                                            fontSize: 50,
                                            color: theme.palette.primary.main,
                                            mb: 1,
                                        }}
                                    />
                                    <Typography
                                        variant="h6"
                                        sx={{ fontWeight: 600 }}
                                    >
                                        {dashboardData.topProduct.name}
                                    </Typography>
                                    <Typography
                                        variant="subtitle2"
                                        sx={{ color: theme.palette.grey[600] }}
                                    >
                                        {dashboardData.topProduct.brand}
                                    </Typography>

                                    <Box
                                        mt={2}
                                        sx={{
                                            display: "flex",
                                            justifyContent: "center",
                                            gap: 2,
                                        }}
                                    >
                                        <Box>
                                            <Typography variant="caption">
                                                Tamanho
                                            </Typography>
                                            <Typography
                                                variant="body1"
                                                sx={{ fontWeight: 500 }}
                                            >
                                                {dashboardData.topProduct.size}
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="caption">
                                                Cor
                                            </Typography>
                                            <Typography
                                                variant="body1"
                                                sx={{ fontWeight: 500 }}
                                            >
                                                {dashboardData.topProduct.color}
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="caption">
                                                Vendas
                                            </Typography>
                                            <Typography
                                                variant="body1"
                                                sx={{ fontWeight: 500 }}
                                            >
                                                {
                                                    dashboardData.topProduct
                                                        .totalSold
                                                }
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Box
                                        mt={3}
                                        sx={{
                                            maxWidth: "200px",
                                            margin: "0 auto",
                                        }}
                                    >
                                        <Doughnut
                                            data={{
                                                labels: ["Vendas", "Estoque"],
                                                datasets: [
                                                    {
                                                        data: [
                                                            dashboardData
                                                                .topProduct
                                                                .totalSold,
                                                            100 -
                                                                dashboardData
                                                                    .topProduct
                                                                    .totalSold,
                                                        ],
                                                        backgroundColor: [
                                                            theme.palette
                                                                .primary.main,
                                                            theme.palette
                                                                .grey[300],
                                                        ],
                                                        borderWidth: 0,
                                                    },
                                                ],
                                            }}
                                            options={{
                                                cutout: "70%",
                                                plugins: {
                                                    legend: {
                                                        position: "bottom",
                                                    },
                                                    tooltip: {
                                                        callbacks: {
                                                            label: (
                                                                context
                                                            ) => {
                                                                const label =
                                                                    context.label ||
                                                                    "";
                                                                const value =
                                                                    context.raw ||
                                                                    0;
                                                                return `${label}: ${value} unidades`;
                                                            },
                                                        },
                                                    },
                                                },
                                            }}
                                        />
                                    </Box>
                                </Box>
                            ) : (
                                <Typography
                                    variant="body1"
                                    sx={{
                                        textAlign: "center",
                                        color: theme.palette.grey[600],
                                    }}
                                >
                                    Nenhum produto vendido ainda
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                );

            case "returns":
                return (
                    <Card
                        sx={{ borderRadius: 4, boxShadow: 3, height: "100%" }}
                    >
                        <CardContent>
                            <Typography
                                variant="h5"
                                sx={{
                                    mb: 2,
                                    color: theme.palette.primary.dark,
                                }}
                            >
                                Trocas & Devoluções
                            </Typography>
                            <Box sx={{ maxWidth: "300px", margin: "0 auto" }}>
                                <Pie
                                    data={{
                                        labels: ["Trocas", "Devoluções"],
                                        datasets: [
                                            {
                                                data: [
                                                    dashboardData.totalExchanges,
                                                    dashboardData.totalReturns,
                                                ],
                                                backgroundColor: [
                                                    theme.palette.secondary
                                                        .main,
                                                    theme.palette.primary.light,
                                                ],
                                                borderWidth: 0,
                                            },
                                        ],
                                    }}
                                    options={{
                                        plugins: {
                                            legend: { position: "bottom" },
                                            tooltip: {
                                                callbacks: {
                                                    label: (context) => {
                                                        const label =
                                                            context.label || "";
                                                        const value =
                                                            context.raw || 0;
                                                        return `${label}: ${value} ocorrências`;
                                                    },
                                                },
                                            },
                                        },
                                    }}
                                />
                            </Box>
                        </CardContent>
                    </Card>
                );

            // Modifique a função renderChart para estes gráficos:

            case "inventory":
                return (
                    <Card
                        sx={{ borderRadius: 4, boxShadow: 3, height: "100%" }}
                    >
                        <CardContent>
                            <Typography
                                variant="h5"
                                sx={{
                                    mb: 2,
                                    color: theme.palette.primary.dark,
                                }}
                            >
                                Estoque por Categoria
                            </Typography>
                            {dashboardData.formattedInventory?.length > 0 ? (
                                <Bar
                                    data={{
                                        labels: dashboardData.formattedInventory.map(
                                            (item) => item.categoryName
                                        ),
                                        datasets: [
                                            {
                                                label: "Itens em Estoque",
                                                data: dashboardData.formattedInventory.map(
                                                    (item) => item.totalStock
                                                ),
                                                backgroundColor:
                                                    theme.palette.tertiary.dark,
                                                borderColor:
                                                    theme.palette.tertiary.dark,
                                                borderWidth: 1,
                                            },
                                        ],
                                    }}
                                    options={{
                                        indexAxis: "y",
                                        responsive: true,
                                        plugins: {
                                            legend: { position: "bottom" },
                                            tooltip: {
                                                callbacks: {
                                                    label: (context) => {
                                                        const label =
                                                            context.dataset
                                                                .label || "";
                                                        const value =
                                                            context.parsed.x ||
                                                            0;
                                                        return `${label}: ${value} unidades`;
                                                    },
                                                },
                                            },
                                        },
                                    }}
                                />
                            ) : (
                                <Typography
                                    variant="body1"
                                    sx={{
                                        textAlign: "center",
                                        color: theme.palette.grey[600],
                                    }}
                                >
                                    Nenhum dado de estoque disponível
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                );

            case "users":
                if (userRole !== "admin") return null;
                return (
                    <Card
                        sx={{ borderRadius: 4, boxShadow: 3, height: "100%" }}
                    >
                        <CardContent>
                            <Typography
                                variant="h5"
                                sx={{
                                    mb: 2,
                                    color: theme.palette.primary.dark,
                                }}
                            >
                                Cadastro de Usuários
                            </Typography>
                            {dashboardData.usersOverTime?.length > 0 ? (
                                <Line
                                    data={{
                                        labels: dashboardData.usersOverTime.map(
                                            (d) => formatMonth(d.month)
                                        ),
                                        datasets: [
                                            {
                                                label: "Novos Usuários",
                                                data: dashboardData.usersOverTime.map(
                                                    (d) => d.totalUsers
                                                ),
                                                borderColor:
                                                    theme.palette.tertiary.dark,
                                                backgroundColor:
                                                    theme.palette.tertiary
                                                        .dark + "30",
                                                tension: 0.4,
                                            },
                                        ],
                                    }}
                                    options={{
                                        responsive: true,
                                        plugins: {
                                            legend: { position: "bottom" },
                                            tooltip: {
                                                callbacks: {
                                                    label: (context) => {
                                                        const label =
                                                            context.dataset
                                                                .label || "";
                                                        const value =
                                                            context.parsed.y ||
                                                            0;
                                                        return `${label}: ${value} novos usuários`;
                                                    },
                                                },
                                            },
                                        },
                                        scales: {
                                            y: {
                                                beginAtZero: true,
                                                ticks: {
                                                    stepSize: 1,
                                                    precision: 0,
                                                },
                                            },
                                        },
                                    }}
                                />
                            ) : (
                                <Typography
                                    variant="body1"
                                    sx={{
                                        textAlign: "center",
                                        color: theme.palette.grey[600],
                                    }}
                                >
                                    Nenhum dado de usuários disponível
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                );
        }
    };

    if (loading)
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="80vh"
            >
                <CircularProgress sx={{ color: theme.palette.primary.main }} />
            </Box>
        );

    return (
        <Box p={3} sx={{ marginTop: 10 }}>
            <Typography
                variant="h3"
                sx={{
                    mb: 4,
                    color: theme.palette.primary.dark,
                    fontWeight: 600,
                    textAlign: "center",
                }}
            >
                Painel de Controle
            </Typography>

            {/* KPIs SUPERIORES */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={3}>
                    <Card
                        sx={{
                            bgcolor: theme.palette.primary.light,
                            borderRadius: 4,
                            boxShadow: 3,
                        }}
                    >
                        <CardContent>
                            <Box display="flex" alignItems="center" gap={2}>
                                <AttachMoney
                                    sx={{
                                        fontSize: 32,
                                        color: theme.palette.primary.dark,
                                    }}
                                />
                                <Box>
                                    <Typography variant="subtitle1">
                                        Vendas Totais
                                    </Typography>
                                    <Typography
                                        variant="h5"
                                        sx={{ fontWeight: 700 }}
                                    >
                                        {formatCurrency(
                                            dashboardData.totalSales
                                        )}
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={3}>
                    <Card
                        sx={{
                            bgcolor: theme.palette.secondary.main,
                            borderRadius: 4,
                            boxShadow: 3,
                        }}
                    >
                        <CardContent>
                            <Box display="flex" alignItems="center" gap={2}>
                                <ShoppingCart
                                    sx={{ fontSize: 32, color: "white" }}
                                />
                                <Box>
                                    <Typography
                                        variant="subtitle1"
                                        sx={{ color: "white" }}
                                    >
                                        Compras Totais
                                    </Typography>
                                    <Typography
                                        variant="h5"
                                        sx={{ fontWeight: 700, color: "white" }}
                                    >
                                        {formatCurrency(
                                            dashboardData.totalPurchases
                                        )}
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {userRole === "admin" && (
                    <Grid item xs={12} md={3}>
                        <Card
                            sx={{
                                color: "white",
                                bgcolor: theme.palette.tertiary.dark,
                                borderRadius: 4,
                                boxShadow: 3,
                            }}
                        >
                            <CardContent>
                                <Box display="flex" alignItems="center" gap={2}>
                                    <People sx={{ fontSize: 32 }} />
                                    <Box>
                                        <Typography variant="subtitle1">
                                            Usuários Ativos
                                        </Typography>
                                        <Typography
                                            variant="h5"
                                            sx={{ fontWeight: 700 }}
                                        >
                                            {dashboardData.totalUsers}
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                )}

                <Grid item xs={12} md={3}>
                    <Card
                        sx={{
                            bgcolor: theme.palette.primary.dark,
                            borderRadius: 4,
                            boxShadow: 3,
                        }}
                    >
                        <CardContent>
                            <Box display="flex" alignItems="center" gap={2}>
                                <Sync sx={{ fontSize: 32, color: "white" }} />
                                <Box>
                                    <Typography
                                        variant="subtitle1"
                                        sx={{ color: "white" }}
                                    >
                                        Trocas e Devoluções
                                    </Typography>
                                    <Typography
                                        variant="h5"
                                        sx={{ fontWeight: 700, color: "white" }}
                                    >
                                        {dashboardData.totalExchanges +
                                            dashboardData.totalReturns}
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* ÁREA DE GRÁFICOS COM PAGINAÇÃO */}
            <Box sx={{ position: "relative" }}>
                {dashboardData && (
                    <Grid container spacing={3}>
                        {chartPages[chartPage].map((page) => (
                            <Grid item xs={12} md={page.cols} key={page.id}>
                                {renderChart(page.component)}
                            </Grid>
                        ))}
                    </Grid>
                )}

                {/* CONTROLES DE PAGINAÇÃO */}
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        mt: 3,
                        gap: 1,
                    }}
                >
                    <IconButton
                        onClick={() => setChartPage(0)}
                        sx={{
                            color:
                                chartPage === 0
                                    ? theme.palette.primary.main
                                    : theme.palette.grey[400],
                            "&:hover": { backgroundColor: "transparent" },
                        }}
                    >
                        <ChevronLeft />
                    </IconButton>

                    <Box
                        sx={{
                            height: "4px",
                            width: "40px",
                            bgcolor:
                                chartPage === 0
                                    ? theme.palette.primary.main
                                    : theme.palette.grey[300],
                            borderRadius: 2,
                        }}
                    />

                    <Box
                        sx={{
                            height: "4px",
                            width: "40px",
                            bgcolor:
                                chartPage === 1
                                    ? theme.palette.primary.main
                                    : theme.palette.grey[300],
                            borderRadius: 2,
                        }}
                    />

                    <IconButton
                        onClick={() => setChartPage(1)}
                        sx={{
                            color:
                                chartPage === 1
                                    ? theme.palette.primary.main
                                    : theme.palette.grey[400],
                            "&:hover": { backgroundColor: "transparent" },
                        }}
                    >
                        <ChevronRight />
                    </IconButton>
                </Box>
            </Box>
        </Box>
    );
};

export default Dashboard;
