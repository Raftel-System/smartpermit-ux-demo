import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useRef } from "react";
import html2pdf from "html2pdf.js";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

/* ---------- Types ---------- */
interface LethalHazardRow { danger: string; controls: string; }

interface PDFData {
    step1?: { zone: string; date?: Date | string; workOrderNumber: string; };
    step2?: {
        description: string;
        estimatedDuration: string;
        resources: {
            people: string[];
            materials: string[];
            epiSpecific: string[];
            epiComplets: string[];
        };
    };
    step3?: { environmentHazards: string[]; };
    step4?: { riskManagement: string[]; };
    step5?: { lethalHazards: LethalHazardRow[]; };
    step6?: { responsibleName: string; validationDate?: Date | string; };
    autoDetection?: { workingAtHeight?: boolean; suggestedPermits?: string[]; };
}

interface JMT {
    id: string;
    title: string;
    description: string;
    zone: string;
    type: string;         // 'height' | 'tower' | ...
    assignedTo: string;
    deadline?: Date | string;
    riskLevel: string;    // 'low' | 'medium' | 'high'
    requiredPPE: string[];
    risks: string[];
    controls: string[];
    workOrderNumber?: string;
    pdfData?: PDFData;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    jmt: JMT;
}

/* ---------- Utils ---------- */
function parseDate(d?: Date | string) {
    if (!d) return undefined;
    const dt = typeof d === "string" ? new Date(d) : d;
    return isNaN(dt.getTime()) ? undefined : dt;
}

function fmtDate(d?: Date | string) {
    const dt = parseDate(d);
    return dt ? format(dt, "d MMMM yyyy", { locale: fr }) : "—";
}

function fmtType(t: string) {
    const m: Record<string, string> = {
        height: "Travail en hauteur",
        tower: "Tour / Dopol",
        confined: "Espace confiné",
        electrical: "Travaux électriques",
    };
    return m[t] || t;
}

function fmtRisk(r: string) {
    const m: Record<string, string> = { low: "Faible", medium: "Moyen", high: "Élevé" };
    return m[r] || r;
}

function joinBullets(arr?: string[]) {
    if (!arr || !arr.length) return "—";
    return arr.map(v => `• ${v}`).join("  ");
}

/* ---------- Composant principal ---------- */
export default function JMTPrintModal({ isOpen, onClose, jmt }: Props) {
    const ref = useRef<HTMLDivElement | null>(null);

    // Normalisation (fallback vers l’ancien schéma)
    const data = useMemo(() => jmt.pdfData ?? {}, [jmt]);
    const step1 = data.step1 ?? { zone: jmt.zone, date: jmt.deadline, workOrderNumber: jmt.workOrderNumber || "" };
    const step2 = data.step2 ?? {
        description: jmt.description,
        estimatedDuration: "",
        resources: {
            people: [],
            materials: [],
            epiSpecific: [],
            epiComplets: jmt.requiredPPE || [],
        },
    };
    const step3 = data.step3 ?? { environmentHazards: jmt.risks || [] };
    const step4 = data.step4 ?? { riskManagement: jmt.controls || [] };
    const step5 = data.step5 ?? { lethalHazards: [] };
    const step6 = data.step6 ?? { responsibleName: jmt.assignedTo || "", validationDate: jmt.deadline };
    const auto = data.autoDetection ?? inferAuto(jmt);

    const handleDownload = () => {
        if (!ref.current) return;

        const filenameSafe = (s: string) =>
            (s || "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w\- ]+/g, "").replace(/\s+/g, "_");

        const name =
            `JMT_${filenameSafe(jmt.title || step1.zone || jmt.id)}_${format(new Date(), "yyyyMMdd_HHmm")}.pdf`;

        const opt = {
            margin: [0.5, 0.5, 0.6, 0.5], // top, right, bottom, left (inches)
            filename: name,
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, windowWidth: 1200 },
            jsPDF: { unit: "in", format: "a4", orientation: "portrait" as const },
            pagebreak: { mode: ["css", "legacy"], avoid: ["tr", ".avoid-break"], after: ".force-break" },
        };

        html2pdf().set(opt).from(ref.current).save();
    };

    // Option : focus au show pour éviter bug Tailwind print
    useEffect(() => {
        if (isOpen && ref.current) {
            // noop but keeps layout settled
        }
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl bg-white text-black print:text-black">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-indigo-600">
                        📄 Prévisualisation — JMT (format PDF v3)
                    </DialogTitle>
                </DialogHeader>

                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => window.print()}>Imprimer</Button>
                    <Button onClick={handleDownload}>Télécharger le PDF</Button>
                </div>

                {/* Zone PDF */}
                <div
                    ref={ref}
                    className={cn(
                        "px-8 py-6 max-w-none text-sm leading-6",
                        // mise en page A4 "print"
                        "print:px-0 print:py-0"
                    )}
                >
                    {/* En-tête */}
                    <Header
                        id={jmt.id}
                        title={jmt.title}
                        type={fmtType(jmt.type)}
                        risk={fmtRisk(jmt.riskLevel)}
                    />

                    {/* Étape 1 */}
                    <Section title="Étape 1 — Informations générales">
                        <Grid two>
                            <Field label="Zone de travail" value={step1.zone || "—"} />
                            <Field label="Date" value={fmtDate(step1.date)} />
                            <Field label="N° de commande de travail" value={step1.workOrderNumber || "—"} />
                        </Grid>
                    </Section>

                    {/* Étape 2 */}
                    <Section title="Étape 2 — Détails du travail">
                        <Field block label="Description" value={step2.description || "—"} />
                        <Grid two className="mt-2">
                            <Field label="Durée estimée" value={step2.estimatedDuration || "—"} />
                        </Grid>

                        <SubTitle className="mt-2">Ressources nécessaires</SubTitle>
                        <Grid two>
                            <Field label="Ressources humaines" value={joinBullets(step2.resources?.people)} />
                            <Field label="Matériels / consommables" value={joinBullets(step2.resources?.materials)} />
                            <Field label="EPI spécifiques" value={joinBullets(step2.resources?.epiSpecific)} />
                            <Field label="EPI complets" value={joinBullets(step2.resources?.epiComplets)} />
                        </Grid>
                    </Section>

                    {/* Étape 3 */}
                    <Section title="Étape 3 — Dangers liés à l’environnement">
                        <List items={step3.environmentHazards} empty="Aucun danger renseigné." />
                    </Section>

                    {/* Étape 4 */}
                    <Section title="Étape 4 — Gestion des risques (mesures)">
                        <List items={step4.riskManagement} empty="Aucune mesure renseignée." />
                    </Section>

                    {/* Étape 5 */}
                    <Section title="Étape 5 — Dangers mortels ou significatifs & moyens de maîtrise">
                        {step5.lethalHazards?.length ? (
                            <table className="w-full border border-gray-300 text-sm avoid-break">
                                <thead className="bg-gray-100">
                                <tr>
                                    <th className="border border-gray-300 px-3 py-2 text-left w-[40%]">Danger</th>
                                    <th className="border border-gray-300 px-3 py-2 text-left">Moyens de maîtrise</th>
                                </tr>
                                </thead>
                                <tbody>
                                {step5.lethalHazards.map((row, i) => (
                                    <tr key={i}>
                                        <td className="border border-gray-300 px-3 py-2 align-top">{row.danger || "—"}</td>
                                        <td className="border border-gray-300 px-3 py-2 align-top">{row.controls || "—"}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        ) : (
                            <em className="text-gray-600">Aucun danger mortel/important renseigné.</em>
                        )}
                    </Section>

                    {/* Étape 6 */}
                    <Section title="Étape 6 — Responsable de l’intervention">
                        <Grid two>
                            <Field label="Nom" value={step6.responsibleName || "—"} />
                            <Field label="Date de validation" value={fmtDate(step6.validationDate)} />
                        </Grid>
                    </Section>

                    {/* Analyse automatique */}
                    <Section title="Analyse automatique (application)">
                        <List
                            items={[
                                auto.workingAtHeight ? "Détection : travail en hauteur" : undefined,
                                auto.suggestedPermits?.length ? `Permis suggérés : ${auto.suggestedPermits.join(", ")}` : undefined,
                            ].filter(Boolean) as string[]}
                            empty="Aucune analyse spécifique."
                        />
                    </Section>

                    <Footer />
                </div>
            </DialogContent>
        </Dialog>
    );
}

/* ---------- Sous-composants UI ---------- */

function Header({ id, title, type, risk }: { id: string; title: string; type: string; risk: string }) {
    return (
        <div className="mb-5 border-b pb-3">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="m-0 text-2xl font-bold">Fiche JMT — Analyse des Risques</h1>
                    <p className="m-0 text-xs text-gray-600">ID : {id}</p>
                </div>
                <div className="text-right">
                    <div className="text-sm">Type : <strong>{type}</strong></div>
                    <div className="text-sm">Niveau de risque : <strong>{risk}</strong></div>
                </div>
            </div>
            {title && <div className="mt-2 text-base"><strong>Intervention :</strong> {title}</div>}
        </div>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className="mb-5 break-inside-avoid">
            <h2 className="text-lg font-semibold text-blue-700 mb-2">{title}</h2>
            <div className="text-sm leading-6">{children}</div>
        </section>
    );
}

function SubTitle({ children, className }: { children: React.ReactNode; className?: string }) {
    return <div className={cn("text-sm font-semibold text-gray-700", className)}>{children}</div>;
}

function Grid({ children, two = false, className }: { children: React.ReactNode; two?: boolean; className?: string }) {
    return (
        <div className={cn("grid gap-3", two ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1", className)}>
            {children}
        </div>
    );
}

function Field({ label, value, block = false }: { label: string; value: string; block?: boolean }) {
    return (
        <div className={cn(block && "md:col-span-2")}>
            <div className="text-[13px] text-gray-600">{label}</div>
            <div className="border rounded px-3 py-2 mt-1">{value || "—"}</div>
        </div>
    );
}

function List({ items = [], empty = "—" as string }) {
    if (!items?.length) return <em className="text-gray-600">{empty}</em>;
    return (
        <ul className="list-disc pl-5 space-y-1">
            {items.map((it, i) => <li key={i}>{it}</li>)}
        </ul>
    );
}

function Footer() {
    return (
        <div className="mt-6 pt-3 border-t text-xs text-gray-500">
            Généré par SmartPermit — {format(new Date(), "dd/MM/yyyy HH:mm", { locale: fr })}
        </div>
    );
}

function inferAuto(jmt: JMT): NonNullable<PDFData["autoDetection"]> {
    const isHeight =
        jmt.type === "height" ||
        /hauteur|échafaud|échelle|harnais/i.test(
            `${jmt.title} ${jmt.description} ${(jmt.risks || []).join(" ")} ${(jmt.requiredPPE || []).join(" ")}`
        );
    return {
        workingAtHeight: isHeight,
        suggestedPermits: isHeight ? ["Permis de travail en hauteur"] : [],
    };
}