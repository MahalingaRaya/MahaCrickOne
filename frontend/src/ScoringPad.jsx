import React from 'react';

export default function ScoringPad({ mId, setMId, batId, setBatId, bwlId, setBwlId, matches, filteredBatters, filteredBowlers, ready, pushBallEvent, executeUndoCommand, events }) {
  const btn = { flex: 1, padding: '12px 0', backgroundColor: '#252525', color: '#ccc', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' };
  const pad = { padding: '20px', fontSize: '24px', fontWeight: 'bold', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' };
  const sel = { flex: 1, padding: '12px', borderRadius: '5px', background: '#111', color: '#fff', border: '1px solid #333' };

  return (
    <div style={{ background: '#111', padding: '15px', borderRadius: '10px', border: '1px solid #222' }}>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <select value={mId} onChange={e => setMId(e.target.value)} style={sel}>
          <option value="" disabled>Active Match</option>
          {matches.map(m => <option key={m.id} value={m.id}>{m.team1?.shortName} v {m.team2?.shortName}</option>)}
        </select>
        <select value={batId} onChange={e => setBatId(e.target.value)} style={sel}>
          <option value="">Striker</option>
          {filteredBatters.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select value={bwlId} onChange={e => setBwlId(e.target.value)} style={sel}>
          <option value="">Bowler</option>
          {filteredBowlers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', opacity: ready ? 1 : 0.2, pointerEvents: ready ? 'auto' : 'none' }}>
        <button onClick={() => pushBallEvent(0, false, 'WIDE')} style={btn}>WD</button><button onClick={() => pushBallEvent(0, false, 'NO_BALL')} style={btn}>NB</button><button onClick={() => pushBallEvent(1, false, 'BYE')} style={btn}>B</button><button onClick={() => pushBallEvent(1, false, 'LEG_BYE')} style={btn}>LB</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', opacity: ready ? 1 : 0.2, pointerEvents: ready ? 'auto' : 'none' }}>
        {[0, 1, 2, 3, 4, 6].map(r => <button key={r} onClick={() => pushBallEvent(r)} style={{ ...pad, background: r === 4 || r === 6 ? '#1b5e20' : '#333' }}>{r}</button>)}
      </div>
      <div style={{ display: 'flex', gap: '10px', marginTop: '10px', opacity: ready ? 1 : 0.2, pointerEvents: ready ? 'auto' : 'none' }}>
        <button onClick={() => pushBallEvent(0, true)} style={{ flex: 2, padding: '18px', fontSize: '18px', fontWeight: 'bold', background: '#d32f2f', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>WICKET</button>
        <button onClick={executeUndoCommand} disabled={!events.length} style={{ flex: 1, padding: '18px', background: '#444', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>UNDO</button>
      </div>
    </div>
  );
}
