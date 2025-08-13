import React, { createContext, useContext, useState, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';

export interface JMTData {
  id: string;
  title: string;
  description: string;
  zone: string;
  type: 'height' | 'tower' | 'confined' | 'electrical';
  status: 'pending' | 'approved' | 'rejected' | 'archived' | 'in-progress';
  createdAt: Date;
  deadline: Date;
  assignedTo: string;
  riskLevel: 'low' | 'medium' | 'high';
  requiredPPE: string[];
  risks: string[];
  controls: string[];
  supervisor?: string;
  director?: string;
  comments?: string;
  pdfData?: {
    step1: { zone: string; date?: Date; workOrderNumber: string; };
    step2: { description: string; estimatedDuration: string; resources: {
        people: string[]; materials: string[]; epiSpecific: string[]; epiComplets: string[];
      }; };
    step3: { environmentHazards: string[]; };
    step4: { riskManagement: string[]; };
    step5: { lethalHazards: { danger: string; controls: string; }[]; };
    step6: { responsibleName: string; validationDate?: Date; };
    autoDetection?: { workingAtHeight?: boolean; suggestedPermits?: string[]; };
  };
  workOrderNumber?: string;
}

export interface PermitData {
  id: string;
  jmtId: string;
  type: 'height' | 'tower' | 'confined' | 'electrical';
  status: 'pending' | 'approved' | 'rejected' | 'expired' | 'active';
  validFrom: Date;
  validTo: Date;
  supervisorApproval?: {
    approved: boolean;
    date: Date;
    supervisor: string;
    comments?: string;
  };
  directorApproval?: {
    approved: boolean;
    date: Date;
    director: string;
    comments?: string;
  };
}

interface AppContextType {
  jmts: JMTData[];
  permits: PermitData[];
  createJMT: (jmt: Omit<JMTData, 'id' | 'createdAt' | 'status'>) => void;
  updateJMT: (id: string, updates: Partial<JMTData>) => void;
  deleteJMT: (id: string) => void;
  approveJMT: (id: string, role: 'supervisor' | 'director', comments?: string) => void;
  rejectJMT: (id: string, role: 'supervisor' | 'director', comments?: string) => void;
  createPermit: (permit: Omit<PermitData, 'id'>) => void;
  approvePermit: (id: string, role: 'supervisor' | 'director', comments?: string) => void;
  notifications: Notification[];
  markNotificationRead: (id: string) => void;
}

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Données initiales
const initialJMTs: JMTData[] = [
  {
    id: '1',
    title: 'Maintenance ascenseur Tour A',
    description: 'Vérification et maintenance préventive de l\'ascenseur de la tour A, niveaux 15-20',
    zone: 'Tour A - Niveaux 15-20',
    type: 'height',
    status: 'pending',
    createdAt: new Date('2024-01-15'),
    deadline: new Date('2024-01-20'),
    assignedTo: 'Équipe Maintenance',
    riskLevel: 'high',
    requiredPPE: ['Harnais', 'Casque', 'Chaussures de sécurité', 'Gants'],
    risks: ['Chute de hauteur', 'Electrocution', 'Coincement'],
    controls: ['Formation obligatoire', 'Vérification équipements', 'Procédure de consignation']
  },
  {
    id: '2',
    title: 'Inspection antenne télécoms',
    description: 'Inspection technique annuelle de l\'antenne de télécommunications',
    zone: 'Tour B - Sommet',
    type: 'tower',
    status: 'approved',
    createdAt: new Date('2024-01-10'),
    deadline: new Date('2024-01-18'),
    assignedTo: 'TechCom Services',
    riskLevel: 'medium',
    requiredPPE: ['Harnais', 'Casque', 'Lunettes'],
    risks: ['Chute', 'Conditions météo'],
    controls: ['Vérification météo', 'Communication radio'],
    supervisor: 'M. Dupont'
  },
  {
    id: '3',
    title: 'Réparation éclairage',
    description: 'Remplacement des luminaires défaillants dans les zones communes',
    zone: 'Bâtiment C - RDC',
    type: 'electrical',
    status: 'in-progress',
    createdAt: new Date('2024-01-12'),
    deadline: new Date('2024-01-16'),
    assignedTo: 'ElecPro',
    riskLevel: 'low',
    requiredPPE: ['Gants isolants', 'Casque'],
    risks: ['Electrocution'],
    controls: ['Consignation électrique', 'VAT']
  }
];

const initialNotifications: Notification[] = [
  {
    id: '1',
    type: 'warning',
    title: 'Permis expire bientôt',
    message: 'Le permis de travail en hauteur pour la Tour A expire dans 24h',
    read: false,
    createdAt: new Date()
  },
  {
    id: '2',
    type: 'info',
    title: 'Nouvelle JMT',
    message: 'Une nouvelle JMT "Maintenance ascenseur" nécessite votre validation',
    read: false,
    createdAt: new Date()
  },
  {
    id: '3',
    type: 'success',
    title: 'Formation programmée',
    message: 'Formation HSE programmée pour le 25/01/2024',
    read: false,
    createdAt: new Date()
  }
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [jmts, setJMTs] = useState<JMTData[]>(initialJMTs);
  const [permits, setPermits] = useState<PermitData[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  const createJMT = (jmtData: Omit<JMTData, 'id' | 'createdAt' | 'status'>) => {
    const newJMT: JMTData = {
      ...jmtData,
      id: Date.now().toString(),
      createdAt: new Date(),
      status: 'pending'
    };
    
    setJMTs(prev => [newJMT, ...prev]);
    
    // Ajouter une notification
    const notification: Notification = {
      id: Date.now().toString(),
      type: 'info',
      title: 'Nouvelle JMT créée',
      message: `JMT "${newJMT.title}" créée avec succès`,
      read: false,
      createdAt: new Date()
    };
    setNotifications(prev => [notification, ...prev]);
    
    toast({
      title: "JMT créée",
      description: `${newJMT.title} a été créée avec succès`,
    });
  };

  const updateJMT = (id: string, updates: Partial<JMTData>) => {
    setJMTs(prev => prev.map(jmt => 
      jmt.id === id ? { ...jmt, ...updates } : jmt
    ));
    
    toast({
      title: "JMT mise à jour",
      description: "Les modifications ont été sauvegardées",
    });
  };

  const deleteJMT = (id: string) => {
    setJMTs(prev => prev.filter(jmt => jmt.id !== id));
    
    toast({
      title: "JMT supprimée",
      description: "La JMT a été supprimée avec succès",
      variant: "destructive"
    });
  };

  const approveJMT = (id: string, role: 'supervisor' | 'director', comments?: string) => {
    setJMTs(prev => prev.map(jmt => {
      if (jmt.id === id) {
        const updates: Partial<JMTData> = {
          status: 'approved' as const,
          comments
        };
        
        if (role === 'supervisor') {
          updates.supervisor = 'M. Dupont';
        } else {
          updates.director = 'M. Martin';
        }
        
        return { ...jmt, ...updates };
      }
      return jmt;
    }));
    
    toast({
      title: "JMT approuvée",
      description: `JMT approuvée par ${role === 'supervisor' ? 'le superviseur' : 'la direction'}`,
    });
  };

  const rejectJMT = (id: string, role: 'supervisor' | 'director', comments?: string) => {
    setJMTs(prev => prev.map(jmt => 
      jmt.id === id ? { 
        ...jmt, 
        status: 'rejected' as const,
        comments,
        [role]: role === 'supervisor' ? 'M. Dupont' : 'M. Martin'
      } : jmt
    ));
    
    toast({
      title: "JMT refusée",
      description: `JMT refusée par ${role === 'supervisor' ? 'le superviseur' : 'la direction'}`,
      variant: "destructive"
    });
  };

  const createPermit = (permitData: Omit<PermitData, 'id'>) => {
    const newPermit: PermitData = {
      ...permitData,
      status: "pending",
      id: Date.now().toString()
    };
    
    setPermits(prev => [newPermit, ...prev]);
    
    toast({
      title: "Permis créé",
      description: "Le permis de travail a été généré avec succès",
    });
  };

  const approvePermit = (id: string, role: 'supervisor' | 'director', comments?: string) => {
    setPermits(prev => prev.map(permit => {
      if (permit.id === id) {
        const approval = {
          approved: true,
          date: new Date(),
          comments,
          [role]: role === 'supervisor' ? 'M. Dupont' : 'M. Martin'
        };
        
        return {
          ...permit,
          status: 'approved' as const,
          [`${role}Approval`]: approval
        };
      }
      return permit;
    }));
    
    toast({
      title: "Permis approuvé",
      description: `Permis approuvé par ${role === 'supervisor' ? 'le superviseur' : 'la direction'}`,
    });
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  return (
    <AppContext.Provider value={{
      jmts,
      permits,
      createJMT,
      updateJMT,
      deleteJMT,
      approveJMT,
      rejectJMT,
      createPermit,
      approvePermit,
      notifications,
      markNotificationRead
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}