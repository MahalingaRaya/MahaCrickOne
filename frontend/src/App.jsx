import { useState, useEffect } from 'react';
import './App.css';
import FranchiseManager from './components/FranchiseManager';
import ScorecardTables from './components/ScorecardTables';
import BallTimeline from './components/BallTimeline';

export default function App() {
  const [view, setView] = useState('match');
  const [teams, setTeams] = useState([]); const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]); const [events, setEvents] = useState([]);
  
  // Selection Context
  const [mId, setMId] = useState('');
  const [strikerId, setStrikerId] = useState(''); const [nonStrikerId, setNonStrikerId] = useState('');
  const [bowlerId, setBowlerId] = useState(''); const [inn, setInn] = useState(1);

  useEffect(() => { syncData(); }, []);
  useEffect(() => { if (mId) fetchEvents(); }, [mId]);

  const syncData = () => {
    fetch('https://mahacrickone.onrender.com/api/teams').then(r=>r.json()).then(setTeams);
    fetch('https://mahacrickone.onrender.com/api/players').then(r=>r.json()).then(setPlayers);
    fetch('https://mahacrickone.onrender.com/api/matches').then(r=>r.json()).then(d => { setMatches(d); if(d.length > 0 && !mId) setMId(d[d.length-1].id.toString()); });
  };

  const fetchEvents = () => {
    fetch(`https://mahacrickone.onrender.com/api/events/match/${mId}`).then(r=>r.json()).then(setEvents);
  };

  const currentMatch = matches.find(m => m.id.toString() === mId);
  const totalLimitOvers = currentMatch ? currentMatch.totalOvers : 20;

  // Compute Innings Calculations
  const innEvents = events.filter(e => inn === 1 ? e.inningsNumber === 1 : e.inningsNumber === 2);
  const totalRuns = innEvents.reduce((s, e) => s + e.runsScored + (e.extraType==='WIDE'||e.extraType==='NO_BALL'?1:0), 0);
  const totalWickets = innEvents.filter(e => e.isWicket).length;
  const legalBalls = innEvents.filter(e => e.extraType!=='WIDE' && e.extraType!=='NO_BALL').length;
  const currentOver = Math.floor(legalBalls / 6);
  const currentBall = legalBalls % 6;

  const targetRuns = inn === 2 ? (events.filter(e => e.inningsNumber === 1).reduce((s, e) => s + e.runsScored + (e.extraType==='WIDE'||e.extraType==='NO_BALL'?1:0), 0) + 1) : 0;

  // Automatic Strike Rotation logic
  const handleScoreInput = async (runs, isWkt = false, extra = 'NONE') => {
    if (legalBalls >= totalLimitOvers * 6) return alert("Innings completed!");

    let nextStriker = strikerId;
    let nextNonStriker = nonStrikerId;

    // Standard run value rotation check
    if (!isWkt && (runs === 1 || runs === 3)) {
      nextStriker = nonStrikerId;
      nextNonStriker = strikerId;
    }

    // Over completion check (6 legal deliveries)
    const isOverComplete = extra === 'NONE' || extra === 'BYE' || extra === 'LEG_BYE' ? (currentBall + 1) === 6 : false;
    if (isOverComplete) {
      const temp = nextStriker;
      nextStriker = nextNonStriker;
      nextNonStriker = temp;
      alert(`Over ${currentOver + 1} completed! Please rotate strike and assign a new bowler.`);
    }

    await fetch('https://mahacrickone.onrender.com/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        matchId: parseInt(mId), inningsNumber: inn, overNumber: currentOver, ballNumber: currentBall + 1,
        strikerId: parseInt(strikerId), nonStrikerId: parseInt(nonStrikerId), bowlerId: parseInt(bowlerId),
        runsScored: runs, isWicket: isWkt, extraType: extra
      })
    });

    setStrikerId(nextStriker);
    setNonStrikerId(nextNonStriker);
    fetchEvents();
  };

  const handleUndo = async () => {
    if (!events.length) return;
    await fetch(`https://mahacrickone.onrender.com/api/events/${events[events.length - 1].id}`, { method: 'DELETE' });
    fetchEvents();
  };

  const battingTeamId = inn === 1 ? currentMatch?.team1?.id : currentMatch?.team2?.id;
  const bowlingTeamId = inn === 1 ? currentMatch?.team2?.id : currentMatch?.team1?.id;

  return (
    <div style={{ backgroundColor: '#050505', minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif' }}>
      <header style={{ backgroundColor: '#111', padding: '15px', textAlign: 'center', borderBottom: '2px solid #e3b505' }}>
        <h1 style={{ margin: 0, color: '#e3b505', fontSize: '22px' }}>🏏 MAHA CRICKONE PRO</h1>
      </header>

      <div style={{ display: 'flex', justifyContent: 'center', margin: '15px 0', gap: '10px' }}>
        <button onClick={() => setView('match')} style={{ padding: '8px 20px', borderRadius: '30px', border: 'none', fontWeight: 'bold', backgroundColor: view==='match'?'#e3b505':'#222', color: view==='match'?'#000':'#fff' }}>Live Match</button>
        <button onClick={() => setView('admin')} style={{ padding: '8px 20px', borderRadius: '30px', border: 'none', fontWeight: 'bold', backgroundColor: view==='admin'?'#fff':'#222', color: view==='admin'?'#000':'#fff' }}>Franchise Admin</button>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '0 10px' }}>
        {view === 'match' && (
          <div>
            {/* Top Scorecard Card Component */}
            <div style={{ background: '#111', borderRadius: '12px', border: '1px solid #333', padding: '20px', textAlign: 'center', marginBottom: '15px' }}>
              <h2 style={{ margin: '0 0 5px 0', fontSize: '16px', color: '#aaa' }}>{currentMatch?.team1?.shortName} VS {currentMatch?.team2?.shortName} ({currentMatch?.matchFormat})</h2>
              <div style={{ fontSize: '54px', fontWeight: '900', margin: '10px 0' }}>{totalRuns}/{totalWickets}</div>
              <div style={{ fontSize: '16px', color: '#e3b505', fontWeight: 'bold' }}>OVERS: {currentOver}.{currentBall} / {totalLimitOvers}.0</div>
              {inn === 2 && <div style={{ color: '#fff', background: '#b8860b', padding: '6px', borderRadius: '5px', marginTop: '10px', fontSize: '13px' }}>Need {targetRuns - totalRuns} runs in {(totalLimitOvers*6) - legalBalls} balls</div>}
            </div>

            {/* Live Player Context Assignment Dropdowns */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
              <select value={strikerId} onChange={e=>setStrikerId(e.target.value)} style={{ flex: 1, padding: '10px', background: '#111', color: '#fff', borderRadius: '5px', border: '1px solid #333' }}>
                <option value="">* Striker</option>
                {players.filter(p=>p.team?.id===battingTeamId).map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <select value={nonStrikerId} onChange={e=>setNonStrikerId(e.target.value)} style={{ flex: 1, padding: '10px', background: '#111', color: '#fff', borderRadius: '5px', border: '1px solid #333' }}>
                <option value="">Non-Striker</option>
                {players.filter(p=>p.team?.id===battingTeamId).map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <select value={bowlerId} onChange={e=>setBowlerId(e.target.value)} style={{ flex: 1, padding: '10px', background: '#111', color: '#fff', borderRadius: '5px', border: '1px solid #333' }}>
                <option value="">Bowler</option>
                {players.filter(p=>p.team?.id===bowlingTeamId).map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            {/* Dynamic Real-Time Scorecard Summary Tables */}
            <ScorecardTables players={players} events={innEvents} strikerId={strikerId} nonStrikerId={nonStrikerId} bowlerId={bowlerId} battingTeamId={battingTeamId} bowlingTeamId={bowlingTeamId} />

            {/* Ball Ticker List */}
            <BallTimeline events={innEvents} currentOver={currentOver} />

            {/* Professional Grid Input Scorer Panel */}
            <div style={{ background: '#111', padding: '15px', borderRadius: '12px', border: '1px solid #222', marginTop: '15px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '10px' }}>
                {[0, 1, 2, 3].map(r => <button key={r} onClick={() => handleScoreInput(r)} style={{ padding: '15px', background: '#252525', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '16px' }}>{r}</button>)}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '10px' }}>
                <button onClick={() => handleScoreInput(4)} style={{ padding: '15px', background: '#1b5e20', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '16px' }}>4</button>
                <button onClick={() => handleScoreInput(6)} style={{ padding: '15px', background: '#1b5e20', color: '#e3b505', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '16px' }}>6</button>
                <button onClick={() => handleScoreInput(0, true)} style={{ padding: '15px', background: '#d32f2f', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '16px' }}>WICKET</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                <button onClick={() => handleScoreInput(0, false, 'WIDE')} style={{ padding: '12px 5px', background: '#b8860b', color: '#fff', border: 'none', borderRadius: '5px', fontSize: '12px', fontWeight: 'bold' }}>WD</button>
                <button onClick={() => handleScoreInput(0, false, 'NO_BALL')} style={{ padding: '12px 5px', background: '#b8860b', color: '#fff', border: 'none', borderRadius: '5px', fontSize: '12px', fontWeight: 'bold' }}>NB</button>
                <button onClick={() => handleScoreInput(1, false, 'BYE')} style={{ padding: '12px 5px', background: '#333', color: '#fff', border: 'none', borderRadius: '5px', fontSize: '12px', fontWeight: 'bold' }}>BYE</button>
                <button onClick={() => handleScoreInput(1, false, 'LEG_BYE')} style={{ padding: '12px 5px', background: '#333', color: '#fff', border: 'none', borderRadius: '5px', fontSize: '12px', fontWeight: 'bold' }}>LB</button>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button onClick={handleUndo} style={{ flex: 1, padding: '12px', background: '#444', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold' }}>UNDO LAST BALL</button>
                {inn === 1 && <button onClick={() => setInn(2)} style={{ flex: 1, padding: '12px', background: '#e3b505', color: '#000', border: 'none', borderRadius: '6px', fontWeight: 'bold' }}>END INNINGS</button>}
              </div>
            </div>
          </div>
        )}

        {view === 'admin' && (
          <FranchiseManager teams={teams} players={players} matches={matches} onSync={syncData} />
        )}
      </div>
    </div>
  );
}
