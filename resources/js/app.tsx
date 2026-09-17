import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import { ContentProvider } from './context/ContentContext';
import HomePage from './pages/HomePage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#fffdf8] flex items-center justify-center p-6 text-center">
          <div className="max-w-md rounded-2xl bg-white p-8 shadow-xl border border-[#d9e1d7]">
            <h2 className="display-font text-2xl font-bold text-[#183a35]">Refreshing View...</h2>
            <p className="mt-3 text-sm text-[#58706a]">
              We noticed a display sync update. Please click below to reset the view.
            </p>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="mt-6 rounded-full bg-[#123f38] px-6 py-3 font-bold text-white shadow hover:bg-[#28745e] transition"
            >
              Reset & Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppRouter() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // Determine current view based on URL route
  if (currentPath.startsWith('/admin/login')) {
    return <AdminLoginPage />;
  }

  if (currentPath.startsWith('/admin')) {
    return <AdminDashboardPage />;
  }

  return <HomePage />;
}

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <ContentProvider>
          <AppRouter />
        </ContentProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
}
