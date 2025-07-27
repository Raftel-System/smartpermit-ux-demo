import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { useState } from "react";

interface JMTModalProps {
    mode: "view" | "edit";
    isOpen: boolean;
    onClose: () => void;
    jmt: {
        id: string;
        title: string;
        description: string;
        zone: string;
        type: string;
        status: string;
        createdAt: Date;
        deadline: Date;
        assignedTo: string;
        riskLevel: string;
        requiredPPE: string[];
    };
    onSave?: (updatedJmt: any) => void;
}

export default function JMTModal({ mode, isOpen, onClose, jmt, onSave }: JMTModalProps) {
    const [form, setForm] = useState({ ...jmt });
    const isView = mode === "view";

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        if (onSave) onSave(form);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl p-6 space-y-6">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">
                        {isView ? "Détails de la fiche JMT" : "Modifier la fiche JMT"}
                    </DialogTitle>
                </DialogHeader>

                {/* Section 1: Informations générales */}
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <Label htmlFor="title">Titre</Label>
                        {isView ? (
                            <p className="text-sm text-muted-foreground mt-1">{form.title}</p>
                        ) : (
                            <Input name="title" value={form.title} onChange={handleChange} />
                        )}
                    </div>

                    <div>
                        <Label htmlFor="zone">Zone</Label>
                        {isView ? (
                            <p className="text-sm text-muted-foreground mt-1">{form.zone}</p>
                        ) : (
                            <Input name="zone" value={form.zone} onChange={handleChange} />
                        )}
                    </div>

                    <div>
                        <Label htmlFor="type">Type de travail</Label>
                        {isView ? (
                            <p className="text-sm text-muted-foreground mt-1 capitalize">{form.type}</p>
                        ) : (
                            <select
                                name="type"
                                value={form.type}
                                onChange={handleChange}
                                className="w-full border rounded px-3 py-2 text-sm"
                            >
                                <option value="height">Travail en hauteur</option>
                                <option value="tower">Accès tour</option>
                                <option value="confined">Espace confiné</option>
                                <option value="electrical">Travaux électriques</option>
                            </select>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="assignedTo">Assigné à</Label>
                        {isView ? (
                            <p className="text-sm text-muted-foreground mt-1">{form.assignedTo}</p>
                        ) : (
                            <Input name="assignedTo" value={form.assignedTo} onChange={handleChange} />
                        )}
                    </div>
                </div>

                {/* Section 2: Description */}
                <div>
                    <Label htmlFor="description">Description</Label>
                    {isView ? (
                        <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">
                            {form.description}
                        </p>
                    ) : (
                        <Textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            rows={4}
                        />
                    )}
                </div>

                {/* Section 3: Risques et sécurité */}
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <Label htmlFor="riskLevel">Niveau de risque</Label>
                        {isView ? (
                            <p className="text-sm text-muted-foreground mt-1 capitalize">{form.riskLevel}</p>
                        ) : (
                            <select
                                name="riskLevel"
                                value={form.riskLevel}
                                onChange={handleChange}
                                className="w-full border rounded px-3 py-2 text-sm"
                            >
                                <option value="low">Faible</option>
                                <option value="medium">Moyen</option>
                                <option value="high">Élevé</option>
                            </select>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="requiredPPE">EPI requis</Label>
                        {isView ? (
                            <ul className="list-disc pl-4 mt-1 text-sm text-muted-foreground">
                                {form.requiredPPE.map((item, idx) => (
                                    <li key={idx}>{item}</li>
                                ))}
                            </ul>
                        ) : (
                            <Input
                                name="requiredPPE"
                                value={form.requiredPPE.join(", ")}
                                onChange={(e) =>
                                    setForm({ ...form, requiredPPE: e.target.value.split(",").map(p => p.trim()) })
                                }
                            />
                        )}
                    </div>
                </div>

                {/* Section 4: Dates */}
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <Label>Créée le</Label>
                        <p className="text-sm text-muted-foreground mt-1">
                            {format(new Date(form.createdAt), "dd/MM/yyyy")}
                        </p>
                    </div>

                    <div>
                        <Label htmlFor="deadline">Deadline</Label>
                        {isView ? (
                            <p className="text-sm text-muted-foreground mt-1">
                                {format(new Date(form.deadline), "dd/MM/yyyy")}
                            </p>
                        ) : (
                            <Input
                                name="deadline"
                                type="date"
                                value={format(new Date(form.deadline), "yyyy-MM-dd")}
                                onChange={handleChange}
                            />
                        )}
                    </div>
                </div>

                {/* Bouton Enregistrer */}
                {!isView && (
                    <div className="text-right">
                        <Button onClick={handleSave}>💾 Enregistrer</Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}