package com.example.demo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "deliveries")
public class Delivery {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "match_id")
    private Match match;

    private int innings; // 1 (First Innings) or 2 (Second Innings)
    private int overNumber; 
    private int ballNumber; 

    @ManyToOne
    @JoinColumn(name = "batter_id")
    private Player batter;

    @ManyToOne
    @JoinColumn(name = "bowler_id")
    private Player bowler;

    private int runsScored;
    private int extras;
    private boolean isWicket;
    private String wicketType; // e.g., "Bowled", "Caught", "Run Out"

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Match getMatch() { return match; }
    public void setMatch(Match match) { this.match = match; }
    public int getInnings() { return innings; }
    public void setInnings(int innings) { this.innings = innings; }
    public int getOverNumber() { return overNumber; }
    public void setOverNumber(int overNumber) { this.overNumber = overNumber; }
    public int getBallNumber() { return ballNumber; }
    public void setBallNumber(int ballNumber) { this.ballNumber = ballNumber; }
    public Player getBatter() { return batter; }
    public void setBatter(Player batter) { this.batter = batter; }
    public Player getBowler() { return bowler; }
    public void setBowler(Player bowler) { this.bowler = bowler; }
    public int getRunsScored() { return runsScored; }
    public void setRunsScored(int runsScored) { this.runsScored = runsScored; }
    public int getExtras() { return extras; }
    public void setExtras(int extras) { this.extras = extras; }
    public boolean isWicket() { return isWicket; }
    public void setWicket(boolean wicket) { isWicket = wicket; }
    public String getWicketType() { return wicketType; }
    public void setWicketType(String wicketType) { this.wicketType = wicketType; }
}
