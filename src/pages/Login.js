// src/components/Login.js

import React, { useState } from "react";
import axios from "axios";
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    InputAdornment,
    useTheme,
    Alert,
} from "@mui/material";
import { styled } from "@mui/system";
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import roupaImg from "../assets/img/roupa.png";
import theme from "../assets/theme";

const url = process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL : "";

// Container geral, fundo amarelo pastel
const Container = styled("div")(({ theme }) => ({
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#f7f7dc", // amarelo pastel leve, ajuste conforme necessário
    alignItems: "center",
    justifyContent: "center",
}));

// Caixa da esquerda onde fica o formulário
const FormCard = styled(Paper)(({ theme }) => ({
    width: "50%",
    maxWidth: "450px",
    height: "410px",
    backgroundColor: "#fdfbe7", // um off-white/amarelo bem claro para destacar do fundo
    padding: theme.spacing(4),
    borderRadius: "8px 0px 0px 8px",
    boxShadow: "0 0 20px rgba(0,0,0,0.1)",
    position: "relative",
    zIndex: 2, // fica acima da imagem
    [theme.breakpoints.down("md")]: {
        width: "90%",
    },
}));

// Seção da direita com a imagem
const Image = styled(Box)(({ theme }) => ({
    width: "506px",
    height: "100%",
    // backgroundColor: "#444444",
    backgroundSize: "cover",
    backgroundPosition: "center",
    borderRadius: "0 8px 8px 0",
    [theme.breakpoints.down("md")]: {
        display: "none",
    },
}));

export default function Login() {
    const theme = useTheme();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        try {
            const response = await axios.post(
                url + "/api/sign",
                { email, password },
                { withCredentials: true }
            );

            if (response.status === 200) {
                const token = response.data.token;
                // Define o cookie 'LojaRoupa' no domínio atual (front-end)
                document.cookie = `LojaRoupa=${token}; path=/; SameSite=None; Secure`;
                console.log('Cookie definido via JavaScript no domínio do front-end.');
                setSuccess("Login realizado com sucesso!");
                window.location = "/";
            }
        } catch (err) {
            if (err.response) {
                setError(err.response.data.message || "Falha no login.");
            } else {
                setError("Ocorreu um erro. Por favor, tente novamente.");
            }
        }
    };
    console.log(roupaImg);
    return (
        <Container>
            <FormCard elevation={0} sx={{
              display: 'flex',
              flexDirection: 'column',
              textAlign: 'center',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
                <Typography
                    variant="h3"
                    component="h1"
                    sx={{
                        fontSize: '36px',
                        mb: 4,
                        fontFamily: "Montserrat, sans-serif",
                        fontWeight: 700,
                    }}
                >
                    Login
                </Typography>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
                {success && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        {success}
                    </Alert>
                )}
                <Box
                    component="form"
                    onSubmit={handleSubmit}
                    width="300px"
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 5,
                        alignItems: "center",
                    }}
                >
                    <TextField
                        variant="outlined"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        fullWidth
                        required
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <PersonIcon sx={{ color: "#000" }} />
                                </InputAdornment>
                            ),
                        }}
                        sx={{

                          "& .MuiOutlinedInput-root": {
                              height: "32px",
                              borderRadius: "8px",
                              backgroundColor: '#F7E9B6',
                              // Cor padrão da borda
                              "& fieldset": {
                                borderColor: "#F7E9B6",
                              },
                              // Cor quando está ativo/focado
                              "&.Mui-focused fieldset": {
                                borderColor: "#222", // Substitua pela cor desejada
                                borderWidth: "2px", // Pode ajustar a espessura se necessário
                              },
                            },
                          }}
                          />

                    <TextField
                        variant="outlined"
                        placeholder="Senha"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        fullWidth
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                                    <LockIcon sx={{ color: "#000" }} />
                                </InputAdornment>
                            ),
                          }}
                          sx={{
                            
                            "& .MuiOutlinedInput-root": {
                                height: "32px",
                                borderRadius: "8px",
                                backgroundColor: '#F7E9B6',
                                // Cor padrão da borda
                                "& fieldset": {
                                    borderColor: "#F7E9B6",
                                },
                                // Cor quando está ativo/focado
                                "&.Mui-focused fieldset": {
                                    borderColor: "#222", // Substitua pela cor desejada
                                    borderWidth: "2px", // Pode ajustar a espessura se necessário
                                },
                            },
                        }}
                    />

                    <Button
                        type="submit"
                        variant="contained"
                        sx={{
                            width: "200px",
                            py: 0,
                            fontFamily: "Montserrat, sans-serif",
                            fontSize: "1.4rem",
                            fontWeight: 700,
                            textTransform: "none",
                            backgroundColor: theme.palette.tertiary.dark, // amarelo mais vivo
                            color: "#000", // texto preto
                            borderRadius: "8px",
                            "&:hover": {
                                backgroundColor: theme.palette.tertiary.dark_hover, // um tom mais escuro
                            },
                        }}
                    >
                        Log in
                    </Button>
                </Box>
            </FormCard>

            <Image component="img" src={roupaImg} alt="Imagem de roupa" />
        </Container>
    );
}
