import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CheckCircle, Clock, XCircle, Archive, AlertCircle } from 'lucide-react';

export type Status = 'pending' | 'approved' | 'rejected' | 'archived' | 'in-progress';

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const statusConfig = {
  'pending': {
    label: 'En attente',
    icon: Clock,
    className: 'bg-warning/10 text-warning-foreground border-warning/20 hover:bg-warning/20'
  },
  'approved': {
    label: 'Validé',
    icon: CheckCircle,
    className: 'bg-accent/10 text-accent-foreground border-accent/20 hover:bg-accent/20'
  },
  'rejected': {
    label: 'Refusé',
    icon: XCircle,
    className: 'bg-destructive/10 text-destructive-foreground border-destructive/20 hover:bg-destructive/20'
  },
  'archived': {
    label: 'Archivé',
    icon: Archive,
    className: 'bg-muted text-muted-foreground border-border hover:bg-muted/80'
  },
  'in-progress': {
    label: 'En cours',
    icon: AlertCircle,
    className: 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20'
  }
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const config = statusConfig[status];
  const Icon = config.icon;
  
  return (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium transition-colors",
        config.className,
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
};