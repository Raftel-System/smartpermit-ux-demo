import React, { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, ChevronLeft, ChevronRight, Plus, Save, X } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import {JMTData, useApp} from "@/contexts/AppContext";
import { DropdownTagMulti } from "@/components/form/DropdownTagMulti";

type JMTType = "height" | "tower" | "confined" | "electrical";
type RiskLevel = "low" | "medium" | "high";

interface LethalHazardRow {
  danger: string;
  controls: string;
}

interface PDFData {
  step1: { zone: string; date?: Date; workOrderNumber: string };
  step2: {
    description: string;
    estimatedDuration: string;
    resources: {
      people: string[];
      materials: string[];
      epiSpecific: string[];
      epiComplets: string[];
    };
  };
  step3: { environmentHazards: string[] };
  step4: { riskManagement: string[] };
  step5: { lethalHazards: LethalHazardRow[] };
  step6: { responsibleName: string; validationDate?: Date };
  autoDetection?: { workingAtHeight?: boolean; suggestedPermits?: string[] };
}

interface CreateJMTModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (type: string) => void;
}

/* ===== Defaults ===== */
const DEFAULT_ZONES = [
  "Tour Dopol – Étage 1",
  "Tour Dopol – Étage 2",
  "Zone Atelier A",
  "Salle Élec B",
];

const DEFAULT_DURATIONS = ["1 heure", "2 heures", "3 heures", "4 heures", "Journée"];

const DEFAULT_PEOPLE = ["Électricien", "Personne de renfort", "Chef d’équipe"];
const DEFAULT_MATERIALS = ["Câble température 3G1.5", "Poulie", "Goulottes", "Attaches", "Escabeau 3m"];
const DEFAULT_EPI_SPECIFIC = ["Tenue contre Feu"];
const DEFAULT_EPI_COMPLETS = ["Casque", "Gants", "Harnais", "Chaussures S3"];

const DEFAULT_ENV_HAZARDS = [
  "Brûlure",
  "Travail en hauteur",
  "Risque de chute d’objets",
  "Zone de passage fréquentée",
  "Présence possible de tension électrique",
];

const DEFAULT_RISK_MGMT = [
  "Installation de barrières et balisage",
  "Coupure d’alimentation et consignation (LOTOTO)",
  "Harnais + point d’ancrage",
  "Vérification des outils/équipements",
  "Coordination avec équipes voisines",
];

const DEFAULT_LETHAL_ROWS: LethalHazardRow[] = [
  { danger: "Chute de hauteur", controls: "Harnais + ancrage + intervenir à deux" },
  { danger: "Contact électrique", controls: "Coupure, VAT, respecter LOTOTO" },
];

/* ====== UI ====== */
function StepHeader({ n, total, title }: { n: number; total: number; title: string }) {
  return (
      <div>
        <div className="text-xs text-muted-foreground">Étape {n} / {total}</div>
        <h3 className="text-lg font-semibold mt-1">{title}</h3>
      </div>
  );
}

/* ====== Modal ====== */
export function CreateJMTModal({ open, onOpenChange, onCreated }: CreateJMTModalProps) {
  const totalSteps = 6;
  const [currentStep, setCurrentStep] = useState(1);

  // catalogues (options)
  const [zoneOptions, setZoneOptions] = useState<string[]>(DEFAULT_ZONES);
  const [durationOptions, setDurationOptions] = useState<string[]>(DEFAULT_DURATIONS);

  const [peopleOptions, setPeopleOptions] = useState<string[]>(DEFAULT_PEOPLE);
  const [materialsOptions, setMaterialsOptions] = useState<string[]>(DEFAULT_MATERIALS);
  const [epiSpecificOptions, setEpiSpecificOptions] = useState<string[]>(DEFAULT_EPI_SPECIFIC);
  const [epiCompletsOptions, setEpiCompletsOptions] = useState<string[]>(DEFAULT_EPI_COMPLETS);

  // valeurs sélectionnées
  const [zone, setZone] = useState<string>("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [workOrderNumber, setWorkOrderNumber] = useState("");
  const [estimatedDuration, setEstimatedDuration] = useState<string>(DEFAULT_DURATIONS[3]); // "4 heures"
  const [type, setType] = useState<JMTType>("height");
  const [riskLevel, setRiskLevel] = useState<RiskLevel>("medium");
  const [assignedTo, setAssignedTo] = useState<string>("Équipe Maintenance");

  const [people, setPeople] = useState<string[]>([]);
  const [materials, setMaterials] = useState<string[]>([]);
  const [epiSpecific, setEpiSpecific] = useState<string[]>([]);
  const [epiComplets, setEpiComplets] = useState<string[]>([]);

  const [envHazards, setEnvHazards] = useState<string[]>([...DEFAULT_ENV_HAZARDS]);
  const [riskMgmt, setRiskMgmt] = useState<string[]>([...DEFAULT_RISK_MGMT]);
  const [lethalRows, setLethalRows] = useState<LethalHazardRow[]>([...DEFAULT_LETHAL_ROWS]);

  // saisies libres
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState<Date | undefined>(undefined);
  const [responsibleName, setResponsibleName] = useState("");

  // auto
  const autoDetection = useMemo(() => {
    const workingAtHeight = type === "height" || envHazards.some((h) => /hauteur/i.test(h));
    return {
      workingAtHeight,
      suggestedPermits: workingAtHeight ? ["Permis de travail en hauteur"] : [],
    };
  }, [type, envHazards]);

  const { createJMT } = useApp();

  const handleSave = () => {
    // enrichir les catalogues avec les nouvelles valeurs ajoutées
    const addToOptions = (vals: string[], setOpts: React.Dispatch<React.SetStateAction<string[]>>, opts: string[]) => {
      const newOnes = vals.filter(v => !opts.some(o => o.toLowerCase() === v.toLowerCase()));
      if (newOnes.length) setOpts(prev => [...prev, ...newOnes]);
    };
    addToOptions(people, setPeopleOptions, peopleOptions);
    addToOptions(materials, setMaterialsOptions, materialsOptions);
    addToOptions(epiSpecific, setEpiSpecificOptions, epiSpecificOptions);
    addToOptions(epiComplets, setEpiCompletsOptions, epiCompletsOptions);
    if (zone && !zoneOptions.some(o => o.toLowerCase() === zone.toLowerCase())) setZoneOptions(prev => [...prev, zone]);
    if (estimatedDuration && !durationOptions.some(o => o.toLowerCase() === estimatedDuration.toLowerCase())) {
      setDurationOptions(prev => [...prev, estimatedDuration]);
    }

    const pdfData: PDFData = {
      step1: { zone, date, workOrderNumber },
      step2: {
        description,
        estimatedDuration,
        resources: {
          people,
          materials,
          epiSpecific,
          epiComplets,
        },
      },
      step3: { environmentHazards: envHazards },
      step4: { riskManagement: riskMgmt },
      step5: { lethalHazards: lethalRows },
      step6: { responsibleName, validationDate: deadline },
      autoDetection,
    };

    const requiredPPE = [...new Set([...epiSpecific, ...epiComplets])];

    createJMT({
      title: title || `JMT ${format(new Date(), "dd/MM/yyyy", { locale: fr })} — ${zone || "Zone"}`,
      description,
      zone,
      type,
      deadline: deadline || new Date(),
      assignedTo,
      riskLevel,
      requiredPPE,
      risks: envHazards,
      controls: riskMgmt,
      pdfData,
      workOrderNumber,
    });

    toast({ title: "JMT créée", description: "La fiche est prête pour validation et export PDF." });
    onOpenChange(false);
    if (onCreated) {
      onCreated(type);
    }
    setCurrentStep(1);
  };

  const addLethalRow = () => setLethalRows([...lethalRows, { danger: "", controls: "" }]);
  const updateLethalRow = (i: number, patch: Partial<LethalHazardRow>) =>
      setLethalRows(lethalRows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  const removeLethalRow = (i: number) => setLethalRows(lethalRows.filter((_, idx) => idx !== i));

  const RiskChoices: { value: RiskLevel; label: string }[] = [
    { value: "low", label: "Faible" },
    { value: "medium", label: "Moyen" },
    { value: "high", label: "Élevé" },
  ];

  const TypeChoices: { value: JMTType; label: string }[] = [
    { value: "height", label: "Travail en hauteur" },
    { value: "tower", label: "Tour / Dopol" },
    { value: "confined", label: "Espace confiné" },
    { value: "electrical", label: "Travaux électriques" },
  ];

  return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Créer une nouvelle JMT</DialogTitle>
          </DialogHeader>

          {/* Étapes */}
          <div className="space-y-6">
            {/* Étape 1 */}
            {currentStep === 1 && (
                <div className="space-y-4">
                  <StepHeader n={1} total={totalSteps} title="Informations générales" />

                  <div>
                    <Label>Zone de travail *</Label>
                    <div className="mt-2 flex gap-2">
                      <Input
                          value={zone}
                          onChange={(e) => setZone(e.target.value)}
                          placeholder="Ex: Tour Dopol – Étage 2"
                      />
                      <Button
                          variant="outline"
                          onClick={() => {
                            if (zone && !zoneOptions.some(o => o.toLowerCase() === zone.toLowerCase())) {
                              setZoneOptions(prev => [...prev, zone]);
                              toast({ title: "Zone ajoutée", description: `"${zone}" a été ajoutée aux options.` });
                            }
                          }}
                      >
                        Ajouter à la liste
                      </Button>
                    </div>
                    {zoneOptions.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {zoneOptions.map((opt) => (
                              <Badge
                                  key={opt}
                                  variant={opt === zone ? "default" : "outline"}
                                  className="cursor-pointer"
                                  onClick={() => setZone(opt)}
                              >
                                {opt}
                              </Badge>
                          ))}
                        </div>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Date *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                              variant="outline"
                              className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground", "mt-1")}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP", { locale: fr }) : "Sélectionner une date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                              mode="single"
                              selected={date}
                              onSelect={setDate}
                              initialFocus
                              className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div>
                      <Label>Numéro de commande de travail *</Label>
                      <Input
                          className="mt-1"
                          value={workOrderNumber}
                          onChange={(e) => setWorkOrderNumber(e.target.value)}
                          placeholder="Ex: CT-2025-1489"
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label>Type</Label>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {TypeChoices.map((t) => (
                            <Button
                                key={t.value}
                                type="button"
                                variant={type === t.value ? "default" : "outline"}
                                onClick={() => setType(t.value)}
                                className="h-9"
                            >
                              {t.label}
                            </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>Niveau de risque</Label>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {RiskChoices.map((r) => (
                            <Badge
                                key={r.value}
                                className={cn(
                                    "cursor-pointer px-3 py-2",
                                    riskLevel === r.value ? "bg-primary text-primary-foreground" : "bg-muted"
                                )}
                                onClick={() => setRiskLevel(r.value)}
                            >
                              {r.label}
                            </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>Assigné à</Label>
                      <Input
                          className="mt-1"
                          value={assignedTo}
                          onChange={(e) => setAssignedTo(e.target.value)}
                          placeholder="Ex: Équipe Maintenance"
                      />
                    </div>
                  </div>
                </div>
            )}

            {/* Étape 2 */}
            {currentStep === 2 && (
                <div className="space-y-4">
                  <StepHeader n={2} total={totalSteps} title="Détails du travail & Ressources" />

                  <div>
                    <Label>Description *</Label>
                    <Textarea
                        className="mt-1 min-h-24"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Ex: Tirage de câble pour l’installation d’une sonde…"
                    />
                  </div>

                  <div>
                    <Label>Durée estimée</Label>
                    <div className="mt-2 flex gap-2">
                      <Input
                          value={estimatedDuration}
                          onChange={(e) => setEstimatedDuration(e.target.value)}
                          placeholder="Ex: 4 heures"
                      />
                      <Button
                          variant="outline"
                          onClick={() => {
                            const v = estimatedDuration.trim();
                            if (!v) return;
                            if (!durationOptions.some(o => o.toLowerCase() === v.toLowerCase())) {
                              setDurationOptions(prev => [...prev, v]);
                              toast({ title: "Durée ajoutée", description: `"${v}" a été ajoutée aux options.` });
                            }
                          }}
                      >
                        Ajouter à la liste
                      </Button>
                    </div>
                    {durationOptions.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {durationOptions.map((opt) => (
                              <Badge
                                  key={opt}
                                  variant={opt === estimatedDuration ? "default" : "outline"}
                                  className="cursor-pointer"
                                  onClick={() => setEstimatedDuration(opt)}
                              >
                                {opt}
                              </Badge>
                          ))}
                        </div>
                    )}
                  </div>

                  {/* Dropdown multi avec tags */}
                  <DropdownTagMulti
                      label="Ressources humaines"
                      options={peopleOptions}
                      setOptions={setPeopleOptions}
                      selected={people}
                      setSelected={setPeople}
                  />

                  <DropdownTagMulti
                      label="Matériels / consommables"
                      options={materialsOptions}
                      setOptions={setMaterialsOptions}
                      selected={materials}
                      setSelected={setMaterials}
                  />

                  <DropdownTagMulti
                      label="EPI spécifiques"
                      options={epiSpecificOptions}
                      setOptions={setEpiSpecificOptions}
                      selected={epiSpecific}
                      setSelected={setEpiSpecific}
                  />

                  <DropdownTagMulti
                      label="EPI complets"
                      options={epiCompletsOptions}
                      setOptions={setEpiCompletsOptions}
                      selected={epiComplets}
                      setSelected={setEpiComplets}
                  />
                </div>
            )}

            {/* Étape 3 */}
            {currentStep === 3 && (
                <div className="space-y-4">
                  <StepHeader n={3} total={totalSteps} title="Dangers liés à l’environnement" />
                  <DropdownTagMulti
                      label="Dangers"
                      options={DEFAULT_ENV_HAZARDS}
                      selected={envHazards}
                      setSelected={setEnvHazards}
                  />
                </div>
            )}

            {/* Étape 4 */}
            {currentStep === 4 && (
                <div className="space-y-4">
                  <StepHeader n={4} total={totalSteps} title="Gestion des risques (mesures)" />
                  <DropdownTagMulti
                      label="Mesures de maîtrise"
                      options={DEFAULT_RISK_MGMT}
                      selected={riskMgmt}
                      setSelected={setRiskMgmt}
                  />
                </div>
            )}

            {/* Étape 5 */}
            {currentStep === 5 && (
                <div className="space-y-4">
                  <StepHeader n={5} total={totalSteps} title="Dangers mortels / significatifs & moyens de maîtrise" />
                  <div className="space-y-3">
                    {lethalRows.map((row, idx) => (
                        <div key={idx} className="grid md:grid-cols-12 gap-2 items-start">
                          <div className="md:col-span-5">
                            <Label>Danger</Label>
                            <Input
                                className="mt-1"
                                value={row.danger}
                                onChange={(e) => updateLethalRow(idx, { danger: e.target.value })}
                                placeholder="Ex: Chute de hauteur"
                            />
                          </div>
                          <div className="md:col-span-6">
                            <Label>Moyens de maîtrise</Label>
                            <Input
                                className="mt-1"
                                value={row.controls}
                                onChange={(e) => updateLethalRow(idx, { controls: e.target.value })}
                                placeholder="Ex: Harnais, point d’ancrage, intervention à deux…"
                            />
                          </div>
                          <div className="md:col-span-1 flex md:justify-end">
                            <Button variant="ghost" size="icon" onClick={() => removeLethalRow(idx)} aria-label="Supprimer">
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                    ))}
                    <Button type="button" variant="outline" onClick={addLethalRow} className="flex items-center gap-2">
                      <Plus className="h-4 w-4" /> Ajouter une ligne
                    </Button>
                  </div>
                </div>
            )}

            {/* Étape 6 */}
            {currentStep === 6 && (
                <div className="space-y-4">
                  <StepHeader n={6} total={totalSteps} title="Responsable & finalisation" />

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Nom du responsable *</Label>
                      <Input
                          className="mt-1"
                          value={responsibleName}
                          onChange={(e) => e.target.value.length <= 80 && setResponsibleName(e.target.value)}
                          placeholder="Ex: Mohamed Mohamed"
                      />
                    </div>

                    <div>
                      <Label>Date de validation *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                              variant="outline"
                              className={cn("w-full justify-start text-left font-normal", !deadline && "text-muted-foreground", "mt-1")}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {deadline ? format(deadline, "PPP", { locale: fr }) : "Sélectionner une date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={deadline} onSelect={setDeadline} initialFocus className="p-3 pointer-events-auto" />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label>Titre (affiché dans la liste)</Label>
                      <Input className="mt-1" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Tirage câble – Tour Dopol D1" />
                    </div>
                    <div>
                      <Label>Niveau de risque</Label>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {RiskChoices.map((r) => (
                            <Badge
                                key={r.value}
                                className={cn(
                                    "cursor-pointer px-3 py-2",
                                    riskLevel === r.value ? "bg-primary text-primary-foreground" : "bg-muted"
                                )}
                                onClick={() => setRiskLevel(r.value)}
                            >
                              {r.label}
                            </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label>Assigné à</Label>
                      <Input className="mt-1" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} />
                    </div>
                  </div>
                </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-6 flex items-center justify-between">
            <Button variant="outline" onClick={() => setCurrentStep((s) => Math.max(1, s - 1))} disabled={currentStep === 1} className="flex items-center gap-2">
              <ChevronLeft className="h-4 w-4" />
              Précédent
            </Button>

            {currentStep === totalSteps ? (
                <Button onClick={handleSave} className="flex items-center gap-2">
                  <Save className="h-4 w-4" /> Enregistrer
                </Button>
            ) : (
                <Button onClick={() => setCurrentStep((s) => Math.min(totalSteps, s + 1))} className="flex items-center gap-2">
                  Suivant
                  <ChevronRight className="h-4 w-4" />
                </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
  );
}