package com.example.demo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "ball_events")
public class BallEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long matchId;
    private Integer overNumber;
    private Integer ballNumber;
    private Integer runs;
    private Boolean wicket;
    private String extraType; // "WIDE", "NO_BALL", "BYE", "LEG_BYE", or null

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Long getMatchId() { return matchId; }
    public void setMatchId(Long matchId) { this.matchId = matchId; }
    
    public Integer getOverNumber() { return overNumber; }
    public void setOverNumber(Integer overNumber) { this.overNumber = overNumber; }
    
    public Integer getBallNumber() { return ballNumber; }
    public void setBallNumber(Integer ballNumber) { this.ballNumber = ballNumber; }
    
    public Integer getRuns() { return runs; }
    public void setRuns(Integer runs) { this.runs = runs; }
    
    public Boolean getWicket() { return wicket; }
    public void setWicket(Boolean wicket) { this.wicket = wicket; }
    
    public String getExtraType() { return extraType; }
    public void setExtraType(String extraType) { this.extraType = extraType; }
}
