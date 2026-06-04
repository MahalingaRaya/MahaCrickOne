import React from 'react';

export default function Scoreboard({ activeMatch, currentInnings, inn1Runs, inn1Wickets, inn1Balls, inn2Runs, inn2Wickets, inn2Balls, displayRuns, displayWickets, calcOvers, calcBalls, strikerRuns, strikerBallsFaced, strikerSR, bowlerWickets, bowlerRunsConceded, bowlerLegalBalls, bowlerEcon, thisOverEvents, activeBatter, activeBowler, onSwitchInnings }) {
  
  const matchMaxOvers = activeMatch ? parseInt(activeMatch.totalOvers) : 20;
  const matchMaxBalls = matchMaxOvers * 6;
  const isMatchOver = currentInnings === 2 && (inn2Runs >= inn1Runs + 1 || inn2Balls >= matchMaxBalls || inn2Wickets >= 10);

  return (
    <div style={{ background: '#111', borderRadius: '10px', border: '1px solid #333', overflow: 'hidden', marginBottom: '20px' }}>
      
      {/* Target Tracker Header Banner */}
      {currentInnings === 2 && (
        <div style={{ background: '#e3b505', color: '#000', padding: '12px', textAlign: 'center', fontWeight: 'bold', fontSize: '15px' }}>
          {isMatchOver ? "🏁 MATCH CONCLUDED" : `🎯 TARGET: ${inn1Runs + 1} | Need ${ (inn1Runs + 1) - inn2Runs } runs in ${ matchMaxBalls - inn2Balls } balls`}
        </div>
      )}

      {/* Primary Broadcast Header */}
      <div style={{ padding: '25px 20px', textAlign: 'center', background: 'linear-gradient(135deg, #1f1f1f 0%, #0a0a0a 100%)', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '12px', right: '15px', color: '#d32f2f', fontWeight: 'bold', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '8px', height: '8px', backgroundColor: '#d32f2f', borderRadius: '50%' }}></div> LIVE
        </div>
        <div style={{ fontSize: '14px', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>
          {activeMatch ? `${activeMatch.team1?.shortName} vs ${activeMatch.team2?.shortName} (${matchMaxOvers} Ov)` : "No Active Match Selected"}
        </div>
        <div style={{ fontSize: '72px', fontWeight: '900', color: '#fff', lineHeight: '1', margin: '12px 0' }}>
          {displayRuns}<span style={{ color: '#666', fontSize: '44px' }}>/{displayWickets}</span>
        </div>
        <div style={{ fontSize: '16px', color: '#e3b505', fontWeight: 'bold' }}>
          OVER: <span style={{ color: '#fff' }}>{calcOvers}.{calcBalls}</span>
          <span style={{ margin: '0 12px', color: '#444' }}>|</span>
          INNINGS: <span style={{ color: '#fff' }}>{currentInnings}</span>
        </div>
        
        {currentInnings === 1 && (calcOvers >= matchMaxOvers || displayWickets >= 10) && (
          <button onClick={onSwitchInnings} style={{ marginTop: '15px', padding: '8px 18px', background: '#e3b505', color: '#000', border: 'none', borderRadius: '4px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>
            Declare Innings & Set Target ➔
          </button>
        )}
      </div>

      {/* Live Match Summary Cards */}
      <div style={{ background: '#161616', padding: '15px', borderTop: '1px solid #252525' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #252525' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ color: '#e3b505' }}>🏏</span><span style={{ fontWeight: 'bold', color: '#fff' }}>{activeBatter ? activeBatter.name : 'Striker'} *</span></div>
          <div style={{ display: 'flex', gap: '15px', color: '#aaa', fontSize: '14px' }}><span><strong style={{ color: '#fff', fontSize: '16px' }}>{strikerRuns}</strong> ({strikerBallsFaced})</span><span>SR: {strikerSR}</span></div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span>⚾</span><span style={{ fontWeight: 'bold', color: '#fff' }}>{activeBowler ? activeBowler.name : 'Bowler'}</span></div>
          <div style={{ display: 'flex', gap: '15px', color: '#aaa', fontSize: '14px' }}><span><strong style={{ color: '#fff', fontSize: '16px' }}>{bowlerWickets}</strong>-{bowlerRunsConceded}</span><span>Ov: {Math.floor(bowlerLegalBalls/6)}.{bowlerLegalBalls%6}</span><span>ECO: {bowlerEcon}</span></div>
        </div>
      </div>

      {/* Ball-by-Ball Timeline Ticker */}
      <div style={{ background: '#0d0d0d', padding: '12px 15px', borderTop: '1px solid #222', display: 'flex', alignItems: 'center', gap: '12px', overflowX: 'auto' }}>
        <span style={{ color: '#666', fontSize: '11px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>THIS OVER:</span>
        <div style={{ display: 'flex', gap: '6px' }}>
          {thisOverEvents.map(e => {
            let d = e.runs, bg = '#252525', tc = '#fff';
            if (e.wicket) { d = 'W'; bg = '#d32f2f'; }
            else if (e.extraType === 'WIDE') { d = 'WD'; bg = '#b8860b'; }
            else if (e.extraType === 'NO_BALL') { d = 'NB'; bg = '#b8860b'; }
            else if (e.runs === 4) { bg = '#1b5e20'; }
            else if (e.runs === 6) { bg = '#1b5e20'; tc = '#e3b505'; }
            return <div key={e.id} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '30px', height: '30px', borderRadius: '50%', background: bg, color: tc, fontSize: '13px', fontWeight: 'bold', flexShrink: 0 }}>{d}</div>;
          })}
        </div>
      </div>
    </div>
  );
}
