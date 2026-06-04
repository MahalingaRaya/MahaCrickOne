import { useState } from 'react';

export default function FranchiseManager({ teams, players, matches, onSync }) {
  const [tn, setTn] = useState(''); const [sn, setSn] = useState('');
  const [pn, setPn] = useState(''); const [pRole, setPRole] = useState('BATSMAN'); const [tid, setTid] = useState('');
  const [t1, setT1] = useState(''); const [t2, setT2] = useState(''); const [ovs, setOvs] = useState('20'); const [fmt, setFmt] = useState('T20');

  const formBox = { background: '#111', padding: '15px', borderRadius: '8px', border: '1px solid #333', marginBottom: '15px' };
  const inputStyle = { width: '100%', padding: '10px', boxSizing: 'border-box', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '5px', marginBottom: '10px' };

  const addTeam = async (e) => {
    e.preventDefault();
    await fetch('https://mahacrickone.onrender.com/api/teams', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: tn, shortName: sn }) });
    setTn(''); setSn(''); onSync(); alert("Franchise Added!");
  };

  const addPlayer = async (e) => {
    e.preventDefault();
    await fetch('https://mahacrickone.onrender.com/api/players', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: pn, role: pRole, team: { id: parseInt(tid) } }) });
    setPn(''); onSync(); alert("Player Drafted!");
  };

  const startMatch = async (e) => {
    e.preventDefault();
    await fetch('https://mahacrickone.onrender.com/api/matches', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ team1Id: t1, team2Id: t2, totalOvers: parseInt(ovs), matchFormat: fmt, status: 'LIVE' }) });
    onSync(); alert("Match Scheduled!");
  };

  return (
    <div>
      <div style={formBox}>
        <h3 style={{ margin: '0 0 10px 0', color: '#e3b505', fontSize: '15px' }}>1. Franchise Creation</h3>
        <form onSubmit={addTeam}>
          <input type="text" placeholder="Franchise Name" value={tn} onChange={e=>setTn(e.target.value)} required style={inputStyle} />
          <input type="text" placeholder="Short Name (e.g. RCB)" value={sn} onChange={e=>setSn(e.target.value)} required style={inputStyle} />
          <button type="submit" style={{ width: '100%', padding: '10px', background: '#fff', color: '#000', fontWeight: 'bold', border: 'none', borderRadius: '5px' }}>Save Team</button>
        </form>
      </div>

      <div style={formBox}>
        <h3 style={{ margin: '0 0 10px 0', color: '#e3b505', fontSize: '15px' }}>2. Squad Management</h3>
        <form onSubmit={addPlayer}>
          <input type="text" placeholder="Player Name" value={pn} onChange={e=>setPn(e.target.value)} required style={inputStyle} />
          <select value={pRole} onChange={e=>setPRole(e.target.value)} style={inputStyle}>
            <option value="BATSMAN">Batsman</option>
            <option value="BOWLER">Bowler</option>
            <option value="ALL_ROUNDER">All-Rounder</option>
            <option value="WICKET_KEEPER">Wicket Keeper</option>
          </select>
          <select value={tid} onChange={e=>setTid(e.target.value)} required style={inputStyle}>
            <option value="">Assign Franchise</option>
            {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <button type="submit" style={{ width: '100%', padding: '10px', background: '#fff', color: '#000', fontWeight: 'bold', border: 'none', borderRadius: '5px' }}>Draft Player</button>
        </form>
      </div>

      <div style={formBox}>
        <h3 style={{ margin: '0 0 10px 0', color: '#e3b505', fontSize: '15px' }}>3. Match Scheduling Center</h3>
        <form onSubmit={startMatch}>
          <select value={t1} onChange={e=>setT1(e.target.value)} required style={inputStyle}>
            <option value="">Team A (Batting First)</option>
            {teams.map(t => <option key={t.id} value={t.id}>{t.shortName}</option>)}
          </select>
          <select value={t2} onChange={e=>setT2(e.target.value)} required style={inputStyle}>
            <option value="">Team B (Bowling First)</option>
            {teams.map(t => <option key={t.id} value={t.id}>{t.shortName}</option>)}
          </select>
          <select value={fmt} onChange={e=>{ setFmt(e.target.value); setOvs(e.target.value==='T1'?'1':e.target.value==='T5'?'5':e.target.value==='T10'?'10':'20'); }} style={inputStyle}>
            <option value="T1">T1 Format (1 Over)</option>
            <option value="T5">T5 Format (5 Overs)</option>
            <option value="T10">T10 Format (10 Overs)</option>
            <option value="T20">T20 Format (20 Overs)</option>
          </select>
          <button type="submit" style={{ width: '100%', padding: '10px', background: '#e3b505', color: '#000', fontWeight: 'bold', border: 'none', borderRadius: '5px' }}>Initialize Live Fixture</button>
        </form>
      </div>
    </div>
  );
}
