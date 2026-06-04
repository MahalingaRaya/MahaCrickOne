import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [teams, setTeams] = useState([])
  const [players, setPlayers] = useState([])
  const [matches, setMatches] = useState([])

  // Form States
  const [teamName, setTeamName] = useState('')
  const [shortName, setShortName] = useState('')
  const [playerName, setPlayerName] = useState('')
  const [playerRole, setPlayerRole] = useState('Batsman')
  const [selectedTeamId, setSelectedTeamId] = useState('')
  
  // Match States
  const [team1Id, setTeam1Id] = useState('')
  const [team2Id, setTeam2Id] = useState('')
  const [totalOvers, setTotalOvers] = useState(20)

  // Fetch Data on Load
  useEffect(() => {
    fetchTeams()
    fetchPlayers()
    fetchMatches()
  }, [])

  const fetchTeams = () => {
    fetch('https://mahacrickone.onrender.com/api/teams')
      .then(res => res.json())
      .then(data => {
         setTeams(data)
         if(data.length > 0) {
             setSelectedTeamId(data[0].id)
             setTeam1Id(data[0].id)
             if(data.length > 1) setTeam2Id(data[1].id)
         }
      }).catch(err => console.error(err))
  }

  const fetchPlayers = () => {
    fetch('https://mahacrickone.onrender.com/api/players')
      .then(res => res.json())
      .then(data => setPlayers(data)).catch(err => console.error(err))
  }

  const fetchMatches = () => {
    fetch('https://mahacrickone.onrender.com/api/matches')
      .then(res => res.json())
      .then(data => setMatches(data)).catch(err => console.error(err))
  }

  // Handlers
  const handleAddTeam = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch('https://mahacrickone.onrender.com/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: teamName, shortName: shortName })
      })
      if (res.ok) { fetchTeams(); setTeamName(''); setShortName(''); }
    } catch (error) { console.error(error) }
  }

  const handleAddPlayer = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch('https://mahacrickone.onrender.com/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: playerName, role: playerRole, team: { id: parseInt(selectedTeamId) } })
      })
      if (res.ok) { fetchPlayers(); setPlayerName(''); }
    } catch (error) { console.error(error) }
  }

  const handleAddMatch = async (e) => {
    e.preventDefault()
    
    if (!team1Id || !team2Id) {
        alert("Please make sure you have created at least 2 teams first!")
        return
    }
    if (team1Id === team2Id) {
        alert("A team cannot play against itself!")
        return
    }
    
    try {
      // Force IDs to be Integers for Java
      const payload = { 
          team1: { id: parseInt(team1Id) }, 
          team2: { id: parseInt(team2Id) }, 
          totalOvers: parseInt(totalOvers) 
      }
      
      const res = await fetch('https://mahacrickone.onrender.com/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      if (res.ok) { 
          fetchMatches(); 
          alert("Match Scheduled Successfully! ✅")
      } else {
          // If the backend fails, this will tell us exactly why
          const errText = await res.text();
          alert(`Backend Error (${res.status}): ` + errText)
      }
    } catch (error) { 
        alert("Network Error: " + error.message) 
    }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center' }}>Maha CrickOne Manager</h1>

      {/* 1. Create Team */}
      <div style={{ background: '#1e1e1e', color: '#fff', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
        <h2>Register Franchise</h2>
        <form onSubmit={handleAddTeam}>
          <input type="text" placeholder="Team Name" value={teamName} onChange={e => setTeamName(e.target.value)} required style={{ display: 'block', margin: '10px 0', padding: '12px', width: '95%', borderRadius: '5px', border: 'none' }} />
          <input type="text" placeholder="Short Name" value={shortName} onChange={e => setShortName(e.target.value)} required style={{ display: 'block', margin: '10px 0', padding: '12px', width: '95%', borderRadius: '5px', border: 'none' }} />
          <button type="submit" style={{ width: '100%', padding: '12px', background: '#d32f2f', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}>Save Team</button>
        </form>
      </div>

      {/* 2. Draft Player */}
      <div style={{ background: '#1e1e1e', color: '#fff', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
        <h2>Draft Player</h2>
        <form onSubmit={handleAddPlayer}>
          <input type="text" placeholder="Player Name" value={playerName} onChange={e => setPlayerName(e.target.value)} required style={{ display: 'block', margin: '10px 0', padding: '12px', width: '95%', borderRadius: '5px', border: 'none' }} />
          <select value={playerRole} onChange={e => setPlayerRole(e.target.value)} style={{ display: 'block', margin: '10px 0', padding: '12px', width: '100%', borderRadius: '5px', border: 'none' }}>
            <option value="Batsman">Batsman</option>
            <option value="Bowler">Bowler</option>
            <option value="All-Rounder">All-Rounder</option>
          </select>
          <select value={selectedTeamId} onChange={e => setSelectedTeamId(e.target.value)} required style={{ display: 'block', margin: '10px 0', padding: '12px', width: '100%', borderRadius: '5px', border: 'none' }}>
            <option value="" disabled>Select Team</option>
            {teams.map(t => <option key={t.id} value={t.id}>{t.name} ({t.shortName})</option>)}
          </select>
          <button type="submit" disabled={teams.length === 0} style={{ width: '100%', padding: '12px', background: '#e3b505', color: '#000', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}>Save Player</button>
        </form>
      </div>

      {/* 3. Schedule Match */}
      <div style={{ background: '#1e1e1e', color: '#fff', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
        <h2>Schedule Match</h2>
        <form onSubmit={handleAddMatch}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
            <div style={{ width: '48%' }}>
              <label style={{ fontSize: '12px' }}>Team 1</label>
              <select value={team1Id} onChange={e => setTeam1Id(e.target.value)} required style={{ display: 'block', margin: '5px 0', padding: '12px', width: '100%', borderRadius: '5px', border: 'none' }}>
                {teams.map(t => <option key={t.id} value={t.id}>{t.shortName}</option>)}
              </select>
            </div>
            <div style={{ width: '48%' }}>
              <label style={{ fontSize: '12px' }}>Team 2</label>
              <select value={team2Id} onChange={e => setTeam2Id(e.target.value)} required style={{ display: 'block', margin: '5px 0', padding: '12px', width: '100%', borderRadius: '5px', border: 'none' }}>
                {teams.map(t => <option key={t.id} value={t.id}>{t.shortName}</option>)}
              </select>
            </div>
          </div>
          <input type="number" placeholder="Total Overs" value={totalOvers} onChange={e => setTotalOvers(e.target.value)} required style={{ display: 'block', margin: '10px 0', padding: '12px', width: '95%', borderRadius: '5px', border: 'none' }} />
          <button type="submit" disabled={teams.length < 2} style={{ width: '100%', padding: '12px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}>
            {teams.length < 2 ? "Need at least 2 teams" : "Create Fixture"}
          </button>
        </form>
      </div>

      {/* 4. Upcoming Fixtures */}
      <div>
        <h2>Upcoming Fixtures</h2>
        {matches.length === 0 ? <p>No matches scheduled yet!</p> : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {matches.map(match => (
              <li key={match.id} style={{ padding: '15px', background: '#f4f4f4', marginBottom: '10px', borderRadius: '5px', borderLeft: '5px solid #28a745', textAlign: 'center', fontSize: '18px', color: '#000' }}>
                <strong>{match.team1?.shortName || '?'} vs {match.team2?.shortName || '?'}</strong> <br/>
                <span style={{ fontSize: '14px', color: '#555', background: '#e0e0e0', padding: '3px 8px', borderRadius: '12px' }}>{match.totalOvers} Overs • {match.status}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

    </div>
  )
}

export default App
