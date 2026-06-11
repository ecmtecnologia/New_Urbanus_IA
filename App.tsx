
import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginModule from './components/LoginModule';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ProcessList from './components/ProcessList';
import GISModule from './components/GISModule';
import VirtualAnalyst from './components/VirtualAnalyst';
import DatabaseSchema from './components/DatabaseSchema';
import FamilyManager from './components/FamilyManager';
import SecurityModule from './components/SecurityModule';
import ConflictModule from './components/ConflictModule';
import ExportModule from './components/ExportModule';
import TeamDashboard from './components/TeamDashboard';
import LegislationModule from './components/LegislationModule';
import TerritoryManager from './components/TerritoryManager';
import RuralModule from './components/RuralModule';
import UserManagement from './components/UserManagement';
import GEDModule from './components/GEDModule';

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedProcessId, setSelectedProcessId] = useState<string | null>(null);

  if (!isAuthenticated) {
    return <LoginModule />;
  }

  const handleNavigateToProcess = (id: string, tab: string = 'analyst') => {
    setSelectedProcessId(id);
    setActiveTab(tab);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'processes':
        return <ProcessList onAnalyze={(id) => handleNavigateToProcess(id, 'analyst')} onViewMap={(id) => handleNavigateToProcess(id, 'gis')} />;
      case 'ged':
        return <GEDModule />;
      case 'territory':
        return <TerritoryManager />;
      case 'rural':
        return <RuralModule />;
      case 'gis':
        return <GISModule initialProcessId={selectedProcessId} />;
      case 'analyst':
        return <VirtualAnalyst initialProcessId={selectedProcessId} />;
      case 'conflicts':
        return <ConflictModule />;
      case 'legislation':
        return <LegislationModule />;
      case 'export':
        return <ExportModule />;
      case 'team':
        return <TeamDashboard />;
      case 'users':
        return <UserManagement />;
      case 'portal':
        return <FamilyManager onCancel={() => setActiveTab('processes')} />;
      case 'security':
        return <SecurityModule />;
      case 'database':
        return <DatabaseSchema />;
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-slate-400">Módulo em desenvolvimento...</p>
          </div>
        );
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
