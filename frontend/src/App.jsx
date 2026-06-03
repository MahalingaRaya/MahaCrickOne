import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [teams, setTeams] = useState([])
  const [teamName, setTeamName] = useState('')
  const [shortName, setShortName] = useState('')

  // 1. Fetch Teams from Render on load
  useEffect(() => {
    fetch('https://mahacrickone.onrender.com/api/teams')
      .then(res => res.json())
      .then(data => setTeams(data))
      .catch(err => console.error("Error fetching teams:", err))
  }, [])

  // 2. Send New Team to Render
  const handleAddTeam = async (e) => {
    e.preventDefault()
    const newTeam = { name: teamName, shortName: shortName }
    
    try {
      const response = await fetch('https://mahacrickone.onrender.com/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTeam)
      })
      
      if (response.ok) {
        const savedTeam = await response.json()
        setTeams([...teams, savedTeam]) // Update the UI instantly
        setTeamName('') // Clear the form
        setShortName('')
      }
    } catch (error) {
      console.error("Error saving team:", error)
    }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center' }}>Maha CrickOne Manager</h1>
      
      {/* Create Team Form */}
      <div style={{ background: '#1e1e1e', color: '#fff', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
        <h2>Register a Franchise</h2>
        <form onSubmit={handleAddTeam}>
          <input 
            type="text" 
            placeholder="Team Name (e.g., Royal Challengers Bengaluru)" 
            value={teamName}
            onChange={e => setTeamName(e.target.value)}
            required
            style={{ display: 'block', margin: '10px 0', padding: '12px', width: '95%', borderRadius: '5px', border: 'none' }}
          />
          <input 
            type="text" 
            placeholder="Short Name (e.g., RCB)" 
            value={shortName}
            onChange={e => setShortName(e.target.value)}
            required
            style={{ display: 'block', margin: '10px 0', padding: '12px', width: '95%', borderRadius: '5px', border: 'none' }}
          />
          <button type="submit" style={{ width: '100%', padding: '12px', background: '#d32f2f', color: 'white', border: 'none', borderRadius: '5px', fontSize: '16px', fontWeight: 'bold', marginTop: '10px' }}>
            Save Team to Database
          </button>
        </form>
      </div>

      {/* Display Teams List */}
      <div>
        <h2>Active Teams</h2>
        {teams.length === 0 ? (
          <p>No teams found. Add the first one above!</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {teams.map(team => (
              <li key={team.id} style={{ padding: '15px', background: '#f4f4f4', marginBottom: '10px', borderRadius: '5px', borderLeft: '5px solid #d32f2f' }}>
                <strong>{team.name}</strong> ({team.shortName})
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default App
