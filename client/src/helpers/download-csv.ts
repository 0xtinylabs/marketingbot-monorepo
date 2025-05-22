const downloadCSV = (jsonData: any, filename = "data.csv") => {
  if (!jsonData.length) return;

  const headers = Object.keys(jsonData[0]);
  const csvRows = [
    headers.join(","), // Header row
    ...jsonData.map((row: any) =>
      headers
        .map((field) => `"${String(row[field]).replace(/"/g, '""')}"`)
        .join(",")
    ),
  ];

  const csvContent = csvRows.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export default downloadCSV;
