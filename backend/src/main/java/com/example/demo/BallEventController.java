package com.example.demo.controller;

import com.example.demo.model.BallEvent;
import com.example.demo.repository.BallEventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "https://mahacrickone.vercel.app")
public class BallEventController {

    @Autowired
    private BallEventRepository ballEventRepository;

    // 1. Get the entire match ledger to calculate the Scorecard
    @GetMapping("/match/{matchId}")
    public List<BallEvent> getMatchEvents(@PathVariable Long matchId) {
        return ballEventRepository.findByMatchIdOrderByIdAsc(matchId);
    }

    // 2. Record a single ball event (4, 6, Wicket, Wide, etc.)
    @PostMapping
    public ResponseEntity<?> recordEvent(@RequestBody BallEvent event) {
        try {
            // Ensure null safety for extras
            if (event.getExtraType() != null && event.getExtraType().isEmpty()) {
                event.setExtraType(null);
            }
            BallEvent savedEvent = ballEventRepository.save(event);
            return ResponseEntity.ok(savedEvent);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Java Crash: " + e.getMessage());
        }
    }
}
