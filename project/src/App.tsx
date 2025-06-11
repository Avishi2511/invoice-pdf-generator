import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
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

// Home page component
const HomePage: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-900">
      <Header 
        mobileMenuOpen={mobileMenuOpen} 
        setMobileMenuOpen={setMobileMenuOpen}
        onNavigateHome={() => navigate('/')}
        onNavigateLogin={() => navigate('/login')}
        onNavigateSignup={() => navigate('/signup')}
        onNavigateDashboard={() => navigate('/dashboard')}
        onNavigateInvoices={() => navigate('/invoices')}
        onNavigateSettings={() => navigate('/settings')}
      />
      <Hero />
      <Features />
      <HowItWorks />
      <FinalCTA />
      <Footer />
    </div>
  );
};

// Wrapper components for navigation
const LoginWrapper: React.FC = () => {
  const navigate = useNavigate();
  return <Login onLogin={() => navigate('/dashboard')} onNavigateHome={() => navigate('/')} />;
};

const SignupWrapper: React.FC = () => {
  const navigate = useNavigate();
  return <Signup onSignup={() => navigate('/dashboard')} onNavigateHome={() => navigate('/')} />;
};

const DashboardWrapper: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Dashboard 
      onLogout={() => navigate('/')} 
      onNavigateToInvoices={() => navigate('/invoices')} 
      onNavigateToSettings={() => navigate('/settings')}
      onNavigateToHome={() => navigate('/')}
    />
  );
};

const InvoicePageWrapper: React.FC = () => {
  const navigate = useNavigate();
  return (
    <InvoicePage 
      onLogout={() => navigate('/')} 
      onNavigateToDashboard={() => navigate('/dashboard')} 
      onNavigateToSettings={() => navigate('/settings')}
      onNavigateToHome={() => navigate('/')}
    />
  );
};

const AccountSettingsWrapper: React.FC = () => {
  const navigate = useNavigate();
  return (
    <AccountSettings 
      onLogout={() => navigate('/')} 
      onNavigateToDashboard={() => navigate('/dashboard')}
      onNavigateToInvoices={() => navigate('/invoices')}
      onNavigateHome={() => navigate('/')}
    />
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginWrapper />} />
        <Route path="/signup" element={<SignupWrapper />} />
        <Route path="/dashboard" element={<DashboardWrapper />} />
        <Route path="/invoices" element={<InvoicePageWrapper />} />
        <Route path="/settings" element={<AccountSettingsWrapper />} />
        {/* Redirect any unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;