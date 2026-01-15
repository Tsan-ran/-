
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Import from './pages/Import';
import EntryEditor from './pages/EntryEditor';
import RecordList from './pages/RecordList';
import Gallery from './pages/Gallery';
import Settings from './pages/Settings';
import { db } from './services/db';
import { Taxon } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('import');
  const [isInitialized, setIsInitialized] = useState(false);
  const [selectedTaxonForEdit, setSelectedTaxonForEdit] = useState<Taxon | null>(null);

  useEffect(() => {
    const index = db.getTaxonIndex();
    if (index.length > 0) setActiveTab('add');
    else setActiveTab('import');
    setIsInitialized(true);
  }, []);

  const handleEdit = (taxon: Taxon) => {
    setSelectedTaxonForEdit(taxon);
    setActiveTab('add');
  };

  const handleTabChange = (tab: string) => {
    if (tab !== 'add') setSelectedTaxonForEdit(null);
    setActiveTab(tab);
  };

  if (!isInitialized) return null;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard onNavigate={handleTabChange} />;
      case 'import': return <Import onNavigate={handleTabChange} />;
      case 'add': return <EntryEditor onNavigate={handleTabChange} initialTaxon={selectedTaxonForEdit} />;
      case 'list': return <RecordList onEdit={handleEdit} />;
      case 'gallery': return <Gallery onNavigate={handleTabChange} />;
      case 'settings': return <Settings />;
      default: return <Dashboard onNavigate={handleTabChange} />;
    }
  };

  return (
    <Layout activeTab={activeTab} onNavigate={handleTabChange}>
      {renderContent()}
    </Layout>
  );
};

export default App;
