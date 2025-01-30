// src/App.js
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import Home from "./pages/Home";
import UserList from "./pages/Users/UserList";
import ProductsAndCategories from './pages/Products/ProductAndCategories';
import InventoryAndTransactions from './pages/Inventory/InventoryAndTransactions';
import Dashboard from "./components/Dashboard";

function App() {
  return (
      <AuthProvider>
        <BrowserRouter>
          <div className="wrapper">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Home />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="adm/users" element={<UserList />} />
                <Route path="/products" element={<ProductsAndCategories />} />
                <Route path="/estoque" element={<InventoryAndTransactions />} />
              </Route>
            </Routes>
          </div>
        </BrowserRouter>
      </AuthProvider>
  );
}

export default App;
