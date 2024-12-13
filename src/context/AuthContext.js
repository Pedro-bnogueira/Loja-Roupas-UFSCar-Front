import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Armazena dados do usuário autenticado
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const url = process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL : "";
  const token = Cookies.get("LojaRoupa");

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const response = await axios.post(`${url}/api/auth`, { token }, { withCredentials: true });
          if (response.status === 200 && response.data.user) {
            setUser(response.data.user);
            setAuthenticated(true);
          } else {
            setUser(null);
            setAuthenticated(false);
          }
        } catch (err) {
          console.error('Erro ao obter o usuário:', err);
          setUser(null);
          setAuthenticated(false);
        }
      } else {
        setUser(null);
        setAuthenticated(false);
      }
      setLoading(false);
    };
    fetchUser();
  }, [token, url]);

  return (
    <AuthContext.Provider value={{ user, setUser, authenticated, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
