import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './layouts/Layout';

// Pages
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { StudentDashboard } from './pages/StudentDashboard';
import { InternshipExplorer } from './pages/InternshipExplorer';
import { InternshipDetails } from './pages/InternshipDetails';
import { ApplicationsPage } from './pages/ApplicationsPage';
import { SavedInternships } from './pages/SavedInternships';
import { CompareInternships } from './pages/CompareInternships';
import { RecommendationsPage } from './pages/RecommendationsPage';
import { SkillGapPage } from './pages/SkillGapPage';
import { ResumeAssistantPage } from './pages/ResumeAssistantPage';
import { InterviewPrepPage } from './pages/InterviewPrepPage';
import { CareerAdvisorPage } from './pages/CareerAdvisorPage';
import { AIAssistantPage } from './pages/AIAssistantPage';
import { ProgressTrackerPage } from './pages/ProgressTrackerPage';
import { CompanyDashboard } from './pages/CompanyDashboard';
import { CompanyInternshipsPage } from './pages/CompanyInternshipsPage';
import { CompanyApplicantsPage } from './pages/CompanyApplicantsPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminDSAEnginePage } from './pages/AdminDSAEnginePage';
import { AdminAIInsightsPage } from './pages/AdminAIInsightsPage';
import { AdminAnalyticsPage } from './pages/AdminAnalyticsPage';
import { ActivityLogsPage } from './pages/ActivityLogsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SettingsPage } from './pages/SettingsPage';

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    if (role === 'ADMIN') return <Navigate to="/admin-dashboard" replace />;
    if (role === 'COMPANY') return <Navigate to="/company-dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* Public Routes */}
            <Route index element={<LandingPage />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="internships" element={<InternshipExplorer />} />
            <Route path="internships/:id" element={<InternshipDetails />} />

            {/* Student Protected Routes */}
            <Route
              path="dashboard"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="applications"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <ApplicationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="saved"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <SavedInternships />
                </ProtectedRoute>
              }
            />
            <Route
              path="compare"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <CompareInternships />
                </ProtectedRoute>
              }
            />
            <Route
              path="recommendations"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <RecommendationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="skill-gap"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <SkillGapPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="resume-assistant"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <ResumeAssistantPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="interview-prep"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <InterviewPrepPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="career-advisor"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <CareerAdvisorPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="ai-assistant"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <AIAssistantPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="progress"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <ProgressTrackerPage />
                </ProtectedRoute>
              }
            />

            {/* Company Protected Routes */}
            <Route
              path="company-dashboard"
              element={
                <ProtectedRoute allowedRoles={['COMPANY', 'ADMIN']}>
                  <CompanyDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="company-internships"
              element={
                <ProtectedRoute allowedRoles={['COMPANY', 'ADMIN']}>
                  <CompanyInternshipsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="company-applicants"
              element={
                <ProtectedRoute allowedRoles={['COMPANY', 'ADMIN']}>
                  <CompanyApplicantsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="company-analytics"
              element={
                <ProtectedRoute allowedRoles={['COMPANY', 'ADMIN']}>
                  <AdminAnalyticsPage />
                </ProtectedRoute>
              }
            />

            {/* Admin Protected Routes */}
            <Route
              path="admin-dashboard"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin-students"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <CompanyApplicantsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin-companies"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <CompanyDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin-dsa"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDSAEnginePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin-ai"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminAIInsightsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin-analytics"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminAnalyticsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin-activity-logs"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <ActivityLogsPage />
                </ProtectedRoute>
              }
            />

            {/* Shared Protected Routes */}
            <Route
              path="notifications"
              element={
                <ProtectedRoute>
                  <NotificationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="interviews"
              element={
                <ProtectedRoute>
                  <InterviewPrepPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />

            {/* Catch All Redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
