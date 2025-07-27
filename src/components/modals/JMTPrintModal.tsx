
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import html2pdf from "html2pdf.js";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    jmt: {
        id: string;
        title: string;
        description: string;
        zone: string;
        type: string;
        assignedTo: string;
        createdAt: string | Date;
        deadline: string | Date;
        riskLevel: string;
        requiredPPE: string[];
    };
}

export default function JMTPrintModal({ isOpen, onClose, jmt }: Props) {
    const pdfRef = useRef<HTMLDivElement>(null);

    const handleDownloadPDF = () => {
        if (pdfRef.current) {
            const opt = {
                margin: 0.5,
                filename: `JMT_${jmt.id}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
            };
            html2pdf().set(opt).from(pdfRef.current).save();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl bg-white text-black print:text-black">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-indigo-600">
                        📄 Aperçu PDF - Téléchargeable
                    </DialogTitle>
                </DialogHeader>

                <div ref={pdfRef} className="prose max-w-none px-4 py-2">
                    <h1 className="text-2xl font-bold border-b pb-2 mb-4">Fiche JMT – Analyse des Risques</h1>

                    <section className="mb-6">
                        <h2 className="text-lg font-semibold text-blue-600 border-b pb-1 mb-3">Informations Générales</h2>
                        <div className="space-y-2">
                            <InfoRow label="ID" value={jmt.id} />
                            <InfoRow label="Titre" value={jmt.title} />
                            <InfoRow label="Zone" value={jmt.zone} />
                            <InfoRow label="Type" value={formatType(jmt.type)} />
                            <InfoRow label="Assigné à" value={jmt.assignedTo} />
                            <InfoRow label="Créé le" value={formatDate(jmt.createdAt)} />
                            <InfoRow label="Deadline" value={formatDate(jmt.deadline)} />
                        </div>
                    </section>

                    <section className="mb-6">
                        <h2 className="text-lg font-semibold text-blue-600 border-b pb-1 mb-3">Description de la tâche</h2>
                        <p>{jmt.description}</p>
                    </section>

                    <section className="mb-6">
                        <h2 className="text-lg font-semibold text-blue-600 border-b pb-1 mb-3">Sécurité & EPI</h2>
                        <InfoRow label="Niveau de risque" value={formatRisk(jmt.riskLevel)} />
                        <div className="mt-2">
                            <p className="font-medium">EPI requis :</p>
                            <ul className="list-disc ml-6">
                                {jmt.requiredPPE.map((item, i) => (
                                    <li key={i}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    </section>

                    <section className="mt-10">
                        <p className="italic text-sm text-gray-600">Signature de l'intervenant :</p>
                        <div className="border-t w-64 mt-2 mb-6"></div>
                        <p className="italic text-sm text-gray-600">Date :</p>
                        <div className="border-t w-40 mt-2"></div>
                    </section>
                </div>

                <div className="flex justify-end mt-6 print:hidden">
                    <Button onClick={handleDownloadPDF}>⬇️ Télécharger en PDF</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex">
            <span className="w-48 font-medium">{label} :</span>
            <span>{value}</span>
        </div>
    );
}

function formatDate(date: string | Date) {
    return new Date(date).toLocaleDateString("fr-FR");
}

function formatType(type: string) {
    const types: Record<string, string> = {
        height: "Travail en hauteur",
        tower: "Accès tour",
        confined: "Espace confiné",
        electrical: "Travaux électriques",
    };
    return types[type] || type;
}

function formatRisk(risk: string) {
    const risks: Record<string, string> = {
        low: "Faible",
        medium: "Moyen",
        high: "Élevé",
    };
    return risks[risk] || risk;
}
