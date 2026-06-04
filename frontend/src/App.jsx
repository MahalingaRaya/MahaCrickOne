import { useState, useEffect } from 'react';
import './App.css';

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

  useEffect(() => { apiLoad(); }, []);
  useEffect(() => { if (mId) fetch(`https://mahacrickone.onrender.com/api/events/match/${mId}`).then(r => r.json()).then(setEvents); }, [mId]);

  const apiLoad = () => {
    fetch('https://mahacrickone.onrender.com/api/teams').then(r => r.json()).then(d => { setTeams(d); if(d.length > 0) { setSelTId(d[0].id); setT1Id(d[0].id); if(d.length > 1) setT2Id(d[1].id); } });
    fetch('https://mahacrickone.onrender.com/api/players').then(r => r.json()).then(setPlayers);
    fetch('https://mahacrickone.onrender.com/api/matches').then(r => r.json()).then(d => { setMatches(d); if(d.length > 0 && !mId) setMId(d[0].id.toString()); });
  };

  const addTeam = async (e) => {
    e.preventDefault();
    if(teams.some(t => t.name.toLowerCase() === tName.toLowerCase() || t.shortName.toLowerCase() === sName.toLowerCase())) return alert("Franchise already registered!");
    await fetch('https://mahacrickone.onrender.com/api/teams', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: tName, shortName: sName }) });
    setTName(''); setSName(''); apiLoad();
  };

  const addPlayer = async (e) => {
    e.preventDefault();
    if(players.some(p => p.name.toLowerCase() === pName.toLowerCase() && p.team?.id === parseInt(selTId))) return alert("Player already on team roster!");
    await fetch('https://mahacrickone.onrender.com/api/players', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: pName, role: 'Batsman', team: { id: parseInt(selTId) } }) });
    setPName(''); apiLoad();
  };

  const addMatch = async (e) => {
    e.preventDefault();
    await fetch('https://mahacrickone.onrender.com/api/matches', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ team1Id: t1Id.toString(), team2Id: t2Id.toString(), totalOvers: mOvers }) });
    apiLoad(); alert("Match Scheduled!");
  };

  const curMatch = matches.find(m => m.id.toString() === mId);
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

  const scoreBall = async (r, wk = false, ex = null) => {
    if (ovs >= maxOvers && ex !== 'WIDE' && ex !== 'NO_BALL') return alert("Overs capacity concluded for this innings!");
    await fetch('https://mahacrickone.onrender.com/api/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ matchId: parseInt(mId), batterId: parseInt(batId), bowlerId: parseInt(bwlId), overNumber: inn === 1 ? ovs : ovs + 50, ballNumber: bls + 1, runs: r, wicket: wk, extraType: ex }) });
    fetch(`https://mahacrickone.onrender.com/api/events/match/${mId}`).then(r => r.json()).then(setEvents);
  };

  const undoBall = async () => {
    if (!events.length) return;
    await fetch(`https://mahacrickone.onrender.com/api/events/${events[events.length - 1].id}`, { method: 'DELETE' });
    fetch(`https://mahacrickone.onrender.com/api/events/match/${mId}`).then(r => r.json()).then(setEvents);
  };

  const ready = mId !== '' && batId !== '' && bwlId !== '';
  const isMatchOver = inn === 2 && (inn2R >= inn1R + 1 || inn2B >= (maxOvers * 6) || inn2W >= 10);

  const btn = { flex: 1, padding: '12px 0', backgroundColor: '#252525', color: '#ccc', border: 'none', borderRadius: '5px', fontWeight: 'bold' };
  const pad = { padding: '20px', fontSize: '24px', fontWeight: 'bold', color: '#fff', border: 'none', borderRadius: '8px' };
  const sel = { flex: 1, padding: '12px', borderRadius: '5px', background: '#111', color: '#fff', border: '1px solid #333' };
  const inp = { flex: 2, padding: '12px', borderRadius: '5px', border: 'none', background: '#222', color: '#fff' };

  return (
    <div style={{ backgroundColor: '#050505', minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif', paddingBottom: '50px' }}>
      <header style={{ backgroundColor: '#111', padding: '15px', textAlign: 'center', borderBottom: '2px solid #e3b505' }}><h1 style={{ margin: 0, color: '#e3b505', fontSize: '24px' }}>🏏 Maha CrickOne</h1></header>
      <div style={{ display: 'flex', justifyContent: 'center', margin: '15px 0', gap: '10px' }}>
        <button onClick={() => setPage('admin')} style={{ padding: '8px 20px', borderRadius: '30px', border: 'none', fontWeight: 'bold', backgroundColor: page === 'admin' ? '#fff' : '#333', color: page === 'admin' ? '#000' : '#fff' }}>Dashboard</button>
        <button onClick={() => setPage('match')} style={{ padding: '8px 20px', borderRadius: '30px', border: 'none', fontWeight: 'bold', backgroundColor: page === 'match' ? '#e3b505' : '#333', color: page === 'match' ? '#000' : '#fff' }}>Live Match</button>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '0 10px' }}>
        {page === 'match' && (
          <div>
            <div style={{ background: '#111', borderRadius: '10px', border: '1px solid #333', overflow: 'hidden', marginBottom: '20px' }}>
              {inn === 2 && (
                <div style={{ background: '#e3b505', color: '#000', padding: '12px', textAlign: 'center', fontWeight: 'bold', fontSize: '15px' }}>
                  {isMatchOver ? "🏁 MATCH CONCLUDED" : `🎯 TARGET: ${inn1R + 1} | Need ${(inn1R + 1) - inn2R} runs in ${(maxOvers * 6) - inn2B} balls`}
                </div>
              )}
              <div style={{ padding: '25px 20px', textAlign: 'center', background: 'linear-gradient(135deg, #1f1f1f 0%, #0a0a0a 100%)' }}>
                <div style={{ fontSize: '14px', color: '#aaa', textTransform: 'uppercase', fontWeight: 'bold' }}>{curMatch ? `${curMatch.team1?.shortName} vs ${curMatch.team2?.shortName} (${maxOvers} Ov)` : "Select Match"}</div>
                <div style={{ fontSize: '72px', fontWeight: '900', color: '#fff', margin: '12px 0' }}>{runs}<span style={{ color: '#666', fontSize: '44px' }}>/{wickets}</span></div>
                <div style={{ fontSize: '16px', color: '#e3b505', fontWeight: 'bold' }}>OVER: <span style={{ color: '#fff' }}>{ovs}.{bls}</span><span style={{ margin: '0 12px', color: '#444' }}>|</span>INNINGS: <span style={{ color: '#fff' }}>{inn}</span></div>
                {inn === 1 && (ovs >= maxOvers || wickets >= 10) && (
                  <button onClick={() => setInn(2)} style={{ marginTop: '15px', padding: '8px 18px', background: '#e3b505', color: '#000', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>Declare & Set Target ➔</button>
                )}
              </div>
              <div style={{ background: '#161616', padding: '15px', borderTop: '1px solid #252525' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #252525' }}>
                  <div><span style={{ color: '#e3b505' }}>Format 🏏 </span><span style={{ fontWeight: 'bold', color: '#fff' }}>{actBat ? actBat.name : 'Striker'} *</span></div>
                  <div style={{ color: '#aaa', fontSize: '14px' }}><span><strong style={{ color: '#fff', fontSize: '16px' }}>{sRuns}</strong> ({sBalls})</span> | SR: {sSR}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div><span>Bowl ⚾ </span><span style={{ fontWeight: 'bold', color: '#fff' }}>{actBwl ? actBwl.name : 'Bowler'}</span></div>
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

            <div style={{ background: '#111', padding: '15px', borderRadius: '10px', border: '1px solid #222' }}>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                <select value={mId} onChange={e => { setMId(e.target.value); setEvents([]); setInn(1); }} style={sel}>
                  <option value="" disabled>Active Match</option>
                  {matches.map(m => <option key={m.id} value={m.id}>{m.team1?.shortName} v {m.team2?.shortName}</option>)}
                </select>
                <select value={batId} onChange={e => setBatId(e.target.value)} style={sel}><option value="" disabled>Striker</option>{players.filter(p=>p.team?.id===(inn===1?curMatch?.team1?.id:curMatch?.team2?.id)).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
                <select value={bwlId} onChange={e => setBwlId(e.target.value)} style={sel}><option value="" disabled>Bowler</option>{players.filter(p=>p.team?.id===(inn===1?curMatch?.team2?.id:curMatch?.team1?.id)).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', opacity: ready ? 1 : 0.2, pointerEvents: ready ? 'auto' : 'none' }}>
                <button onClick={() => scoreBall(0, false, 'WIDE')} style={btn}>WD</button><button onClick={() => scoreBall(0, false, 'NO_BALL')} style={btn}>NB</button><button onClick={() => scoreBall(1, false, 'BYE')} style={btn}>B</button><button onClick={() => scoreBall(1, false, 'LEG_BYE')} style={btn}>LB</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', opacity: ready ? 1 : 0.2, pointerEvents: ready ? 'auto' : 'none' }}>
                {[0, 1, 2, 3, 4, 6].map(r => <button key={r} onClick={() => scoreBall(r)} style={{ ...pad, background: r === 4 || r === 6 ? '#1b5e20' : '#333' }}>{r}</button>)}
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px', opacity: ready ? 1 : 0.2, pointerEvents: ready ? 'auto' : 'none' }}>
                <button onClick={() => scoreBall(0, true)} style={{ flex: 2, padding: '18px', fontSize: '18px', fontWeight: 'bold', background: '#d32f2f', color: '#fff', border: 'none', borderRadius: '8px' }}>WICKET</button>
                <button onClick={undoBall} disabled={!events.length} style={{ flex: 1, padding: '18px', background: '#444', color: '#fff', border: 'none', borderRadius: '8px' }}>UNDO</button>
              </div>
            </div>
          </div>
        )}

        {page === 'admin' && (
          <div>
            <div style={{ background: '#111', padding: '20px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #333' }}>
              <h3 style={{ margin: '0 0 15px 0', color: '#e3b505' }}>1. Register Franchise Team</h3>
              <form onSubmit={addTeam} style={{ display: 'flex', gap: '10px' }}>
                <input type="text" placeholder="Franchise Name" value={tName} onChange={e => setTName(e.target.value)} required style={inp} />
                <input type="text" placeholder="Short (e.g. RCB)" value={sName} onChange={e => setSName(e.target.value)} required style={{ ...inp, flex: 1 }} />
                <button type="submit" style={{ padding: '12px 20px', background: '#fff', color: '#000', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}>Save</button>
              </form>
            </div>
            <div style={{ background: '#111', padding: '20px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #333' }}>
              <h3 style={{ margin: '0 0 15px 0', color: '#e3b505' }}>2. Draft Player to Roster</h3>
              <form onSubmit={addPlayer}>
                <input type="text" placeholder="Player Name" value={pName} onChange={e => setPName(e.target.value)} required style={{ ...inp, display: 'block', width: '100%', marginBottom: '10px' }} />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <select value={selTId} onChange={e => setSelTId(e.target.value)} required style={sel}>
                    <option value="" disabled>Select Team Lineup</option>
                    {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                  <button type="submit" style={{ padding: '12px 20px', background: '#fff', color: '#000', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}>Draft</button>
                </div>
              </form>
            </div>
            <div style={{ background: '#111', padding: '20px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #333' }}>
              <h3 style={{ margin: '0 0 15px 0', color: '#e3b505' }}>3. Schedule Professional Fixture</h3>
              <form onSubmit={addMatch} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <select value={t1Id} onChange={e => setT1Id(e.target.value)} style={sel}>{teams.map(t => <option key={t.id} value={t.id}>{t.shortName}</option>)}</select>
                  <span style={{ fontWeight: 'bold', color: '#777' }}>VS</span>
                  <select value={t2Id} onChange={e => setT2Id(e.target.value)} style={sel}>{teams.map(t => <option key={t.id} value={t.id}>{t.shortName}</option>)}</select>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <select value={mOvers} onChange={e => setMOvers(e.target.value)} style={sel}>
                    <option value="1">Custom 1-Over Match</option>
                    <option value="2">Custom 2-Over Match</option>
                    <option value="5">T5 Match (5 Overs)</option>
                    <option value="20">T20 Match (20 Overs)</option>
                  </select>
                  <button type="submit" style={{ padding: '12px 20px', background: '#e3b505', color: '#000', border: 'none', borderRadius: '5px', fontWeight: 'bold', width: '100%' }}>Create Match</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
