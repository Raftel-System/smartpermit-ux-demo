import React from 'react';
import { DashboardStats } from '@/components/DashboardStats';
import { JMTCard } from '@/components/JMTCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Bell, TrendingUp, Activity } from 'lucide-react';

interface DashboardProps {
  userRole: 'user' | 'supervisor' | 'director';
}

// Données simulées pour la démo
const mockJMTData = [
  {
    id: '1',
    title: 'Maintenance ascenseur Tour A',
    description: 'Vérification et maintenance préventive de l\'ascenseur de la tour A, niveaux 15-20',
    zone: 'Tour A - Niveaux 15-20',
    type: 'height' as const,
    status: 'pending' as const,
    createdAt: new Date('2024-01-15'),
    deadline: new Date('2024-01-20'),
    assignedTo: 'Équipe Maintenance',
    riskLevel: 'high' as const,
    requiredPPE: ['Harnais', 'Casque', 'Chaussures de sécurité', 'Gants']
  },
  {
    id: '2',
    title: 'Inspection antenne télécoms',
    description: 'Inspection technique annuelle de l\'antenne de télécommunications',
    zone: 'Tour B - Sommet',
    type: 'tower' as const,
    status: 'approved' as const,
    createdAt: new Date('2024-01-10'),
    deadline: new Date('2024-01-18'),
    assignedTo: 'TechCom Services',
    riskLevel: 'medium' as const,
    requiredPPE: ['Harnais', 'Casque', 'Lunettes']
  },
  {
    id: '3',
    title: 'Réparation éclairage',
    description: 'Remplacement des luminaires défaillants dans les zones communes',
    zone: 'Bâtiment C - RDC',
    type: 'electrical' as const,
    status: 'in-progress' as const,
    createdAt: new Date('2024-01-12'),
    deadline: new Date('2024-01-16'),
    assignedTo: 'ElecPro',
    riskLevel: 'low' as const,
    requiredPPE: ['Gants isolants', 'Casque']
  }
];

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

export function Dashboard({ userRole }: DashboardProps) {
  const handleViewJMT = (id: string) => {
    console.log('Viewing JMT:', id);
  };

  const handleEditJMT = (id: string) => {
    console.log('Editing JMT:', id);
  };

  const handleCreateJMT = () => {
    console.log('Creating new JMT');
  };

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
          className="bg-gradient-primary hover:opacity-90 shadow-glow"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle JMT
        </Button>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {getRoleGreeting()}
          </h1>
          <p className="text-muted-foreground">
            Gérez vos autorisations de travail en toute sécurité
          </p>
        </div>
        {getActionButton()}
      </div>

      {/* Statistiques */}
      <DashboardStats userRole={userRole} />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* JMT récentes */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              {userRole === 'user' ? 'Mes JMT récentes' : 'JMT à traiter'}
            </h2>
            <Button variant="ghost" size="sm">
              Voir tout
            </Button>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-1">
            {mockJMTData.map((jmt) => (
              <JMTCard
                key={jmt.id}
                jmt={jmt}
                userRole={userRole}
                onView={handleViewJMT}
                onEdit={handleEditJMT}
              />
            ))}
          </div>
        </div>

        {/* Panneau latéral */}
        <div className="space-y-4">
          {/* Activité récente */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Activité récente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 text-sm">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.status === 'success' ? 'bg-accent' :
                    activity.status === 'warning' ? 'bg-warning' : 'bg-primary'
                  }`} />
                  <div className="flex-1">
                    <p className="text-foreground">{activity.message}</p>
                    <p className="text-muted-foreground text-xs">{activity.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Notifications
                <Badge variant="destructive" className="ml-auto">3</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
                <p className="text-sm font-medium text-warning-foreground">
                  Permis hauteur expire bientôt
                </p>
                <p className="text-xs text-muted-foreground">
                  Tour A - Expire le 20/01/2024
                </p>
              </div>
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-sm font-medium text-primary">
                  Nouvelle validation requise
                </p>
                <p className="text-xs text-muted-foreground">
                  JMT en attente de votre validation
                </p>
              </div>
              <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
                <p className="text-sm font-medium text-accent">
                  Formation HSE programmée
                </p>
                <p className="text-xs text-muted-foreground">
                  25/01/2024 - Salle de formation
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Indicateur de performance */}
          {userRole === 'director' && (
            <Card className="shadow-card">
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
                    <div className="bg-gradient-success h-2 rounded-full" style={{ width: '94%' }} />
                  </div>
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>Objectif: 95%</span>
                    <span>+2% ce mois</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}