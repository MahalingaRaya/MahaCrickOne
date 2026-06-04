import {useState,useEffect} from 'react';
import './App.css';

export default function App(){
  const [activePage,setActivePage]=useState('match');
  const [teams,setTeams]=useState([]);const [players,setPlayers]=useState([]);
  const [matches,setMatches]=useState([]);const [events,setEvents]=useState([]);
  const [teamName,setTeamName]=useState('');const [shortName,setShortName]=useState('');
  const [playerName,setPlayerName]=useState('');const [selectedTeamId,setSelectedTeamId]=useState('');
  const [team1Id,setTeam1Id]=useState('');const [team2Id,setTeam2Id]=useState('');
  const [activeMatchId,setActiveMatchId]=useState('');const [batterId,setBatterId]=useState('');const [bowlerId,setBowlerId]=useState('');

  useEffect(()=>{fetchTeams();fetchPlayers();fetchMatches();},[]);
  useEffect(()=>{if(activeMatchId){fetch(`https://mahacrickone.onrender.com/api/events/match/${activeMatchId}`).then(r=>r.json()).then(setEvents).catch(console.error);}},[activeMatchId]);

  const fetchTeams=()=>fetch('https://mahacrickone.onrender.com/api/teams').then(r=>r.json()).then(d=>{setTeams(d);if(d.length>0){setSelectedTeamId(d[0].id);setTeam1Id(d[0].id);if(d.length>1)setTeam2Id(d[1].id);}}).catch(console.error);
  const fetchPlayers=()=>fetch('https://mahacrickone.onrender.com/api/players').then(r=>r.json()).then(setPlayers).catch(console.error);
  const fetchMatches=()=>fetch('https://mahacrickone.onrender.com/api/matches').then(r=>r.json()).then(d=>{setMatches(d);if(d.length>0&&!activeMatchId)setActiveMatchId(d[0].id);}).catch(console.error);

  const handleAddTeam=async(e)=>{e.preventDefault();const res=await fetch('https://mahacrickone.onrender.com/api/teams',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:teamName,shortName})});if(res.ok){fetchTeams();setTeamName('');setShortName('');}};
  const handleAddPlayer=async(e)=>{e.preventDefault();const res=await fetch('https://mahacrickone.onrender.com/api/players',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:playerName,role:'Batsman',team:{id:parseInt(selectedTeamId)}})});if(res.ok){fetchPlayers();setPlayerName('');}};
  const handleAddMatch=async(e)=>{e.preventDefault();const res=await fetch('https://mahacrickone.onrender.com/api/matches',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({team1Id:team1Id.toString(),team2Id:team2Id.toString(),totalOvers:"20"})});if(res.ok){fetchMatches();alert("Match Scheduled!");}};

  const totalRuns=events.reduce((s,ev)=>s+ev.runs+(ev.extraType==='WIDE'||ev.extraType==='NO_BALL'?1:0),0);
  const totalWickets=events.filter(e=>e.wicket).length;
  const legalBalls=events.filter(e=>e.extraType!=='WIDE'&&e.extraType!=='NO_BALL').length;
  const calcOvers=Math.floor(legalBalls/6);const calcBalls=legalBalls%6;

  const strikerEvents=events.filter(e=>e.batterId===parseInt(batterId));
  const strikerRuns=strikerEvents.reduce((s,e)=>(e.extraType==='WIDE'||e.extraType==='LEG_BYE'||e.extraType==='BYE')?s:s+e.runs,0);
  const strikerBallsFaced=strikerEvents.filter(e=>e.extraType!=='WIDE').length;
  const strikerSR=strikerBallsFaced>0?((strikerRuns/strikerBallsFaced)*100).toFixed(1):"0.0";

  const bowlerEvents=events.filter(e=>e.bowlerId===parseInt(bowlerId));
  const bowlerRunsConceded=bowlerEvents.reduce((s,e)=>{let c=e.runs;if(e.extraType==='WIDE'||e.extraType==='NO_BALL')c+=1;if(e.extraType==='BYE'||e.extraType==='LEG_BYE')c=0;return s+c;},0);
  const bowlerWickets=bowlerEvents.filter(e=>e.wicket).length;
  const bowlerLegalBalls=bowlerEvents.filter(e=>e.extraType!=='WIDE'&&e.extraType!=='NO_BALL').length;
  const bowlerEcon=bowlerLegalBalls>0?((bowlerRunsConceded/bowlerLegalBalls)*6).toFixed(1):"0.0";

  const activeBatter=players.find(p=>p.id.toString()===batterId);
  const activeBowler=players.find(p=>p.id.toString()===bowlerId);
  const currentOverTracker=calcBalls===0&&legalBalls>0?calcOvers-1:calcOvers;
  const thisOverEvents=events.filter(e=>e.overNumber===currentOverTracker);

  const handleScoreBall=async(runs,isWicket=false,extraType=null)=>{try{const res=await fetch('https://mahacrickone.onrender.com/api/events',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({matchId:parseInt(activeMatchId),batterId:parseInt(batterId),bowlerId:parseInt(bowlerId),overNumber:calcOvers,ballNumber:calcBalls+1,runs,wicket:isWicket,extraType})});if(res.ok){const u=await fetch(`https://mahacrickone.onrender.com/api/events/match/${activeMatchId}`).then(r=>r.json());setEvents(u);}else alert("Error!");}catch(e){alert("Error: "+e.message);}};
  const handleUndo=async()=>{if(events.length===0)return alert("Nothing to undo!");const last=events[events.length-1];try{const res=await fetch(`https://mahacrickone.onrender.com/api/events/${last.id}`,{method:'DELETE'});if(res.ok){const u=await fetch(`https://mahacrickone.onrender.com/api/events/match/${activeMatchId}`).then(r=>r.json());setEvents(u);}else alert("Failed!");}catch(e){alert("Error: "+e.message);}};
  
  const isReadyToScore=activeMatchId!==''&&batterId!==''&&bowlerId!=='';
  const activeMatch=matches.find(m=>m.id.toString()===activeMatchId.toString());

  // Compressed styles for mobile clipboard limit
  const btnStyle={flex:1,padding:'12px 0',backgroundColor:'#333',color:'#ccc',border:'none',borderRadius:'5px',fontWeight:'bold'};
  const runStyle={padding:'20px',fontSize:'24px',fontWeight:'bold',color:'#fff',border:'none',borderRadius:'8px'};
  const selStyle={flex:1,padding:'12px',borderRadius:'5px',background:'#222',color:'#fff',border:'1px solid #444'};
  const inpStyle={flex:2,padding:'12px',borderRadius:'5px',border:'none',background:'#222',color:'#fff'};

  return(
    <div style={{backgroundColor:'#050505',minHeight:'100vh',color:'#fff',fontFamily:'sans-serif',paddingBottom:'50px'}}>
      <header style={{backgroundColor:'#111',padding:'15px',textAlign:'center',borderBottom:'2px solid #e3b505'}}><h1 style={{margin:0,color:'#e3b505',fontSize:'24px',letterSpacing:'1px'}}>🏏 Maha CrickOne</h1></header>
      <div style={{display:'flex',justifyContent:'center',margin:'15px 0',gap:'10px'}}><button onClick={()=>setActivePage('admin')} style={{padding:'8px 20px',borderRadius:'30px',border:'none',fontWeight:'bold',backgroundColor:activePage==='admin'?'#fff':'#333',color:activePage==='admin'?'#000':'#fff'}}>Dashboard</button><button onClick={()=>setActivePage('match')} style={{padding:'8px 20px',borderRadius:'30px',border:'none',fontWeight:'bold',backgroundColor:activePage==='match'?'#e3b505':'#333',color:activePage==='match'?'#000':'#fff'}}>Live Match</button></div>
      <div style={{maxWidth:'600px',margin:'0 auto',padding:'0 10px'}}>
        
        {activePage==='match'&&(<div>
          <div style={{background:'#111',borderRadius:'10px',border:'1px solid #333',overflow:'hidden',marginBottom:'20px'}}>
            <div style={{padding:'20px',textAlign:'center',position:'relative',background:'linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%)'}}>
              <div style={{position:'absolute',top:'10px',right:'15px',color:'#d32f2f',fontWeight:'bold',fontSize:'12px',display:'flex',alignItems:'center',gap:'5px'}}><div style={{width:'8px',height:'8px',backgroundColor:'#d32f2f',borderRadius:'50%'}}></div> LIVE</div>
              <div style={{fontSize:'14px',color:'#ccc',textTransform:'uppercase'}}>{activeMatch?`${activeMatch.team1?.shortName} vs ${activeMatch.team2?.shortName}`:"Select Match"}</div>
              <div style={{fontSize:'64px',fontWeight:'900',color:'#fff',lineHeight:'1',margin:'10px 0'}}>{totalRuns}<span style={{color:'#888',fontSize:'40px'}}>/{totalWickets}</span></div>
              <div style={{fontSize:'16px',color:'#e3b505',fontWeight:'bold'}}>OVER: <span style={{color:'#fff'}}>{calcOvers}.{calcBalls}</span></div>
            </div>
            <div style={{background:'#1a1a1a',padding:'15px',borderTop:'1px solid #333'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'10px',paddingBottom:'10px',borderBottom:'1px solid #2a2a2a'}}>
                <div style={{display:'flex',alignItems:'center',gap:'8px'}}><span style={{fontSize:'16px'}}>🏏</span><span style={{fontWeight:'bold',color:'#fff',fontSize:'16px'}}>{activeBatter?activeBatter.name:'Striker'} *</span></div>
                <div style={{display:'flex',gap:'15px',color:'#aaa',fontSize:'14px'}}><span><strong style={{color:'#fff',fontSize:'18px'}}>{strikerRuns}</strong> ({strikerBallsFaced})</span><span>SR: {strikerSR}</span></div>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div style={{display:'flex',alignItems:'center',gap:'8px'}}><span style={{fontSize:'16px'}}>⚾</span><span style={{fontWeight:'bold',color:'#fff',fontSize:'16px'}}>{activeBowler?activeBowler.name:'Bowler'}</span></div>
                <div style={{display:'flex',gap:'15px',color:'#aaa',fontSize:'14px'}}><span><strong style={{color:'#fff',fontSize:'18px'}}>{bowlerWickets}</strong>-{bowlerRunsConceded}</span><span>Ov: {Math.floor(bowlerLegalBalls/6)}.{bowlerLegalBalls%6}</span><span>ECO: {bowlerEcon}</span></div>
              </div>
            </div>
            <div style={{background:'#111',padding:'12px 15px',borderTop:'1px solid #333',display:'flex',alignItems:'center',gap:'10px',overflowX:'auto'}}>
              <span style={{color:'#888',fontSize:'12px',fontWeight:'bold'}}>THIS OVER:</span>
              <div style={{display:'flex',gap:'8px'}}>
                {thisOverEvents.map(e=>{let d=e.runs;let bg='#333';let tc='#fff';if(e.wicket){d='W';bg='#d32f2f';}else if(e.extraType==='WIDE'){d='WD';bg='#555';}else if(e.extraType==='NO_BALL'){d='NB';bg='#555';}else if(e.extraType==='LEG_BYE'){d=`${e.runs}Lb`;bg='#444';}else if(e.extraType==='BYE'){d=`${e.runs}B`;bg='#444';}else if(e.runs===4){bg='#28a745';}else if(e.runs===6){bg='#28a745';tc='#000';}return(<div key={e.id} style={{display:'flex',justifyContent:'center',alignItems:'center',width:'32px',height:'32px',borderRadius:'50%',background:bg,color:tc,fontSize:'14px',fontWeight:'bold',flexShrink:0}}>{d}</div>);})}
              </div>
            </div>
          </div>
          <div style={{background:'#111',padding:'15px',borderRadius:'10px',border:'1px solid #222'}}>
            <div style={{display:'flex',gap:'10px',marginBottom:'15px'}}>
              <select value={activeMatchId} onChange={e=>setActiveMatchId(e.target.value)} style={selStyle}><option value="" disabled>Match</option>{matches.map(m=><option key={m.id} value={m.id}>{m.team1?.shortName} v {m.team2?.shortName}</option>)}</select>
              <select value={batterId} onChange={e=>setBatterId(e.target.value)} style={selStyle}><option value="" disabled>Striker</option>{players.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select>
              <select value={bowlerId} onChange={e=>setBowlerId(e.target.value)} style={selStyle}><option value="" disabled>Bowler</option>{players.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:'15px',opacity:isReadyToScore?1:0.3}}><button onClick={()=>handleScoreBall(0,false,'WIDE')} disabled={!isReadyToScore} style={btnStyle}>WD</button><button onClick={()=>handleScoreBall(0,false,'NO_BALL')} disabled={!isReadyToScore} style={btnStyle}>NB</button><button onClick={()=>handleScoreBall(1,false,'BYE')} disabled={!isReadyToScore} style={btnStyle}>B</button><button onClick={()=>handleScoreBall(1,false,'LEG_BYE')} disabled={!isReadyToScore} style={btnStyle}>LB</button></div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3, 1fr)',gap:'10px',opacity:isReadyToScore?1:0.3}}>{[0,1,2,3,4,6].map(r=><button key={r} disabled={!isReadyToScore} onClick={()=>handleScoreBall(r)} style={{...runStyle,background:r===4||r===6?'#28a745':'#444'}}>{r}</button>)}</div>
            <div style={{display:'flex',gap:'10px',marginTop:'10px',opacity:isReadyToScore?1:0.3}}><button disabled={!isReadyToScore} onClick={()=>handleScoreBall(0,true)} style={{flex:2,padding:'20px',fontSize:'20px',fontWeight:'bold',background:'#d32f2f',color:'#fff',border:'none',borderRadius:'8px'}}>WICKET</button><button disabled={!isReadyToScore||events.length===0} onClick={handleUndo} style={{flex:1,padding:'20px',fontSize:'16px',fontWeight:'bold',background:'#555',color:'#fff',border:'none',borderRadius:'8px'}}>UNDO</button></div>
          </div>
        </div>)}

        {activePage==='admin'&&(<div>
          <div style={{background:'#111',padding:'20px',borderRadius:'10px',marginBottom:'20px'}}><h3 style={{margin:'0 0 15px 0'}}>1. Teams</h3><form onSubmit={handleAddTeam} style={{display:'flex',gap:'10px'}}><input type="text" placeholder="Name" value={teamName} onChange={e=>setTeamName(e.target.value)} required style={inpStyle}/><input type="text" placeholder="Short" value={shortName} onChange={e=>setShortName(e.target.value)} required style={{...inpStyle,flex:1}}/><button type="submit" style={{padding:'0 20px',background:'#fff',color:'#000',border:'none',borderRadius:'5px',fontWeight:'bold'}}>Add</button></form></div>
          <div style={{background:'#111',padding:'20px',borderRadius:'10px',marginBottom:'20px'}}><h3 style={{margin:'0 0 15px 0'}}>2. Players</h3><form onSubmit={handleAddPlayer}><input type="text" placeholder="Player Name" value={playerName} onChange={e=>setPlayerName(e.target.value)} required style={{display:'block',width:'100%',boxSizing:'border-box',padding:'12px',marginBottom:'10px',borderRadius:'5px',border:'none',background:'#222',color:'#fff'}}/><div style={{display:'flex',gap:'10px'}}><select value={selectedTeamId} onChange={e=>setSelectedTeamId(e.target.value)} required style={{flex:1,padding:'12px',borderRadius:'5px',border:'none',background:'#222',color:'#fff'}}><option value="" disabled>Team</option>{teams.map(t=><option key={t.id} value={t.id}>{t.shortName}</option>)}</select><button type="submit" style={{padding:'0 20px',background:'#fff',color:'#000',border:'none',borderRadius:'5px',fontWeight:'bold'}}>Draft</button></div></form></div>
          <div style={{background:'#111',padding:'20px',borderRadius:'10px',marginBottom:'20px'}}><h3 style={{margin:'0 0 15px 0'}}>3. Matches</h3><form onSubmit={handleAddMatch} style={{display:'flex',gap:'10px',alignItems:'center'}}><select value={team1Id} onChange={e=>setTeam1Id(e.target.value)} style={{flex:1,padding:'12px',borderRadius:'5px',border:'none',background:'#222',color:'#fff'}}>{teams.map(t=><option key={t.id} value={t.id}>{t.shortName}</option>)}</select><span style={{fontWeight:'bold',color:'#777'}}>VS</span><select value={team2Id} onChange={e=>setTeam2Id(e.target.value)} style={{flex:1,padding:'12px',borderRadius:'5px',border:'none',background:'#222',color:'#fff'}}>{teams.map(t=><option key={t.id} value={t.id}>{t.shortName}</option>)}</select><button type="submit" style={{padding:'12px 20px',background:'#fff',color:'#000',border:'none',borderRadius:'5px',fontWeight:'bold'}}>Create</button></form></div>
        </div>)}

      </div>
    </div>
  );
}
