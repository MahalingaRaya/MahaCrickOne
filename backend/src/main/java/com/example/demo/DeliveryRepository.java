package com.example.demo.repository;

import com.example.demo.model.Delivery;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DeliveryRepository extends JpaRepository<Delivery, Long> {
    // Custom query to fetch the entire match history
    List<Delivery> findByMatchId(Long matchId); 
}
