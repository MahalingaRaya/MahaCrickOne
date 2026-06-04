import { useState, useEffect } from 'react'
import './App.css'

function App() {
  // Navigation State (Solves Problem #1)
  const [activePage, setActivePage] = useState('admin') // 'admin' or 'match'

  // Data States
  const [teams, setTeams] = useState([])
  const [players, setPlayers] = useState([])
  const [matches, setMatches] = useState([])

  // Admin Forms
  const [teamName, setTeamName] = useState('')
  const [shortName, setShortName] = useState('')
  const [playerName, setPlayerName] = useState('')
  const [playerRole, setPlayerRole] = useState('Batsman')
  const [selectedTeamId, setSelectedTeamId] = useState('')
  const [team1Id, setTeam1Id] = useState('')
  const [team2Id, setTeam2Id] = useState('')
  const [totalOvers, setTotalOvers] = useState(20)

  // Live Scoring States
  const [activeMatchId, setActiveMatchId] = useState('')
  const [batterId, setBatterId] = useState('')
  const [bowlerId, setBowlerId] = useState('')
  
  // Scoreboard Display States (Priority 1)
  const [currentScore, setCurrentScore] = useState(0)
  const [currentWickets, setCurrentWickets] = useState(0)
  const [currentOver, setCurrentOver] = useState(0)
  const [currentBall, setCurrentBall] = useState(1)
  const [innings, setInnings] = useState(1)

  useEffect(() => {
    fetchTeams()
    fetchPlayers()
    fetchMatches()
  }, [])

  const fetchTeams = () => fetch('https://mahacrickone.onrender.com/api/teams').then(res => res.json()).then(data => { setTeams(data); if(data.length > 0) { setSelectedTeamId(data[0].id); setTeam1Id(data[0].id); if(data.length > 1) setTeam2Id(data[1].id); } }).catch(console.error)
  const fetchPlayers = () => fetch('https://mahacrickone.onrender.com/api/players').then(res => res.json()).then(setPlayers).catch(console.error)
  const fetchMatches = () => fetch('https://mahacrickone.onrender.com/api/matches').then(res => res.json()).then(data => { setMatches(data); if(data.length > 0 && !activeMatchId) setActiveMatchId(data[0].id); }).catch(console.error)

  // Handlers
  const handleAddTeam = async (e) => {
    e.preventDefault()
    const res = await fetch('https://mahacrickone.onrender.com/api/teams', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: teamName, shortName: shortName }) })
    if (res.ok) { fetchTeams(); setTeamName(''); setShortName(''); }
  }

  const handleAddPlayer = async (e) => {
    e.preventDefault()
    const res = await fetch('https://mahacrickone.onrender.com/api/players', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: playerName, role: playerRole, team: { id: parseInt(selectedTeamId) } }) })
    if (res.ok) { fetchPlayers(); setPlayerName(''); }
  }

  const handleAddMatch = async (e) => {
    e.preventDefault()
    const res = await fetch('https://mahacrickone.onrender.com/api/matches', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ team1Id: team1Id.toString(), team2Id: team2Id.toString(), totalOvers: totalOvers.toString() }) })
    if (res.ok) { fetchMatches(); alert("Match Scheduled!") }
  }

  const handleScoreBall = async (runs, isWicket = false) => {
      const payload = {
          matchId: activeMatchId.toString(), batterId: batterId.toString(), bowlerId: bowlerId.toString(),
          innings: innings.toString(), overNumber: currentOver.toString(), ballNumber: currentBall.toString(),
          runsScored: runs.toString(), extras: "0", isWicket: isWicket.toString(), wicketType: isWicket ? "Caught" : ""
      }

      const res = await fetch('https://mahacrickone.onrender.com/api/deliveries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (res.ok) {
          // Update Local Scoreboard Visually
          setCurrentScore(prev => prev + runs)
          if (isWicket) setCurrentWickets(prev => prev + 1)

          if (currentBall === 6) { setCurrentOver(currentOver + 1); setCurrentBall(1); } 
          else { setCurrentBall(currentBall + 1); }
      }
  }

  const isReadyToScore = activeMatchId !== '' && batterId !== '' && bowlerId !== '';

  // Get active match details for the scoreboard
  const activeMatch = matches.find(m => m.id.toString() === activeMatchId.toString());

  return (
    <div style={{ backgroundColor: '#050505', minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif', paddingBottom: '50px' }}>
      
      {/* BRANDING HEADER (Solves Problem #5) */}
      <header style={{ backgroundColor: '#111', padding: '20px', textAlign: 'center', borderBottom: '2px solid #e3b505', boxShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
        <h1 style={{ margin: 0, color: '#e3b505', fontSize: '28px', textTransform: 'uppercase', letterSpacing: '1px' }}>🏏 Maha CrickOne</h1>
        <p style={{ margin: '5px 0 0 0', color: '#aaa', fontSize: '14px', fontStyle: 'italic' }}>One Platform. Every Match. Every Player.</p>
      </header>

      {/* NAVIGATION TABS */}
      <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0', gap: '10px' }}>
        <button 
          onClick={() => setActivePage('admin')} 
          style={{ padding: '10px 20px', borderRadius: '30px', border: 'none', fontWeight: 'bold', backgroundColor: activePage === 'admin' ? '#fff' : '#333', color: activePage === 'admin' ? '#000' : '#fff' }}>
          Dashboard
        </button>
        <button 
          onClick={() => setActivePage('match')} 
          style={{ padding: '10px 20px', borderRadius: '30px', border: 'none', fontWeight: 'bold', backgroundColor: activePage === 'match' ? '#e3b505' : '#333', color: activePage === 'match' ? '#000' : '#fff' }}>
          Live Match
        </button>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '0 15px' }}>

        {/* =========================================
            VIEW 1: LIVE SCORING PAGE 
            ========================================= */}
        {activePage === 'match' && (
          <div>
            {/* SCOREBOARD HEADER (Priority 1) */}
            <div style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%)', borderRadius: '15px', padding: '20px', border: '1px solid #333', textAlign: 'center', marginBottom: '20px', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '10px', right: '15px', color: '#d32f2f', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '10px', height: '10px', backgroundColor: '#d32f2f', borderRadius: '50%', animation: 'blink 1.5s infinite' }}></div> LIVE
              </div>
              
              <h3 style={{ margin: '0 0 10px 0', color: '#ccc' }}>
                {activeMatch ? `${activeMatch.team1?.shortName} vs ${activeMatch.team2?.shortName}` : "Select a Match Below"}
              </h3>
              
              <div style={{ fontSize: '48px', fontWeight: '900', color: '#fff', margin: '10px 0' }}>
                {currentScore} <span style={{ color: '#888', fontSize: '32px' }}>/ {currentWickets}</span>
              </div>
              
              <div style={{ fontSize: '18px', color: '#aaa' }}>
                Over: <span style={{ color: '#fff', fontWeight: 'bold' }}>{currentOver}.{currentBall - 1}</span> 
                <span style={{ margin: '0 10px' }}>|</span> 
                Innings: <span style={{ color: '#fff', fontWeight: 'bold' }}>{innings}</span>
              </div>
            </div>

            {/* SCORING CONTROLS */}
            <div style={{ background: '#111', padding: '20px', borderRadius: '15px', border: '1px solid #222' }}>
              
              <select value={activeMatchId} onChange={e => setActiveMatchId(e.target.value)} style={{ display: 'block', width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '8px', background: '#222', color: '#fff', border: '1px solid #444' }}>
                  <option value="" disabled>Select Live Match</option>
                  {matches.map(m => <option key={m.id} value={m.id}>{m.team1?.shortName} vs {m.team2?.shortName}</option>)}
              </select>

              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                  <select value={batterId} onChange={e => setBatterId(e.target.value)} style={{ flex: 1, padding: '12px', borderRadius: '8px', background: '#222', color: '#fff', border: '1px solid #444' }}>
                      <option value="" disabled>Striker</option>
                      {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <select value={bowlerId} onChange={e => setBowlerId(e.target.value)} style={{ flex: 1, padding: '12px', borderRadius: '8px', background: '#222', color: '#fff', border: '1px solid #444' }}>
                      <option value="" disabled>Bowler</option>
                      {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
              </div>

              {/* EXTRAS (Problem #3) */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', opacity: isReadyToScore ? 1 : 0.4 }}>
                 {['Wide', 'No Ball', 'Bye', 'Leg Bye'].map(extra => (
                    <button key={extra} disabled={!isReadyToScore} style={{ flex: 1, margin: '0 2px', padding: '10px 0', backgroundColor: '#333', color: '#ccc', border: '1px solid #555', borderRadius: '5px', fontSize: '12px', fontWeight: 'bold' }}>{extra}</button>
                 ))}
              </div>

              {/* RUNS */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', opacity: isReadyToScore ? 1 : 0.4 }}>
                  {[0, 1, 2, 3, 4, 6].map(runs => (
                      <button 
                        key={runs} disabled={!isReadyToScore} onClick={() => handleScoreBall(runs)} 
                        style={{ padding: '20px', fontSize: '24px', fontWeight: 'bold', background: runs === 4 || runs === 6 ? '#28a745' : '#444', color: '#fff', border: 'none', borderRadius: '10px', boxShadow: '0 4px 0 #111' }}>
                          {runs}
                      </button>
                  ))}
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '15px', opacity: isReadyToScore ? 1 : 0.4 }}>
                <button disabled={!isReadyToScore} onClick={() => handleScoreBall(0, true)} style={{ flex: 2, padding: '20px', fontSize: '22px', fontWeight: 'bold', background: '#d32f2f', color: '#fff', border: 'none', borderRadius: '10px', boxShadow: '0 4px 0 #601010' }}>
                    WICKET
                </button>
                <button disabled={!isReadyToScore} style={{ flex: 1, padding: '20px', fontSize: '18px', fontWeight: 'bold', background: '#555', color: '#fff', border: 'none', borderRadius: '10px', boxShadow: '0 4px 0 #222' }}>
                    UNDO
                </button>
              </div>

            </div>
          </div>
        )}

        {/* =========================================
            VIEW 2: ADMIN DASHBOARD 
            ========================================= */}
        {activePage === 'admin' && (
          <div>
            <div style={{ background: '#111', padding: '20px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #333' }}>
              <h3 style={{ margin: '0 0 15px 0', borderBottom: '1px solid #333', paddingBottom: '10px' }}>1. Franchise Teams</h3>
              <form onSubmit={handleAddTeam} style={{ display: 'flex', gap: '10px' }}>
                <input type="text" placeholder="Team Name" value={teamName} onChange={e => setTeamName(e.target.value)} required style={{ flex: 2, padding: '12px', borderRadius: '5px', border: 'none', background: '#222', color: '#fff' }} />
                <input type="text" placeholder="Short" value={shortName} onChange={e => setShortName(e.target.value)} required style={{ flex: 1, padding: '12px', borderRadius: '5px', border: 'none', background: '#222', color: '#fff' }} />
                <button type="submit" style={{ padding: '0 20px', background: '#fff', color: '#000', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}>Add</button>
              </form>
            </div>

            <div style={{ background: '#111', padding: '20px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #333' }}>
              <h3 style={{ margin: '0 0 15px 0', borderBottom: '1px solid #333', paddingBottom: '10px' }}>2. Player Roster</h3>
              <form onSubmit={handleAddPlayer}>
                <input type="text" placeholder="Player Name" value={playerName} onChange={e => setPlayerName(e.target.value)} required style={{ display: 'block', width: '100%', boxSizing: 'border-box', padding: '12px', marginBottom: '10px', borderRadius: '5px', border: 'none', background: '#222', color: '#fff' }} />
                <div style={{ display: 'flex', gap: '10px' }}>
                    <select value={selectedTeamId} onChange={e => setSelectedTeamId(e.target.value)} required style={{ flex: 1, padding: '12px', borderRadius: '5px', border: 'none', background: '#222', color: '#fff' }}>
                      <option value="" disabled>Select Team</option>
                      {teams.map(t => <option key={t.id} value={t.id}>{t.shortName}</option>)}
                    </select>
                    <button type="submit" style={{ padding: '0 20px', background: '#fff', color: '#000', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}>Draft</button>
                </div>
              </form>
            </div>

            <div style={{ background: '#111', padding: '20px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #333' }}>
              <h3 style={{ margin: '0 0 15px 0', borderBottom: '1px solid #333', paddingBottom: '10px' }}>3. Match Scheduling</h3>
              <form onSubmit={handleAddMatch} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <select value={team1Id} onChange={e => setTeam1Id(e.target.value)} style={{ flex: 1, padding: '12px', borderRadius: '5px', border: 'none', background: '#222', color: '#fff' }}>
                  {teams.map(t => <option key={t.id} value={t.id}>{t.shortName}</option>)}
                </select>
                <span style={{ fontWeight: 'bold', color: '#777' }}>VS</span>
                <select value={team2Id} onChange={e => setTeam2Id(e.target.value)} style={{ flex: 1, padding: '12px', borderRadius: '5px', border: 'none', background: '#222', color: '#fff' }}>
                  {teams.map(t => <option key={t.id} value={t.id}>{t.shortName}</option>)}
                </select>
                <button type="submit" style={{ padding: '12px 20px', background: '#fff', color: '#000', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}>Create</button>
              </form>
            </div>
          </div>
        )}

      </div>
      
      {/* CSS for the blinking live light */}
      <style>{`
        @keyframes blink {
          0% { opacity: 1; }
          50% { opacity: 0.2; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}

export default App
