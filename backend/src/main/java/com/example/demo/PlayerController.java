package com.example.demo.controller;

import com.example.demo.model.Player;
import com.example.demo.repository.PlayerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/players")
@CrossOrigin(origins = "https://mahacrickone.vercel.app")
public class PlayerController {

    @Autowired
    private PlayerRepository playerRepository;

    @GetMapping
    public List<Player> getAllPlayers() {
        return playerRepository.findAll();
    }

    @PostMapping
    public Player createPlayer(@RequestBody Player player) {
        return playerRepository.save(player);
    }
}
