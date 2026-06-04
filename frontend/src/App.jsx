import { useState, useEffect } from 'react';
import './App.css';
import AdminDashboard from './AdminDashboard.jsx';
import Scoreboard from './Scoreboard.jsx';
import ScoringPad from './ScoringPad.jsx';

export default function App() {
  const [activePage, setActivePage] = useState('match');
  const [teams, setTeams] = useState([]); 
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]); 
  const [events, setEvents] = useState([]);
  const [activeMatchId, setActiveMatchId] = useState('');
  const [batterId, setBatterId] = useState(''); 
  const [bowlerId, setBowlerId] = useState('');
  const [currentInnings, setCurrentInnings] = useState(1);

  useEffect(() => { loadCoreData(); }, []);
  useEffect(() => { if (activeMatchId) loadMatchLedger(); }, [activeMatchId]);

  const loadCoreData = () => {
    fetch('https://mahacrickone.onrender.com/api/teams').then(r => r.json()).then(setTeams).catch(console.error);
    fetch('https://mahacrickone.onrender.com/api/players').then(r => r.json()).then(setPlayers).catch(console.error);
    fetch('https://mahacrickone.onrender.com/api/matches').then(r => r.json()).then(d => { setMatches(d); if(d.length > 0 && !activeMatchId) setActiveMatchId(d[0].id.toString()); }).catch(console.error);
  };

  const loadMatchLedger = () => {
    fetch(`https://mahacrickone.onrender.com/api/events/match/${activeMatchId}`).then(r => r.json()).then(setEvents).catch(console.error);
  };

  const handleAddTeam = async (name, shortName) => {
    const res = await fetch('https://mahacrickone.onrender.com/api/teams', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, shortName }) });
    if (!res.ok) alert("Franchise Name or Short Name already exists!");
    loadCoreData();
  };

  const handleAddPlayer = async (name, teamId) => {
    const res = await fetch('https://mahacrickone.onrender.com/api/players', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, role: 'Batsman', team: { id: parseInt(teamId) } }) });
    if (!res.ok) alert("Player already drafted to this team lineup!");
    loadCoreData();
  };

  const handleAddMatch = async (team1Id, team2Id, totalOvers) => {
    await fetch('https://mahacrickone.onrender.com/api/matches', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ team1Id, team2Id, totalOvers }) });
    loadCoreData();
    alert("Match Scheduled Successfully!");
  };

  const inn1Events = events.filter(e => e.overNumber < 50);
  const inn2Events = events.filter(e => e.overNumber >= 50);

  const inn1Runs = inn1Events.reduce((s, e) => s + e.runs + (e.extraType === 'WIDE' || e.extraType === 'NO_BALL' ? 1 : 0), 0);
  const inn1Balls = inn1Events.filter(e => e.extraType !== 'WIDE' && e.extraType !== 'NO_BALL').length;
  const inn1Wickets = inn1Events.filter(e => e.wicket).length;

  const inn2Runs = inn2Events.reduce((s, e) => s + e.runs + (e.extraType === 'WIDE' || e.extraType === 'NO_BALL' ? 1 : 0), 0);
  const inn2Balls = inn2Events.filter(e => e.extraType !== 'WIDE' && e.extraType !== 'NO_BALL').length;
  const inn2Wickets = inn2Events.filter(e => e.wicket).length;

  const displayRuns = currentInnings === 1 ? inn1Runs : inn2Runs;
  const displayWickets = currentInnings === 1 ? inn1Wickets : inn2Wickets;
  const activeLegalBalls = currentInnings === 1 ? inn1Balls : inn2Balls;
  const calcOvers = Math.floor(activeLegalBalls / 6); const calcBalls = activeLegalBalls % 6;

  const strikerEvents = events.filter(e => e.batterId === parseInt(batterId));
  const strikerRuns = strikerEvents.reduce((s, e) => (e.extraType === 'WIDE' || e.extraType === 'LEG_BYE' || e.extraType === 'BYE') ? s : s + e.runs, 0);
  const strikerBallsFaced = strikerEvents.filter(e => e.extraType !== 'WIDE').length;
  const strikerSR = strikerBallsFaced > 0 ? ((strikerRuns / strikerBallsFaced) * 100).toFixed(1) : "0.0";

  const bowlerEvents = events.filter(e => e.bowlerId === parseInt(bowlerId));
  const bowlerRunsConceded = bowlerEvents.reduce((s, e) => s + e.runs + (e.extraType === 'WIDE' || e.extraType === 'NO_BALL' ? 1 : 0) - (e.extraType === 'BYE' || e.extraType === 'LEG_BYE' ? e.runs : 0), 0);
  const bowlerWickets = bowlerEvents.filter(e => e.wicket).length;
  const bowlerLegalBalls = bowlerEvents.filter(e => e.extraType !== 'WIDE' && e.extraType !== 'NO_BALL').length;
  const bowlerEcon = bowlerLegalBalls > 0 ? ((bowlerRunsConceded / bowlerLegalBalls) * 6).toFixed(1) : "0.0";

  const activeBatter = players.find(p => p.id.toString() === batterId);
  const activeBowler = players.find(p => p.id.toString() === bowlerId);
  const currentOverTracker = calcBalls === 0 && activeLegalBalls > 0 ? calcOvers - 1 : calcOvers;
  const thisOverEvents = events.filter(e => e.overNumber === (currentInnings === 1 ? currentOverTracker : currentOverTracker + 50));

  const handleScoreBall = async (runs, isWicket = false, extraType = null) => {
    const virtualOver = currentInnings === 1 ? calcOvers : calcOvers + 50;
    await fetch('https://mahacrickone.onrender.com/api/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ matchId: parseInt(activeMatchId), batterId: parseInt(batterId), bowlerId: parseInt(bowlerId), overNumber: virtualOver, ballNumber: calcBalls + 1, runs, wicket: isWicket, extraType }) });
    loadMatchLedger();
  };

  const handleUndo = async () => {
    if (events.length === 0) return;
    await fetch(`https://mahacrickone.onrender.com/api/events/${events[events.length - 1].id}`, { method: 'DELETE' });
    loadMatchLedger();
  };

  const isReadyToScore = activeMatchId !== '' && batterId !== '' && bowlerId !== '';
  const activeMatch = matches.find(m => m.id.toString() === activeMatchId);

  return (
    <div style={{ backgroundColor: '#050505', minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif', paddingBottom: '50px' }}>
      <header style={{ backgroundColor: '#111', padding: '15px', textAlign: 'center', borderBottom: '2px solid #e3b505' }}><h1 style={{ margin: 0, color: '#e3b505', fontSize: '24px' }}> McKinley CrickOne</h1></header>
      <div style={{ display: 'flex', justifyContent: 'center', margin: '15px 0', gap: '10px' }}>
        <button onClick={() => setActivePage('admin')} style={{ padding: '8px 20px', borderRadius: '30px', border: 'none', fontWeight: 'bold', backgroundColor: activePage === 'admin' ? '#fff' : '#333', color: activePage === 'admin' ? '#000' : '#fff' }}>Dashboard</button>
        <button onClick={() => setActivePage('match')} style={{ padding: '8px 20px', borderRadius: '30px', border: 'none', fontWeight: 'bold', backgroundColor: activePage === 'match' ? '#e3b505' : '#333', color: activePage === 'match' ? '#000' : '#fff' }}>Live Match</button>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '0 10px' }}>
        {activePage === 'match' && (
          <div>
            <Scoreboard activeMatch={activeMatch} currentInnings={currentInnings} inn1Runs={inn1Runs} inn1Wickets={inn1Wickets} inn1Balls={inn1Balls} inn2Runs={inn2Runs} inn2Wickets={inn2Wickets} inn2Balls={inn2Balls} displayRuns={displayRuns} displayWickets={displayWickets} calcOvers={calcOvers} calcBalls={calcBalls} strikerRuns={strikerRuns} strikerBallsFaced={strikerBallsFaced} strikerSR={strikerSR} bowlerWickets={bowlerWickets} bowlerRunsConceded={bowlerRunsConceded} bowlerLegalBalls={bowlerLegalBalls} bowlerEcon={bowlerEcon} thisOverEvents={thisOverEvents} activeBatter={activeBatter} activeBowler={activeBowler} onSwitchInnings={() => setCurrentInnings(2)} />
            <ScoringPad matches={matches} players={players} activeMatchId={activeMatchId} setActiveMatchId={setActiveMatchId} batterId={batterId} setBatterId={setBatterId} bowlerId={bowlerId} setBowlerId={setBowlerId} isReadyToScore={isReadyToScore} onScoreBall={handleScoreBall} onUndo={handleUndo} hasEvents={events.length > 0} />
          </div>
        )}
        {activePage === 'admin' && (
          <AdminDashboard teams={teams} players={players} matches={matches} onAddTeam={handleAddTeam} onAddPlayer={handleAddPlayer} onAddMatch={handleAddMatch} />
        )}
      </div>
    </div>
  );
}
