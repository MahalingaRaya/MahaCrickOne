import React from 'react';

export default function Scoreboard({ curMatch, maxOvers, inn, isMatchOver, inn1R, inn2R, inn2B, inn2W, runs, wickets, ovs, bls, actBat, sRuns, sBalls, sSR, actBwl, bWkts, bRuns, bBalls, bEcon, overEvs, players }) {
  return (
    <div style={{ background: '#111', borderRadius: '10px', border: '1px solid #333', overflow: 'hidden', marginBottom: '20px' }}>
      {inn === 2 && (
        <div style={{ background: '#e3b505', color: '#000', padding: '12px', textAlign: 'center', fontWeight: 'bold', fontSize: '15px' }}>
          {isMatchOver ? "🏁 MATCH CONCLUDED" : `🎯 TARGET: ${inn1R + 1} | Need ${(inn1R + 1) - inn2R} runs in ${(maxOvers * 6) - inn2B} balls`}
        </div>
      )}
      <div style={{ padding: '25px 20px', textAlign: 'center', background: 'linear-gradient(135deg, #1f1f1f 0%, #0a0a0a 100%)' }}>
        <div style={{ fontSize: '14px', color: '#aaa', textTransform: 'uppercase', fontWeight: 'bold' }}>
          {curMatch ? `${curMatch.team1?.shortName} vs ${curMatch.team2?.shortName} (${maxOvers} OV)` : "No Match Configured"}
        </div>
        <div style={{ fontSize: '64px', fontWeight: '900', color: '#fff', margin: '12px 0' }}>{runs}<span style={{ color: '#666', fontSize: '44px' }}>/{wickets}</span></div>
        <div style={{ fontSize: '16px', color: '#e3b505', fontWeight: 'bold' }}>OVER: <span style={{ color: '#fff' }}>{ovs}.{bls}</span><span style={{ margin: '0 12px', color: '#444' }}>|</span>INNINGS: <span style={{ color: '#fff' }}>{inn}</span></div>
      </div>
      <div style={{ background: '#161616', padding: '15px', borderTop: '1px solid #252525' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #252525' }}>
          <div><span style={{ color: '#e3b505' }}>Franchise 🏏 </span><span style={{ fontWeight: 'bold', color: '#fff' }}>{actBat ? actBat.name : 'Select Striker'} *</span></div>
          <div style={{ color: '#aaa', fontSize: '14px' }}><span><strong style={{ color: '#fff', fontSize: '16px' }}>{sRuns}</strong> ({sBalls})</span> | SR: {sSR}</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div><span>Bowling ⚾ </span><span style={{ fontWeight: 'bold', color: '#fff' }}>{actBwl ? actBwl.name : 'Select Bowler'}</span></div>
          <div style={{ color: '#aaa', fontSize: '14px' }}><span><strong style={{ color: '#fff', fontSize: '16px' }}>{bWkts}</strong>-{bRuns}</span> | Ov: {Math.floor(bBalls/6)}.{bBalls%6} | ECO: {bEcon}</div>
        </div>
      </div>
      <div style={{ background: '#0d0d0d', padding: '12px 15px', borderTop: '1px solid #222', display: 'flex', gap: '12px', overflowX: 'auto' }}>
        <span style={{ color: '#666', fontSize: '11px', fontWeight: 'bold' }}>THIS OVER:</span>
        <div style={{ display: 'flex', gap: '6px' }}>
          {overEvs.map(e => {
            let d = e.runs, bg = '#252525', tc = '#fff';
            if (e.wicket) { d = 'W'; bg = '#d32f2f'; }
            else if (e.extraType === 'WIDE') { d = 'WD'; bg = '#b8860b'; }
            else if (e.extraType === 'NO_BALL') { d = 'NB'; bg = '#b8860b'; }
            else if (e.runs === 4 || e.runs === 6) { bg = '#1b5e20'; if(e.runs===6) tc='#e3b505'; }
            return <div key={e.id} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '30px', height: '30px', borderRadius: '50%', background: bg, color: tc, fontSize: '13px', fontWeight: 'bold' }}>{d}</div>;
          })}
        </div>
      </div>
    </div>
  );
}
