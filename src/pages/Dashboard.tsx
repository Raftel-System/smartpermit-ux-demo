import React, { useState } from 'react';
import { DashboardStats } from '@/components/DashboardStats';
import { JMTCard } from '@/components/JMTCard';
import { CreateJMTModal } from '@/components/modals/CreateJMTModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Filter, Bell, Activity, TrendingUp } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

interface DashboardProps {
  userRole: 'user' | 'supervisor' | 'director';
}

export function Dashboard({ userRole }: DashboardProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { jmts, notifications, markNotificationRead } = useApp();

  const handleViewJMT = (id: string) => {
    console.log('Viewing JMT:', id);
    // TODO: Implémenter la vue détaillée
  };

  const handleEditJMT = (id: string) => {
    console.log('Editing JMT:', id);
    // TODO: Implémenter l'édition
  };

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
          <Card className="shadow-card hover:shadow-industrial transition-shadow duration-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Activité récente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentActivities.map((activity, index) => (
                <div 
                  key={activity.id} 
                  className="flex items-start gap-3 text-sm animate-fade-in"
                  style={{ animationDelay: `${0.1 * index}s` }}
                >
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.status === 'success' ? 'bg-accent animate-pulse' :
                    activity.status === 'warning' ? 'bg-warning animate-pulse' : 'bg-primary animate-pulse'
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
    </div>
  );
}