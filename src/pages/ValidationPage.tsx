import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { StatusBadge } from '@/components/StatusBadge';
import { useApp } from '@/contexts/AppContext';
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  FileText, 
  Clock, 
  User, 
  MapPin,
  AlertTriangle,
  Shield,
  Filter,
  Search
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ValidationPageProps {
  userRole: 'supervisor' | 'director';
}

export function ValidationPage({ userRole }: ValidationPageProps) {
  const { jmts, approveJMT, rejectJMT } = useApp();
  const [selectedJMT, setSelectedJMT] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [comments, setComments] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('all');

  // Filtrer les JMT selon le rôle
  const filteredJMTs = jmts.filter(jmt => {
    const matchesSearch = jmt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         jmt.zone.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = riskFilter === 'all' || jmt.riskLevel === riskFilter;
    
    if (userRole === 'supervisor') {
      return jmt.status === 'pending' && matchesSearch && matchesRisk;
    } else { // director
      return (jmt.status === 'pending' || (jmt.status === 'approved' && jmt.riskLevel === 'high')) && 
             matchesSearch && matchesRisk;
    }
  });

  const selectedJMTData = jmts.find(jmt => jmt.id === selectedJMT);

  const handleAction = () => {
    if (!selectedJMT || !actionType) return;

    if (actionType === 'approve') {
      approveJMT(selectedJMT, userRole, comments);
    } else {
      rejectJMT(selectedJMT, userRole, comments);
    }

    setSelectedJMT(null);
    setShowDetails(false);
    setComments('');
    setActionType(null);
  };

  const openActionDialog = (jmtId: string, action: 'approve' | 'reject') => {
    setSelectedJMT(jmtId);
    setActionType(action);
    setShowDetails(true);
  };

  const viewDetails = (jmtId: string) => {
    setSelectedJMT(jmtId);
    setActionType(null);
    setShowDetails(true);
  };

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
    <div className="space-y-6 animate-fade-in">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {userRole === 'supervisor' ? 'Validations Superviseur' : 'Validations Direction'}
          </h1>
          <p className="text-muted-foreground">
            {userRole === 'supervisor' 
              ? 'Examinez et validez les JMT de votre équipe'
              : 'Validez les permis à haut risque'
            }
          </p>
        </div>
      </div>

      {/* Filtres */}
      <Card className="shadow-card">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une JMT..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les risques</SelectItem>
                <SelectItem value="high">Risque élevé</SelectItem>
                <SelectItem value="medium">Risque modéré</SelectItem>
                <SelectItem value="low">Risque faible</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques rapides */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <Clock className="h-5 w-5 text-warning-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">En attente</p>
                <p className="text-2xl font-bold">{filteredJMTs.filter(j => j.status === 'pending').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Haut risque</p>
                <p className="text-2xl font-bold">{filteredJMTs.filter(j => j.riskLevel === 'high').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <CheckCircle className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Validées aujourd'hui</p>
                <p className="text-2xl font-bold">7</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des JMT */}
      <div className="space-y-4">
        {filteredJMTs.length > 0 ? (
          filteredJMTs.map((jmt, index) => (
            <Card 
              key={jmt.id} 
              className="shadow-card hover:shadow-industrial transition-all duration-200 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">{jmt.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{jmt.description}</p>
                      </div>
                      <StatusBadge status={jmt.status} />
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{jmt.zone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{jmt.assignedTo}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{format(jmt.deadline, 'dd/MM/yyyy', { locale: fr })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                        <Badge className={getRiskColor(jmt.riskLevel)}>
                          {getRiskLabel(jmt.riskLevel)}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row lg:flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => viewDetails(jmt.id)}
                      className="flex-1 lg:flex-none"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Voir
                    </Button>
                    
                    {jmt.status === 'pending' && (
                      <>
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => openActionDialog(jmt.id, 'approve')}
                          className="flex-1 lg:flex-none"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Valider
                        </Button>
                        
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => openActionDialog(jmt.id, 'reject')}
                          className="flex-1 lg:flex-none"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Refuser
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="shadow-card">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                Aucune JMT à valider
              </h3>
              <p className="text-sm text-muted-foreground text-center">
                {searchTerm || riskFilter !== 'all' 
                  ? 'Aucune JMT ne correspond à vos critères de recherche'
                  : 'Toutes les JMT de votre périmètre ont été traitées'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal de détails/action */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {actionType ? 
                (actionType === 'approve' ? 'Valider la JMT' : 'Refuser la JMT') :
                'Détails de la JMT'
              }
            </DialogTitle>
          </DialogHeader>

          {selectedJMTData && (
            <div className="space-y-6">
              {/* Informations générales */}
              <div>
                <h3 className="font-semibold text-foreground mb-3">{selectedJMTData.title}</h3>
                <p className="text-sm text-muted-foreground">{selectedJMTData.description}</p>
              </div>

              <Separator />

              {/* Détails techniques */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Zone:</span>
                  <p className="text-muted-foreground">{selectedJMTData.zone}</p>
                </div>
                <div>
                  <span className="font-medium">Équipe:</span>
                  <p className="text-muted-foreground">{selectedJMTData.assignedTo}</p>
                </div>
                <div>
                  <span className="font-medium">Échéance:</span>
                  <p className="text-muted-foreground">
                    {format(selectedJMTData.deadline, 'dd MMMM yyyy', { locale: fr })}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Niveau de risque:</span>
                  <Badge className={getRiskColor(selectedJMTData.riskLevel)}>
                    {getRiskLabel(selectedJMTData.riskLevel)}
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* EPI requis */}
              <div>
                <h4 className="font-medium mb-2">EPI requis:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedJMTData.requiredPPE.map(ppe => (
                    <Badge key={ppe} variant="outline">{ppe}</Badge>
                  ))}
                </div>
              </div>

              {/* Risques identifiés */}
              <div>
                <h4 className="font-medium mb-2">Risques identifiés:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedJMTData.risks.map(risk => (
                    <Badge key={risk} variant="outline" className="bg-destructive/10">
                      {risk}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Mesures de maîtrise */}
              <div>
                <h4 className="font-medium mb-2">Mesures de maîtrise:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedJMTData.controls.map(control => (
                    <Badge key={control} variant="outline" className="bg-accent/10">
                      {control}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Section commentaires pour action */}
              {actionType && (
                <>
                  <Separator />
                  <div>
                    <label className="text-sm font-medium">
                      Commentaires {actionType === 'reject' && '(obligatoire)'}:
                    </label>
                    <Textarea
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      placeholder={actionType === 'approve' 
                        ? 'Commentaires optionnels...'
                        : 'Expliquez les raisons du refus...'
                      }
                      className="mt-2"
                      rows={3}
                    />
                  </div>
                </>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowDetails(false)}>
                  {actionType ? 'Annuler' : 'Fermer'}
                </Button>
                
                {actionType && (
                  <Button
                    onClick={handleAction}
                    className={actionType === 'approve' ? 'bg-gradient-success' : ''}
                    variant={actionType === 'approve' ? 'default' : 'destructive'}
                    disabled={actionType === 'reject' && !comments.trim()}
                  >
                    {actionType === 'approve' ? (
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
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}