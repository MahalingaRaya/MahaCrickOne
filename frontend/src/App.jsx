import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [teams, setTeams] = useState([])
  const [players, setPlayers] = useState([])

  // Team Form State
  const [teamName, setTeamName] = useState('')
  const [shortName, setShortName] = useState('')

  // Player Form State
  const [playerName, setPlayerName] = useState('')
  const [playerRole, setPlayerRole] = useState('Batsman')
  const [selectedTeamId, setSelectedTeamId] = useState('')

  // Fetch Data from Render on Load
  useEffect(() => {
    fetchTeams()
    fetchPlayers()
  }, [])

  const fetchTeams = () => {
    fetch('https://mahacrickone.onrender.com/api/teams')
      .then(res => res.json())
      .then(data => {
         setTeams(data)
         // Default the player dropdown to the first team
         if(data.length > 0) setSelectedTeamId(data[0].id)
      })
      .catch(err => console.error(err))
  }

  const fetchPlayers = () => {
    fetch('https://mahacrickone.onrender.com/api/players')
      .then(res => res.json())
      .then(data => setPlayers(data))
      .catch(err => console.error(err))
  }

  // Handle Adding a Team
  const handleAddTeam = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch('https://mahacrickone.onrender.com/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: teamName, shortName: shortName })
      })
      if (res.ok) {
        fetchTeams() // Refresh list instantly
        setTeamName('')
        setShortName('')
      }
    } catch (error) { console.error(error) }
  }

  // Handle Adding a Player
  const handleAddPlayer = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch('https://mahacrickone.onrender.com/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: playerName,
          role: playerRole,
          team: { id: selectedTeamId } // Links the player to the exact team in MySQL
        })
      })
      if (res.ok) {
        fetchPlayers() // Refresh list instantly
        setPlayerName('')
      }
    } catch (error) { console.error(error) }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center' }}>Maha CrickOne Manager</h1>

      {/* 1. Create Team Section */}
      <div style={{ background: '#1e1e1e', color: '#fff', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
        <h2>Register a Franchise</h2>
        <form onSubmit={handleAddTeam}>
          <input type="text" placeholder="Team Name (e.g., Royal Challengers Bengaluru)" value={teamName} onChange={e => setTeamName(e.target.value)} required style={{ display: 'block', margin: '10px 0', padding: '12px', width: '95%', borderRadius: '5px', border: 'none' }} />
          <input type="text" placeholder="Short Name (e.g., RCB)" value={shortName} onChange={e => setShortName(e.target.value)} required style={{ display: 'block', margin: '10px 0', padding: '12px', width: '95%', borderRadius: '5px', border: 'none' }} />
          <button type="submit" style={{ width: '100%', padding: '12px', background: '#d32f2f', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}>Save Team</button>
        </form>
      </div>

      {/* 2. Create Player Section */}
      <div style={{ background: '#1e1e1e', color: '#fff', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
        <h2>Draft a Player</h2>
        <form onSubmit={handleAddPlayer}>
          <input type="text" placeholder="Player Name (e.g., Virat Kohli)" value={playerName} onChange={e => setPlayerName(e.target.value)} required style={{ display: 'block', margin: '10px 0', padding: '12px', width: '95%', borderRadius: '5px', border: 'none' }} />
          
          <select value={playerRole} onChange={e => setPlayerRole(e.target.value)} style={{ display: 'block', margin: '10px 0', padding: '12px', width: '100%', borderRadius: '5px', border: 'none' }}>
            <option value="Batsman">Batsman</option>
            <option value="Bowler">Bowler</option>
            <option value="All-Rounder">All-Rounder</option>
            <option value="Wicketkeeper">Wicketkeeper</option>
          </select>

          <select value={selectedTeamId} onChange={e => setSelectedTeamId(e.target.value)} required style={{ display: 'block', margin: '10px 0', padding: '12px', width: '100%', borderRadius: '5px', border: 'none' }}>
            <option value="" disabled>Select Team</option>
            {teams.map(t => (
              <option key={t.id} value={t.id}>{t.name} ({t.shortName})</option>
            ))}
          </select>

          <button type="submit" disabled={teams.length === 0} style={{ width: '100%', padding: '12px', background: '#e3b505', color: '#000', border: 'none', borderRadius: '5px', fontWeight: 'bold', marginTop: '10px' }}>
            {teams.length === 0 ? "Add a Team First" : "Save Player to Roster"}
          </button>
        </form>
      </div>

      {/* 3. Display Roster */}
      <div>
        <h2>Active Players</h2>
        {players.length === 0 ? (
          <p>No players drafted yet!</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {players.map(player => (
              <li key={player.id} style={{ padding: '15px', background: '#f4f4f4', marginBottom: '10px', borderRadius: '5px', borderLeft: '5px solid #e3b505' }}>
                <strong>{player.name}</strong> - {player.role} <br/>
                <small style={{ color: '#555' }}>Team: {player.team?.shortName || 'Unassigned'}</small>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default App
