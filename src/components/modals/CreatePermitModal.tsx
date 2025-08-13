import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { DropdownTagMulti } from "@/components/form/DropdownTagMulti"; // réutilisé
import { CalendarIcon, ChevronLeft, ChevronRight, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useApp } from "@/contexts/AppContext";

// ===== Types =====
export type FallFactor = "F0" | "F1" | "F2";

export interface PermitSignRole {
    role: "Responsable LHM" | "Émetteur du permis" | "Responsable du sous-traitant" | "Fin des travaux";
    name: string;
    signedAt?: Date;
    // signature image/trace: string (optionnel)
}

export interface WorkAtHeightPermit {
    id: string;
    number: string;               // N°
    place: string;                // Lieu de travail
    date?: Date;                  // Date
    startTime?: string;           // HH:mm
    endTime?: string;             // HH:mm

    description: string;          // Description de l'intervention
    responsibleLHM: string;       // Responsable de l'intervention LHM
    subcontractor: string;        // Sous-traitant
    precisePlace: string;         // Lieu précis (ex: TOUR DOPOL - Étage 2)

    // Moyens techniques
    equipment: string[];          // tags (Échafaudage, Nacelle, Ligne de vie…)
    access: string[];             // tags (Échelle, Plate-forme, PEMP…)
    workMode: string[];           // tags (Poste fixe, Déplacement horizontal…)
    personsMax?: number;
    observations?: string;

    // Chute
    fallFactor: FallFactor;       // F0/F1/F2
    fallDistance?: string;        // Distance de chute

    // Systèmes de protection
    anchorage: string[];          // (corps-morts, stop chute sur structure…)
    lanyard: string[];            // (simple, absorbeur obligatoire…)
    harness: string[];            // (conformité, positionnement, dorsal/sternal…)

    // Plan de sauvetage
    rescueMeans?: string;
    rescueComms?: string;
    rescueTeams?: string;

    // Conditions / commentaires
    extraConditions?: string;
    comments?: string;

    // Signatures
    signatures: PermitSignRole[];

    // Rattachement optionnel
    jmtId?: string;
}

type Props = {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    initialJMT?: {
        id?: string;
        zone?: string;
        description?: string;
        assignedTo?: string;
        deadline?: Date | string;
        pdfData?: any;
    } | null;
};

// ===== Options par défaut (éditables) =====
const EQUIPMENT_DEFAULT = ["Échafaudage", "Nacelle", "Ligne de vie", "Garde-corps provisoire"];
const ACCESS_DEFAULT = ["Échelle", "Plate-forme", "PEMP"];
const WORK_DEFAULT = ["Poste fixe", "Déplacement horizontal", "Déplacement vertical"];
const ANCHORAGE_DEFAULT = ["Corps-morts", "Stop chute sur structure", "Ligne de vie"];
const LANYARD_DEFAULT = ["Simple (long max)", "Avec absorbeur (F1/F2)", "Double longe"];
const HARNESS_DEFAULT = ["Conformité harnais", "De positionnement", "Dorsal", "Sternal"];

// ===== UI auxiliaire =====
function StepHeader({ n, total, title }: { n: number; total: number; title: string }) {
    return (
        <div>
            <div className="text-xs text-muted-foreground">Étape {n} / {total}</div>
            <h3 className="text-lg font-semibold mt-1">{title}</h3>
        </div>
    );
}

export default function CreatePermitModal({ open, onOpenChange, initialJMT }: Props) {
    const total = 5;
    const [step, setStep] = React.useState(1);

    // Préremplissage depuis JMT si fourni
    const initialZone = initialJMT?.pdfData?.step1?.zone || initialJMT?.zone || "";
    const initialDate = initialJMT?.pdfData?.step1?.date ? new Date(initialJMT.pdfData.step1.date) :
        (initialJMT?.deadline ? new Date(initialJMT.deadline) : undefined);
    const initialResp = initialJMT?.pdfData?.step6?.responsibleName || initialJMT?.assignedTo || "";

    // État principal
    const [number, setNumber] = React.useState("");
    const [place, setPlace] = React.useState(initialZone);
    const [date, setDate] = React.useState<Date | undefined>(initialDate);
    const [startTime, setStartTime] = React.useState<string>("");
    const [endTime, setEndTime] = React.useState<string>("");

    const [description, setDescription] = React.useState(initialJMT?.pdfData?.step2?.description || initialJMT?.description || "");
    const [responsibleLHM, setResponsibleLHM] = React.useState(initialResp);
    const [subcontractor, setSubcontractor] = React.useState("");
    const [precisePlace, setPrecisePlace] = React.useState(initialZone ? `${initialZone}` : "");

    const [equipmentOptions, setEquipmentOptions] = React.useState<string[]>(EQUIPMENT_DEFAULT);
    const [accessOptions, setAccessOptions] = React.useState<string[]>(ACCESS_DEFAULT);
    const [workOptions, setWorkOptions] = React.useState<string[]>(WORK_DEFAULT);
    const [anchorageOptions, setAnchorageOptions] = React.useState<string[]>(ANCHORAGE_DEFAULT);
    const [lanyardOptions, setLanyardOptions] = React.useState<string[]>(LANYARD_DEFAULT);
    const [harnessOptions, setHarnessOptions] = React.useState<string[]>(HARNESS_DEFAULT);

    const [equipment, setEquipment] = React.useState<string[]>([]);
    const [access, setAccess] = React.useState<string[]>([]);
    const [workMode, setWorkMode] = React.useState<string[]>([]);
    const [personsMax, setPersonsMax] = React.useState<number | undefined>(undefined);
    const [observations, setObservations] = React.useState<string>("");

    const [fallFactor, setFallFactor] = React.useState<FallFactor>("F0");
    const [fallDistance, setFallDistance] = React.useState<string>("");

    const [anchorage, setAnchorage] = React.useState<string[]>([]);
    const [lanyard, setLanyard] = React.useState<string[]>([]);
    const [harness, setHarness] = React.useState<string[]>([]);

    const [rescueMeans, setRescueMeans] = React.useState<string>("");
    const [rescueComms, setRescueComms] = React.useState<string>("");
    const [rescueTeams, setRescueTeams] = React.useState<string>("");

    const [extraConditions, setExtraConditions] = React.useState<string>("");
    const [comments, setComments] = React.useState<string>("");

    const [signatures, setSignatures] = React.useState<PermitSignRole[]>([
        { role: "Responsable LHM", name: initialResp || "" },
        { role: "Émetteur du permis", name: "" },
        { role: "Responsable du sous-traitant", name: "" },
        { role: "Fin des travaux", name: "" },
    ]);

    const { createPermit } = useApp();

    const handleSave = () => {
        const payload: Omit<WorkAtHeightPermit, "id"> = {
            number,
            place,
            date,
            startTime,
            endTime,
            description,
            responsibleLHM,
            subcontractor,
            precisePlace,
            equipment,
            access,
            workMode,
            personsMax,
            observations,
            fallFactor,
            fallDistance,
            anchorage,
            lanyard,
            harness,
            rescueMeans,
            rescueComms,
            rescueTeams,
            extraConditions,
            comments,
            signatures,
            jmtId: initialJMT?.id,
        };
        createPermit(payload);
        onOpenChange(false);
        setStep(1);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Créer un Permis de travail en hauteur</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Étape 1 : En‑tête */}
                    {step === 1 && (
                        <div className="space-y-4">
                            <StepHeader n={1} total={total} title="Informations générales" />

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <Label>Numéro du permis *</Label>
                                    <Input value={number} onChange={(e) => setNumber(e.target.value)} placeholder="Ex: PTH-2025-0012" />
                                </div>
                                <div>
                                    <Label>Lieu de travail *</Label>
                                    <Input value={place} onChange={(e) => setPlace(e.target.value)} placeholder="Ex: Tour Dopol" />
                                </div>

                                <div>
                                    <Label>Date *</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {date ? format(date, "PPP", { locale: fr }) : "Sélectionner une date"}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar mode="single" selected={date} onSelect={setDate} initialFocus className="p-3 pointer-events-auto" />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Heure de début</Label>
                                        <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                                    </div>
                                    <div>
                                        <Label>Heure de fin</Label>
                                        <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                                    </div>
                                </div>

                                <div className="md:col-span-2">
                                    <Label>Lieu précis</Label>
                                    <Input value={precisePlace} onChange={(e) => setPrecisePlace(e.target.value)} placeholder="Ex: TOUR DOPOL — Étage 2" />
                                </div>
                            </div>

                            <div>
                                <Label>Description de l'intervention *</Label>
                                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Décrire l'intervention…" className="min-h-24" />
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <Label>Responsable de l'intervention LHM *</Label>
                                    <Input value={responsibleLHM} onChange={(e) => setResponsibleLHM(e.target.value)} placeholder="Nom complet" />
                                </div>
                                <div>
                                    <Label>Sous-traitant</Label>
                                    <Input value={subcontractor} onChange={(e) => setSubcontractor(e.target.value)} placeholder="Raison sociale" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Étape 2 : Moyens techniques */}
                    {step === 2 && (
                        <div className="space-y-4">
                            <StepHeader n={2} total={total} title="Moyens techniques" />

                            <DropdownTagMulti
                                label="Équipement"
                                options={equipmentOptions}
                                setOptions={setEquipmentOptions}
                                selected={equipment}
                                setSelected={setEquipment}
                            />

                            <DropdownTagMulti
                                label="Accès"
                                options={accessOptions}
                                setOptions={setAccessOptions}
                                selected={access}
                                setSelected={setAccess}
                            />

                            <DropdownTagMulti
                                label="Travail"
                                options={workOptions}
                                setOptions={setWorkOptions}
                                selected={workMode}
                                setSelected={setWorkMode}
                            />

                            <div className="grid md:grid-cols-3 gap-4">
                                <div>
                                    <Label>Personnes max</Label>
                                    <Input
                                        type="number"
                                        min={1}
                                        value={personsMax ?? ""}
                                        onChange={(e) => setPersonsMax(e.target.value ? Number(e.target.value) : undefined)}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <Label>Observations</Label>
                                    <Input value={observations} onChange={(e) => setObservations(e.target.value)} placeholder="Notes diverses…" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Étape 3 : Chute + protections */}
                    {step === 3 && (
                        <div className="space-y-4">
                            <StepHeader n={3} total={total} title="Gestion du risque de chute & protections" />

                            <div className="grid md:grid-cols-3 gap-4">
                                <div>
                                    <Label>Facteur de chute</Label>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {(["F0", "F1", "F2"] as FallFactor[]).map((f) => (
                                            <Badge
                                                key={f}
                                                onClick={() => setFallFactor(f)}
                                                className={cn(
                                                    "cursor-pointer px-3 py-2",
                                                    fallFactor === f ? "bg-primary text-primary-foreground" : "bg-muted"
                                                )}
                                            >
                                                {f}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <Label>Distance de chute</Label>
                                    <Input value={fallDistance} onChange={(e) => setFallDistance(e.target.value)} placeholder="Ex: 2 m" />
                                </div>
                            </div>

                            <DropdownTagMulti
                                label="Ancrage"
                                options={anchorageOptions}
                                setOptions={setAnchorageOptions}
                                selected={anchorage}
                                setSelected={setAnchorage}
                            />

                            <DropdownTagMulti
                                label="Longe"
                                options={lanyardOptions}
                                setOptions={setLanyardOptions}
                                selected={lanyard}
                                setSelected={setLanyard}
                            />

                            <DropdownTagMulti
                                label="Harnais"
                                options={harnessOptions}
                                setOptions={setHarnessOptions}
                                selected={harness}
                                setSelected={setHarness}
                            />
                        </div>
                    )}

                    {/* Étape 4 : Plan de sauvetage */}
                    {step === 4 && (
                        <div className="space-y-4">
                            <StepHeader n={4} total={total} title="Plan de sauvetage" />
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <Label>Moyens de secours</Label>
                                    <Textarea value={rescueMeans} onChange={(e) => setRescueMeans(e.target.value)} />
                                </div>
                                <div>
                                    <Label>Moyens de communication des secours</Label>
                                    <Textarea value={rescueComms} onChange={(e) => setRescueComms(e.target.value)} />
                                </div>
                            </div>
                            <div>
                                <Label>Équipes de sauvetage</Label>
                                <Textarea value={rescueTeams} onChange={(e) => setRescueTeams(e.target.value)} />
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <Label>Conditions de sécurité supplémentaires</Label>
                                    <Textarea value={extraConditions} onChange={(e) => setExtraConditions(e.target.value)} />
                                </div>
                                <div>
                                    <Label>Commentaires</Label>
                                    <Textarea value={comments} onChange={(e) => setComments(e.target.value)} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Étape 5 : Validation & signatures */}
                    {step === 5 && (
                        <div className="space-y-4">
                            <StepHeader n={5} total={total} title="Validation & signatures" />
                            <div className="grid md:grid-cols-2 gap-4">
                                {signatures.map((s, idx) => (
                                    <div key={idx} className="rounded border p-3">
                                        <div className="text-sm text-muted-foreground mb-2">{s.role}</div>
                                        <Label>Nom</Label>
                                        <Input
                                            className="mt-1"
                                            value={s.name}
                                            onChange={(e) => {
                                                const next = [...signatures];
                                                next[idx] = { ...s, name: e.target.value };
                                                setSignatures(next);
                                            }}
                                            placeholder="Nom et prénom"
                                        />
                                        <div className="mt-2">
                                            <Label>Date & heure</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className={cn("w-full justify-start text-left font-normal", !s.signedAt && "text-muted-foreground", "mt-1")}
                                                    >
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {s.signedAt ? format(s.signedAt, "Pp", { locale: fr }) : "Sélectionner"}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={s.signedAt}
                                                        onSelect={(d) => {
                                                            const next = [...signatures];
                                                            next[idx] = { ...s, signedAt: d || undefined };
                                                            setSignatures(next);
                                                        }}
                                                        initialFocus
                                                        className="p-3 pointer-events-auto"
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer navigation */}
                <div className="mt-6 flex items-center justify-between">
                    <Button variant="outline" onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1} className="flex items-center gap-2">
                        <ChevronLeft className="h-4 w-4" />
                        Précédent
                    </Button>

                    {step === total ? (
                        <Button onClick={handleSave} className="flex items-center gap-2">
                            <Save className="h-4 w-4" />
                            Enregistrer le permis
                        </Button>
                    ) : (
                        <Button onClick={() => setStep((s) => Math.min(total, s + 1))} className="flex items-center gap-2">
                            Suivant
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}