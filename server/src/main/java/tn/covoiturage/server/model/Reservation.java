package tn.covoiturage.server.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reservations")
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "trip_id")
    private Trip trip;

    @ManyToOne
    @JoinColumn(name = "passenger_id")
    private User passenger;

    private Integer seats;
    private String status = "confirmed"; // confirmed, cancelled
    private Double price;
    
    private LocalDateTime createdAt = LocalDateTime.now();

    public Reservation() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Trip getTrip() { return trip; }
    public void setTrip(Trip trip) { this.trip = trip; }

    public User getPassenger() { return passenger; }
    public void setPassenger(User passenger) { this.passenger = passenger; }

    public Integer getSeats() { return seats; }
    public void setSeats(Integer seats) { this.seats = seats; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
