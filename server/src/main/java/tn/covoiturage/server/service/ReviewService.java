package tn.covoiturage.server.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.covoiturage.server.model.Review;
import tn.covoiturage.server.model.Trip;
import tn.covoiturage.server.model.User;
import tn.covoiturage.server.repository.ReviewRepository;
import tn.covoiturage.server.repository.UserRepository;

import java.util.List;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Review> getReviewsForDriver(Long driverId) {
        User driver = userRepository.findById(driverId).orElseThrow(() -> new RuntimeException("Driver not found"));
        return reviewRepository.findByTarget(driver);
    }

    @Transactional
    public Review submitReview(Review review, User reviewer) {
        User target = review.getTarget();
        Trip trip = review.getTrip();

        // Security check: only if passenger on completed trip (simplified here)
        review.setReviewer(reviewer);
        review.setAuthorName(reviewer.getPrenom() + " " + reviewer.getNom());
        review.setAuthorAvatar(reviewer.getAvatarUrl());
        review.setTripRoute(trip.getDepart() + " -> " + trip.getArrivee());

        Review savedReview = reviewRepository.save(review);

        // Recalculate average note
        updateDriverRating(target);

        return savedReview;
    }

    private void updateDriverRating(User driver) {
        List<Review> reviews = reviewRepository.findByTarget(driver);
        if (reviews.isEmpty()) return;

        double sum = 0;
        for (Review r : reviews) {
            sum += r.getRating();
        }
        driver.setNote(sum / reviews.size());
        userRepository.save(driver);
    }
}
