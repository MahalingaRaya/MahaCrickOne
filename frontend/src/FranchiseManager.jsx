import { useState } from 'react';

export default function FranchiseManager({ teams, players, matches, onSync }) {
  const safeTeams = Array.isArray(teams) ? teams : [];

  const [tn, setTn] = useState(''); const [sn, setSn] = useState('');
  const [pn, setPn] = useState(''); const [pRole, setPRole] = useState('BATSMAN'); const [tid, setTid] = useState('');
  const [t1, setT1] = useState(''); const [t2, setT2] = useState(''); const [ovs, setOvs] = useState('1'); const [fmt, setFmt] = useState('T1');

  const box = { background: '#111', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #333' };
  const inp = { width: '100%', padding: '10px', boxSizing: 'border-box', background: '#222', color: '#fff', border: 'none', borderRadius: '4px', marginBottom: '10px' };

  // Delete team functionality
  const deleteTeam = async (id) => {
    try {
      await fetch(`https://mahacrickone.onrender.com/api/teams/${id}`, { method: 'DELETE' });
      onSync();
    } catch (err) {
      alert("Error deleting team. Check backend.");
    }
  };

  const handleTeam = async (e) => {
    e.preventDefault();
    await fetch('https://mahacrickone.onrender.com/api/teams', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: tn, shortName: sn }) });
    setTn(''); setSn(''); onSync();
  };

  const handlePlayer = async (e) => {
    e.preventDefault();
    await fetch('https://mahacrickone.onrender.com/api/players', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: pn, role: pRole, team: { id: parseInt(tid) } }) });
    setPn(''); onSync();
  };

  const handleMatch = async (e) => {
    e.preventDefault();
    if(t1 === t2) return alert("Select distinct squads!");

    // THE FIX: 100% matched to your Match.java entity
    const payload = {
      team1: { id: parseInt(t1) },
      team2: { id: parseInt(t2) },
      totalOvers: parseInt(ovs),
      matchFormat: fmt,
      status: 'LIVE'
    };

    const res = await fetch('https://mahacrickone.onrender.com/api/matches', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(payload) 
    });

    if (res.ok) {
      onSync(); 
      alert("Fixture Created! Check Live Match tab.");
    } else {
      alert("Database Error: Java backend rejected the Match save.");
    }
  };

  return (
    <div>
      <div style={box}>
        <h3 style={{ color: '#e3b505', margin: '0 0 10px 0' }}>1. Manage Franchises</h3>
        <form onSubmit={handleTeam} style={{ marginBottom: '15px' }}>
          <input type="text" placeholder="Franchise Name" value={tn} onChange={e=>setTn(e.target.value)} required style={inp} />
          <input type="text" placeholder="Short Name (e.g. RCB)" value={sn} onChange={e=>setSn(e.target.value)} required style={inp} />
          <button type="submit" style={{ width: '100%', padding: '10px', background: '#fff', color: '#000', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>Save Team</button>
        </form>
        
        {/* Active Teams List with Delete Option */}
        <div style={{ maxHeight: '150px', overflowY: 'auto', borderTop: '1px solid #333', paddingTop: '10px' }}>
          <span style={{ fontSize: '12px', color: '#aaa', display: 'block', marginBottom: '8px' }}>Active Teams (Click X to delete duplicates):</span>
          {safeTeams.map(t => (
            <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', background: '#222', padding: '8px', marginBottom: '5px', borderRadius: '4px' }}>
              <span>{t.name} ({t.shortName})</span>
              <button type="button" onClick={() => deleteTeam(t.id)} style={{ background: '#d32f2f', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>X</button>
            </div>
          ))}
        </div>
      </div>

      <div style={box}>
        <h3 style={{ color: '#e3b505', margin: '0 0 10px 0' }}>2. Draft Player</h3>
        <form onSubmit={handlePlayer}>
          <input type="text" placeholder="Player Name" value={pn} onChange={e=>setPn(e.target.value)} required style={inp} />
          <select value={pRole} onChange={e=>setPRole(e.target.value)} style={inp}>
            <option value="BATSMAN">Batsman</option><option value="BOWLER">Bowler</option>
          </select>
          <select value={tid} onChange={e=>setTid(e.target.value)} required style={inp}>
            <option value="">Select Franchise Assignment</option>
            {safeTeams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <button type="submit" style={{ width: '100%', padding: '10px', background: '#fff', color: '#000', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>Draft Player</button>
        </form>
      </div>

      <div style={box}>
        <h3 style={{ color: '#e3b505', margin: '0 0 10px 0' }}>3. Schedule Match</h3>
        <form onSubmit={handleMatch}>
          <select value={t1} onChange={e=>setT1(e.target.value)} required style={inp}>
            <option value="">Team A</option>
            {safeTeams.map(t => <option key={t.id} value={t.id}>{t.shortName}</option>)}
          </select>
          <select value={t2} onChange={e=>setT2(e.target.value)} required style={inp}>
            <option value="">Team B</option>
            {safeTeams.map(t => <option key={t.id} value={t.id}>{t.shortName}</option>)}
          </select>
          <select value={fmt} onChange={e=>{ setFmt(e.target.value); setOvs(e.target.value==='T1'?'1':e.target.value==='T5'?'5':'20'); }} style={inp}>
            <option value="T1">1 Over Match</option><option value="T5">5 Overs Match</option><option value="T20">20 Overs Match</option>
          </select>
          <button type="submit" style={{ width: '100%', padding: '12px', background: '#e3b505', color: '#000', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>Launch Match</button>
        </form>
      </div>
    </div>
  );
}
