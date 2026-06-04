import React from 'react';

export default function ScorecardTables({ players = [], events = [], battingTeamId, bowlingTeamId, strikerId }) {
  const th = { color: '#e3b505', padding: '8px', borderBottom: '1px solid #333', textAlign: 'left', fontSize: '13px' };
  const td = { padding: '8px', borderBottom: '1px solid #222', fontSize: '13px' };

  const batPlrs = players.filter(p => p.team?.id === battingTeamId);
  const bwlPlrs = players.filter(p => p.team?.id === bowlingTeamId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <div style={{ background: '#111', padding: '12px', borderRadius: '8px', border: '1px solid #222' }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '13px' }}>🏏 Batting Summary</h4>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr><th style={th}>Batter</th><th style={th}>R</th><th style={th}>B</th><th style={th}>SR</th></tr></thead>
          <tbody>
            {batPlrs.map(p => {
              const bEvs = events.filter(e => e.strikerId === p.id || e.striker?.id === p.id);
              if (bEvs.length === 0) return null;
              const r = bEvs.reduce((s, e) => (e.extraType==='WIDE'||e.extraType==='BYE'||e.extraType==='LEG_BYE')?s:s+e.runsScored, 0);
              const b = bEvs.filter(e => e.extraType !== 'WIDE').length;
              return (
                <tr key={p.id}>
                  <td style={td}>{p.name} {strikerId === p.id.toString() ? '*' : ''}</td>
                  <td style={td}>{r}</td><td style={td}>{b}</td>
                  <td style={td}>{b > 0 ? ((r/b)*100).toFixed(1) : "0.0"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div style={{ background: '#111', padding: '12px', borderRadius: '8px', border: '1px solid #222' }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '13px' }}>⚾ Bowling Attack</h4>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr><th style={th}>Bowler</th><th style={th}>O</th><th style={th}>R</th><th style={th}>W</th></tr></thead>
          <tbody>
            {bwlPlrs.map(p => {
              const blEvs = events.filter(e => e.bowlerId === p.id || e.bowler?.id === p.id);
              if (blEvs.length === 0) return null;
              const b = blEvs.filter(e => e.extraType!=='WIDE' && e.extraType!=='NO_BALL').length;
              const r = blEvs.reduce((s, e) => s + e.runsScored + (e.extraType==='WIDE'||e.extraType==='NO_BALL'?1:0), 0);
              return (
                <tr key={p.id}>
                  <td style={td}>{p.name}</td>
                  <td style={td}>{Math.floor(b/6)}.{b%6}</td>
                  <td style={td}>{r}</td>
                  <td style={td}>{blEvs.filter(e => e.isWicket).length}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
