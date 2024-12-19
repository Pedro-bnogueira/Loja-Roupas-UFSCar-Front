import React, { useState } from 'react';
import { Box, Tabs, Tab, Typography } from '@mui/material';
import InventoryList from '../../components/InventoryList';
import TransactionsList from '../../components/TransactionsList';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography component="div">{children}</Typography>
        </Box>
      )}
    </div>
  );
}

export default function InventoryAndTransactions() {
  const [tabValue, setTabValue] = useState(0);

  const handleChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ marginTop: 10, paddingX: 2 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleChange} 
          aria-label="Tabs de Controle de Estoque e Histórico de Transações"
        >
          <Tab label="Controle de Estoque" />
          <Tab label="Histórico de Transações" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <InventoryList />
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        <TransactionsList />
      </TabPanel>
    </Box>
  );
}