import { useState } from "react";
import { Icon } from "@iconify/react";
import type { Siniestro } from "../../types/siniestro.types";

type DownloadReportButtonProps = {
  siniestro: Siniestro;
  className?: string;
  fullWidth?: boolean;
};

export default function DownloadReportButton({
  siniestro,
  className = "",
  fullWidth = true,
}: DownloadReportButtonProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      const { downloadSiniestroReportPdf } = await import(
        "../../lib/generateReportPdf"
      );
      downloadSiniestroReportPdf(siniestro);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={downloading}
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
