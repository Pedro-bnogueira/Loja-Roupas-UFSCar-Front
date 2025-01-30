import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People'; 
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import StorefrontIcon from '@mui/icons-material/Storefront';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import { AuthContext } from '../context/AuthContext';
import logo from '../assets/img/logo.png'

const menuItems = [
  { text: 'Início', icon: <HomeIcon />, link: '/' },
  { text: 'Estoque', icon: <Inventory2Icon />, link: '/estoque', adminOnly: false },
  { text: 'Produtos', icon: <StorefrontIcon />, link: '/products', adminOnly: false },
  { text: 'Administração', icon: <AdminPanelSettingsIcon />, link: '/adm/users', adminOnly: true },
];

export default function AppMenu({ open, setOpen }) {
  const { user } = useContext(AuthContext);

  const toggleDrawer = (isOpen) => (event) => {
    if (
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return;
    }
    setOpen(isOpen);
  };

  const drawerContent = (
    <Box
      sx={{
        width: 240,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      {/* Cabeçalho do Menu */}
      <Box
        sx={{
          textAlign: 'center',
          padding: 2,
          backgroundColor: 'primary.main',
          color: 'primary.contrastText',
        }}
      >
        <Box
          component="img"
          src={logo}
          alt="Logo"
          sx={{
            width: 100,
            height: 100,
            borderRadius: '50%',
            objectFit: 'cover',
            marginBottom: 1,
          }}
        />
        <Typography variant="h6" component="div">
          Loja de Roupas UFSCar
        </Typography>
      </Box>

      <Divider />

      {/* Lista de Itens de Menu */}
      <List>
        {menuItems
          .filter(item => !item.adminOnly || (item.adminOnly && user && user.accessLevel === 'admin'))
          .map((item) => (
            <ListItemButton
              component={Link}
              to={item.link}
              key={item.text}
              sx={{
                color: 'white',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
              }}
            >
              <ListItemIcon sx={{ color: 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          ))}
      </List>

    </Box>
  );

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={toggleDrawer(false)}
      PaperProps={{
        sx: {
          width: 240,
          backgroundColor: 'primary.main',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
}