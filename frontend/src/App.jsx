import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Providers
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { VoiceProvider } from './components/VoiceHelper';

// Route Protection
import ProtectedRoute from './components/shared/ProtectedRoute';
import { AdminRoute, EspecialistaRoute } from './components/shared/RoleBasedRoute';

// Pages - Auth
import Login from './pages/Login';

// Pages - Admin
import AdminDashboard from './pages/admin/AdminDashboard';

// Pages - Especialista
import EspecialistaDashboard from './pages/especialista/EspecialistaDashboard';
import ExpedientePaciente from './pages/especialista/ExpedientePaciente';

// Pages - Paciente (nuevo dashboard)
import PacienteDashboard from './pages/paciente/PacienteDashboard';

// Pages - Shared (módulos comunes)
import Perfil from './pages/Perfil';
import Nutricion from './pages/Nutricion';
import Medicina from './pages/Medicina';
import Fisioterapia from './pages/Fisioterapia';
import Neuropsicologia from './pages/Neuropsicologia';
import Ortesis from './pages/Ortesis';
import Citas from './pages/Citas';
import Chat from './pages/Chat';
import Recordatorios from './pages/Recordatorios';
import FAQs from './pages/FAQs';
import Blog from './pages/Blog';
import Comunidad from './pages/Comunidad';
import Configuracion from './pages/Configuracion';
import NotFound from './pages/NotFound';

// Styles
import './App.css';
import './styles/accessibility.css';

// Componente para redirigir según el rol del usuario
const DashboardRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen" role="status" aria-live="polite">
        <div className="loading-spinner"></div>
        <p>Cargando...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirigir según el rol
  const rol = user.rol || user.role;

  switch (rol) {
    case 'administrador':
      return <Navigate to="/admin" replace />;
    case 'especialista':
      return <Navigate to="/especialista" replace />;
    case 'paciente':
    default:
      return <Navigate to="/paciente" replace />;
  }
};

// Aplicar configuración guardada al inicio (para evitar flash)
const applyStoredSettings = () => {
  try {
    // Tema
    const theme = localStorage.getItem('vitalia-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', theme);

    // Configuración de accesibilidad
    const accessibility = localStorage.getItem('vitalia-accessibility');
    if (accessibility) {
      const settings = JSON.parse(accessibility);
      document.documentElement.setAttribute('data-font-scale', settings.fontScale || 'md');
      document.documentElement.setAttribute('data-contrast', settings.contrast || 'normal');
      document.documentElement.setAttribute('data-reduced-motion', settings.reducedMotion?.toString() || 'false');
      document.documentElement.setAttribute('data-age-mode', settings.ageMode || 'young-adult');
    }
  } catch (e) {
    console.warn('Error aplicando configuración guardada:', e);
  }
};

// Ejecutar inmediatamente
applyStoredSettings();

function App() {
  return (
    <Router>
      <AuthProvider>
        <AccessibilityProvider>
          <VoiceProvider>
            <NotificationProvider>
              <div className="App">
                <Routes>
                  {/* ===== RUTAS PÚBLICAS ===== */}
                  <Route path="/login" element={<Login />} />

                  {/* ===== DASHBOARD PRINCIPAL (redirige según rol) ===== */}
                  <Route path="/" element={<DashboardRedirect />} />

                  {/* ===== RUTAS DE PACIENTE ===== */}
                  <Route path="/paciente" element={
                    <ProtectedRoute>
                      <PacienteDashboard />
                    </ProtectedRoute>
                  } />

                  {/* ===== RUTAS DE ADMIN ===== */}
                  <Route path="/admin" element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  } />
                  <Route path="/admin/*" element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  } />

                  {/* ===== RUTAS DE ESPECIALISTA ===== */}
                  <Route path="/especialista" element={
                    <EspecialistaRoute>
                      <EspecialistaDashboard />
                    </EspecialistaRoute>
                  } />
                  <Route path="/especialista/pacientes/:pacienteId/expediente" element={
                    <EspecialistaRoute>
                      <ExpedientePaciente />
                    </EspecialistaRoute>
                  } />
                  <Route path="/especialista/*" element={
                    <EspecialistaRoute>
                      <EspecialistaDashboard />
                    </EspecialistaRoute>
                  } />

                  {/* ===== RUTAS COMPARTIDAS (todos los roles autenticados) ===== */}
                  <Route path="/perfil" element={
                    <ProtectedRoute>
                      <Perfil />
                    </ProtectedRoute>
                  } />

                  <Route path="/nutricion" element={
                    <ProtectedRoute>
                      <Nutricion />
                    </ProtectedRoute>
                  } />

                  <Route path="/medicina" element={
                    <ProtectedRoute>
                      <Medicina />
                    </ProtectedRoute>
                  } />

                  <Route path="/fisioterapia" element={
                    <ProtectedRoute>
                      <Fisioterapia />
                    </ProtectedRoute>
                  } />

                  <Route path="/neuropsicologia" element={
                    <ProtectedRoute>
                      <Neuropsicologia />
                    </ProtectedRoute>
                  } />

                  <Route path="/ortesis" element={
                    <ProtectedRoute>
                      <Ortesis />
                    </ProtectedRoute>
                  } />

                  <Route path="/citas" element={
                    <ProtectedRoute>
                      <Citas />
                    </ProtectedRoute>
                  } />

                  <Route path="/chat" element={
                    <ProtectedRoute>
                      <Chat />
                    </ProtectedRoute>
                  } />

                  <Route path="/chat/:conversacionId" element={
                    <ProtectedRoute>
                      <Chat />
                    </ProtectedRoute>
                  } />

                  <Route path="/recordatorios" element={
                    <ProtectedRoute>
                      <Recordatorios />
                    </ProtectedRoute>
                  } />

                  <Route path="/faqs" element={
                    <ProtectedRoute>
                      <FAQs />
                    </ProtectedRoute>
                  } />

                  <Route path="/blog" element={
                    <ProtectedRoute>
                      <Blog />
                    </ProtectedRoute>
                  } />

                  <Route path="/comunidad" element={
                    <ProtectedRoute>
                      <Comunidad />
                    </ProtectedRoute>
                  } />

                  <Route path="/configuracion" element={
                    <ProtectedRoute>
                      <Configuracion />
                    </ProtectedRoute>
                  } />

                  {/* ===== 404 ===== */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </NotificationProvider>
          </VoiceProvider>
        </AccessibilityProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
