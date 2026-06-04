import { useState, useEffect } from 'react';
import './App.css';
import AdminDashboard from './AdminDashboard.jsx';
import Scoreboard from './Scoreboard.jsx';
import ScoringPad from './ScoringPad.jsx';

export default function App() {
  const [page, setPage] = useState('match');
  const [teams, setTeams] = useState([]); const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]); const [events, setEvents] = useState([]);
  
  const [tName, setTName] = useState(''); const [sName, setSName] = useState('');
  const [pName, setPName] = useState(''); const [selTId, setSelTId] = useState('');
  const [t1Id, setT1Id] = useState(''); const [t2Id, setT2Id] = useState('');
  const [mOvers, setMOvers] = useState('1');

  const [mId, setMId] = useState(''); const [batId, setBatId] = useState(''); const [bwlId, setBwlId] = useState('');
  const [inn, setInn] = useState(1);

  useEffect(() => { loadSystemContext(); }, []);
  
  useEffect(() => { 
    if (mId) {
      fetch(`https://mahacrickone.onrender.com/api/events/match/${mId}`)
        .then(r => r.json())
        .then(data => { setEvents(data); setBatId(''); setBwlId(''); setInn(1); })
        .catch(console.error);
    }
  }, [mId]);

  const loadSystemContext = () => {
    fetch('https://mahacrickone.onrender.com/api/teams').then(r => r.json()).then(setTeams);
    fetch('https://mahacrickone.onrender.com/api/players').then(r => r.json()).then(setPlayers);
    fetch('https://mahacrickone.onrender.com/api/matches').then(r => r.json()).then(d => { 
      setMatches(d); 
      if(d.length > 0) setMId(d[d.length - 1].id.toString()); 
    });
  };

  const executeTeamRegistration = async (e) => {
    e.preventDefault();
    if(teams.some(t => t.name.toLowerCase() === tName.toLowerCase() || t.shortName.toLowerCase() === sName.toLowerCase())) return alert("Franchise identity already exist!");
    await fetch('https://mahacrickone.onrender.com/api/teams', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: tName, shortName: sName }) });
    setTName(''); setSName(''); loadSystemContext();
  };

  const executePlayerDraft = async (e) => {
    e.preventDefault();
    if(players.some(p => p.name.toLowerCase() === pName.toLowerCase() && p.team?.id === parseInt(selTId))) return alert("Player profile allocation already assigned!");
    await fetch('https://mahacrickone.onrender.com/api/players', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: pName, role: 'Batsman', team: { id: parseInt(selTId) } }) });
    setPName(''); loadSystemContext();
  };

  const executeMatchScheduling = async (e) => {
    e.preventDefault();
    if (t1Id === t2Id) return alert("Opponents must be unique!");
    const res = await fetch('https://mahacrickone.onrender.com/api/matches', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ team1Id: t1Id.toString(), team2Id: t2Id.toString(), totalOvers: mOvers }) });
    if(res.ok) { loadSystemContext(); setPage('match'); alert("Professional Fixture Synchronized!"); }
  };

  const curMatch = matches.find(m => m.id.toString() === mId.toString());
  const maxOvers = curMatch ? parseInt(curMatch.totalOvers) : 1;

  const inn1 = events.filter(e => e.overNumber < 50); const inn2 = events.filter(e => e.overNumber >= 50);
  const inn1R = inn1.reduce((s, e) => s + e.runs + (e.extraType === 'WIDE' || e.extraType === 'NO_BALL' ? 1 : 0), 0);
  const inn1B = inn1.filter(e => e.extraType !== 'WIDE' && e.extraType !== 'NO_BALL').length;
  const inn1W = inn1.filter(e => e.wicket).length;

  const inn2R = inn2.reduce((s, e) => s + e.runs + (e.extraType === 'WIDE' || e.extraType === 'NO_BALL' ? 1 : 0), 0);
  const inn2B = inn2.filter(e => e.extraType !== 'WIDE' && e.extraType !== 'NO_BALL').length;
  const inn2W = inn2.filter(e => e.wicket).length;

  const runs = inn === 1 ? inn1R : inn2R; const wickets = inn === 1 ? inn1W : inn2W;
  const balls = inn === 1 ? inn1B : inn2B; const ovs = Math.floor(balls / 6); const bls = balls % 6;

  const sEv = events.filter(e => e.batterId === parseInt(batId));
  const sRuns = sEv.reduce((s, e) => (e.extraType === 'WIDE' || e.extraType === 'LEG_BYE' || e.extraType === 'BYE') ? s : s + e.runs, 0);
  const sBalls = sEv.filter(e => e.extraType !== 'WIDE').length;
  const sSR = sBalls > 0 ? ((sRuns / sBalls) * 100).toFixed(1) : "0.0";

  const bEv = events.filter(e => e.bowlerId === parseInt(bwlId));
  const bRuns = bEv.reduce((s, e) => s + e.runs + (e.extraType === 'WIDE' || e.extraType === 'NO_BALL' ? 1 : 0) - (e.extraType === 'BYE' || e.extraType === 'LEG_BYE' ? e.runs : 0), 0);
  const bWkts = bEv.filter(e => e.wicket).length;
  const bBalls = bEv.filter(e => e.extraType !== 'WIDE' && e.extraType !== 'NO_BALL').length;
  const bEcon = bBalls > 0 ? ((bRuns / bBalls) * 6).toFixed(1) : "0.0";

  const actBat = players.find(p => p.id.toString() === batId);
  const actBwl = players.find(p => p.id.toString() === bwlId);
  const overTrk = bls === 0 && balls > 0 ? ovs - 1 : ovs;
  const overEvs = events.filter(e => e.overNumber === (inn === 1 ? overTrk : overTrk + 50));

  const battingTeamId = inn === 1 ? curMatch?.team1?.id : curMatch?.team2?.id;
  const bowlingTeamId = inn === 1 ? curMatch?.team2?.id : curMatch?.team1?.id;
  const filteredBatters = players.filter(p => p.team?.id === battingTeamId);
  const filteredBowlers = players.filter(p => p.team?.id === bowlingTeamId);

  const pushBallEvent = async (r, wk = false, ex = null) => {
    if (ovs >= maxOvers && ex !== 'WIDE' && ex !== 'NO_BALL') return alert("Overs capacity concluded!");
    await fetch('https://mahacrickone.onrender.com/api/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ matchId: parseInt(mId), batterId: parseInt(batId), bowlerId: parseInt(bwlId), overNumber: inn === 1 ? ovs : ovs + 50, ballNumber: bls + 1, runs: r, wicket: wk, extraType: ex }) });
    fetch(`https://mahacrickone.onrender.com/api/events/match/${mId}`).then(r => r.json()).then(setEvents);
  };

  const executeUndoCommand = async () => {
    if (!events.length) return;
    await fetch(`https://mahacrickone.onrender.com/api/events/${events[events.length - 1].id}`, { method: 'DELETE' });
    fetch(`https://mahacrickone.onrender.com/api/events/match/${mId}`).then(r => r.json()).then(setEvents);
  };

  const ready = mId !== '' && batId !== '' && bwlId !== '';
  const isMatchOver = inn === 2 && (inn2R >= inn1R + 1 || inn2B >= (maxOvers * 6) || inn2W >= 10);

  return (
    <div style={{ backgroundColor: '#050505', minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif', paddingBottom: '50px' }}>
      <header style={{ backgroundColor: '#111', padding: '15px', textAlign: 'center', borderBottom: '2px solid #e3b505' }}>
        <h1 style={{ margin: 0, color: '#e3b505', fontSize: '24px', textTransform: 'uppercase' }}>🏏 Maha CrickOne</h1>
      </header>
      
      <div style={{ display: 'flex', justifyContent: 'center', margin: '15px 0', gap: '10px' }}>
        <button onClick={() => setPage('admin')} style={{ padding: '8px 20px', borderRadius: '30px', border: 'none', fontWeight: 'bold', backgroundColor: page === 'admin' ? '#fff' : '#333', color: page === 'admin' ? '#000' : '#fff' }}>Dashboard</button>
        <button onClick={() => setPage('match')} style={{ padding: '8px 20px', borderRadius: '30px', border: 'none', fontWeight: 'bold', backgroundColor: page === 'match' ? '#e3b505' : '#333', color: page === 'match' ? '#000' : '#fff' }}>Live Match</button>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '0 10px' }}>
        {page === 'match' && (
          <div>
            <Scoreboard curMatch={curMatch} maxOvers={maxOvers} inn={inn} isMatchOver={isMatchOver} inn1R={inn1R} inn2R={inn2R} inn2B={inn2B} inn2W={inn2W} runs={runs} wickets={wickets} ovs={ovs} bls={bls} actBat={actBat} sRuns={sRuns} sBalls={sBalls} sSR={sSR} actBwl={actBwl} bWkts={bWkts} bRuns={bRuns} bBalls={bBalls} bEcon={bEcon} overEvs={overEvs} players={players} events={events} setInn={setInn} />
            <ScoringPad mId={mId} setMId={setMId} batId={batId} setBatId={setBatId} bwlId={bwlId} setBwlId={setBwlId} matches={matches} filteredBatters={filteredBatters} filteredBowlers={filteredBowlers} ready={ready} pushBallEvent={pushBallEvent} executeUndoCommand={executeUndoCommand} events={events} />
          </div>
        )}
        {page === 'admin' && (
          <AdminDashboard tName={tName} setTName={setTName} sName={sName} setSName={setSName} pName={pName} setPName={setPName} selTId={selTId} setSelTId={setSelTId} teams={teams} t1Id={t1Id} setT1Id={setT1Id} t2Id={t2Id} setT2Id={setT2Id} mOvers={mOvers} setMOvers={setMOvers} executeTeamRegistration={executeTeamRegistration} executePlayerDraft={executePlayerDraft} executeMatchScheduling={executeMatchScheduling} />
        )}
      </div>
    </div>
  );
}
