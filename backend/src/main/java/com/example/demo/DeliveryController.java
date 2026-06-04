package com.example.demo.controller;

import com.example.demo.model.Delivery;
import com.example.demo.model.Match;
import com.example.demo.model.Player;
import com.example.demo.repository.DeliveryRepository;
import com.example.demo.repository.MatchRepository;
import com.example.demo.repository.PlayerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/deliveries")
@CrossOrigin(origins = "https://mahacrickone.vercel.app")
public class DeliveryController {

    @Autowired
    private DeliveryRepository deliveryRepository;
    @Autowired
    private MatchRepository matchRepository;
    @Autowired
    private PlayerRepository playerRepository;

    @GetMapping("/match/{matchId}")
    public List<Delivery> getDeliveriesByMatch(@PathVariable Long matchId) {
        return deliveryRepository.findByMatchId(matchId);
    }

    @PostMapping
    public ResponseEntity<?> recordDelivery(@RequestBody Map<String, String> payload) {
        try {
            Long matchId = Long.parseLong(payload.get("matchId"));
            Long batterId = Long.parseLong(payload.get("batterId"));
            Long bowlerId = Long.parseLong(payload.get("bowlerId"));
            
            Match match = matchRepository.findById(matchId)
                    .orElseThrow(() -> new RuntimeException("Match not found"));
            Player batter = playerRepository.findById(batterId)
                    .orElseThrow(() -> new RuntimeException("Batter not found"));
            Player bowler = playerRepository.findById(bowlerId)
                    .orElseThrow(() -> new RuntimeException("Bowler not found"));

            Delivery delivery = new Delivery();
            delivery.setMatch(match);
            delivery.setBatter(batter);
            delivery.setBowler(bowler);
            delivery.setInnings(Integer.parseInt(payload.get("innings")));
            delivery.setOverNumber(Integer.parseInt(payload.get("overNumber")));
            delivery.setBallNumber(Integer.parseInt(payload.get("ballNumber")));
            delivery.setRunsScored(Integer.parseInt(payload.get("runsScored")));
            delivery.setExtras(Integer.parseInt(payload.get("extras")));
            delivery.setWicket(Boolean.parseBoolean(payload.get("isWicket")));
            
            if (payload.containsKey("wicketType")) {
                delivery.setWicketType(payload.get("wicketType"));
            }

            Delivery saved = deliveryRepository.save(delivery);
            return ResponseEntity.ok(saved);

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Java Crash Reason: " + e.getMessage());
        }
    }
}
