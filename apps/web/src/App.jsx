import React from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';

import { Toaster } from '@/components/ui/sonner';
import ScrollToTop from './components/ScrollToTop.jsx';

import { AuthProvider } from './contexts/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import HomePage from './pages/HomePage.jsx';
import BrowsePage from './pages/BrowsePage.jsx';
import ItemDetailPage from './pages/ItemDetailPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import UserDashboardPage from './pages/UserDashboardPage.jsx';
import MyListingsPage from './pages/MyListingsPage.jsx';
import ListingFormPage from './pages/ListingFormPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import PaymentMethodsPage from './pages/PaymentMethodsPage.jsx';
import HelpSupportPage from './pages/HelpSupportPage.jsx';
import MyRentalsPage from './pages/MyRentalsPage.jsx';
import FavoritesPage from './pages/FavoritesPage.jsx';
import ChatPage from './pages/ChatPage.jsx';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage.jsx';
import TermsOfServicePage from './pages/TermsOfServicePage.jsx';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ScrollToTop />

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/browse" element={<BrowsePage />} />
          <Route path="/items/:id" element={<ItemDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsOfServicePage />} />
          <Route path="/help" element={<HelpSupportPage />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <UserDashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-listings"
            element={
              <ProtectedRoute>
                <MyListingsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-rentals"
            element={
              <ProtectedRoute>
                <MyRentalsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/create-listing"
            element={
              <ProtectedRoute>
                <ListingFormPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/edit-listing/:id"
            element={
              <ProtectedRoute>
                <ListingFormPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/payment-methods"
            element={
              <ProtectedRoute>
                <PaymentMethodsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/favorites"
            element={
              <ProtectedRoute>
                <FavoritesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="*"
            element={
              <div className="min-h-[100dvh] flex items-center justify-center bg-background">
                <div className="text-center">
                  <h1 className="text-6xl font-bold text-primary mb-4 font-serif">
                    404
                  </h1>
                  <p className="text-xl text-muted-foreground mb-6">
                    Página não encontrada
                  </p>
                  <a href="/" className="text-primary font-medium hover:underline">
                    Voltar para o início
                  </a>
                </div>
              </div>
            }
          />
        </Routes>

        <Toaster />
      </AuthProvider>
    </Router>
  );
}

export default App;
