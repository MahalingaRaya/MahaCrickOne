import { useState, useEffect } from 'react';
import './App.css';
import FranchiseManager from './FranchiseManager.jsx';

export default function App() {
  const [view, setView] = useState('admin');
  const [teams, setTeams] = useState([]); 
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]); 

  useEffect(() => { syncData(); }, []);

  const syncData = () => {
    fetch('https://mahacrickone.onrender.com/api/teams').then(r=>r.json()).then(setTeams).catch(() => {});
    fetch('https://mahacrickone.onrender.com/api/players').then(r=>r.json()).then(setPlayers).catch(() => {});
    fetch('https://mahacrickone.onrender.com/api/matches').then(r=>r.json()).then(setMatches).catch(() => {});
  };

  return (
    <div style={{ backgroundColor: '#050505', minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif' }}>
      <header style={{ backgroundColor: '#111', padding: '15px', textAlign: 'center', borderBottom: '2px solid #e3b505' }}>
        <h1 style={{ margin: 0, color: '#e3b505', fontSize: '22px' }}>🏏 MAHA CRICKONE PRO</h1>
      </header>
      
      <div style={{ display: 'flex', justifyContent: 'center', margin: '15px 0', gap: '10px' }}>
        <button onClick={() => setView('match')} style={{ padding: '8px 20px', borderRadius: '30px', border: 'none', fontWeight: 'bold', backgroundColor: view==='match'?'#e3b505':'#222', color: view==='match'?'#000':'#fff' }}>Live Match</button>
        <button onClick={() => setView('admin')} style={{ padding: '8px 20px', borderRadius: '30px', border: 'none', fontWeight: 'bold', backgroundColor: view==='admin'?'#fff':'#222', color: view==='admin'?'#000':'#fff' }}>Franchise Admin</button>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '0 10px' }}>
        {view === 'match' && (
          <div style={{ textAlign: 'center', padding: '40px', background: '#111', borderRadius: '12px' }}>
            <h2 style={{ color: '#e3b505' }}>Scoreboard Offline</h2>
            <p>We are testing the Admin panel first to prevent crashes!</p>
          </div>
        )}
        {view === 'admin' && (
          <FranchiseManager teams={teams} players={players} matches={matches} onSync={syncData} />
        )}
      </div>
    </div>
  );
}
