package tn.covoiturage.server.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "trips")
public class Trip {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String depart;
    private String arrivee;
    private String departurePoint;
    private String arrivalPoint;
    
    private LocalDate date;
    private LocalDateTime departureTime;
    private LocalDateTime arrivalTime;
    
    private Double prix;
    private Integer placesDisponibles;
    private Integer seats;
    
    private String status = "upcoming"; // upcoming, completed, cancelled
    private String car;
    
    @Column(length = 1000)
    private String notes;

    @ElementCollection
    private List<String> stops;

    @ManyToOne
    @JoinColumn(name = "owner_id")
    private User owner;

    public Trip() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getDepart() { return depart; }
    public void setDepart(String depart) { this.depart = depart; }

    public String getArrivee() { return arrivee; }
    public void setArrivee(String arrivee) { this.arrivee = arrivee; }

    public String getDeparturePoint() { return departurePoint; }
    public void setDeparturePoint(String departurePoint) { this.departurePoint = departurePoint; }

    public String getArrivalPoint() { return arrivalPoint; }
    public void setArrivalPoint(String arrivalPoint) { this.arrivalPoint = arrivalPoint; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public LocalDateTime getDepartureTime() { return departureTime; }
    public void setDepartureTime(LocalDateTime departureTime) { this.departureTime = departureTime; }

    public LocalDateTime getArrivalTime() { return arrivalTime; }
    public void setArrivalTime(LocalDateTime arrivalTime) { this.arrivalTime = arrivalTime; }

    public Double getPrix() { return prix; }
    public void setPrix(Double prix) { this.prix = prix; }

    public Integer getPlacesDisponibles() { return placesDisponibles; }
    public void setPlacesDisponibles(Integer placesDisponibles) { this.placesDisponibles = placesDisponibles; }

    public Integer getSeats() { return seats; }
    public void setSeats(Integer seats) { this.seats = seats; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getCar() { return car; }
    public void setCar(String car) { this.car = car; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public List<String> getStops() { return stops; }
    public void setStops(List<String> stops) { this.stops = stops; }

    public User getOwner() { return owner; }
    public void setOwner(User owner) { this.owner = owner; }
}
