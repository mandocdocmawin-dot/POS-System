export const formatPHP = (amount: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(amount);

export const payrollMoney = (centavos: number) => formatPHP(centavos / 100);
