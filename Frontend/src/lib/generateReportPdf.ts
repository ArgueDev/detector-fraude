import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { BRAND_NAME, BRAND_TAGLINE } from "./branding";
import type { Siniestro } from "../types/siniestro.types";

export type ReportPdfOptions = {
  explicacionIA?: string;
};

function buildExplicacionIA(siniestro: Siniestro): string {
  const alertas =
    siniestro.alertas_activadas.length > 0
      ? siniestro.alertas_activadas.join("; ")
      : "Sin alertas registradas";

  return (
    `El score de ${siniestro.score_riesgo} para ${siniestro.id_siniestro} ` +
    `considera cobertura ${siniestro.cobertura}, sucursal ${siniestro.sucursal}, ` +
    `monto reclamado de $${siniestro.monto_reclamado.toLocaleString("es-EC")} y ` +
    `${siniestro.alertas_activadas.length} alerta(s): ${alertas}. ` +
    `Estado: ${siniestro.estado}. Documentación ` +
    `${siniestro.documentos_completos ? "completa" : "incompleta"}. ` +
    `ARIA recomienda revisión prioritaria antes de autorizar pagos.`
  );
}

export function downloadSiniestroReportPdf(
  siniestro: Siniestro,
  options?: ReportPdfOptions
): void {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const margin = 14;
  let y = margin;

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 36, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(BRAND_NAME, margin, 16);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(BRAND_TAGLINE, margin, 24);
  doc.setFontSize(8);
  doc.text("Reporte ejecutivo de siniestro", margin, 30);

  y = 44;
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`Siniestro ${siniestro.id_siniestro}`, margin, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const meta = [
    `Score de riesgo: ${siniestro.score_riesgo}`,
    `Nivel de riesgo: ${siniestro.nivel_riesgo}`,
    `Cobertura: ${siniestro.cobertura}`,
    `Estado: ${siniestro.estado}`,
    `Ramo: ${siniestro.ramo}`,
    `Sucursal: ${siniestro.sucursal}`,
    `Fecha ocurrencia: ${siniestro.fecha_ocurrencia}`,
    `Fecha reporte: ${siniestro.fecha_reporte}`,
    `Monto reclamado: $${siniestro.monto_reclamado.toLocaleString("es-EC")}`,
    `Monto pagado: $${siniestro.monto_pagado.toLocaleString("es-EC")}`,
  ];
  meta.forEach((line) => {
    doc.text(line, margin, y);
    y += 5;
  });

  y += 4;
  doc.setFont("helvetica", "bold");
  doc.text("Alertas activadas", margin, y);
  y += 5;
  doc.setFont("helvetica", "normal");

  if (siniestro.alertas_activadas.length === 0) {
    doc.text("Ninguna alerta activa.", margin, y);
    y += 6;
  } else {
    siniestro.alertas_activadas.forEach((alerta) => {
      doc.text(`• ${alerta}`, margin, y);
      y += 5;
      if (y > 250) {
        doc.addPage();
        y = margin;
      }
    });
  }

  y += 4;
  doc.setFont("helvetica", "bold");
  doc.text("Explicación IA (ARIA)", margin, y);
  y += 5;
  doc.setFont("helvetica", "normal");

  const explicacion =
    options?.explicacionIA?.trim() || buildExplicacionIA(siniestro);
  const explicacionLines = doc.splitTextToSize(explicacion, 182);
  doc.text(explicacionLines, margin, y);
  y += explicacionLines.length * 4.5 + 6;

  autoTable(doc, {
    startY: y,
    head: [["Campo", "Valor"]],
    body: [
      ["ID siniestro", siniestro.id_siniestro],
      ["Póliza", siniestro.id_poliza],
      ["Asegurado", siniestro.id_asegurado],
      ["Beneficiario", siniestro.beneficiario || "—"],
      ["Score", String(siniestro.score_riesgo)],
      ["Nivel", siniestro.nivel_riesgo],
      ["Monto reclamado", `$${siniestro.monto_reclamado.toLocaleString("es-EC")}`],
      ["Monto estimado", `$${siniestro.monto_estimado.toLocaleString("es-EC")}`],
      ["Monto pagado", `$${siniestro.monto_pagado.toLocaleString("es-EC")}`],
      ["Documentos", siniestro.documentos_completos ? "Completos" : "Incompletos"],
      ["Historial asegurado", String(siniestro.historial_siniestros_asegurado)],
    ],
    theme: "grid",
    headStyles: { fillColor: [239, 68, 68] },
    styles: { fontSize: 9, cellPadding: 2 },
    margin: { left: margin, right: margin },
  });

  const docWithTable = doc as jsPDF & { lastAutoTable?: { finalY: number } };
  const finalY = docWithTable.lastAutoTable?.finalY ?? y + 40;
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text(
    `Generado: ${new Date().toLocaleString("es-EC")} · ${BRAND_NAME}`,
    margin,
    Math.min(finalY + 10, 285)
  );

  doc.save(`reporte-siniestro-${siniestro.id_siniestro}.pdf`);
}
