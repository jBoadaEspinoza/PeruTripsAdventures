import React from 'react';
import ActivityCard from './ActivityCard';
import type { ActivityCardData } from './ActivityCard';

export interface ActivityGridProps {
  activities: ActivityCardData[];
  columns?: 1 | 2 | 3 | 4 | 6 | 12;
  variant?: 'default' | 'horizontal' | 'compact';
  showDetailsButton?: boolean;
  detailsButtonText?: string;
  onDetailsClick?: (id: string) => void;
  className?: string;
  emptyMessage?: string;
  loading?: boolean;
}

const ActivityGrid: React.FC<ActivityGridProps> = ({
  activities,
  columns = 3,
  variant = 'default',
  showDetailsButton = true,
  detailsButtonText,
  onDetailsClick,
  className = '',
  emptyMessage = 'No se encontraron actividades.',
  loading = false
}) => {
  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3">Cargando actividades...</p>
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <p className="text-muted lead">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`row g-4 ${className}`}>
      {activities.map((activity) => (
        <ActivityCard
          key={activity.id}
          activity={activity}
          columns={columns}
          variant={variant}
          showDetailsButton={showDetailsButton}
          detailsButtonText={detailsButtonText}
          onDetailsClick={onDetailsClick}
        />
      ))}
    </div>
  );
};

export default ActivityGrid; 