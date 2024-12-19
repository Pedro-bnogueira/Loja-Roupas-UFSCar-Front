// coloca o valor monetário (R$ 000.000,00) para float com 2 casas decimais para ser colocada no bd
export function formatMoneyToFloat(value) {
    return parseFloat(value.replace(/[^0-9,-]/g, "").replace(",", ".")).toFixed(
        2
    );
}
