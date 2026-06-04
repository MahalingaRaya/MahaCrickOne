import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [activePage, setActivePage] = useState('match')

  // Data States
  const [teams, setTeams] = useState([])
  const [players, setPlayers] = useState([])
  const [matches, setMatches] = useState([])
  const [events, setEvents] = useState([]) // NEW: Event Ledger

  // Forms
  const [teamName, setTeamName] = useState('')
  const [shortName, setShortName] = useState('')
  const [playerName, setPlayerName] = useState('')
  const [selectedTeamId, setSelectedTeamId] = useState('')
  const [team1Id, setTeam1Id] = useState('')
  const [team2Id, setTeam2Id] = useState('')

  // Live Match States
  const [activeMatchId, setActiveMatchId] = useState('')
  const [batterId, setBatterId] = useState('')
  const [bowlerId, setBowlerId] = useState('')

  // Fetch initial data
  useEffect(() => {
    fetchTeams()
    fetchPlayers()
    fetchMatches()
  }, [])

  // NEW: Fetch Match Ledger whenever the active match changes
  useEffect(() => {
    if (activeMatchId) {
      fetch(`https://mahacrickone.onrender.com/api/events/match/${activeMatchId}`)
        .then(res => res.json())
        .then(data => setEvents(data))
        .catch(console.error)
    }
  }, [activeMatchId])

  const fetchTeams = () => fetch('https://mahacrickone.onrender.com/api/teams').then(res => res.json()).then(data => { setTeams(data); if(data.length > 0) { setSelectedTeamId(data[0].id); setTeam1Id(data[0].id); if(data.length > 1) setTeam2Id(data[1].id); } }).catch(console.error)
  const fetchPlayers = () => fetch('https://mahacrickone.onrender.com/api/players').then(res => res.json()).then(setPlayers).catch(console.error)
  const fetchMatches = () => fetch('https://mahacrickone.onrender.com/api/matches').then(res => res.json()).then(data => { setMatches(data); if(data.length > 0 && !activeMatchId) setActiveMatchId(data[0].id); }).catch(console.error)

  const handleAddTeam = async (e) => { e.preventDefault(); const res = await fetch('https://mahacrickone.onrender.com/api/teams', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: teamName, shortName: shortName }) }); if (res.ok) { fetchTeams(); setTeamName(''); setShortName(''); } }
  const handleAddPlayer = async (e) => { e.preventDefault(); const res = await fetch('https://mahacrickone.onrender.com/api/players', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: playerName, role: 'Batsman', team: { id: parseInt(selectedTeamId) } }) }); if (res.ok) { fetchPlayers(); setPlayerName(''); } }
  const handleAddMatch = async (e) => { e.preventDefault(); const res = await fetch('https://mahacrickone.onrender.com/api/matches', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ team1Id: team1Id.toString(), team2Id: team2Id.toString(), totalOvers: "20" }) }); if (res.ok) { fetchMatches(); alert("Match Scheduled!") } }

  // ---------------------------------------------------------
  // EVENT SOURCING CALCULATIONS (The Engine)
  // ---------------------------------------------------------
  const totalRuns = events.reduce((sum, ev) => sum + ev.runs, 0)
  const totalWickets = events.filter(ev => ev.wicket).length
  const legalBalls = events.filter(ev => ev.extraType !== 'WIDE' && ev.extraType !== 'NO_BALL').length
  const calcOvers = Math.floor(legalBalls / 6)
  const calcBalls = legalBalls % 6

  // NEW: Rewired to hit /api/events
  const handleScoreBall = async (runs, isWicket = false, extraType = null) => {
      const payload = {
          matchId: parseInt(activeMatchId),
          overNumber: calcOvers,
          ballNumber: calcBalls + 1,
          runs: runs,
          wicket: isWicket,
          extraType: extraType
      }

      try {
          const res = await fetch('https://mahacrickone.onrender.com/api/events', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
          })
          
          if (res.ok) {
              // Instantly fetch the updated ledger to recalculate the scoreboard!
              const updatedEvents = await fetch(`https://mahacrickone.onrender.com/api/events/match/${activeMatchId}`).then(r => r.json())
              setEvents(updatedEvents)
          } else {
              alert("Backend Error Saving Ball!")
          }
      } catch (error) { 
          alert("Network Error: " + error.message) 
      }
  }

  const isReadyToScore = activeMatchId !== '' && batterId !== '' && bowlerId !== '';
  const activeMatch = matches.find(m => m.id.toString() === activeMatchId.toString());

  return (
    <div style={{ backgroundColor: '#050505', minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif', paddingBottom: '50px' }}>
      
      <header style={{ backgroundColor: '#111', padding: '20px', textAlign: 'center', borderBottom: '2px solid #e3b505' }}>
        <h1 style={{ margin: 0, color: '#e3b505', fontSize: '28px', textTransform: 'uppercase', letterSpacing: '1px' }}>🏏 Maha CrickOne</h1>
        <p style={{ margin: '5px 0 0 0', color: '#aaa', fontSize: '14px', fontStyle: 'italic' }}>One Platform. Every Match. Every Player.</p>
      </header>

      <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0', gap: '10px' }}>
        <button onClick={() => setActivePage('admin')} style={{ padding: '10px 20px', borderRadius: '30px', border: 'none', fontWeight: 'bold', backgroundColor: activePage === 'admin' ? '#fff' : '#333', color: activePage === 'admin' ? '#000' : '#fff' }}>Dashboard</button>
        <button onClick={() => setActivePage('match')} style={{ padding: '10px 20px', borderRadius: '30px', border: 'none', fontWeight: 'bold', backgroundColor: activePage === 'match' ? '#e3b505' : '#333', color: activePage === 'match' ? '#000' : '#fff' }}>Live Match</button>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '0 15px' }}>

        {/* --- LIVE SCORING VIEW --- */}
        {activePage === 'match' && (
          <div>
            {/* The Dynamically Calculated Scoreboard */}
            <div style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%)', borderRadius: '15px', padding: '20px', border: '1px solid #333', textAlign: 'center', marginBottom: '20px', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '10px', right: '15px', color: '#d32f2f', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '10px', height: '10px', backgroundColor: '#d32f2f', borderRadius: '50%', animation: 'blink 1.5s infinite' }}></div> LIVE
              </div>
              
              <h3 style={{ margin: '0 0 10px 0', color: '#ccc' }}>
                {activeMatch ? `${activeMatch.team1?.shortName} vs ${activeMatch.team2?.shortName}` : "Select a Match Below"}
              </h3>
              
              <div style={{ fontSize: '56px', fontWeight: '900', color: '#fff', margin: '10px 0' }}>
                {totalRuns} <span style={{ color: '#888', fontSize: '36px' }}>/ {totalWickets}</span>
              </div>
              
              <div style={{ fontSize: '18px', color: '#aaa' }}>
                Over: <span style={{ color: '#fff', fontWeight: 'bold' }}>{calcOvers}.{calcBalls}</span> 
              </div>
            </div>

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

              {/* Extras Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', opacity: isReadyToScore ? 1 : 0.4 }}>
                 <button onClick={() => handleScoreBall(1, false, 'WIDE')} disabled={!isReadyToScore} style={{ flex: 1, margin: '0 2px', padding: '10px 0', backgroundColor: '#333', color: '#ccc', border: '1px solid #555', borderRadius: '5px' }}>Wide</button>
                 <button onClick={() => handleScoreBall(1, false, 'NO_BALL')} disabled={!isReadyToScore} style={{ flex: 1, margin: '0 2px', padding: '10px 0', backgroundColor: '#333', color: '#ccc', border: '1px solid #555', borderRadius: '5px' }}>No Ball</button>
                 <button onClick={() => handleScoreBall(1, false, 'BYE')} disabled={!isReadyToScore} style={{ flex: 1, margin: '0 2px', padding: '10px 0', backgroundColor: '#333', color: '#ccc', border: '1px solid #555', borderRadius: '5px' }}>Bye</button>
                 <button onClick={() => handleScoreBall(1, false, 'LEG_BYE')} disabled={!isReadyToScore} style={{ flex: 1, margin: '0 2px', padding: '10px 0', backgroundColor: '#333', color: '#ccc', border: '1px solid #555', borderRadius: '5px' }}>Leg Bye</button>
              </div>

              {/* Run Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', opacity: isReadyToScore ? 1 : 0.4 }}>
                  {[0, 1, 2, 3, 4, 6].map(runs => (
                      <button key={runs} disabled={!isReadyToScore} onClick={() => handleScoreBall(runs)} style={{ padding: '20px', fontSize: '24px', fontWeight: 'bold', background: runs === 4 || runs === 6 ? '#28a745' : '#444', color: '#fff', border: 'none', borderRadius: '10px' }}>
                          {runs}
                      </button>
                  ))}
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '15px', opacity: isReadyToScore ? 1 : 0.4 }}>
                <button disabled={!isReadyToScore} onClick={() => handleScoreBall(0, true)} style={{ flex: 2, padding: '20px', fontSize: '22px', fontWeight: 'bold', background: '#d32f2f', color: '#fff', border: 'none', borderRadius: '10px' }}>WICKET</button>
                <button disabled={!isReadyToScore} onClick={() => alert("Undo logic coming in next backend update!")} style={{ flex: 1, padding: '20px', fontSize: '18px', fontWeight: 'bold', background: '#555', color: '#fff', border: 'none', borderRadius: '10px' }}>UNDO</button>
              </div>

            </div>
          </div>
        )}

        {/* --- ADMIN DASHBOARD VIEW --- */}
        {activePage === 'admin' && (
          <div>
            <div style={{ background: '#111', padding: '20px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #333' }}>
              <h3 style={{ margin: '0 0 15px 0' }}>1. Teams</h3>
              <form onSubmit={handleAddTeam} style={{ display: 'flex', gap: '10px' }}>
                <input type="text" placeholder="Team Name" value={teamName} onChange={e => setTeamName(e.target.value)} required style={{ flex: 2, padding: '12px', borderRadius: '5px', border: 'none', background: '#222', color: '#fff' }} />
                <input type="text" placeholder="Short" value={shortName} onChange={e => setShortName(e.target.value)} required style={{ flex: 1, padding: '12px', borderRadius: '5px', border: 'none', background: '#222', color: '#fff' }} />
                <button type="submit" style={{ padding: '0 20px', background: '#fff', color: '#000', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}>Add</button>
              </form>
            </div>

            <div style={{ background: '#111', padding: '20px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #333' }}>
              <h3 style={{ margin: '0 0 15px 0' }}>2. Players</h3>
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
              <h3 style={{ margin: '0 0 15px 0' }}>3. Matches</h3>
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
      <style>{`@keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.2; } 100% { opacity: 1; } }`}</style>
    </div>
  )
}

export default App
