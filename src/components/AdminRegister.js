
import React, { useState } from 'react';
import axios from 'axios';

const url = process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL : "";

const AdminRegister = () => {
  // Estados para armazenar os campos do formulário
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accessLevel, setAccessLevel] = useState('user'); // Valor padrão: 'user'

  // Estados para mensagens de sucesso ou erro
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Função para lidar com o envio do formulário
  const handleSubmit = async (e) => {
    e.preventDefault(); // Previne o comportamento padrão do formulário
    setError('');
    setSuccess('');

    try {
      // Envia uma requisição POST para /new/user com os dados do usuário
      const response = await axios.post(
        url + '/api/new/user',
        { name, email, password, accessLevel },
        { withCredentials: true } // Importante se a rota requer autenticação via cookies
      );

      if (response.status === 201) {
        setSuccess('Usuário cadastrado com sucesso!');
        // Limpa os campos do formulário
        setName('');
        setEmail('');
        setPassword('');
        setAccessLevel('user');
      }
    } catch (err) {
      if (err.response) {
        // Erro retornado pelo servidor
        setError(err.response.data.message || 'Falha no cadastro.');
      } else {
        // Erro de rede ou outro erro inesperado
        setError('Ocorreu um erro. Por favor, tente novamente.');
      }
    }
  };

  return (
    <div style={styles.container}>
      <h2>Cadastrar Novo Usuário</h2>
      {error && <p style={styles.error}>{error}</p>}
      {success && <p style={styles.success}>{success}</p>}
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.inputGroup}>
          <label htmlFor="name">Nome:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={styles.input}
          />
        </div>
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
        <div style={styles.inputGroup}>
          <label htmlFor="accessLevel">Nível de Acesso:</label>
          <select
            id="accessLevel"
            value={accessLevel}
            onChange={(e) => setAccessLevel(e.target.value)}
            required
            style={styles.select}
          >
            <option value="user">Usuário</option>
            <option value="admin">Administrador</option>
          </select>
        </div>
        <button type="submit" style={styles.button}>Cadastrar</button>
      </form>
    </div>
  );
};

// Estilos simples para o componente
const styles = {
  container: {
    maxWidth: '500px',
    margin: '50px auto',
    padding: '30px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    backgroundColor: '#f9f9f9',
    fontFamily: 'Arial, sans-serif'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'left'
  },
  input: {
    padding: '10px',
    fontSize: '16px',
    borderRadius: '4px',
    border: '1px solid #ccc'
  },
  select: {
    padding: '10px',
    fontSize: '16px',
    borderRadius: '4px',
    border: '1px solid #ccc'
  },
  button: {
    padding: '12px',
    fontSize: '16px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer'
  },
  error: {
    color: 'red',
    fontWeight: 'bold'
  },
  success: {
    color: 'green',
    fontWeight: 'bold'
  }
};

export default AdminRegister;
