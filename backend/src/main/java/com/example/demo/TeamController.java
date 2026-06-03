package com.example.demo.controller;

import com.example.demo.model.Team;
import com.example.demo.repository.TeamRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/teams")
@CrossOrigin(origins = "https://mahacrickone.vercel.app")
public class TeamController {

    @Autowired
    private TeamRepository teamRepository;

    @GetMapping
    public List<Team> getAllTeams() {
        return teamRepository.findAll();
    }

    @PostMapping
    public Team createTeam(@RequestBody Team team) {
        return teamRepository.save(team);
    }
}
