package tn.covoiturage.server.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "reviewer_id")
    private User reviewer;

    @ManyToOne
    @JoinColumn(name = "target_id")
    private User target; // The driver being reviewed

    @ManyToOne
    @JoinColumn(name = "trip_id")
    private Trip trip;

    private Integer rating;
    
    @Column(length = 1000)
    private String comment;
    
    private String authorName;
    private String authorAvatar;
    private LocalDateTime date = LocalDateTime.now();
    private String tripRoute;

    public Review() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getReviewer() { return reviewer; }
    public void setReviewer(User reviewer) { this.reviewer = reviewer; }

    public User getTarget() { return target; }
    public void setTarget(User target) { this.target = target; }

    public Trip getTrip() { return trip; }
    public void setTrip(Trip trip) { this.trip = trip; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }

    public String getAuthorName() { return authorName; }
    public void setAuthorName(String authorName) { this.authorName = authorName; }

    public String getAuthorAvatar() { return authorAvatar; }
    public void setAuthorAvatar(String authorAvatar) { this.authorAvatar = authorAvatar; }

    public LocalDateTime getDate() { return date; }
    public void setDate(LocalDateTime date) { this.date = date; }

    public String getTripRoute() { return tripRoute; }
    public void setTripRoute(String tripRoute) { this.tripRoute = tripRoute; }
}
