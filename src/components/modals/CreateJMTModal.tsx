import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CalendarIcon, Plus, X, Save, ChevronRight, ChevronLeft } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useApp } from '@/contexts/AppContext';
import { toast } from '@/hooks/use-toast';

interface CreateJMTModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface JMTFormData {
  title: string;
  description: string;
  zone: string;
  type: 'height' | 'tower' | 'confined' | 'electrical';
  deadline: Date | undefined;
  assignedTo: string;
  riskLevel: 'low' | 'medium' | 'high';
  requiredPPE: string[];
  risks: string[];
  controls: string[];
}

const initialFormData: JMTFormData = {
  title: '',
  description: '',
  zone: '',
  type: 'height',
  deadline: undefined,
  assignedTo: '',
  riskLevel: 'medium',
  requiredPPE: [],
  risks: [],
  controls: []
};

const ppeOptions = [
  'Harnais de sécurité',
  'Casque de protection',
  'Chaussures de sécurité',
  'Gants de protection',
  'Lunettes de sécurité',
  'Gilet haute visibilité',
  'Masque respiratoire',
  'Gants isolants',
  'Détecteur de gaz'
];

const commonRisks = [
  'Chute de hauteur',
  'Electrocution',
  'Coincement',
  'Chute d\'objets',
  'Conditions météorologiques',
  'Espace confiné',
  'Gaz toxiques',
  'Incendie/Explosion'
];

const commonControls = [
  'Formation obligatoire',
  'Vérification des équipements',
  'Procédure de consignation',
  'Surveillance continue',
  'Communication radio',
  'Vérification météorologique',
  'Détection de gaz',
  'Plan d\'évacuation'
];

export function CreateJMTModal({ open, onOpenChange }: CreateJMTModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<JMTFormData>(initialFormData);
  const [newPPE, setNewPPE] = useState('');
  const [newRisk, setNewRisk] = useState('');
  const [newControl, setNewControl] = useState('');
  const { createJMT } = useApp();

  const totalSteps = 4;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.description || !formData.zone || !formData.deadline) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    createJMT({
      ...formData,
      deadline: formData.deadline!
    });

    // Reset form
    setFormData(initialFormData);
    setCurrentStep(1);
    onOpenChange(false);
  };

  const addPPE = (ppe: string) => {
    if (ppe && !formData.requiredPPE.includes(ppe)) {
      setFormData(prev => ({
        ...prev,
        requiredPPE: [...prev.requiredPPE, ppe]
      }));
    }
  };

  const removePPE = (ppe: string) => {
    setFormData(prev => ({
      ...prev,
      requiredPPE: prev.requiredPPE.filter(item => item !== ppe)
    }));
  };

  const addRisk = (risk: string) => {
    if (risk && !formData.risks.includes(risk)) {
      setFormData(prev => ({
        ...prev,
        risks: [...prev.risks, risk]
      }));
    }
  };

  const removeRisk = (risk: string) => {
    setFormData(prev => ({
      ...prev,
      risks: prev.risks.filter(item => item !== risk)
    }));
  };

  const addControl = (control: string) => {
    if (control && !formData.controls.includes(control)) {
      setFormData(prev => ({
        ...prev,
        controls: [...prev.controls, control]
      }));
    }
  };

  const removeControl = (control: string) => {
    setFormData(prev => ({
      ...prev,
      controls: prev.controls.filter(item => item !== control)
    }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4 animate-fade-in">
            <div>
              <Label htmlFor="title">Titre de l'intervention *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Maintenance ascenseur Tour A"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description">Description détaillée *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Décrivez précisément les tâches à effectuer..."
                className="mt-1 min-h-20"
              />
            </div>

            <div>
              <Label htmlFor="zone">Zone d'intervention *</Label>
              <Input
                id="zone"
                value={formData.zone}
                onChange={(e) => setFormData(prev => ({ ...prev, zone: e.target.value }))}
                placeholder="Ex: Tour A - Niveaux 15-20"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="assignedTo">Équipe assignée *</Label>
              <Input
                id="assignedTo"
                value={formData.assignedTo}
                onChange={(e) => setFormData(prev => ({ ...prev, assignedTo: e.target.value }))}
                placeholder="Ex: Équipe Maintenance"
                className="mt-1"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4 animate-fade-in">
            <div>
              <Label>Type d'intervention *</Label>
              <Select
                value={formData.type}
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="height">Travail en hauteur</SelectItem>
                  <SelectItem value="tower">Accès tour</SelectItem>
                  <SelectItem value="confined">Espace confiné</SelectItem>
                  <SelectItem value="electrical">Travail électrique</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Niveau de risque</Label>
              <Select
                value={formData.riskLevel}
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, riskLevel: value }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Risque faible</SelectItem>
                  <SelectItem value="medium">Risque modéré</SelectItem>
                  <SelectItem value="high">Risque élevé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Date limite d'exécution *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal mt-1",
                      !formData.deadline && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.deadline ? (
                      format(formData.deadline, "PPP", { locale: fr })
                    ) : (
                      <span>Sélectionner une date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.deadline}
                    onSelect={(date) => setFormData(prev => ({ ...prev, deadline: date }))}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4 animate-fade-in">
            <div>
              <Label>Équipements de Protection Individuelle (EPI)</Label>
              
              <div className="mt-2 space-y-2">
                <div className="flex gap-2">
                  <Select onValueChange={addPPE}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Sélectionner un EPI" />
                    </SelectTrigger>
                    <SelectContent>
                      {ppeOptions.filter(ppe => !formData.requiredPPE.includes(ppe)).map(ppe => (
                        <SelectItem key={ppe} value={ppe}>{ppe}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Input
                    value={newPPE}
                    onChange={(e) => setNewPPE(e.target.value)}
                    placeholder="Ou ajouter un EPI personnalisé"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (newPPE) {
                        addPPE(newPPE);
                        setNewPPE('');
                      }
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {formData.requiredPPE.map(ppe => (
                    <Badge key={ppe} variant="outline" className="flex items-center gap-1">
                      {ppe}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removePPE(ppe)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6 animate-fade-in">
            <div>
              <Label>Dangers/Risques identifiés</Label>
              
              <div className="mt-2 space-y-2">
                <div className="flex gap-2">
                  <Select onValueChange={addRisk}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Sélectionner un risque" />
                    </SelectTrigger>
                    <SelectContent>
                      {commonRisks.filter(risk => !formData.risks.includes(risk)).map(risk => (
                        <SelectItem key={risk} value={risk}>{risk}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Input
                    value={newRisk}
                    onChange={(e) => setNewRisk(e.target.value)}
                    placeholder="Ou ajouter un risque personnalisé"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (newRisk) {
                        addRisk(newRisk);
                        setNewRisk('');
                      }
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {formData.risks.map(risk => (
                    <Badge key={risk} variant="outline" className="flex items-center gap-1 bg-destructive/10">
                      {risk}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeRisk(risk)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <Label>Mesures de maîtrise</Label>
              
              <div className="mt-2 space-y-2">
                <div className="flex gap-2">
                  <Select onValueChange={addControl}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Sélectionner une mesure" />
                    </SelectTrigger>
                    <SelectContent>
                      {commonControls.filter(control => !formData.controls.includes(control)).map(control => (
                        <SelectItem key={control} value={control}>{control}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Input
                    value={newControl}
                    onChange={(e) => setNewControl(e.target.value)}
                    placeholder="Ou ajouter une mesure personnalisée"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (newControl) {
                        addControl(newControl);
                        setNewControl('');
                      }
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {formData.controls.map(control => (
                    <Badge key={control} variant="outline" className="flex items-center gap-1 bg-accent/10">
                      {control}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeControl(control)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">
            Créer une nouvelle JMT
          </DialogTitle>
          
          {/* Progress indicator */}
          <div className="flex items-center justify-center space-x-2 py-4">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className={cn(
                  "h-2 w-8 rounded-full transition-colors duration-200",
                  i + 1 <= currentStep ? "bg-primary" : "bg-muted"
                )}
              />
            ))}
          </div>
          
          <p className="text-center text-sm text-muted-foreground">
            Étape {currentStep} sur {totalSteps}
          </p>
        </DialogHeader>

        <div className="py-4">
          {renderStep()}
        </div>

        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Précédent
          </Button>

          {currentStep === totalSteps ? (
            <Button
              onClick={handleSubmit}
              className="bg-gradient-primary hover:opacity-90 flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Créer la JMT
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="flex items-center gap-2"
            >
              Suivant
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}