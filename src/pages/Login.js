// src/components/Login.js

import React, { useState } from 'react';
import axios from 'axios';
const url = process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL : "";

const Login = () => {
  // Estados para armazenar email, senha e mensagens
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Função para lidar com o envio do formulário
  const handleSubmit = async (e) => {
    e.preventDefault(); // Previne o comportamento padrão do formulário
    setError('');
    setSuccess('');

    try {
      // Envia uma requisição POST para /api/sign com email e senha
      const response = await axios.post(
        url + '/api/sign',
        { email, password },
        { withCredentials: true } // Importante para enviar e receber cookies
      );

      if (response.status === 200) {
        setSuccess('Login realizado com sucesso!');
        window.location = '/'
        // Redirecionar o usuário ou atualizar o estado da aplicação conforme necessário
      }
    } catch (err) {
      if (err.response) {
        // Erro retornado pelo servidor
        setError(err.response.data.message || 'Falha no login.');
      } else {
        // Erro de rede ou outro erro inesperado
        setError('Ocorreu um erro. Por favor, tente novamente.');
      }
    }
  };

  return (
    <div style={styles.container}>
      <h2>Login</h2>
      {error && <p style={styles.error}>{error}</p>}
      {success && <p style={styles.success}>{success}</p>}
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.inputGroup}>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />
        </div>
        <div style={styles.inputGroup}>
          <label htmlFor="password">Senha:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />
        </div>
        <button type="submit" style={styles.button}>Login</button>
      </form>
    </div>
  );
};

// Estilos simples para o componente
const styles = {
  container: {
    maxWidth: '400px',
    margin: '50px auto',
    padding: '20px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    textAlign: 'center',
    fontFamily: 'Arial, sans-serif'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'left'
  },
  input: {
    padding: '8px',
    fontSize: '16px'
  },
  button: {
    padding: '10px',
    fontSize: '16px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
  },
  error: {
    color: 'red'
  },
  success: {
    color: 'green'
  }
};

export default Login;
