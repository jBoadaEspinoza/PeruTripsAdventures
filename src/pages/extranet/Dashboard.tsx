import React, { useState, useEffect } from 'react';
import ExtranetPage from '../../components/ExtranetPage';
import { useExtranetLoading } from '../../hooks/useExtranetLoading';
import { useAuth } from '../../context/AuthContext';

interface RecentActivity {
  id: number;
  name: string;
  status: string;
}

interface DashboardData {
  totalActivities: number;
  totalBookings: number;
  totalRevenue: number;
  recentActivities: RecentActivity[];
}

const Dashboard: React.FC = () => {
  const { withLoading } = useExtranetLoading();
  const { user, company } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalActivities: 0,
    totalBookings: 0,
    totalRevenue: 0,
    recentActivities: []
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      // Simular múltiples llamadas al backend que necesitan cargar
      await withLoading(async () => {
        // Simular llamada 1: Cargar estadísticas
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Simular llamada 2: Cargar actividades recientes
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simular llamada 3: Cargar datos financieros
        await new Promise(resolve => setTimeout(resolve, 800));
        
        setDashboardData({
          totalActivities: 25,
          totalBookings: 156,
          totalRevenue: 15420.50,
          recentActivities: [
            { id: 1, name: 'Tour a Paracas', status: 'Activo' },
            { id: 2, name: 'Visita a Nazca', status: 'Activo' },
            { id: 3, name: 'Paseo en Ica', status: 'Inactivo' }
          ]
        });
      }, 'dashboard-loading');
    };

    loadDashboardData();
  }, [withLoading]);

  return (
    <ExtranetPage title="Dashboard">
      <div className="row">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Bienvenido, {user?.nickname || 'Usuario'}!</h5>
              <p className="card-text">
                Este es el panel principal del extranet. Aquí podrás gestionar tus actividades,
                reservas y configuraciones.
              </p>
              
              {/* Estadísticas rápidas */}
              <div className="row mt-4">
                <div className="col-md-3">
                  <div className="card bg-primary text-white">
                    <div className="card-body">
                      <h6 className="card-title">
                        <i className="fas fa-calendar-alt me-2"></i>
                        Actividades
                      </h6>
                      <h4 className="mb-0">{dashboardData.totalActivities}</h4>
                      <small>Total de actividades</small>
                    </div>
                  </div>
                </div>
                
                <div className="col-md-3">
                  <div className="card bg-success text-white">
                    <div className="card-body">
                      <h6 className="card-title">
                        <i className="fas fa-bookmark me-2"></i>
                        Reservas
                      </h6>
                      <h4 className="mb-0">{dashboardData.totalBookings}</h4>
                      <small>Reservas este mes</small>
                    </div>
                  </div>
                </div>
                
                <div className="col-md-3">
                  <div className="card bg-info text-white">
                    <div className="card-body">
                      <h6 className="card-title">
                        <i className="fas fa-chart-line me-2"></i>
                        Ingresos
                      </h6>
                      <h4 className="mb-0">S/ {dashboardData.totalRevenue.toLocaleString()}</h4>
                      <small>Ingresos este mes</small>
                    </div>
                  </div>
                </div>
                
                <div className="col-md-3">
                  <div className="card bg-warning text-white">
                    <div className="card-body">
                      <h6 className="card-title">
                        <i className="fas fa-star me-2"></i>
                        Calificación
                      </h6>
                      <h4 className="mb-0">4.8</h4>
                      <small>Promedio de reseñas</small>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actividades recientes */}
              <div className="row mt-4">
                <div className="col-12">
                  <div className="card">
                    <div className="card-header">
                      <h6 className="mb-0">Actividades Recientes</h6>
                    </div>
                    <div className="card-body">
                      <div className="table-responsive">
                        <table className="table table-hover">
                          <thead>
                            <tr>
                              <th>Actividad</th>
                              <th>Estado</th>
                              <th>Acciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {dashboardData.recentActivities.map(activity => (
                              <tr key={activity.id}>
                                <td>{activity.name}</td>
                                <td>
                                  <span className={`badge ${activity.status === 'Activo' ? 'bg-success' : 'bg-secondary'}`}>
                                    {activity.status}
                                  </span>
                                </td>
                                <td>
                                  <button className="btn btn-sm btn-outline-primary me-1">
                                    <i className="fas fa-edit"></i>
                                  </button>
                                  <button className="btn btn-sm btn-outline-info">
                                    <i className="fas fa-eye"></i>
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ExtranetPage>
  );
};

export default Dashboard; 