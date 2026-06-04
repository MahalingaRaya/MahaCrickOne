import React from 'react';

export default function ScoringPad({ matches, players, activeMatchId, setActiveMatchId, batterId, setBatterId, bowlerId, setBowlerId, isReadyToScore, onScoreBall, onUndo, hasEvents }) {
  
  const btnStyle = { flex: 1, padding: '12px 0', backgroundColor: '#252525', color: '#ccc', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' };
  const runStyle = { padding: '20px', fontSize: '24px', fontWeight: 'bold', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' };
  const selStyle = { flex: 1, padding: '12px', borderRadius: '5px', background: '#111', color: '#fff', border: '1px solid #333' };

  return (
    <div style={{ background: '#111', padding: '15px', borderRadius: '10px', border: '1px solid #222' }}>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <select value={activeMatchId} onChange={e => setActiveMatchId(e.target.value)} style={selStyle}>
          <option value="" disabled>Active Match</option>
          {matches.map(m => <option key={m.id} value={m.id}>{m.team1?.shortName} v {m.team2?.shortName}</option>)}
        </select>
        <select value={batterId} onChange={e => setBatterId(e.target.value)} style={selStyle}>
          <option value="" disabled>Striker</option>
          {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select value={bowlerId} onChange={e => setBowlerId(e.target.value)} style={selStyle}>
          <option value="" disabled>Bowler</option>
          {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', opacity: isReadyToScore ? 1 : 0.2, pointerEvents: isReadyToScore ? 'auto' : 'none' }}>
        <button onClick={() => onScoreBall(0, false, 'WIDE')} style={btnStyle}>WD</button>
        <button onClick={() => onScoreBall(0, false, 'NO_BALL')} style={btnStyle}>NB</button>
        <button onClick={() => onScoreBall(1, false, 'BYE')} style={btnStyle}>B</button>
        <button onClick={() => onScoreBall(1, false, 'LEG_BYE')} style={btnStyle}>LB</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', opacity: isReadyToScore ? 1 : 0.2, pointerEvents: isReadyToScore ? 'auto' : 'none' }}>
        {[0, 1, 2, 3, 4, 6].map(r => (
          <button key={r} onClick={() => onScoreBall(r)} style={{ ...runStyle, background: r === 4 || r === 6 ? '#1b5e20' : '#333' }}>{r}</button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: '10px', opacity: isReadyToScore ? 1 : 0.2, pointerEvents: isReadyToScore ? 'auto' : 'none' }}>
        <button onClick={() => onScoreBall(0, true)} style={{ flex: 2, padding: '18px', fontSize: '18px', fontWeight: 'bold', background: '#d32f2f', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>WICKET</button>
        <button onClick={onUndo} disabled={!hasEvents} style={{ flex: 1, padding: '18px', fontSize: '16px', fontWeight: 'bold', background: '#444', color: '#fff', border: 'none', borderRadius: '8px', cursor: hasEvents ? 'pointer' : 'not-allowed' }}>UNDO</button>
      </div>
    </div>
  );
}
