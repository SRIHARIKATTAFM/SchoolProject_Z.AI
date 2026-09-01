// Client-side data export utilities — CSV and PDF generation.
// All operations run in the browser; no server round-trip needed.

// ─── CSV export ────────────────────────────────────────────────────────
export function exportCSV(
  filename: string,
  rows: (string | number)[][],
  headers?: string[]
) {
  const escape = (v: string | number) => {
    const s = String(v ?? "");
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };
  const lines: string[] = [];
  if (headers) lines.push(headers.map(escape).join(","));
  rows.forEach((r) => lines.push(r.map(escape).join(",")));
  const csv = "\uFEFF" + lines.join("\n"); // BOM for Excel UTF-8
  downloadBlob(filename.endsWith(".csv") ? filename : `${filename}.csv`, csv, "text/csv;charset=utf-8");
}

// ─── PDF export (jsPDF) ────────────────────────────────────────────────
export async function exportPDF(
  filename: string,
  title: string,
  build: (doc: any) => void
) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  // Header
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(title, 14, 18);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated: ${new Date().toLocaleString("en-IN", { timeZone: "UTC" })}`, 14, 24);
  doc.setDrawColor(180);
  doc.line(14, 27, 196, 27);
  build(doc);
  doc.save(filename.endsWith(".pdf") ? filename : `${filename}.pdf`);
}

// Helper to render a simple table in a jsPDF doc with pagination.
export function pdfTable(
  doc: any,
  headers: string[],
  rows: (string | number)[][],
  startY = 32
) {
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 14;
  const usableW = pageW - margin * 2;
  const colW = usableW / headers.length;
  let y = startY;
  const rowH = 7;

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setFillColor(31, 111, 67); // primary green
  doc.setTextColor(255, 255, 255);
  headers.forEach((h, i) => {
    doc.rect(margin + i * colW, y, colW, rowH, "F");
    doc.text(String(h), margin + i * colW + 2, y + 5);
  });
  y += rowH;

  doc.setFont("helvetica", "normal");
  doc.setTextColor(40, 40, 40);
  rows.forEach((row, ri) => {
    if (y > doc.internal.pageSize.getHeight() - 20) {
      doc.addPage();
      y = 20;
    }
    if (ri % 2 === 0) {
      doc.setFillColor(245, 245, 245);
      doc.rect(margin, y, usableW, rowH, "F");
    }
    row.forEach((cell, ci) => {
      const text = String(cell ?? "");
      const trimmed = text.length > 28 ? text.substring(0, 27) + "…" : text;
      doc.text(trimmed, margin + ci * colW + 2, y + 5);
    });
    y += rowH;
  });
  return y;
}

function downloadBlob(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
