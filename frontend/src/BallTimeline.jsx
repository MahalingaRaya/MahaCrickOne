import React from 'react';

export default function BallTimeline({ events, currentOver }) {
  const overEvs = events.filter(e => e.overNumber === currentOver);

  return (
    <div style={{ background: '#111', padding: '12px', borderRadius: '8px', border: '1px solid #222', marginTop: '15px' }}>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', overflowX: 'auto', marginBottom: '10px' }}>
        <span style={{ color: '#666', fontSize: '11px', fontWeight: 'bold' }}>THIS OVER:</span>
        {overEvs.map(e => {
          let label = e.runsScored; let bg = '#252525'; let tc = '#fff';
          if (e.isWicket) { label = 'W'; bg = '#d32f2f'; }
          else if (e.extraType === 'WIDE') { label = 'WD'; bg = '#b8860b'; }
          else if (e.extraType === 'NO_BALL') { label = 'NB'; bg = '#b8860b'; }
          else if (e.runsScored === 4 || e.runsScored === 6) { bg = '#1b5e20'; if(e.runsScored===6) tc='#e3b505'; }
          return (
            <div key={e.id} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '28px', height: '28px', borderRadius: '50%', background: bg, color: tc, fontSize: '12px', fontWeight: 'bold', flexShrink: 0 }}>
              {label}
            </div>
          );
        })}
      </div>
      
      {/* Dynamic Scrolling Ball-by-Ball Commentary Timeline */}
      <div style={{ maxHeight: '100px', overflowY: 'auto', borderTop: '1px solid #222', paddingTop: '8px' }}>
        {[...events].reverse().slice(0, 3).map(e => {
          let txt = `scores ${e.runsScored} run(s).`;
          if (e.isWicket) txt = `🔴 OUT! Partnership broken!`;
          else if (e.runsScored === 4) txt = `🔥 FOUR! Superb boundary down the ground!`;
          else if (e.runsScored === 6) txt = `🚀 SIX! Massive strike over deep mid-wicket!`;
          return (
            <div key={e.id} style={{ fontSize: '12px', color: '#aaa', padding: '3px 0' }}>
              <strong style={{ color: '#e3b505' }}>{e.overNumber}.{e.ballNumber}</strong> {e.striker?.name || 'Batter'} vs {e.bowler?.name || 'Bowler'} - {txt}
            </div>
          );
        })}
      </div>
    </div>
  );
}
