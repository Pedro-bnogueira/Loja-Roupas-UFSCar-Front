import React from "react";
import InputMask from "react-input-mask";
import TextField from "@mui/material/TextField";

function PriceField({ data, handleChange, errors }) {
    const formatMoney = (e) => {
        const campo = e.target;
        const valor = campo.value.replace(/\D/g, ""); 
        let novoValor = "R$ ";

        if (valor.length > 2) {
            const parteInteira = valor.slice(0, -2);
            const parteDecimal = valor.slice(-2);
            novoValor += parteInteira.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.") + "," + parteDecimal;
        } else {
            novoValor += valor;
        }

        handleChange({ target: { name: campo.name, value: novoValor } });
    };

    return (
        <TextField
            label="Preço"
            name="price"
            value={data.price}
            onChange={formatMoney} 
            fullWidth
            error={!!errors.price}
            helperText={errors.price}
            required
        />
    );
}

export default PriceField;

// // função para formatar os campos de valores monetários(R$ 000.000.000,00)
// export function formatMoney(e) {
//     const campo = e.target;
//     const valor = campo.value.replace(/\D/g, ""); // Remove tudo o que não é dígito
//     let novoValor = "";
//     // Adiciona o prefixo "R$ "
//     novoValor += "R$ ";
//     // Verifica se há parte inteira
//     if (valor.length > 2) {
//       const parteInteira = valor.slice(0, -2);
//       const parteDecimal = valor.slice(-2);
//       // Formatação para a parte inteira
//       novoValor += parteInteira.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.") + "," + parteDecimal;
//     } else {
//       novoValor += valor;
//     }
//     campo.value = novoValor;
//   }
