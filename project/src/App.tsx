import React, { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import FinalCTA from './components/FinalCTA';
import Footer from './components/Footer';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import InvoicePage from './components/InvoicePage';
import AccountSettings from './components/AccountSettings';

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('home'); // 'home', 'login', 'signup', 'dashboard', 'invoices', 'settings'

  // Simple routing for demo purposes
  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return <Login onLogin={() => setCurrentPage('dashboard')} />;
      case 'signup':
        return <Signup onSignup={() => setCurrentPage('dashboard')} />;
      case 'dashboard':
        return (
          <Dashboard 
            onLogout={() => setCurrentPage('home')} 
            onNavigateToInvoices={() => setCurrentPage('invoices')} 
            onNavigateToSettings={() => setCurrentPage('settings')}
            onNavigateToHome={() => setCurrentPage('home')}
          />
        );
      case 'invoices':
        return (
          <InvoicePage 
            onLogout={() => setCurrentPage('home')} 
            onNavigateToDashboard={() => setCurrentPage('dashboard')} 
            onNavigateToSettings={() => setCurrentPage('settings')}
            onNavigateToHome={() => setCurrentPage('home')}
          />
        );
      case 'settings':
        return (
          <AccountSettings 
            onLogout={() => setCurrentPage('home')} 
            onNavigateToDashboard={() => setCurrentPage('dashboard')}
            onNavigateToInvoices={() => setCurrentPage('invoices')}
            onNavigateHome={() => setCurrentPage('home')}
          />
        );
      default:
        return (
          <div className="min-h-screen bg-gray-900">
            <Header 
              mobileMenuOpen={mobileMenuOpen} 
              setMobileMenuOpen={setMobileMenuOpen}
              onNavigateHome={() => setCurrentPage('home')}
              onNavigateLogin={() => setCurrentPage('login')}
              onNavigateSignup={() => setCurrentPage('signup')}
              onNavigateDashboard={() => setCurrentPage('dashboard')}
              onNavigateInvoices={() => setCurrentPage('invoices')}
              onNavigateSettings={() => setCurrentPage('settings')}
            />
            <Hero />
            <Features />
            <HowItWorks />
            <FinalCTA />
            <Footer />
          </div>
        );
    }
  };

  // Add navigation controls for demo purposes
  React.useEffect(() => {
    const handleNavigation = (e: PopStateEvent) => {
      const path = window.location.pathname;
      if (path === '/login') setCurrentPage('login');
      else if (path === '/signup') setCurrentPage('signup');
      else if (path === '/dashboard') setCurrentPage('dashboard');
      else if (path === '/invoices') setCurrentPage('invoices');
      else if (path === '/settings') setCurrentPage('settings');
      else setCurrentPage('home');
    };

    window.addEventListener('popstate', handleNavigation);
    
    // Handle initial load
    const path = window.location.pathname;
    if (path === '/login') setCurrentPage('login');
    else if (path === '/signup') setCurrentPage('signup');
    else if (path === '/dashboard') setCurrentPage('dashboard');
    else if (path === '/invoices') setCurrentPage('invoices');
    else if (path === '/settings') setCurrentPage('settings');

    return () => window.removeEventListener('popstate', handleNavigation);
  }, []);

  // Only render the page, no demo navigation
  return renderPage();
}

export default App;