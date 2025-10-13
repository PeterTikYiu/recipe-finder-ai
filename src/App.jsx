import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import {
  HomePage,
  FavoritesPage,
  CalculatorPage,
  NotFoundPage,
} from './pages';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import ProfilePage from './pages/Profile';
import RecommendedPage from './pages/Recommended';
import PreferencesWizard from './pages/PreferencesWizard';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<HomePage />} />
              <Route path="favorites" element={<FavoritesPage />} />
              <Route path="calculator" element={<CalculatorPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="onboarding" element={<PreferencesWizard />} />
              <Route path="recommended" element={<RecommendedPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
