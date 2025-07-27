import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge, Status } from './StatusBadge';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Eye, 
  Edit, 
  Clock,
  AlertTriangle,
  HardHat
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface JMTData {
  id: string;
  title: string;
  description: string;
  zone: string;
  type: 'height' | 'tower' | 'confined' | 'electrical';
  status: Status;
  createdAt: Date;
  deadline: Date;
  assignedTo: string;
  riskLevel: 'low' | 'medium' | 'high';
  requiredPPE: string[];
}

interface JMTCardProps {
  jmt: JMTData;
  userRole: 'user' | 'supervisor' | 'director';
  onView: (id: string) => void;
  onEdit?: (id: string) => void;
}

const typeLabels = {
  height: 'Travail en hauteur',
  tower: 'Accès tour',
  confined: 'Espace confiné',
  electrical: 'Électrique'
};

const typeColors = {
  height: 'bg-destructive/10 text-destructive border-destructive/20',
  tower: 'bg-primary/10 text-primary border-primary/20',
  confined: 'bg-warning/10 text-warning-foreground border-warning/20',
  electrical: 'bg-secondary/10 text-secondary-foreground border-secondary/20'
};

const riskColors = {
  low: 'bg-accent/10 text-accent',
  medium: 'bg-warning/10 text-warning-foreground',
  high: 'bg-destructive/10 text-destructive'
};

export function JMTCard({ jmt, userRole, onView, onEdit }: JMTCardProps) {
  const canEdit = userRole === 'user' && (jmt.status === 'pending' || jmt.status === 'rejected');
  
  return (
    <Card className="shadow-card hover:shadow-industrial transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-lg font-semibold text-foreground">
              {jmt.title}
            </CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge 
                variant="outline" 
                className={typeColors[jmt.type]}
              >
                <HardHat className="h-3 w-3 mr-1" />
                {typeLabels[jmt.type]}
              </Badge>
              <StatusBadge status={jmt.status} />
            </div>
          </div>
          <div className={`p-2 rounded-full ${riskColors[jmt.riskLevel]}`}>
            <AlertTriangle className="h-4 w-4" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {jmt.description}
        </p>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground">{jmt.zone}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground">{jmt.assignedTo}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground">
              {format(jmt.createdAt, 'dd MMM yyyy', { locale: fr })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground">
              {format(jmt.deadline, 'dd MMM yyyy', { locale: fr })}
            </span>
          </div>
        </div>

        {jmt.requiredPPE.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">EPI requis:</p>
            <div className="flex flex-wrap gap-1">
              {jmt.requiredPPE.slice(0, 3).map((ppe, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {ppe}
                </Badge>
              ))}
              {jmt.requiredPPE.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{jmt.requiredPPE.length - 3} autres
                </Badge>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onView(jmt.id)}
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-2" />
            Consulter
          </Button>
          {canEdit && onEdit && (
            <Button 
              variant="industrial" 
              size="sm" 
              onClick={() => onEdit(jmt.id)}
              className="flex-1"
            >
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}