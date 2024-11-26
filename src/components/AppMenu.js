// src/components/AppMenu.js
import React from 'react';
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


const menuItems = [
  { text: 'Início', icon: <HomeIcon />, link: '/' },
  // Adicione outros itens de menu aqui
  
];

export default function AppMenu({ open, setOpen }) {
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
          src="/assets/logo.png"
          alt="Logo"
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            objectFit: 'cover',
            marginBottom: 1,
          }}
        />
        <Typography variant="h6" component="div">
          Trupe da diária app
        </Typography>
      </Box>

      <Divider />

      {/* Lista de Itens de Menu */}
      <List>
        {menuItems.map((item) => (
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

      {/* Você pode adicionar mais conteúdo aqui, como rodapé ou seções adicionais */}
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
