import { useState } from "react";
import { Icon } from "@iconify/react";
import type { ReportType, ReportCard, ReportesResumen } from "../../types/reportes.types";

type DownloadExecutiveReportButtonProps = {
  reportType: ReportType;
  report: ReportCard;
  resumen?: ReportesResumen;
  className?: string;
  fullWidth?: boolean;
};

export default function DownloadExecutiveReportButton({
  reportType,
  report,
  resumen,
  className = "",
  fullWidth = true,
}: DownloadExecutiveReportButtonProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (downloading || !resumen) return;
    setDownloading(true);

    try {
      const { downloadGlobalReportPdf } = await import("../../lib/generateReportPdf");
      downloadGlobalReportPdf(reportType, report, resumen);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={downloading || !resumen}
      className={`inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400 transition-all duration-200 hover:bg-red-500/20 disabled:opacity-50 ${fullWidth ? "w-full" : ""} ${className}`}
    >
      <Icon
        icon={downloading ? "solar:refresh-bold" : "solar:download-bold"}
        className={downloading ? "animate-spin text-lg" : "text-lg"}
      />
      {downloading ? "Generando PDF…" : "Descargar Reporte"}
    </button>
  );
}
