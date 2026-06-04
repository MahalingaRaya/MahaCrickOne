import React from 'react';

export default function AdminDashboard({ tName, setTName, sName, setSName, pName, setPName, selTId, setSelTId, teams, t1Id, setT1Id, t2Id, setT2Id, mOvers, setMOvers, executeTeamRegistration, executePlayerDraft, executeMatchScheduling }) {
  const sel = { flex: 1, padding: '12px', borderRadius: '5px', background: '#111', color: '#fff', border: '1px solid #333' };
  const inp = { flex: 2, padding: '12px', borderRadius: '5px', border: 'none', background: '#222', color: '#fff' };

  return (
    <div>
      <div style={{ background: '#111', padding: '20px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #333' }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#e3b505' }}>1. Register Franchise Team</h3>
        <form onSubmit={executeTeamRegistration} style={{ display: 'flex', gap: '10px' }}>
          <input type="text" placeholder="Franchise Name" value={tName} onChange={e => setTName(e.target.value)} required style={inp} />
          <input type="text" placeholder="Short (e.g. RCB)" value={sName} onChange={e => setSName(e.target.value)} required style={{ ...inp, flex: 1 }} />
          <button type="submit" style={{ padding: '12px 20px', background: '#fff', color: '#000', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>Save</button>
        </form>
      </div>
      <div style={{ background: '#111', padding: '20px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #333' }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#e3b505' }}>2. Draft Player to Roster</h3>
        <form onSubmit={executePlayerDraft}>
          <input type="text" placeholder="Player Name" value={pName} onChange={e => setPName(e.target.value)} required style={{ ...inp, display: 'block', width: '100%', marginBottom: '10px' }} />
          <div style={{ display: 'flex', gap: '10px' }}>
            <select value={selTId} onChange={e => setSelTId(e.target.value)} required style={sel}>
              <option value="" disabled>Select Team Lineup</option>
              {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <button type="submit" style={{ padding: '12px 20px', background: '#fff', color: '#000', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>Draft</button>
          </div>
        </form>
      </div>
      <div style={{ background: '#111', padding: '20px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #333' }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#e3b505' }}>3. Schedule Professional Fixture</h3>
        <form onSubmit={executeMatchScheduling} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <select value={t1Id} onChange={e => setT1Id(e.target.value)} style={sel}>
              <option value="" disabled>Select Team 1</option>
              {teams.map(t => <option key={t.id} value={t.id}>{t.shortName}</option>)}
            </select>
            <span style={{ fontWeight: 'bold', color: '#777' }}>VS</span>
            <select value={t2Id} onChange={e => setT2Id(e.target.value)} style={sel}>
              <option value="" disabled>Select Team 2</option>
              {teams.map(t => <option key={t.id} value={t.id}>{t.shortName}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <select value={mOvers} onChange={e => setMOvers(e.target.value)} style={sel}>
              <option value="1">Custom 1-Over Match</option>
              <option value="2">Custom 2-Over Match</option>
              <option value="5">T5 Match (5 Overs)</option>
              <option value="20">T20 Match (20 Overs)</option>
            </select>
            <button type="submit" style={{ padding: '12px 20px', background: '#e3b505', color: '#000', border: 'none', borderRadius: '5px', fontWeight: 'bold', width: '100%', cursor: 'pointer' }}>Create Match</button>
          </div>
        </form>
      </div>
    </div>
  );
}
