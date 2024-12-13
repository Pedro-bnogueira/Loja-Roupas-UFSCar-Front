import React, { useContext } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import axios from "axios";
import AppHeader from "../components/AppHeader";
import AppMenu from "../components/AppMenu";
import AppFooter from "../components/AppFooter";
import AppSetting from "../components/AppSetting";
import { Box, CircularProgress } from "@mui/material";
import { AuthContext } from "../context/AuthContext";

function Home() {
    const { user, authenticated, loading } = useContext(AuthContext);
    const [drawerOpen, setDrawerOpen] = React.useState(false);

    const handleMenuClick = () => {
        setDrawerOpen(!drawerOpen);
    };

    if (loading) {
        return (
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "100vh",
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    if (!authenticated) {
        window.location = "/login";
        return null;
    }

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                minHeight: "100vh",
            }}
        >
            <AppHeader
                response={user || { nome: "Carregando..." }}
                onMenuClick={handleMenuClick}
            />

            <AppMenu open={drawerOpen} setOpen={setDrawerOpen} />

            <Box
                sx={{
                    flexGrow: 1,
                }}
            >
                <Outlet />
            </Box>

            <AppFooter />
            <AppSetting />
        </Box>
    );
}

export default Home;