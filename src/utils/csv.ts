export function downloadFile(
  name: string,
  content: BlobPart,
  type = "text/csv;charset=utf-8",
) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function exportCSV(name: string, rows: (string | number)[][]) {
  const escape = (v: string | number) =>
    '"' +
    String(v)
      .replace(/^[=+@-]/, "'$&")
      .replaceAll('"', '""') +
    '"';
  downloadFile(
    name,
    "\uFEFF" + rows.map((r) => r.map(escape).join(",")).join("\r\n"),
  );
}
