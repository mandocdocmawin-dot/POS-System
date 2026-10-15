export const newId = () => crypto.randomUUID();
export const generateSku = () => `TP-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
