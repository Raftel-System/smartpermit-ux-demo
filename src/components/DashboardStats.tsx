import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Shield, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  AlertTriangle 
} from 'lucide-react';

interface StatsProps {
  userRole: 'user' | 'supervisor' | 'director';
}

export function DashboardStats({ userRole }: StatsProps) {
  // Données simulées adaptées par rôle
  const getStatsData = () => {
    switch (userRole) {
      case 'user':
        return [
          {
            title: 'Mes JMT en cours',
            value: '3',
            change: '+1 cette semaine',
            icon: FileText,
            color: 'bg-primary/10 text-primary'
          },
          {
            title: 'Permis validés',
            value: '12',
            change: '+2 cette semaine',
            icon: CheckCircle,
            color: 'bg-accent/10 text-accent'
          },
          {
            title: 'En attente validation',
            value: '2',
            change: 'Délai moyen: 1.5j',
            icon: Clock,
            color: 'bg-warning/10 text-warning-foreground'
          }
        ];
      
      case 'supervisor':
        return [
          {
            title: 'JMT à valider',
            value: '8',
            change: '+3 aujourd\'hui',
            icon: FileText,
            color: 'bg-warning/10 text-warning-foreground'
          },
          {
            title: 'Permis actifs',
            value: '24',
            change: '15 expire bientôt',
            icon: Shield,
            color: 'bg-primary/10 text-primary'
          },
          {
            title: 'Interventions validées',
            value: '45',
            change: '+12 cette semaine',
            icon: CheckCircle,
            color: 'bg-accent/10 text-accent'
          },
          {
            title: 'Alertes sécurité',
            value: '2',
            change: 'À traiter',
            icon: AlertTriangle,
            color: 'bg-destructive/10 text-destructive'
          }
        ];

      case 'director':
        return [
          {
            title: 'Permis haut risque',
            value: '6',
            change: 'À valider',
            icon: Shield,
            color: 'bg-destructive/10 text-destructive'
          },
          {
            title: 'Conformité globale',
            value: '94%',
            change: '+2% ce mois',
            icon: TrendingUp,
            color: 'bg-accent/10 text-accent'
          },
          {
            title: 'JMT totales',
            value: '156',
            change: '+18 cette semaine',
            icon: FileText,
            color: 'bg-primary/10 text-primary'
          },
          {
            title: 'Incidents évités',
            value: '12',
            change: 'Ce mois',
            icon: CheckCircle,
            color: 'bg-accent/10 text-accent'
          }
        ];

      default:
        return [];
    }
  };

  const stats = getStatsData();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="shadow-card hover:shadow-industrial transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-md ${stat.color}`}>
                <Icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.change}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}