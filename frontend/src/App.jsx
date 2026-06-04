import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [teams, setTeams] = useState([])
  const [players, setPlayers] = useState([])
  const [matches, setMatches] = useState([])

  const [teamName, setTeamName] = useState('')
  const [shortName, setShortName] = useState('')
  const [playerName, setPlayerName] = useState('')
  const [playerRole, setPlayerRole] = useState('Batsman')
  const [selectedTeamId, setSelectedTeamId] = useState('')
  
  const [team1Id, setTeam1Id] = useState('')
  const [team2Id, setTeam2Id] = useState('')
  const [totalOvers, setTotalOvers] = useState(20)

  const [activeMatchId, setActiveMatchId] = useState('')
  const [batterId, setBatterId] = useState('')
  const [bowlerId, setBowlerId] = useState('')
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

  const handleAddTeam = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch('https://mahacrickone.onrender.com/api/teams', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: teamName, shortName: shortName }) })
      if (res.ok) { fetchTeams(); setTeamName(''); setShortName(''); }
    } catch (error) { console.error(error) }
  }

  const handleAddPlayer = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch('https://mahacrickone.onrender.com/api/players', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: playerName, role: playerRole, team: { id: parseInt(selectedTeamId) } }) })
      if (res.ok) { fetchPlayers(); setPlayerName(''); }
    } catch (error) { console.error(error) }
  }

  const handleAddMatch = async (e) => {
    e.preventDefault()
    if (!team1Id || !team2Id) return alert("Need 2 teams!")
    if (team1Id === team2Id) return alert("Cannot play itself!")
    try {
      const res = await fetch('https://mahacrickone.onrender.com/api/matches', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ team1Id: team1Id.toString(), team2Id: team2Id.toString(), totalOvers: totalOvers.toString() }) })
      if (res.ok) { fetchMatches(); alert("Match Scheduled!") }
    } catch (error) { console.error(error) }
  }

  const handleScoreBall = async (runs, isWicket = false) => {
      const payload = {
          matchId: activeMatchId.toString(),
          batterId: batterId.toString(),
          bowlerId: bowlerId.toString(),
          innings: innings.toString(),
          overNumber: currentOver.toString(),
          ballNumber: currentBall.toString(),
          runsScored: runs.toString(),
          extras: "0",
          isWicket: isWicket.toString(),
          wicketType: isWicket ? "Caught" : ""
      }

      try {
          const res = await fetch('https://mahacrickone.onrender.com/api/deliveries', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
          })
          if (res.ok) {
              if (currentBall === 6) { setCurrentOver(currentOver + 1); setCurrentBall(1); } 
              else { setCurrentBall(currentBall + 1); }
          } else {
              const err = await res.text()
              alert("Scoring Error: " + err)
          }
      } catch (error) { alert("Network Error: " + error.message) }
  }

  // Determine if the user is allowed to score
  const isReadyToScore = activeMatchId !== '' && batterId !== '' && bowlerId !== '';

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto', paddingBottom: '100px' }}>
      <h1 style={{ textAlign: 'center', color: '#e3b505' }}>Maha CrickOne</h1>

      <div style={{ background: '#0a0a0a', border: '1px solid #333', color: '#fff', padding: '20px', borderRadius: '10px', marginBottom: '30px' }}>
        <h2 style={{ textAlign: 'center', margin: '0 0 15px 0', color: '#fff' }}>🔴 Live Scorer</h2>
        
        <select value={activeMatchId} onChange={e => setActiveMatchId(e.target.value)} style={{ display: 'block', margin: '10px 0', padding: '12px', width: '100%', borderRadius: '5px', background: '#222', color: '#fff', border: '1px solid #555' }}>
            <option value="" disabled>Select Live Match</option>
            {matches.map(m => <option key={m.id} value={m.id}>{m.team1?.shortName} vs {m.team2?.shortName}</option>)}
        </select>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <select value={batterId} onChange={e => setBatterId(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '5px', background: '#222', color: '#fff', border: '1px solid #555' }}>
                <option value="" disabled>Select Striker</option>
                {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <select value={bowlerId} onChange={e => setBowlerId(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '5px', background: '#222', color: '#fff', border: '1px solid #555' }}>
                <option value="" disabled>Select Bowler</option>
                {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
        </div>

        <div style={{ textAlign: 'center', margin: '15px 0', fontSize: '20px', fontWeight: 'bold' }}>
            Over: {currentOver}.{currentBall - 1} <span style={{fontSize: '14px', color: '#888'}}>(Innings {innings})</span>
        </div>

        {/* VISUAL LOCK: Tells the user exactly what to do */}
        {!isReadyToScore && (
            <div style={{ background: '#d32f2f', color: '#fff', padding: '10px', borderRadius: '5px', textAlign: 'center', marginBottom: '15px', fontWeight: 'bold' }}>
                ⚠️ Select a Match, Striker, and Bowler above to unlock the scoring pad!
            </div>
        )}

        {/* Scoring Buttons (Disabled visually and functionally if not ready) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', opacity: isReadyToScore ? 1 : 0.4 }}>
            {[0, 1, 2, 3, 4, 6].map(runs => (
                <button 
                  key={runs} 
                  disabled={!isReadyToScore}
                  onClick={() => handleScoreBall(runs)} 
                  style={{ padding: '20px', fontSize: '24px', fontWeight: 'bold', background: runs === 4 || runs === 6 ? '#28a745' : '#333', color: '#fff', border: 'none', borderRadius: '8px', cursor: isReadyToScore ? 'pointer' : 'not-allowed' }}>
                    {runs}
                </button>
            ))}
        </div>
        <button 
          disabled={!isReadyToScore}
          onClick={() => handleScoreBall(0, true)} 
          style={{ width: '100%', padding: '20px', marginTop: '10px', fontSize: '24px', fontWeight: 'bold', background: '#d32f2f', color: '#fff', border: 'none', borderRadius: '8px', cursor: isReadyToScore ? 'pointer' : 'not-allowed', opacity: isReadyToScore ? 1 : 0.4 }}>
            WICKET
        </button>
      </div>

      <hr style={{ borderColor: '#333', margin: '30px 0' }} />

      <h3 style={{ color: '#888', textAlign: 'center' }}>Admin Dashboard</h3>
      
      <div style={{ background: '#1e1e1e', color: '#fff', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
        <h4>1. Teams</h4>
        <form onSubmit={handleAddTeam} style={{ display: 'flex', gap: '5px' }}>
          <input type="text" placeholder="Name" value={teamName} onChange={e => setTeamName(e.target.value)} required style={{ flex: 2, padding: '10px', borderRadius: '5px', border: 'none' }} />
          <input type="text" placeholder="Short" value={shortName} onChange={e => setShortName(e.target.value)} required style={{ flex: 1, padding: '10px', borderRadius: '5px', border: 'none' }} />
          <button type="submit" style={{ padding: '10px 15px', background: '#555', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}>Add</button>
        </form>
      </div>

      <div style={{ background: '#1e1e1e', color: '#fff', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
        <h4>2. Players</h4>
        <form onSubmit={handleAddPlayer}>
          <input type="text" placeholder="Player Name" value={playerName} onChange={e => setPlayerName(e.target.value)} required style={{ display: 'block', width: '90%', padding: '10px', marginBottom: '10px', borderRadius: '5px', border: 'none' }} />
          <div style={{ display: 'flex', gap: '5px' }}>
              <select value={selectedTeamId} onChange={e => setSelectedTeamId(e.target.value)} required style={{ flex: 1, padding: '10px', borderRadius: '5px', border: 'none' }}>
                <option value="" disabled>Team</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.shortName}</option>)}
              </select>
              <button type="submit" style={{ padding: '10px 15px', background: '#555', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}>Draft</button>
          </div>
        </form>
      </div>

      <div style={{ background: '#1e1e1e', color: '#fff', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
        <h4>3. Matches</h4>
        <form onSubmit={handleAddMatch} style={{ display: 'flex', gap: '5px' }}>
          <select value={team1Id} onChange={e => setTeam1Id(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '5px', border: 'none' }}>
            {teams.map(t => <option key={t.id} value={t.id}>{t.shortName}</option>)}
          </select>
          <span style={{ padding: '10px 0', fontWeight: 'bold' }}>vs</span>
          <select value={team2Id} onChange={e => setTeam2Id(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '5px', border: 'none' }}>
            {teams.map(t => <option key={t.id} value={t.id}>{t.shortName}</option>)}
          </select>
          <button type="submit" style={{ padding: '10px 15px', background: '#555', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}>Create</button>
        </form>
      </div>

    </div>
  )
}

export default App
