package com.example.demo.controller;

import com.example.demo.model.Match;
import com.example.demo.repository.MatchRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/matches")
@CrossOrigin(origins = "https://mahacrickone.vercel.app")
public class MatchController {

    @Autowired
    private MatchRepository matchRepository;

    @GetMapping
    public List<Match> getAllMatches() {
        return matchRepository.findAll();
    }

    @PostMapping
    public Match createMatch(@RequestBody Match match) {
        // Set default status when a new match is created
        if (match.getStatus() == null) {
            match.setStatus("SCHEDULED");
        }
        return matchRepository.save(match);
    }
}
