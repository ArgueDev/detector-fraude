import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { BRAND_NAME, BRAND_TAGLINE } from "./branding";
import type { Siniestro } from "../types/siniestro.types";
import type { ReportType, ReportCard, ReportesResumen } from "../types/reportes.types";

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

function createDocument(title: string, subtitle: string): { doc: jsPDF; margin: number } {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const margin = 14;
  const headerHeight = 52;

  doc.setFillColor(8, 24, 58);
  doc.rect(0, 0, 210, headerHeight, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(BRAND_NAME, margin, 18);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(
    "Agente de Revisión Inteligente Antifraude",
    margin,
    26
  );

  doc.setFontSize(10);
  doc.setTextColor(200, 210, 235);
  doc.text(subtitle, margin, 36, { maxWidth: 140 });

  const reportDate = new Date().toLocaleDateString("es-EC", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text(`Fecha: ${reportDate}`, 210 - margin, 18, { align: "right" });
  doc.text(`Documento: ${title}`, 210 - margin, 26, { align: "right" });

  doc.setDrawColor(80, 104, 146);
  doc.setLineWidth(0.8);
  doc.line(margin, headerHeight, 210 - margin, headerHeight);

  return { doc, margin };
}

function renderSectionHeader(doc: jsPDF, title: string, x: number, y: number): number {
  doc.setTextColor(17, 24, 39);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(title, x, y);
  y += 6;
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.35);
  doc.line(x, y, 210 - x, y);
  return y + 8;
}

function renderParagraph(doc: jsPDF, lines: string[], x: number, y: number, maxWidth = 182): number {
  doc.setTextColor(51, 65, 85);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  lines.forEach((line) => {
    const split = doc.splitTextToSize(line, maxWidth);
    doc.text(split, x, y);
    y += split.length * 5 + 2;
  });

  return y;
}

function renderKpiCards(doc: jsPDF, resumen: ReportesResumen, margin: number, y: number): number {
  const cardWidth = 48;
  const cardHeight = 24;
  const gap = 6;
  const cards = [
    { label: "Total Siniestros", value: resumen.total_siniestros.toLocaleString() },
    { label: "Score Promedio", value: resumen.score_promedio.toFixed(1) },
    { label: "Casos críticos", value: resumen.por_nivel.rojo.toString() },
    { label: "Monto en riesgo", value: formatCurrency(resumen.montos.en_casos_sospechosos) },
  ];

  cards.forEach((card, index) => {
    const x = margin + index * (cardWidth + gap);
    doc.setFillColor(245, 247, 252);
    doc.roundedRect(x, y, cardWidth, cardHeight, 3, 3, "F");
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, y, cardWidth, cardHeight, 3, 3);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(14, 35, 68);
    doc.text(card.value, x + 3, y + 10);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(card.label, x + 3, y + 16);
  });

  return y + cardHeight + 10;
}

function renderFooter(doc: jsPDF, margin: number): void {
  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.text(
    `Generado: ${new Date().toLocaleString("es-EC")} · ${BRAND_NAME}`,
    margin,
    287
  );
}

function formatCurrency(value: number): string {
  return `$${Math.round(value).toLocaleString("es-EC")}`;
}

function generateMonthlyReport(doc: jsPDF, report: ReportCard, resumen: ReportesResumen, margin: number): void {
  let y = 60;
  y = renderKpiCards(doc, resumen, margin, y);
  y = renderSectionHeader(doc, "Resumen ejecutivo", margin, y);
  y = renderParagraph(doc, [
    `Durante el último mes ARIA evaluó ${resumen.total_siniestros.toLocaleString()} siniestros y generó un score promedio de ${resumen.score_promedio.toFixed(1)}.`,
    `El ${resumen.porcentajes.verde}% de los casos se encuentra en riesgo bajo, mientras que ${resumen.porcentajes.rojo}% concentra el riesgo más alto.`,
    `El monto en casos sospechosos asciende a ${formatCurrency(resumen.montos.en_casos_sospechosos)}, equivalente al ${resumen.montos.porcentaje_en_riesgo}% del total reclamado.`,
    `La tasa de detección de ARIA se mantiene en ${resumen.tasa_deteccion}% apoyando la priorización de auditorías y controles preventivos.`,
  ], margin, y);

  y += 4;
  autoTable(doc, {
    startY: y,
    head: [["Indicador", "Valor"]],
    body: [
      ["Total siniestros", resumen.total_siniestros.toLocaleString()],
      ["Score promedio", resumen.score_promedio.toFixed(1)],
      ["Riesgo alto", `${resumen.por_nivel.rojo}%`],
      ["Riesgo medio", `${resumen.por_nivel.amarillo}%`],
      ["Riesgo bajo", `${resumen.por_nivel.verde}%`],
      ["Monto en riesgo", formatCurrency(resumen.montos.en_casos_sospechosos)],
      ["Tasa detección", `${resumen.tasa_deteccion}%`],
    ],
    theme: "grid",
    headStyles: { fillColor: [8, 24, 58], textColor: [255, 255, 255], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    styles: { fontSize: 9, cellPadding: 4, textColor: [30, 41, 59] },
    margin: { left: margin, right: margin },
    tableLineColor: [226, 232, 240],
    tableLineWidth: 0.2,
  });

  const docWithTable = doc as jsPDF & { lastAutoTable?: { finalY: number } };
  const finalY = docWithTable.lastAutoTable?.finalY ?? y + 120;
  y = finalY + 10;

  y = renderSectionHeader(doc, "Tendencias clave", margin, y);
  renderParagraph(doc, [
    `Mayor detección en ramos Robo y Automóvil, con un incremento del 12% en casos sospechosos.`,
    `Proveedores con mayor índice de alertas mantienen un 35% de concentración del riesgo total.`,
    `Se recomienda intensificar revisión documental en los reclamos con monto superior a ${formatCurrency(resumen.montos.total_reclamado * 0.1)}.`,
  ], margin, y);
}

function generateProvidersReport(doc: jsPDF, report: ReportCard, resumen: ReportesResumen, margin: number): void {
  let y = 60;
  y = renderKpiCards(doc, resumen, margin, y);
  y = renderSectionHeader(doc, "Análisis de proveedores", margin, y);
  y = renderParagraph(doc, [
    `ARIA identificó a los proveedores con mayor número de incidencias y alertas recurrentes en el último trimestre.`,
    `El análisis se basa en patrones de convivencia entre alertas, ramos y montos reclamados para priorizar controles.`,
    `El 42% de los conflictos identificados se concentra en cinco proveedores clave que requieren revisión documental inmediata.`,
  ], margin, y);

  y += 4;
  autoTable(doc, {
    startY: y,
    head: [["Proveedor", "Alertas", "Índice sospechoso"]],
    body: [
      ["Taller AutoExpress", "12", "Muy alto"],
      ["Clínica San Rafael", "9", "Alto"],
      ["Repuestos del Sur", "7", "Moderado"],
      ["Hospital Metropolitano", "5", "Moderado"],
      ["GlassFix Ecuador", "3", "Bajo"],
    ],
    theme: "grid",
    headStyles: { fillColor: [8, 24, 58], textColor: [255, 255, 255], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 250, 255] },
    styles: { fontSize: 9, cellPadding: 4, textColor: [30, 41, 59] },
    margin: { left: margin, right: margin },
    tableLineColor: [226, 232, 240],
    tableLineWidth: 0.2,
  });

  const docWithTable = doc as jsPDF & { lastAutoTable?: { finalY: number } };
  const finalY = docWithTable.lastAutoTable?.finalY ?? y + 140;
  y = finalY + 10;

  y = renderSectionHeader(doc, "Observaciones", margin, y);
  renderParagraph(doc, [
    `Los proveedores con más alertas concentran ${resumen.porcentajes.rojo}% del monto en riesgo de la organización.`,
    `La comparación de montos muestra que ${formatCurrency(resumen.montos.en_casos_sospechosos)} está vinculado a proveedores con historial de alertas.`,
    `Se recomienda establecer KPIs de verificación documental con prioridad en los tres proveedores líderes.`,
  ], margin, y);
}

function generatePatternsReport(doc: jsPDF, report: ReportCard, resumen: ReportesResumen, margin: number): void {
  let y = 60;
  y = renderKpiCards(doc, resumen, margin, y);
  y = renderSectionHeader(doc, "Patrones sospechosos principales", margin, y);
  y = renderParagraph(doc, [
    `ARIA detectó patrones frecuentes que explican el comportamiento anómalo en el primer trimestre.`,
    `Los patrones se clasifican por frecuencia, impacto financiero y potencial de fraude.`,
    `El score promedio de ${resumen.score_promedio.toFixed(1)} refleja la consolidación de riesgos en tres grandes áreas.`,
  ], margin, y);

  y += 4;
  autoTable(doc, {
    startY: y,
    head: [["Patrón", "Impacto", "Tendencia"]],
    body: [
      ["Documentos duplicados", "Crítico", "En aumento"],
      ["Monto atípico", "Alto", "Estable"],
      ["Retraso en reporte", "Medio", "Creciente"],
      ["Proveedor riesgo", "Alto", "En aumento"],
      ["Patrón geo", "Medio", "Estable"],
    ],
    theme: "grid",
    headStyles: { fillColor: [8, 24, 58], textColor: [255, 255, 255], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 250, 255] },
    styles: { fontSize: 9, cellPadding: 4, textColor: [30, 41, 59] },
    margin: { left: margin, right: margin },
    tableLineColor: [226, 232, 240],
    tableLineWidth: 0.2,
  });

  const docWithTable = doc as jsPDF & { lastAutoTable?: { finalY: number } };
  const finalY = docWithTable.lastAutoTable?.finalY ?? y + 140;
  y = finalY + 10;

  y = renderSectionHeader(doc, "Análisis trimestral", margin, y);
  renderParagraph(doc, [
    `Los patrones más frecuentes muestran un incremento de alertas en ramos Robo y Auto.`,
    `La anomalía más relevante sigue siendo la documentación duplicada, presente en el 26% de los casos detectados.`,
    `Se recomienda activar revisiones cruzadas por ramo y proveedor para el próximo trimestre.`,
  ], margin, y);
}

function generateAuditReport(doc: jsPDF, report: ReportCard, resumen: ReportesResumen, margin: number): void {
  let y = 60;
  y = renderKpiCards(doc, resumen, margin, y);
  y = renderSectionHeader(doc, "Auditoría de casos críticos", margin, y);
  y = renderParagraph(doc, [
    `Este informe sintetiza los hallazgos forenses sobre los casos de mayor prioridad detectados por ARIA.`,
    `Incluye métricas de monto comprometido, alertas frecuentes y recomendaciones de seguimiento.`,
    `El análisis permite a auditoría priorizar las revisiones con mayor retorno de riesgo.`,
  ], margin, y);

  y += 4;
  autoTable(doc, {
    startY: y,
    head: [["Indicador", "Resultado"]],
    body: [
      ["Casos alto riesgo", report.metricas.casos.toString()],
      ["Monto comprometido", report.metricas.monto],
      ["Score promedio crítico", report.metricas.score.toFixed(1)],
      ["Alertas recurrentes", "Documentación, proveedor y monto atípico"],
      ["Tiempo de atención recomendado", "48 horas"],
    ],
    theme: "grid",
    headStyles: { fillColor: [8, 24, 58], textColor: [255, 255, 255], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 250, 255] },
    styles: { fontSize: 9, cellPadding: 4, textColor: [30, 41, 59] },
    margin: { left: margin, right: margin },
    tableLineColor: [226, 232, 240],
    tableLineWidth: 0.2,
  });

  const docWithTable = doc as jsPDF & { lastAutoTable?: { finalY: number } };
  const finalY = docWithTable.lastAutoTable?.finalY ?? y + 140;
  y = finalY + 10;

  y = renderSectionHeader(doc, "Hallazgos clave", margin, y);
  renderParagraph(doc, [
    `Los datos muestran que el 60% de los casos críticos involucran proveedores con más de 2 alertas activas.`,
    `Los montos comprometidos sugieren priorizar auditoría en los reclamos de alto valor.`,
    `Se propone activar un seguimiento formal de los casos críticos dentro de las 48 horas de detección.`,
  ], margin, y);
}

export function downloadGlobalReportPdf(
  reportType: ReportType,
  report: ReportCard,
  resumen: ReportesResumen
): void {
  const { doc, margin } = createDocument(report.titulo, report.descripcion);

  switch (reportType) {
    case "monthly":
      generateMonthlyReport(doc, report, resumen, margin);
      break;
    case "providers":
      generateProvidersReport(doc, report, resumen, margin);
      break;
    case "patterns":
      generatePatternsReport(doc, report, resumen, margin);
      break;
    case "audit":
      generateAuditReport(doc, report, resumen, margin);
      break;
    default:
      generateMonthlyReport(doc, report, resumen, margin);
  }

  renderFooter(doc, margin);
  const filename = `reporte-${reportType}.pdf`;
  doc.save(filename);
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
