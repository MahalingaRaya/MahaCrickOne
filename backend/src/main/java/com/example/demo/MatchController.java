package com.example.demo.controller;

import com.example.demo.model.Match;
import com.example.demo.model.Team;
import com.example.demo.repository.MatchRepository;
import com.example.demo.repository.TeamRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/matches")
@CrossOrigin(origins = "https://mahacrickone.vercel.app")
public class MatchController {

    @Autowired
    private MatchRepository matchRepository;

    @Autowired
    private TeamRepository teamRepository;

    @GetMapping
    public List<Match> getAllMatches() {
        return matchRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> createMatch(@RequestBody Map<String, String> payload) {
        try {
            // Safely extract simple strings from the frontend and convert them
            Long t1Id = Long.parseLong(payload.get("team1Id"));
            Long t2Id = Long.parseLong(payload.get("team2Id"));
            int overs = Integer.parseInt(payload.get("totalOvers"));

            // Find the active teams in the database
            Team t1 = teamRepository.findById(t1Id)
                    .orElseThrow(() -> new RuntimeException("Team 1 not found in Database"));
            Team t2 = teamRepository.findById(t2Id)
                    .orElseThrow(() -> new RuntimeException("Team 2 not found in Database"));

            // Build and save the match manually
            Match match = new Match();
            match.setTeam1(t1);
            match.setTeam2(t2);
            match.setTotalOvers(overs);
            match.setStatus("SCHEDULED");

            Match savedMatch = matchRepository.save(match);
            return ResponseEntity.ok(savedMatch);

        } catch (Exception e) {
            // If anything fails, send the EXACT reason back to the mobile alert box!
            return ResponseEntity.status(500).body("Java Crash Reason: " + e.getMessage());
        }
    }
}
