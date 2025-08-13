import * as React from "react";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Search, Filter, Eye, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import {StatusBadge} from "@/components/StatusBadge.tsx";

// Option: si tu as une auth, passe le nom de l'utilisateur via prop
type Props = {
    currentUserName?: string; // Utilisé par le filtre "Mes permis"
};

export default function PermitsPage({ currentUserName }: Props) {
    const { permits } = useApp();

    // --- UI state ---
    const [q, setQ] = React.useState("");
    const [onlyMine, setOnlyMine] = React.useState(false);
    const [selected, setSelected] = React.useState<string | null>(null); // id du permis à afficher

    const onOpen = (id: string) => setSelected(id);
    const onClose = () => setSelected(null);

    const isMine = React.useCallback(
        (p: any) => {
            if (!onlyMine) return true;
            const who = (currentUserName || "").trim().toLowerCase();
            if (!who) return true; // si on ne connait pas l'utilisateur, on n'exclut rien
            const byResp = (p?.responsibleLHM || "").trim().toLowerCase() === who;
            const bySignature = p?.signatures?.some?.(
                (s: any) =>
                    s?.role === "Responsable LHM" &&
                    (s?.name || "").trim().toLowerCase() === who
            );
            return byResp || bySignature;
        },
        [onlyMine, currentUserName]
    );

    const matchesQuery = (p: any) => {
        const needle = q.trim().toLowerCase();
        if (!needle) return true;
        const hay = [
            p.number,
            p.place,
            p.precisePlace,
            p.description,
            p.responsibleLHM,
            ...(p.equipment || []),
            ...(p.access || []),
            ...(p.workMode || []),
        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
        return hay.includes(needle);
    };

    const filtered = React.useMemo(
        () => permits.filter((p) => isMine(p) && matchesQuery(p)),
        [permits, isMine, q]
    );

    const selectedPermit = React.useMemo(
        () => filtered.find((p) => p.id === selected) || permits.find((p) => p.id === selected),
        [filtered, permits, selected]
    );

    return (
        <div className="mx-auto max-w-6xl p-4 md:p-6">
            <header className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Permis de travail</h1>
                    <p className="text-sm text-muted-foreground">
                        Liste des permis créés {onlyMine && currentUserName ? `par ${currentUserName}` : "dans l’application"}.
                    </p>
                </div>

                {/* Barre d'outils */}
                <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center">
                    <div className="relative sm:w-80">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50" />
                        <Input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Rechercher un numéro, lieu, responsable…"
                            className="pl-9"
                        />
                    </div>

                    <Button
                        type="button"
                        variant={onlyMine ? "default" : "outline"}
                        onClick={() => setOnlyMine((v) => !v)}
                        title="Afficher uniquement mes permis (Responsable LHM)"
                    >
                        <Filter className="mr-2 h-4 w-4" />
                        {onlyMine ? "Mes permis" : "Tous les permis"}
                    </Button>
                </div>
            </header>

            {/* Résumé */}
            <div className="mb-4 text-sm text-muted-foreground">
                {filtered.length} permis {onlyMine && currentUserName ? `assignés à ${currentUserName}` : "au total"}.
            </div>

            {/* Liste */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {filtered.map((p) => (
                    <PermitCard key={p.id} permit={p} onView={() => onOpen(p.id)} />
                ))}
            </div>

            {/* Modal de détails */}
            {selectedPermit && (
                <PermitDetailsDialog permit={selectedPermit} open={!!selected} onOpenChange={(v) => (v ? null : onClose())} />
            )}
        </div>
    );
}

/* ======================= Carte permis ======================= */

function PermitCard({ permit, onView }: { permit: any; onView: () => void }) {
    const dateLabel = permit.date ? safeFormatDate(permit.date) : "—";
    const timeLabel = [permit.startTime, permit.endTime].filter(Boolean).join(" → ");

    return (
        <div className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="text-xs text-muted-foreground">N° Permis</div>
                    <div className="text-base font-semibold">{permit.number || "—"}</div>
                </div>
                <Badge className="bg-primary/10 text-primary">Travail en hauteur</Badge>
                <StatusBadge status={permit.status} />
            </div>

            <Separator className="my-3" />

            <div className="grid grid-cols-2 gap-3 text-sm">
                <Field label="Lieu">{permit.place || "—"}</Field>
                <Field label="Date">{dateLabel}</Field>
                <Field label="Heures">{timeLabel || "—"}</Field>
                <Field label="Responsable LHM">{permit.responsibleLHM || "—"}</Field>
                <Field label="Lieu précis" className="col-span-2">
                    {permit.precisePlace || "—"}
                </Field>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
                {permit.jmtId ? <Badge variant="outline">Rattaché à JMT</Badge> : null}
                {Array.isArray(permit.equipment) && permit.equipment.slice(0, 3).map((e: string) => (
                    <Badge key={e} variant="outline" className="bg-accent/10">{e}</Badge>
                ))}
                {Array.isArray(permit.access) && permit.access.slice(0, 2).map((e: string) => (
                    <Badge key={e} variant="outline" className="bg-accent/10">{e}</Badge>
                ))}
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
                <Button variant="outline" onClick={onView}>
                    <Eye className="mr-2 h-4 w-4" />
                    Voir
                </Button>
                {/* Si tu ajoutes plus tard PermitPrintModal : */}
                {/* <Button variant="outline" onClick={() => onPrint(permit)}>
          <FileText className="mr-2 h-4 w-4" />
          PDF
        </Button> */}
            </div>
        </div>
    );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
    return (
        <div className={cn(className)}>
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className="text-sm">{children}</div>
        </div>
    );
}

function safeFormatDate(d: any) {
    try {
        const dt = typeof d === "string" ? new Date(d) : d;
        return isNaN(dt?.getTime?.()) ? "—" : format(dt, "PPP", { locale: fr });
    } catch {
        return "—";
    }
}

/* ======================= Modal détails ======================= */

function PermitDetailsDialog({
                                 permit,
                                 open,
                                 onOpenChange,
                             }: {
    permit: any;
    open: boolean;
    onOpenChange: (v: boolean) => void;
}) {
    const dateLabel = permit.date ? safeFormatDate(permit.date) : "—";
    const timeLabel = [permit.startTime, permit.endTime].filter(Boolean).join(" → ");

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Détails du permis — {permit.number || "Sans numéro"}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Bloc 1 : entête */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <Field label="Lieu">{permit.place || "—"}</Field>
                        <Field label="Date">{dateLabel}</Field>
                        <Field label="Heures">{timeLabel || "—"}</Field>
                        <Field label="Responsable LHM">{permit.responsibleLHM || "—"}</Field>
                        <Field label="Sous-traitant">{permit.subcontractor || "—"}</Field>
                        <Field label="Lieu précis" className="col-span-2">{permit.precisePlace || "—"}</Field>
                    </div>

                    <Separator />

                    {/* Bloc 2 : description */}
                    <div>
                        <div className="text-sm font-medium mb-1">Description de l’intervention</div>
                        <div className="rounded border p-3 text-sm">{permit.description || "—"}</div>
                    </div>

                    {/* Bloc 3 : moyens techniques */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <TagGroup title="Équipement" items={permit.equipment} />
                        <TagGroup title="Accès" items={permit.access} />
                        <TagGroup title="Travail" items={permit.workMode} />
                        <Field label="Personnes max">{permit.personsMax ?? "—"}</Field>
                        <Field label="Observations" className="md:col-span-2">{permit.observations || "—"}</Field>
                    </div>

                    <Separator />

                    {/* Bloc 4 : chute & protections */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="Facteur de chute">{permit.fallFactor || "—"}</Field>
                        <Field label="Distance de chute">{permit.fallDistance || "—"}</Field>
                        <TagGroup title="Ancrage" items={permit.anchorage} />
                        <TagGroup title="Longe" items={permit.lanyard} />
                        <TagGroup title="Harnais" items={permit.harness} />
                    </div>

                    <Separator />

                    {/* Bloc 5 : plan de sauvetage */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="Moyens de secours">{permit.rescueMeans || "—"}</Field>
                        <Field label="Comms des secours">{permit.rescueComms || "—"}</Field>
                        <Field label="Équipes de sauvetage" className="md:col-span-2">{permit.rescueTeams || "—"}</Field>
                    </div>

                    <Separator />

                    {/* Bloc 6 : conditions, commentaires, signatures */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="Conditions sup.">{permit.extraConditions || "—"}</Field>
                        <Field label="Commentaires">{permit.comments || "—"}</Field>
                    </div>

                    <div>
                        <div className="text-sm font-medium mb-2">Signatures</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {(permit.signatures || []).map((s: any, i: number) => (
                                <div key={`${s.role}-${i}`} className="rounded border p-3 text-sm">
                                    <div className="text-muted-foreground">{s.role}</div>
                                    <div><span className="font-medium">Nom : </span>{s.name || "—"}</div>
                                    <div><span className="font-medium">Date : </span>{s.signedAt ? safeFormatDate(s.signedAt) : "—"}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function TagGroup({ title, items = [] as string[] }) {
    return (
        <div>
            <div className="text-sm font-medium mb-1">{title}</div>
            {items?.length ? (
                <div className="flex flex-wrap gap-2">
                    {items.map((t) => (
                        <Badge key={t} variant="outline" className="bg-accent/10">{t}</Badge>
                    ))}
                </div>
            ) : (
                <div className="text-sm text-muted-foreground">—</div>
            )}
        </div>
    );
}