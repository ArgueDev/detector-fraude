import { Icon } from "@iconify/react";
import { useSiniestro } from "../../hooks/useSiniestro";
import { mapAlertasToParsed } from "../../lib/alertas";
import { buildTimelineFromSiniestro } from "../../lib/siniestroMappers";
import QueryError from "../ui/QueryError";
import SkeletonCard from "../ui/skeletons/SkeletonCard";
import AlertsList from "./AlertsList";
import CaseDetailsCard from "./CaseDetailsCard";
import DownloadReportButton from "./DownloadReportButton";
import TimelineCard from "./TimelineCard";

type CaseDetailDrawerProps = {
  idSiniestro: string | null;
  onClose: () => void;
};

export default function CaseDetailDrawer({
  idSiniestro,
  onClose,
}: CaseDetailDrawerProps) {
  const { data, isLoading, isError, error, refetch } = useSiniestro(idSiniestro);

  if (!idSiniestro) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Cerrar panel"
      />
      <aside className="relative flex h-full w-full max-w-lg flex-col border-l border-zinc-800 bg-[#0f172a] shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Detalle del caso
            </p>
            <h2 className="text-lg font-bold text-white">{idSiniestro}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
          >
            <Icon icon="solar:close-circle-bold" className="text-xl" />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          {isLoading && (
            <>
              <SkeletonCard />
              <SkeletonCard />
            </>
          )}

          {isError && (
            <QueryError
              message={error?.message}
              onRetry={() => refetch()}
            />
          )}

          {data && (
            <>
              <CaseDetailsCard siniestro={data} />
              <section className="rounded-3xl border border-zinc-800 bg-[#111827] p-6">
                <h3 className="text-sm font-semibold text-white">Alertas activadas</h3>
                <div className="mt-4">
                  <AlertsList
                    alerts={mapAlertasToParsed(
                      data.alertas_activadas,
                      data.nivel_riesgo
                    )}
                  />
                </div>
              </section>
              <TimelineCard events={buildTimelineFromSiniestro(data)} />
              <DownloadReportButton siniestro={data} />
            </>
          )}
        </div>
      </aside>
    </div>
  );
}
