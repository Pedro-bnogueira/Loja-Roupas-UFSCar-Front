import React, { useState } from "react";
import { Box, Tabs, Tab, Typography } from "@mui/material";
import ProductList from "../../components/ProductList";
import CategoryList from "../../components/CategoryList";

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

export default function ProductsAndCategories() {
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
          aria-label="Tabs de Produtos e Categorias"
        >
          <Tab label="Produtos Cadastrados" />
          <Tab label="Categorias" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <ProductList />
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        <CategoryList />
      </TabPanel>
    </Box>
  );
}