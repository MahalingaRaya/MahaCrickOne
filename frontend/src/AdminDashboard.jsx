import { useState } from 'react';

export default function AdminDashboard({ teams, players, matches, onAddTeam, onAddPlayer, onAddMatch }) {
  const [teamName, setTeamName] = useState('');
  const [shortName, setShortName] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [team1Id, setTeam1Id] = useState('');
  const [team2Id, setTeam2Id] = useState('');
  const [matchOvers, setMatchOvers] = useState('1'); // Defaulted to 1 over configuration!

  const cardStyle = { background: '#111', padding: '20px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #333' };
  const inputStyle = { padding: '12px', borderRadius: '5px', border: 'none', background: '#222', color: '#fff', boxSizing: 'border-box' };
  const btnStyle = { padding: '12px 20px', background: '#fff', color: '#000', border: 'none', borderRadius: '5px', fontWeight: 'bold' };

  return (
    <div>
      <div style={cardStyle}>
        <h3 style={{ margin: '0 0 15px 0', color: '#e3b505' }}>1. Register Franchise Team</h3>
        <form onSubmit={(e) => { e.preventDefault(); onAddTeam(teamName, shortName); setTeamName(''); setShortName(''); }} style={{ display: 'flex', gap: '10px' }}>
          <input type="text" placeholder="Team Name" value={teamName} onChange={e => setTeamName(e.target.value)} required style={{ ...inputStyle, flex: 2 }} />
          <input type="text" placeholder="Short Name" value={shortName} onChange={e => setShortName(e.target.value)} required style={{ ...inputStyle, flex: 1 }} />
          <button type="submit" style={btnStyle}>Save</button>
        </form>
      </div>

      <div style={cardStyle}>
        <h3 style={{ margin: '0 0 15px 0', color: '#e3b505' }}>2. Draft Player to Roster</h3>
        <form onSubmit={(e) => { e.preventDefault(); onAddPlayer(playerName, selectedTeamId); setPlayerName(''); }}>
          <input type="text" placeholder="Player Name" value={playerName} onChange={e => setPlayerName(e.target.value)} required style={{ ...inputStyle, display: 'block', width: '100%', marginBottom: '10px' }} />
          <div style={{ display: 'flex', gap: '10px' }}>
            <select value={selectedTeamId} onChange={e => setSelectedTeamId(e.target.value)} required style={{ ...inputStyle, flex: 1 }}>
              <option value="" disabled>Select Franchise Assignment</option>
              {teams.map(t => <option key={t.id} value={t.id}>{t.name} ({t.shortName})</option>)}
            </select>
            <button type="submit" style={btnStyle}>Draft</button>
          </div>
        </form>
      </div>

      <div style={cardStyle}>
        <h3 style={{ margin: '0 0 15px 0', color: '#e3b505' }}>3. Schedule Professional Fixture</h3>
        <form onSubmit={(e) => { e.preventDefault(); onAddMatch(team1Id, team2Id, matchOvers); }} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <select value={team1Id} onChange={e => setTeam1Id(e.target.value)} style={{ ...inputStyle, flex: 1 }}>
              <option value="" disabled>Team 1</option>
              {teams.map(t => <option key={t.id} value={t.id}>{t.shortName}</option>)}
            </select>
            <span style={{ fontWeight: 'bold', color: '#777' }}>VS</span>
            <select value={team2Id} onChange={e => setTeam2Id(e.target.value)} style={{ ...inputStyle, flex: 1 }}>
              <option value="" disabled>Team 2</option>
              {teams.map(t => <option key={t.id} value={t.id}>{t.shortName}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <select value={matchOvers} onChange={e => setMatchOvers(e.target.value)} style={{ ...inputStyle, flex: 1 }}>
              <option value="1">Custom 1-Over Match</option>
              <option value="2">Custom 2-Over Match</option>
              <option value="5">T5 Match (5 Overs)</option>
              <option value="10">T10 Match (10 Overs)</option>
              <option value="20">T20 Match (20 Overs)</option>
            </select>
            <button type="submit" style={{ ...btnStyle, width: '100%', background: '#e3b505' }}>Create Match</button>
          </div>
        </form>
      </div>
    </div>
  );
}
