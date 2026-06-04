import React from 'react';

export default function BallTimeline({ events = [], currentOver }) {
  const overEvs = events.filter(e => e.overNumber === currentOver);

  return (
    <div style={{ background: '#111', padding: '12px', borderRadius: '8px', border: '1px solid #222', marginTop: '15px' }}>
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', overflowX: 'auto', marginBottom: '8px' }}>
        <span style={{ color: '#555', fontSize: '11px', fontWeight: 'bold' }}>THIS OVER:</span>
        {overEvs.map(e => {
          let lbl = e.runsScored; let bg = '#252525';
          if (e.isWicket || e.wicket) { lbl = 'W'; bg = '#d32f2f'; }
          else if (e.extraType === 'WIDE' || e.extraType === 'NO_BALL') { lbl = e.extraType==='WIDE'?'WD':'NB'; bg = '#b8860b'; }
          else if (e.runsScored===4 || e.runsScored===6) bg = '#1b5e20';
          return <div key={e.id} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '26px', height: '26px', borderRadius: '50%', background: bg, fontSize: '11px', fontWeight: 'bold', flexShrink: 0 }}>{lbl}</div>;
        })}
      </div>
      <div style={{ maxHeight: '80px', overflowY: 'auto', borderTop: '1px solid #222', paddingTop: '6px' }}>
        {[...events].reverse().slice(0, 3).map(e => {
          let txt = `scores ${e.runsScored} run(s).`;
          if (e.isWicket || e.wicket) txt = `🔴 OUT! Wicket falls down!`;
          else if (e.runsScored === 4) txt = `🔥 FOUR hits through the gap!`;
          else if (e.runsScored === 6) txt = `🚀 SIX! Clear over the boundary rope!`;
          return (
            <div key={e.id} style={{ fontSize: '12px', color: '#aaa', padding: '2px 0' }}>
              <strong style={{ color: '#e3b505' }}>{e.overNumber}.{e.ballNumber}</strong> {txt}
            </div>
          );
        })}
      </div>
    </div>
  );
}
