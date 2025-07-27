import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell, User, LogOut, Settings } from 'lucide-react';

interface AppHeaderProps {
  userRole: 'user' | 'supervisor' | 'director';
  userName: string;
  onRoleChange: (role: 'user' | 'supervisor' | 'director') => void;
}

const roleLabels = {
  user: 'Intervenant',
  supervisor: 'Superviseur',
  director: 'Directeur HSE'
};

export function AppHeader({ userRole, userName, onRoleChange }: AppHeaderProps) {
  return (
    <header className="h-16 border-b bg-gradient-industrial shadow-card">
      <div className="flex h-full items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="h-9 w-9" />
          <div className="hidden md:block">
            <h1 className="font-semibold text-foreground">Tableau de bord</h1>
            <p className="text-sm text-muted-foreground">
              Gestion des autorisations de travail
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Sélecteur de rôle pour la démo */}
          <div className="hidden md:flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Mode démo:</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  {roleLabels[userRole]}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Changer de rôle</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onRoleChange('user')}>
                  Intervenant
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onRoleChange('supervisor')}>
                  Superviseur
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onRoleChange('director')}>
                  Directeur HSE
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              3
            </Badge>
          </Button>

          {/* Menu utilisateur */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center">
                  <User className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium">{userName}</p>
                  <p className="text-xs text-muted-foreground">{roleLabels[userRole]}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Paramètres
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}