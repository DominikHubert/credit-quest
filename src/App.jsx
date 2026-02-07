import { useState, useEffect } from 'react';
import './App.css';
import LoanSetup from './components/LoanSetup';
import Dashboard from './components/Dashboard';
import { api } from './utils/api';

function App() {
  const [loanProfile, setLoanProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    async function init() {
      const data = await api.loadData();
      if (data && data.profile) {
        setLoanProfile(data.profile);
        // Save checks and extras to simple global state/context if needed, 
        // but for now Dashboard loads them or we pass them down.
        // Actually, Dashboard handles its own state. 
        // In the new architecture, App should likely hold the 'Global State' or we pass it via api calls.
        // Let's stick to the current pattern: Dashboard manages its own extra pieces.
        // Wait, if we use one JSON file, we should probably load everything here?
        // Simpler: App loads profile. Dashboard loads the rest? 
        // Or better: Load EVERYTHING here and pass down.
      }
      setLoading(false);
    }
    init();
  }, []);

  const handleSaveProfile = async (profile) => {
    setLoanProfile(profile);
    // When saving profile, we might want to keep existing checks/extras
    const currentData = await api.loadData() || {};
    await api.saveData({ ...currentData, profile });
  };

  const handleReset = async () => {
    if (confirm('Wirklich alles löschen? Dies entfernt auch alle Fortschritte!')) {
      await api.saveData({}); // Clear DB
      setLoanProfile(null);
      // Force reload to clear dashboard state if needed, or just reset state
      window.location.reload();
    }
  }

  if (loading) {
    return <div className="container" style={{ justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Lade Daten...</div>;
  }

  if (!loanProfile) {
    return <LoanSetup onSave={handleSaveProfile} />;
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '2rem 0' }}>
        <h1 style={{ background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '1.5rem' }}>Credit Quest</h1>
        <button onClick={handleReset} style={{ fontSize: '0.9rem', color: 'var(--text-muted)', background: 'none' }}>Profil Reset</button>
      </div>

      <Dashboard profile={loanProfile} />
    </div>
  );
}

export default App;
