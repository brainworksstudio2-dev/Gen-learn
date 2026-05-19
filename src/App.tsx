/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { AdminLogin } from './pages/admin/AdminLogin';
import { Dashboard } from './pages/Dashboard';
import { Materials } from './pages/Materials';
import { Assignments } from './pages/Assignments';
import { Exercises } from './pages/Exercises';
import { Attendance } from './pages/Attendance';
import { Schedule } from './pages/Schedule';
import { Roadmap } from './pages/Roadmap';
import { Grades } from './pages/Grades';
import { Onboarding } from './pages/Onboarding';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ManageMaterials } from './pages/admin/ManageMaterials';
import { ManageAssignments } from './pages/admin/ManageAssignments';
import { ManageExercises } from './pages/admin/ManageExercises';
import { ManageAttendance } from './pages/admin/ManageAttendance';
import { ManageSchedule } from './pages/admin/ManageSchedule';
import { ManageRoadmap } from './pages/admin/ManageRoadmap';
import { Performance } from './pages/admin/Performance';
import { Reports } from './pages/admin/Reports';

import { auth } from './lib/auth';
import { onAuthStateChanged, User } from 'firebase/auth';

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) {
  const [user, setUser] = React.useState<User | null>(auth.currentUser);
  const [loading, setLoading] = React.useState(!auth.currentUser);
  const [role, setRole] = React.useState<string | null>(null);
  const [hasGen, setHasGen] = React.useState<boolean>(false);

  React.useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        const localUserStr = localStorage.getItem('user');
        if (localUserStr) {
          const localUser = JSON.parse(localUserStr);
          setRole(localUser.role || 'student');
          setHasGen(!!localUser.gen);
        } else {
           // If no local user, we'll likely need to fetch from firestore, 
           // but for now let's assume it was set during sign-in
           setRole('student');
           setHasGen(false);
        }
      }
      setLoading(false);
    });
  }, []);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    if (adminOnly || window.location.pathname.startsWith('/admin')) {
      return <Navigate to="/admin/login" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // Redirect student to onboarding if gen is missing
  if (role === 'student' && !hasGen && window.location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute adminOnly><Layout key="admin" admin /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="materials" element={<ManageMaterials />} />
          <Route path="assignments" element={<ManageAssignments />} />
          <Route path="exercises" element={<ManageExercises />} />
          <Route path="attendance" element={<ManageAttendance />} />
          <Route path="schedule" element={<ManageSchedule />} />
          <Route path="roadmap" element={<ManageRoadmap />} />
          <Route path="performance" element={<Performance />} />
          <Route path="reports" element={<Reports />} />
        </Route>

        {/* Student Routes */}
        <Route element={<ProtectedRoute><Layout key="student" /></ProtectedRoute>}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/materials" element={<Materials />} />
          <Route path="/assignments" element={<Assignments />} />
          <Route path="/exercises" element={<Exercises />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/roadmap" element={<Roadmap />} />
          <Route path="/grades" element={<Grades />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
