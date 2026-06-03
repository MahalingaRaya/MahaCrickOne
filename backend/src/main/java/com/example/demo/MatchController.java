package com.example.demo.controller;

import com.example.demo.model.Match;
import com.example.demo.model.Team;
import com.example.demo.repository.MatchRepository;
import com.example.demo.repository.TeamRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

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
    public Match createMatch(@RequestBody Match match) {
        // Fetch managed Team entities from the database using the IDs sent by frontend
        Team t1 = teamRepository.findById(match.getTeam1().getId())
                .orElseThrow(() -> new RuntimeException("Team 1 not found"));
        Team t2 = teamRepository.findById(match.getTeam2().getId())
                .orElseThrow(() -> new RuntimeException("Team 2 not found"));

        // Link the verified database teams back to the match
        match.setTeam1(t1);
        match.setTeam2(t2);

        if (match.getStatus() == null) {
            match.setStatus("SCHEDULED");
        }
        return matchRepository.save(match);
    }
}
