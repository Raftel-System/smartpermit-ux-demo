import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  FileText,
  ClipboardCheck,
  Users,
  Shield,
  BarChart3,
  Settings,
  HardHat,
  Building,
  CheckSquare
} from 'lucide-react';

const navigationItems = [
  {
    title: 'Dashboard',
    url: '/',
    icon: LayoutDashboard,
    roles: ['user', 'supervisor', 'director']
  },
  {
    title: 'Mes JMT',
    url: '/jmt',
    icon: FileText,
    roles: ['user', 'supervisor']
  },
  {
    title: 'Permis de travail',
    url: '/permits',
    icon: Shield,
    roles: ['user', 'supervisor', 'director']
  },
  {
    title: 'Validations',
    url: '/validations',
    icon: CheckSquare,
    roles: ['supervisor', 'director']
  },
  {
    title: 'Équipes',
    url: '/teams',
    icon: Users,
    roles: ['supervisor', 'director']
  },
  {
    title: 'Rapports',
    url: '/reports',
    icon: BarChart3,
    roles: ['director']
  }
];

const settingsItems = [
  {
    title: 'Paramètres',
    url: '/settings',
    icon: Settings,
    roles: ['user', 'supervisor', 'director']
  }
];

interface AppSidebarProps {
  userRole: 'user' | 'supervisor' | 'director';
}

export function AppSidebar({ userRole }: AppSidebarProps) {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === 'collapsed';

  const isActive = (path: string) => {
    if (path === '/') return currentPath === '/';
    return currentPath.startsWith(path);
  };

  const getNavClassName = (path: string) => {
    const active = isActive(path);
    return active 
      ? "bg-primary text-primary-foreground shadow-sm" 
      : "hover:bg-primary/10 text-foreground";
  };

  const filteredNavItems = navigationItems.filter(item => 
    item.roles.includes(userRole)
  );
  
  const filteredSettingsItems = settingsItems.filter(item => 
    item.roles.includes(userRole)
  );

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
            <HardHat className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">
                SmartPermit
              </h2>
              <p className="text-xs text-muted-foreground">Gestion des permis</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={getNavClassName(item.url)}
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Configuration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredSettingsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url}
                      className={getNavClassName(item.url)}
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}