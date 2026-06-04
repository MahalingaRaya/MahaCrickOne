import { useState, useEffect } from 'react';
import './App.css';
import FranchiseManager from './FranchiseManager.jsx';
import ScorecardTables from './ScorecardTables.jsx';
import BallTimeline from './BallTimeline.jsx';

export default function App() {
  const [view, setView] = useState('match');
  const [teams, setTeams] = useState([]); 
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]); 
  const [events, setEvents] = useState([]);
  
  const [mId, setMId] = useState('');
  const [strikerId, setStrikerId] = useState(''); 
  const [nonStrikerId, setNonStrikerId] = useState('');
  const [bowlerId, setBowlerId] = useState(''); 
  const [inn, setInn] = useState(1);

  useEffect(() => { syncData(); }, []);
  useEffect(() => { if (mId) fetchEvents(); }, [mId]);

  const syncData = () => {
    fetch('https://mahacrickone.onrender.com/api/teams').then(r=>r.json()).then(d=>setTeams(Array.isArray(d)?d:[])).catch(()=>{});
    fetch('https://mahacrickone.onrender.com/api/players').then(r=>r.json()).then(d=>setPlayers(Array.isArray(d)?d:[])).catch(()=>{});
    fetch('https://mahacrickone.onrender.com/api/matches').then(r=>r.json()).then(d => { 
      const safeD = Array.isArray(d) ? d : [];
      setMatches(safeD); 
      if(safeD.length > 0 && !mId) setMId(safeD[safeD.length - 1].id.toString()); 
    }).catch(()=>{});
  };

  const fetchEvents = () => {
    if (!mId) return;
    fetch(`https://mahacrickone.onrender.com/api/events/match/${mId}`).then(r=>r.json()).then(d=>setEvents(Array.isArray(d)?d:[])).catch(()=>{});
  };

  // Safe mappings for original backend structure
  const currentMatch = Array.isArray(matches) ? matches.find(m => m.id.toString() === mId.toString()) : null;
  const totalLimitOvers = currentMatch ? parseInt(currentMatch.totalOvers || 1) : 1;

  const team1Obj = teams.find(t => t.id.toString() === currentMatch?.team1Id?.toString());
  const team2Obj = teams.find(t => t.id.toString() === currentMatch?.team2Id?.toString());

  const battingTeamId = currentMatch ? (inn === 1 ? team1Obj?.id : team2Obj?.id) : null;
  const bowlingTeamId = currentMatch ? (inn === 1 ? team2Obj?.id : team1Obj?.id) : null;

  // Translate old event data (runs, wicket, batterId) to the new pro variables
  const rawInnEvents = Array.isArray(events) ? events.filter(e => inn === 1 ? e.overNumber < 50 : e.overNumber >= 50) : [];
  const innEvents = rawInnEvents.map(e => ({
    ...e,
    runsScored: e.runs,
    isWicket: e.wicket,
    strikerId: e.batterId,
    overNumber: e.overNumber >= 50 ? e.overNumber - 50 : e.overNumber
  }));

  const totalRuns = innEvents.reduce((s, e) => s + (e.runsScored || 0) + (e.extraType === 'WIDE' || e.extraType === 'NO_BALL' ? 1 : 0), 0);
  const totalWickets = innEvents.filter(e => e.isWicket).length;
  const legalBalls = innEvents.filter(e => e.extraType !== 'WIDE' && e.extraType !== 'NO_BALL').length;
  const currentOver = Math.floor(legalBalls / 6);
  const currentBall = legalBalls % 6;

  const firstInningsRuns = Array.isArray(events) ? events.filter(e => e.overNumber < 50).reduce((s, e) => s + (e.runs || 0) + (e.extraType === 'WIDE' || e.extraType === 'NO_BALL' ? 1 : 0), 0) : 0;
  const targetRuns = inn === 2 ? firstInningsRuns + 1 : 0;
  const runsNeeded = inn === 2 ? Math.max(0, targetRuns - totalRuns) : 0;
  const ballsRemaining = inn === 2 ? Math.max(0, (totalLimitOvers * 6) - legalBalls) : 0;

  const handleScoreInput = async (runs, isWkt = false, extra = 'NONE') => {
    if (!mId || !strikerId || !bowlerId) return alert("Select Striker and Bowler first!");
    if (legalBalls >= totalLimitOvers * 6) return alert("Innings finished!");

    let nextStriker = strikerId; let nextNonStriker = nonStrikerId;
    if (!isWkt && (runs === 1 || runs === 3)) { nextStriker = nonStrikerId; nextNonStriker = strikerId; }

    const isOverComplete = extra === 'NONE' || extra === 'BYE' || extra === 'LEG_BYE' ? (currentBall + 1) === 6 : false;
    if (isOverComplete) {
      const temp = nextStriker; nextStriker = nextNonStriker; nextNonStriker = temp;
      alert(`Over complete! Please change bowler.`);
    }

    // THE FIX: Sending the original event variables (batterId, runs, wicket) to DB
    await fetch('https://mahacrickone.onrender.com/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        matchId: parseInt(mId), 
        batterId: parseInt(strikerId), 
        bowlerId: parseInt(bowlerId),
        overNumber: inn === 1 ? currentOver : currentOver + 50, 
        ballNumber: currentBall + 1,
        runs: runs, 
        wicket: isWkt, 
        extraType: extra
      })
    });
    setStrikerId(nextStriker); setNonStrikerId(nextNonStriker); fetchEvents();
  };

  const safePlayers = Array.isArray(players) ? players : [];
  const battingTeamPlayers = safePlayers.filter(p => p.team?.id === battingTeamId);
  const bowlingTeamPlayers = safePlayers.filter(p => p.team?.id === bowlingTeamId);

  const btn = { flex: 1, padding: '12px 0', backgroundColor: '#252525', color: '#ccc', border: 'none', borderRadius: '5px', fontWeight: 'bold' };

  return (
    <div style={{ backgroundColor: '#050505', minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif' }}>
      <header style={{ backgroundColor: '#111', padding: '15px', textAlign: 'center', borderBottom: '2px solid #e3b505' }}>
        <h1 style={{ margin: 0, color: '#e3b505', fontSize: '22px' }}>🏏 MAHA CRICKONE PRO</h1>
      </header>
      <div style={{ display: 'flex', justifyContent: 'center', margin: '15px 0', gap: '10px' }}>
        <button onClick={() => setView('match')} style={{ padding: '8px 20px', borderRadius: '30px', border: 'none', fontWeight: 'bold', backgroundColor: view==='match'?'#e3b505':'#222', color: view==='match'?'#000':'#fff' }}>Live Match</button>
        <button onClick={() => setView('admin')} style={{ padding: '8px 20px', borderRadius: '30px', border: 'none', fontWeight: 'bold', backgroundColor: view==='admin'?'#fff':'#222', color: view==='admin'?'#000':'#fff' }}>Franchise Admin</button>
      </div>
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '0 10px', paddingBottom: '30px' }}>
        {view === 'match' && (
          <div>
            {currentMatch ? (
              <>
                <div style={{ background: '#111', borderRadius: '12px', border: '1px solid #333', padding: '20px', textAlign: 'center', marginBottom: '15px' }}>
                  <h2>{team1Obj?.shortName || 'T1'} VS {team2Obj?.shortName || 'T2'} ({totalLimitOvers} OV)</h2>
                  <div style={{ fontSize: '54px', fontWeight: '900', margin: '10px 0' }}>{totalRuns}/{totalWickets}</div>
                  <div style={{ fontSize: '16px', color: '#e3b505', fontWeight: 'bold' }}>OVERS: {currentOver}.{currentBall} / {totalLimitOvers}.0</div>
                  {inn === 2 && <div style={{ color: '#fff', background: '#b8860b', padding: '6px', borderRadius: '5px', marginTop: '10px' }}>Need {runsNeeded} runs in {ballsRemaining} balls</div>}
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <select value={mId} onChange={e => { setMId(e.target.value); setStrikerId(''); setNonStrikerId(''); setBowlerId(''); }} style={{ width: '100%', padding: '10px', background: '#111', color: '#fff', borderRadius: '5px', border: '1px solid #333' }}>
                    <option value="" disabled>Select a match</option>
                    {matches.map(m => {
                      const t1N = teams.find(t=>t.id.toString()===m.team1Id?.toString())?.shortName;
                      const t2N = teams.find(t=>t.id.toString()===m.team2Id?.toString())?.shortName;
                      return <option key={m.id} value={m.id}>{t1N} vs {t2N} ({m.totalOvers} OV)</option>
                    })}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
                  <select value={strikerId} onChange={e=>setStrikerId(e.target.value)} style={{ flex: 1, padding: '10px', background: '#111', color: '#fff', borderRadius: '5px', border: '1px solid #333' }}>
                    <option value="">* Striker</option>{battingTeamPlayers.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <select value={nonStrikerId} onChange={e=>setNonStrikerId(e.target.value)} style={{ flex: 1, padding: '10px', background: '#111', color: '#fff', borderRadius: '5px', border: '1px solid #333' }}>
                    <option value="">Non-Striker</option>{battingTeamPlayers.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <select value={bowlerId} onChange={e=>setBowlerId(e.target.value)} style={{ flex: 1, padding: '10px', background: '#111', color: '#fff', borderRadius: '5px', border: '1px solid #333' }}>
                    <option value="">Bowler</option>{bowlingTeamPlayers.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <ScorecardTables players={safePlayers} events={innEvents} battingTeamId={battingTeamId} bowlingTeamId={bowlingTeamId} strikerId={strikerId} />
                <BallTimeline events={innEvents} currentOver={currentOver} />
                <div style={{ background: '#111', padding: '15px', borderRadius: '12px', border: '1px solid #222', marginTop: '15px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '10px' }}>
                    {[0, 1, 2, 3].map(r => <button key={r} onClick={() => handleScoreInput(r)} style={btn}>{r}</button>)}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '10px' }}>
                    <button onClick={() => handleScoreInput(4)} style={{ ...btn, background: '#1b5e20' }}>4</button>
                    <button onClick={() => handleScoreInput(6)} style={{ ...btn, background: '#1b5e20', color: '#e3b505' }}>6</button>
                    <button onClick={() => handleScoreInput(0, true)} style={{ ...btn, background: '#d32f2f' }}>WICKET</button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                    <button onClick={() => handleScoreInput(0, false, 'WIDE')} style={btn}>WD</button>
                    <button onClick={() => handleScoreInput(0, false, 'NO_BALL')} style={btn}>NB</button>
                    <button onClick={() => handleScoreInput(1, false, 'BYE')} style={btn}>BYE</button>
                    <button onClick={() => handleScoreInput(1, false, 'LEG_BYE')} style={btn}>LB</button>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button onClick={() => { if(events.length) { fetch(`https://mahacrickone.onrender.com/api/events/${events[events.length-1].id}`,{method:'DELETE'}).then(fetchEvents); } }} style={{ flex: 1, padding: '12px', background: '#444', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold' }}>UNDO</button>
                    {inn === 1 && <button onClick={() => { setInn(2); setStrikerId(''); setNonStrikerId(''); setBowlerId(''); }} style={{ flex: 1, padding: '12px', background: '#e3b505', color: '#000', border: 'none', borderRadius: '6px', fontWeight: 'bold' }}>END INNINGS</button>}
                  </div>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', background: '#111', borderRadius: '12px', border: '1px solid #333' }}>
                <p style={{ marginBottom: '15px', color: '#aaa' }}>No active fixtures stored.</p>
                <button onClick={() => setView('admin')} style={{ padding: '10px 20px', background: '#e3b505', color: '#000', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}>Go to Franchise Admin</button>
              </div>
            )}
          </div>
        )}
        {view === 'admin' && <FranchiseManager teams={teams} players={players} matches={matches} onSync={syncData} />}
      </div>
    </div>
  );
}
