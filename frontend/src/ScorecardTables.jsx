import React from 'react';

export default function ScorecardTables({ players, events, battingTeamId, bowlingTeamId }) {
  const tableHeadStyle = { color: '#e3b505', padding: '8px', borderBottom: '1px solid #333', textAlign: 'left', fontSize: '13px' };
  const cellStyle = { padding: '8px', borderBottom: '1px solid #222', fontSize: '13px' };

  // Calculate Batting Roster Stats dynamically
  const battingTeamPlayers = players.filter(p => p.team?.id === battingTeamId);
  const bowlingTeamPlayers = players.filter(p => p.team?.id === bowlingTeamId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '10px' }}>
      {/* Batting Performance Ledger */}
      <div style={{ background: '#111', padding: '12px', borderRadius: '8px', border: '1px solid #222' }}>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#fff' }}>🏏 Batting Performance Summary</h4>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={tableHeadStyle}>Batter</th>
              <th style={tableHeadStyle}>R</th>
              <th style={tableHeadStyle}>B</th>
              <th style={tableHeadStyle}>4s</th>
              <th style={tableHeadStyle}>6s</th>
              <th style={tableHeadStyle}>SR</th>
            </tr>
          </thead>
          <tbody>
            {battingTeamPlayers.map(p => {
              const bEvs = events.filter(e => e.striker?.id === p.id);
              const totalRuns = bEvs.reduce((s, e) => (e.extraType==='WIDE'||e.extraType==='BYE'||e.extraType==='LEG_BYE') ? s : s + e.runsScored, 0);
              const totalBalls = bEvs.filter(e => e.extraType !== 'WIDE').length;
              const boundaries4 = bEvs.filter(e => e.runsScored === 4).length;
              const boundaries6 = bEvs.filter(e => e.runsScored === 6).length;
              const strikeRate = totalBalls > 0 ? ((totalRuns / totalBalls) * 100).toFixed(1) : "0.0";
              
              if (bEvs.length === 0) return null;
              return (
                <tr key={p.id}>
                  <td style={cellStyle}>{p.name}</td>
                  <td style={cellStyle}>{totalRuns}</td>
                  <td style={cellStyle}>{totalBalls}</td>
                  <td style={cellStyle}>{boundaries4}</td>
                  <td style={cellStyle}>{boundaries6}</td>
                  <td style={cellStyle}>{strikeRate}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Bowling Performance Ledger */}
      <div style={{ background: '#111', padding: '12px', borderRadius: '8px', border: '1px solid #222' }}>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#fff' }}>⚾ Bowling Attack Metrics</h4>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={tableHeadStyle}>Bowler</th>
              <th style={tableHeadStyle}>O</th>
              <th style={tableHeadStyle}>R</th>
              <th style={tableHeadStyle}>W</th>
              <th style={tableHeadStyle}>ECON</th>
            </tr>
          </thead>
          <tbody>
            {bowlingTeamPlayers.map(p => {
              const blEvs = events.filter(e => e.bowler?.id === p.id);
              const legalDeliveries = blEvs.filter(e => e.extraType!=='WIDE' && e.extraType!=='NO_BALL').length;
              const runsConceded = blEvs.reduce((s, e) => s + e.runsScored + (e.extraType==='WIDE'||e.extraType==='NO_BALL'?1:0), 0);
              const wicketsTaken = blEvs.filter(e => e.isWicket).length;
              const economy = legalDeliveries > 0 ? ((runsConceded / legalDeliveries) * 6).toFixed(1) : "0.0";

              if (blEvs.length === 0) return null;
              return (
                <tr key={p.id}>
                  <td style={cellStyle}>{p.name}</td>
                  <td style={cellStyle}>{Math.floor(legalDeliveries/6)}.{legalDeliveries%6}</td>
                  <td style={cellStyle}>{runsConceded}</td>
                  <td style={cellStyle}>{wicketsTaken}</td>
                  <td style={cellStyle}>{economy}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
