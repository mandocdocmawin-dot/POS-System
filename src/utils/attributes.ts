export function parseAttributes(text: string): Record<string, string> {
  const result: Record<string, string> = {};
  if (!text.trim()) return result;
  for (const part of text.split(/[,\n]/)) {
    const index = part.indexOf(":");
    if (index <= 0 || !part.slice(index + 1).trim())
      throw new Error("Use attribute: value pairs, separated by commas.");
    const key = part.slice(0, index).trim();
    if (
      Object.keys(result).some((k) => k.toLowerCase() === key.toLowerCase()) ||
      ["__proto__", "constructor", "prototype"].includes(key)
    )
      throw new Error("Attribute names must be unique.");
    result[key] = part.slice(index + 1).trim();
  }
  return result;
}
export const attributesText = (attributes: Record<string, string>) =>
  Object.entries(attributes)
    .map(([key, value]) => `${key}: ${value}`)
    .join(", ");
