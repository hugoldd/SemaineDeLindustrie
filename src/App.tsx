import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { AuthCallback } from './pages/AuthCallback';
import { SetPassword } from './pages/SetPassword';
import { Map } from './pages/Map';
import { CompanyDetail } from './pages/CompanyDetail';
import { StudentDashboard } from './pages/StudentDashboard';
import { CompanyDashboard } from './pages/CompanyDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { ProtectedRoute } from './components/ProtectedRoute';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/set-password" element={<SetPassword />} />
        {/* Public routes with Header/Footer */}
        <Route path="/" element={
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">
              <Home />
            </main>
            <Footer />
          </div>
        } />
        <Route path="/map" element={
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">
              <Map />
            </main>
            <Footer />
          </div>
        } />
        <Route path="/company/:id" element={
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">
              <CompanyDetail />
            </main>
            <Footer />
          </div>
        } />

        {/* Dashboard routes (no Header/Footer) */}
        <Route
          path="/student-dashboard/*"
          element={
            <ProtectedRoute requiredRole="visitor">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/company-dashboard/*"
          element={
            <ProtectedRoute requiredRole="company">
              <CompanyDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-dashboard/*"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}
