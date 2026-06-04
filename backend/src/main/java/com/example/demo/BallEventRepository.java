package com.example.demo.repository;

import com.example.demo.model.BallEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BallEventRepository extends JpaRepository<BallEvent, Long> {
    // This is the magic query that retrieves the ledger to build the scorecard
    List<BallEvent> findByMatchIdOrderByIdAsc(Long matchId);
}
