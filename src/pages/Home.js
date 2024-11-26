import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import axios from "axios";
import AppHeader from "../components/AppHeader";
import AppMenu from "../components/AppMenu";
import AppFooter from "../components/AppFooter";
import AppSetting from "../components/AppSetting";
import { Box } from "@mui/material";
import Cookies from "js-cookie";

const url = process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL : "";

function Home() {
    const token = Cookies.get("LojaRoupa");
    const [authenticated, setAuthenticated] = useState(false);
    const [resp, setResp] = useState(null);
    const [loading, setLoading] = useState(true);
    const [drawerOpen, setDrawerOpen] = useState(false);

    const handleMenuClick = () => {
        setDrawerOpen(!drawerOpen); // Alterna o estado de drawerOpen
    };

    useEffect(() => {
        if (token) {
            axios
                .post(url + "/api/auth", { token }, { withCredentials: true })
                .then((response) => {
                    if (response.status === 200) {
                        setAuthenticated(true);
                        setResp(response.data.user);
                    } else {
                        window.location = "/login";
                    }
                    setLoading(false);
                })
                .catch((err) => {
                    console.error(err);
                    window.location = "/login";
                });
        } else {
            window.location = "/login";
        }
    }, [token]);

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                minHeight: "100vh", // Garantir que a altura mínima seja 100% da viewport
            }}
        >
            <AppHeader
                response={resp || { nome: "Carregando..." }}
                onMenuClick={handleMenuClick}
            />

            {/* Renderiza o menu lateral com base na autenticação */}
            {authenticated && resp && resp.id === 1 ? (
                // <AppAdmin open={drawerOpen} setOpen={setDrawerOpen} />
                <></>
            ) : (
                <AppMenu open={drawerOpen} setOpen={setDrawerOpen} />
            )}

            <Box
                sx={{
                    flexGrow: 1,
                }}
            >
                <Outlet /> {/* Conteúdo das rotas */}
            </Box>

            <AppFooter />
            <AppSetting />
        </Box>
    );
}

export default Home;
