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

    @GetMapping("/match/{matchId}")
    public List<BallEvent> getMatchEvents(@PathVariable Long matchId) {
        return ballEventRepository.findByMatchIdOrderByIdAsc(matchId);
    }

    @PostMapping
    public ResponseEntity<?> recordEvent(@RequestBody BallEvent event) {
        try {
            if (event.getExtraType() != null && event.getExtraType().isEmpty()) {
                event.setExtraType(null);
            }
            BallEvent savedEvent = ballEventRepository.save(event);
            return ResponseEntity.ok(savedEvent);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Java Crash: " + e.getMessage());
        }
    }

    // NEW: UNDO LOGIC API
    @DeleteMapping("/{id}")
    public ResponseEntity<?> undoEvent(@PathVariable Long id) {
        try {
            ballEventRepository.deleteById(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Delete Failed: " + e.getMessage());
        }
    }
}
