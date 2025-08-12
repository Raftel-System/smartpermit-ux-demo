import React, { useState } from 'react';
import { DashboardStats } from '@/components/DashboardStats';
import { JMTCard } from '@/components/JMTCard';
import { CreateJMTModal } from '@/components/modals/CreateJMTModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {Plus, Search, Filter, Bell, Activity, TrendingUp, Shield, CheckCircle, XCircle} from 'lucide-react';
import {JMTData, useApp} from '@/contexts/AppContext';
import JMTModal from "@/components/modals/JMTModal";
import JMTPrintModal from "@/components/modals/JMTPrintModal.tsx";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog.tsx";
import {format} from "date-fns";
import {fr} from "date-fns/locale";
import {Separator} from "@/components/ui/separator.tsx";
import {Textarea} from "@/components/ui/textarea.tsx";

interface DashboardProps {
  userRole: 'user' | 'supervisor' | 'director';
}

export function Dashboard({ userRole }: DashboardProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { jmts, notifications, markNotificationRead } = useApp();

  // Ajoute en haut du composant Dashboard
  const [selectedJMT, setSelectedJMT] = useState<JMTData>(null);
  const [modalMode, setModalMode] = useState<"view" | "edit">("view");
  const [modalOpen, setModalOpen] = useState(false);

  const [showDetails, setShowDetails] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | undefined>(undefined);
  const [selectedJMTData, setSelectedJMTData] = useState<any | null>(null);
  const [comments, setComments] = useState(""); // si votre modal l’utilise

  function normalizeJMTForDetails(jmt: any) {
    const d = jmt?.pdfData ?? {};
    const step1 = d.step1 ?? {
      zone: jmt?.zone,
      date: jmt?.deadline,
      workOrderNumber: jmt?.workOrderNumber || "",
    };
    const step2 = d.step2 ?? {
      description: jmt?.description,
      estimatedDuration: "",
      resources: {
        people: [],
        materials: [],
        epiSpecific: [],
        epiComplets: jmt?.requiredPPE || [],
      },
    };
    const step3 = d.step3 ?? { environmentHazards: jmt?.risks || [] };
    const step4 = d.step4 ?? { riskManagement: jmt?.controls || [] };
    const step5 = d.step5 ?? { lethalHazards: [] };
    const step6 = d.step6 ?? {
      responsibleName: jmt?.assignedTo || "",
      validationDate: jmt?.deadline,
    };
    const autoDetection =
        d.autoDetection ?? {
          workingAtHeight:
              jmt?.type === "height" ||
              /hauteur|échafaud|échelle|harnais/i.test(
                  `${jmt?.title} ${jmt?.description} ${(jmt?.risks || []).join(" ")} ${(jmt?.requiredPPE || []).join(" ")}`
              ),
          suggestedPermits: jmt?.type === "height" ? ["Permis de travail en hauteur"] : [],
        };

    return {
      ...jmt,
      pdfData: { step1, step2, step3, step4, step5, step6, autoDetection },
    };
  }

// Fonction pour ouvrir la modale avec un mode
  const openModal = (jmt: JMTData, mode: "view" | "edit") => {
    setSelectedJMT(jmt);
    setModalMode(mode);
    setModalOpen(true);
  };

  const handleViewJMT = (selectedJMT: any) => {
    console.log("visu : " + selectedJMT);
    const selectedJMTData = jmts.find(jmt => jmt.id === selectedJMT);
    const normalized = normalizeJMTForDetails(selectedJMTData);
    setSelectedJMTData(normalized);
    setActionType(undefined); // vue simple par défaut
    setComments("");
    setShowDetails(true);
  };


  const handleEditJMT = (id: string) => {
    console.log('Editing JMT:', id);
    // TODO: Implémenter l'édition
    const jmt = jmts.find(j => j.id === id);
    if (jmt) openModal(jmt, "edit");
  };

  const handleDownloadPDF = (jmt: JMTData) => {
    console.log('Downloading PDF for JMT:', jmt.id);
  }

  const handleCreateJMT = () => {
    setShowCreateModal(true);
  };

  // Filtrer les JMT selon le rôle et les filtres
  const filteredJMTs = jmts.filter(jmt => {
    const matchesSearch = jmt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         jmt.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         jmt.zone.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || jmt.status === statusFilter;
    
    // Filtrage par rôle
    if (userRole === 'user') {
      return matchesSearch && matchesStatus;
    } else if (userRole === 'supervisor') {
      return matchesSearch && matchesStatus && (jmt.status === 'pending' || jmt.status === 'approved');
    } else {
      return matchesSearch && matchesStatus;
    }
  });

  const getRoleGreeting = () => {
    const greetings = {
      user: 'Bienvenue, Intervenant',
      supervisor: 'Tableau de bord Superviseur',
      director: 'Tableau de bord Direction HSE'
    };
    return greetings[userRole];
  };

  const getActionButton = () => {
    if (userRole === 'user') {
      return (
        <Button 
          onClick={handleCreateJMT}
          className="bg-gradient-primary hover:opacity-90 shadow-glow transition-all duration-200 hover:scale-105"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle JMT
        </Button>
      );
    }
    return null;
  };

  const recentActivities = [
    {
      id: 1,
      type: 'validation',
      message: 'JMT "Maintenance ascenseur" validée par M. Dupont',
      time: '10:30',
      status: 'success'
    },
    {
      id: 2,
      type: 'creation',
      message: 'Nouvelle JMT créée: "Inspection antenne"',
      time: '09:15',
      status: 'info'
    },
    {
      id: 3,
      type: 'alert',
      message: 'Permis "Travail hauteur" expire dans 24h',
      time: '08:45',
      status: 'warning'
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* En-tête avec animation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="animate-scale-in">
          <h1 className="text-2xl font-bold text-foreground">
            {getRoleGreeting()}
          </h1>
          <p className="text-muted-foreground">
            Gérez vos autorisations de travail en toute sécurité
          </p>
        </div>
        <div className="animate-scale-in">
          {getActionButton()}
        </div>
      </div>

      {/* Statistiques avec animation */}
      <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <DashboardStats userRole={userRole} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Section principale des JMT */}
        <div className="lg:col-span-2 space-y-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-lg font-semibold text-foreground">
              {userRole === 'user' ? 'Mes JMT récentes' : 'JMT à traiter'}
            </h2>
            
            {/* Filtres et recherche */}
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="approved">Validé</SelectItem>
                  <SelectItem value="in-progress">En cours</SelectItem>
                  <SelectItem value="rejected">Refusé</SelectItem>
                  <SelectItem value="archived">Archivé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Liste des JMT avec animations */}
          <div className="space-y-4">
            {filteredJMTs.length > 0 ? (
              filteredJMTs.map((jmt, index) => (
                <div 
                  key={jmt.id} 
                  className="animate-fade-in hover:scale-[1.02] transition-all duration-200"
                  style={{ animationDelay: `${0.1 * index}s` }}
                >
                  <JMTCard
                    jmt={jmt}
                    userRole={userRole}
                    onView={handleViewJMT}
                    onEdit={handleEditJMT}
                    onDownloadPdf={handleDownloadPDF}
                  />
                </div>
              ))
            ) : (
              <Card className="shadow-card animate-fade-in">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="text-center space-y-2">
                    <p className="text-lg font-medium text-muted-foreground">
                      Aucune JMT trouvée
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {searchTerm || statusFilter !== 'all' 
                        ? 'Essayez de modifier vos critères de recherche'
                        : 'Commencez par créer votre première JMT'
                      }
                    </p>
                    {userRole === 'user' && !searchTerm && statusFilter === 'all' && (
                      <Button 
                        onClick={handleCreateJMT}
                        className="mt-4"
                        variant="outline"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Créer ma première JMT
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Panneau latéral avec animations */}
        <div className="space-y-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          {/* Activité récente */}
          {/*<Card className="shadow-card hover:shadow-industrial transition-shadow duration-200">*/}
          {/*  <CardHeader>*/}
          {/*    <CardTitle className="flex items-center gap-2">*/}
          {/*      <Activity className="h-5 w-5 text-primary" />*/}
          {/*      Activité récente*/}
          {/*    </CardTitle>*/}
          {/*  </CardHeader>*/}
          {/*  <CardContent className="space-y-3">*/}
          {/*    {recentActivities.map((activity, index) => (*/}
          {/*      <div */}
          {/*        key={activity.id} */}
          {/*        className="flex items-start gap-3 text-sm animate-fade-in"*/}
          {/*        style={{ animationDelay: `${0.1 * index}s` }}*/}
          {/*      >*/}
          {/*        <div className={`w-2 h-2 rounded-full mt-2 ${*/}
          {/*          activity.status === 'success' ? 'bg-accent animate-pulse' :*/}
          {/*          activity.status === 'warning' ? 'bg-warning animate-pulse' : 'bg-primary animate-pulse'*/}
          {/*        }`} />*/}
          {/*        <div className="flex-1">*/}
          {/*          <p className="text-foreground">{activity.message}</p>*/}
          {/*          <p className="text-muted-foreground text-xs">{activity.time}</p>*/}
          {/*        </div>*/}
          {/*      </div>*/}
          {/*    ))}*/}
          {/*  </CardContent>*/}
          {/*</Card>*/}

          {/* Notifications */}
          <Card className="shadow-card hover:shadow-industrial transition-shadow duration-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Notifications
                <Badge variant="destructive" className="ml-auto animate-glow">
                  {notifications.filter(n => !n.read).length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {notifications.slice(0, 3).map((notification, index) => (
                <div 
                  key={notification.id}
                  className={`p-3 rounded-lg border transition-all duration-200 hover:scale-[1.02] cursor-pointer animate-fade-in ${
                    notification.type === 'warning' ? 'bg-warning/10 border-warning/20' :
                    notification.type === 'info' ? 'bg-primary/10 border-primary/20' :
                    notification.type === 'success' ? 'bg-accent/10 border-accent/20' :
                    'bg-destructive/10 border-destructive/20'
                  }`}
                  style={{ animationDelay: `${0.1 * index}s` }}
                  onClick={() => markNotificationRead(notification.id)}
                >
                  <p className={`text-sm font-medium ${
                    notification.type === 'warning' ? 'text-warning-foreground' :
                    notification.type === 'info' ? 'text-primary' :
                    notification.type === 'success' ? 'text-accent' :
                    'text-destructive'
                  }`}>
                    {notification.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {notification.message}
                  </p>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-primary rounded-full float-right -mt-4 animate-pulse" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Indicateur de performance pour directeur */}
          {userRole === 'director' && (
            <Card className="shadow-card hover:shadow-industrial transition-shadow duration-200 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-accent" />
                  Performance HSE
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Conformité</span>
                    <span className="text-sm font-medium text-accent">94%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-gradient-success h-2 rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: '94%' }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>Objectif: 95%</span>
                    <span className="text-accent font-medium">+2% ce mois</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Modal de création */}
      <CreateJMTModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
      />

      {selectedJMT && (
          <JMTModal
              isOpen={modalOpen}
              mode={modalMode}
              jmt={selectedJMT}
              onClose={() => setModalOpen(false)}
              onSave={(updatedJmt) => {
                // TODO : appel API ou mise à jour locale ici
                console.log("Sauvegarde :", updatedJmt);
              }}
          />
      )}

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {actionType
                  ? actionType === "approve"
                      ? "Valider la JMT"
                      : "Refuser la JMT"
                  : "Détails de la JMT"}
            </DialogTitle>
          </DialogHeader>

          {selectedJMTData && (() => {
            // ------ Préparation/fallbacks vers l'ancien schéma ------
            const d = selectedJMTData.pdfData ?? {};
            const step1 = d.step1 ?? {
              zone: selectedJMTData.zone,
              date: selectedJMTData.deadline,
              workOrderNumber: selectedJMTData.workOrderNumber || "",
            };
            const step2 = d.step2 ?? {
              description: selectedJMTData.description,
              estimatedDuration: "",
              resources: {
                people: [],
                materials: [],
                epiSpecific: [],
                epiComplets: selectedJMTData.requiredPPE || [],
              },
            };
            const step3 = d.step3 ?? { environmentHazards: selectedJMTData.risks || [] };
            const step4 = d.step4 ?? { riskManagement: selectedJMTData.controls || [] };
            const step5 = d.step5 ?? { lethalHazards: [] };
            const step6 = d.step6 ?? {
              responsibleName: selectedJMTData.assignedTo || "",
              validationDate: selectedJMTData.deadline,
            };

            const auto = d.autoDetection ?? {
              workingAtHeight:
                  selectedJMTData.type === "height" ||
                  /hauteur|échafaud|échelle|harnais/i.test(
                      `${selectedJMTData.title} ${selectedJMTData.description} ${(selectedJMTData.risks || []).join(" ")} ${(selectedJMTData.requiredPPE || []).join(" ")}`
                  ),
              suggestedPermits:
                  selectedJMTData.type === "height" ? ["Permis de travail en hauteur"] : [],
            };

            const fmtDate = (x?: Date | string) => {
              if (!x) return "—";
              const dt = typeof x === "string" ? new Date(x) : x;
              return isNaN(dt.getTime()) ? "—" : format(dt, "dd MMMM yyyy", { locale: fr });
            };

            const PillList = ({ items = [], variant = "outline", extraClass = "" }: { items?: string[]; variant?: any; extraClass?: string }) =>
                items.length ? (
                    <div className="flex flex-wrap gap-2">
                      {items.map((it) => (
                          <Badge key={it} variant={variant} className={extraClass}>
                            {it}
                          </Badge>
                      ))}
                    </div>
                ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                );

            const getRiskColor = (level: string) => {
              switch (level) {
                case 'high': return 'text-destructive bg-destructive/10';
                case 'medium': return 'text-warning-foreground bg-warning/10';
                case 'low': return 'text-accent bg-accent/10';
                default: return 'text-muted-foreground bg-muted/10';
              }
            };

            const getRiskLabel = (level: string) => {
              switch (level) {
                case 'high': return 'Élevé';
                case 'medium': return 'Modéré';
                case 'low': return 'Faible';
                default: return level;
              }
            };

            return (
                <div className="space-y-6">
                  {/* En-tête / résumé court */}
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{selectedJMTData.title}</h3>
                    <p className="text-sm text-muted-foreground">{step2.description || "—"}</p>
                  </div>

                  <Separator />

                  {/* Statut / infos clés */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Zone :</span>
                      <p className="text-muted-foreground">{step1.zone || "—"}</p>
                    </div>
                    <div>
                      <span className="font-medium">Équipe :</span>
                      <p className="text-muted-foreground">{selectedJMTData.assignedTo || "—"}</p>
                    </div>
                    <div>
                      <span className="font-medium">Échéance :</span>
                      <p className="text-muted-foreground">{fmtDate(selectedJMTData.deadline)}</p>
                    </div>
                    <div>
                      <span className="font-medium">Niveau de risque :</span>
                      <Badge className={getRiskColor(selectedJMTData.riskLevel)}>
                        {getRiskLabel(selectedJMTData.riskLevel)}
                      </Badge>
                    </div>
                  </div>

                  {/* --- Étapes PDF (script3) --- */}
                  <div className="space-y-5">
                    {/* Étape 1 */}
                    <div>
                      <h4 className="font-semibold mb-2">Étape 1 – Informations générales</h4>
                      <div className="grid sm:grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="font-medium">Date</div>
                          <div className="text-muted-foreground">{fmtDate(step1.date)}</div>
                        </div>
                        <div>
                          <div className="font-medium">N° de commande de travail</div>
                          <div className="text-muted-foreground">{step1.workOrderNumber || "—"}</div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Étape 2 */}
                    <div>
                      <h4 className="font-semibold mb-2">Étape 2 – Détails & Ressources</h4>
                      <div className="grid sm:grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="font-medium">Durée estimée</div>
                          <div className="text-muted-foreground">{step2.estimatedDuration || "—"}</div>
                        </div>
                      </div>
                      <div className="mt-3 grid md:grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm font-medium mb-1">Ressources humaines</div>
                          <PillList items={step2.resources?.people} />
                        </div>
                        <div>
                          <div className="text-sm font-medium mb-1">Matériels / consommables</div>
                          <PillList items={step2.resources?.materials} />
                        </div>
                        <div>
                          <div className="text-sm font-medium mb-1">EPI spécifiques</div>
                          <PillList items={step2.resources?.epiSpecific} />
                        </div>
                        <div>
                          <div className="text-sm font-medium mb-1">EPI complets</div>
                          <PillList items={step2.resources?.epiComplets} />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Étape 3 */}
                    <div>
                      <h4 className="font-semibold mb-2">Étape 3 – Dangers liés à l’environnement</h4>
                      <PillList items={step3.environmentHazards} variant="outline" extraClass="bg-destructive/10" />
                    </div>

                    {/* Étape 4 */}
                    <div>
                      <h4 className="font-semibold mb-2">Étape 4 – Gestion des risques</h4>
                      <PillList items={step4.riskManagement} variant="outline" extraClass="bg-accent/10" />
                    </div>

                    {/* Étape 5 */}
                    <div>
                      <h4 className="font-semibold mb-2">Étape 5 – Dangers mortels / significatifs</h4>
                      {step5.lethalHazards?.length ? (
                          <div className="rounded-md border">
                            <table className="w-full text-sm">
                              <thead>
                              <tr className="bg-muted">
                                <th className="text-left p-2">Danger</th>
                                <th className="text-left p-2">Moyens de maîtrise</th>
                              </tr>
                              </thead>
                              <tbody>
                              {step5.lethalHazards.map((row, i) => (
                                  <tr key={i} className="border-t">
                                    <td className="p-2 align-top">{row.danger || "—"}</td>
                                    <td className="p-2 align-top">{row.controls || "—"}</td>
                                  </tr>
                              ))}
                              </tbody>
                            </table>
                          </div>
                      ) : (
                          <p className="text-sm text-muted-foreground">—</p>
                      )}
                    </div>

                    {/* Étape 6 */}
                    <div>
                      <h4 className="font-semibold mb-2">Étape 6 – Responsable de l’intervention</h4>
                      <div className="grid sm:grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="font-medium">Nom</div>
                          <div className="text-muted-foreground">{step6.responsibleName || "—"}</div>
                        </div>
                        <div>
                          <div className="font-medium">Date de validation</div>
                          <div className="text-muted-foreground">{fmtDate(step6.validationDate)}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Rappels (ancien affichage conservé) */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">EPI requis (rappel)</h4>
                      <PillList items={selectedJMTData.requiredPPE} />
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Risques (rappel)</h4>
                      <PillList items={selectedJMTData.risks} variant="outline" extraClass="bg-destructive/10" />
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Mesures (rappel)</h4>
                      <PillList items={selectedJMTData.controls} variant="outline" extraClass="bg-accent/10" />
                    </div>
                  </div>

                  {/* Commentaires & actions de décision */}
                  {actionType && (
                      <>
                        <Separator />
                        <div>
                          <label className="text-sm font-medium">
                            Commentaires {actionType === "reject" && "(obligatoire)"} :
                          </label>
                          <Textarea
                              value={comments}
                              onChange={(e) => setComments(e.target.value)}
                              placeholder={
                                actionType === "approve"
                                    ? "Commentaires optionnels..."
                                    : "Expliquez les raisons du refus..."
                              }
                              className="mt-2"
                              rows={3}
                          />
                        </div>
                      </>
                  )}

                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button variant="outline" onClick={() => setShowDetails(false)}>
                      {actionType ? "Annuler" : "Fermer"}
                    </Button>

                    {actionType && (
                        <Button
                            onClick={handleAction}
                            className={actionType === "approve" ? "bg-gradient-success" : ""}
                            variant={actionType === "approve" ? "default" : "destructive"}
                            disabled={actionType === "reject" && !comments.trim()}
                        >
                          {actionType === "approve" ? (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Valider
                              </>
                          ) : (
                              <>
                                <XCircle className="h-4 w-4 mr-2" />
                                Refuser
                              </>
                          )}
                        </Button>
                    )}
                  </div>
                </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}