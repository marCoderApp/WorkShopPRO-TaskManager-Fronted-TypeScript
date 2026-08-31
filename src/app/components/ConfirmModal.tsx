import { AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
  titulo: string;
  mensaje: string;
  labelConfirmar?: string;
  labelCancelar?: string;
  variante?: "danger" | "warning";
  onConfirmar: () => void;
  onCancelar: () => void;
}

export function ConfirmModal({
  titulo,
  mensaje,
  labelConfirmar = "Confirmar",
  labelCancelar = "Cancelar",
  variante = "danger",
  onConfirmar,
  onCancelar,
}: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onCancelar}>
      <div
        className="bg-card border border-border rounded-xl w-full max-w-sm shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${variante === "danger" ? "bg-destructive/15" : "bg-amber-500/15"}`}>
              <AlertTriangle className={`w-5 h-5 ${variante === "danger" ? "text-destructive" : "text-amber-500"}`} />
            </div>
            <button onClick={onCancelar} className="text-muted-foreground hover:text-foreground transition-colors mt-0.5">
              <X className="w-4 h-4" />
            </button>
          </div>

          <h3 className="text-foreground mb-2" style={{ fontWeight: 600, fontSize: "1rem" }}>{titulo}</h3>
          <p className="text-muted-foreground" style={{ fontSize: "0.875rem", lineHeight: "1.6" }}>{mensaje}</p>
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onCancelar}
            className="flex-1 px-4 py-2.5 border border-border rounded-lg text-foreground hover:bg-secondary transition-colors"
            style={{ fontSize: "0.875rem", fontWeight: 500 }}
          >
            {labelCancelar}
          </button>
          <button
            onClick={() => { onConfirmar(); }}
            className={`flex-1 px-4 py-2.5 rounded-lg transition-opacity hover:opacity-90 ${variante === "danger" ? "bg-destructive text-destructive-foreground" : "bg-amber-500 text-white"}`}
            style={{ fontSize: "0.875rem", fontWeight: 600 }}
          >
            {labelConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}
