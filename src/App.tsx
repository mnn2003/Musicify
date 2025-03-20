import React, { useEffect, Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import { useAuthStore } from './store/authStore';
import { usePlaylistStore } from './store/playlistStore';
import LoadingSpinner from './components/LoadingSpinner'; // A reusable loading spinner component
import ErrorBoundary from './components/ErrorBoundary'; // A reusable error boundary component

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/HomePage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const PlaylistPage = lazy(() => import('./pages/PlaylistPage'));
const LibraryPage = lazy(() => import('./pages/LibraryPage'));
const LikedSongsPage = lazy(() => import('./pages/LikedSongsPage'));
const RecentlyPlayedPage = lazy(() => import('./pages/RecentlyPlayedPage'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));

function App() {
  const { checkAuth, isAuthenticated, isLoading: isAuthLoading } = useAuthStore();
  const { fetchUserData, isLoading: isUserDataLoading } = usePlaylistStore();

  // Check for stored auth on app load
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Fetch user data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserData();
    }
  }, [isAuthenticated, fetchUserData]);

  // Protect routes that require authentication
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (isAuthLoading || isUserDataLoading) {
      return <LoadingSpinner />;
    }
    return isAuthenticated ? children : <Navigate to="/login" />;
  };

  return (
    <HashRouter>
      <ErrorBoundary>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Routes */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<HomePage />} />
              <Route
                path="search"
                element={
                  <ProtectedRoute>
                    <SearchPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="library"
                element={
                  <ProtectedRoute>
                    <LibraryPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="playlist/:id"
                element={
                  <ProtectedRoute>
                    <PlaylistPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="liked-songs"
                element={
                  <ProtectedRoute>
                    <LikedSongsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="recently-played"
                element={
                  <ProtectedRoute>
                    <RecentlyPlayedPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="category/:id"
                element={
                  <ProtectedRoute>
                    <CategoryPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Fallback Route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </HashRouter>
  );
}

export default App;