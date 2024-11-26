import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Menu, MenuItem } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function AppHeader({ response, onMenuClick }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const isMenuOpen = Boolean(anchorEl);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const menuId = 'primary-search-account-menu';

  return (
    <AppBar position="fixed" style={{ backgroundColor: '#f8f9fa', color: '#000' }}>
      <Toolbar>
        {/* Ícone de menu */}
        <IconButton
          edge="start"
          color="inherit"
          onClick={onMenuClick}
          aria-label="open drawer"
        >
          <MenuIcon />
        </IconButton>

        {/* Link para página inicial */}
        <Typography variant="h6" noWrap component={Link} to="/" style={{ textDecoration: 'none', color: '#000', marginLeft: 20 }}>
          Início
        </Typography>

        <div style={{ flexGrow: 1 }} />

        {/* Dropdown de perfil */}
        <div>
          <IconButton
            edge="end"
            aria-label="account of current user"
            aria-controls={menuId}
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            color="inherit"
            style={{ 
              display: 'flex', 
              alignItems: 'center',
              padding: '8px', 
              borderRadius: '8px', 
              transition: 'background-color 0.3s ease', 
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e0e0e0'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <AccountCircle />
            <Typography 
              style={{ 
                marginLeft: 10, 
                cursor: 'pointer', 
                fontWeight: 'bold', 
              }}
            >
              {response.nome}
            </Typography>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            id={menuId}
            keepMounted
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            open={isMenuOpen}
            onClose={handleMenuClose}
          >
            {/* Opções do Dropdown */}
            <MenuItem component="a" onClick={handleMenuClose}>
              <i className="fas fa-sign-out-alt" style={{ marginRight: 8 }}></i>
              Sair
            </MenuItem>
          </Menu>
        </div>
      </Toolbar>
    </AppBar>
  );
}
