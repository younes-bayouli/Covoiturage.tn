package tn.covoiturage.server.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.covoiturage.server.dto.ApiResponse;
import tn.covoiturage.server.model.Review;
import tn.covoiturage.server.model.User;
import tn.covoiturage.server.service.ReviewService;
import tn.covoiturage.server.service.UserService;

import java.util.List;

@RestController
@RequestMapping("/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @Autowired
    private UserService userService;

    @GetMapping("/driver/{driverId}")
    public ResponseEntity<?> getDriverReviews(@PathVariable Long driverId) {
        try {
            List<Review> reviews = reviewService.getReviewsForDriver(driverId);
            return ResponseEntity.ok(new ApiResponse("Driver reviews retrieved", reviews));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> submitReview(@RequestBody Review review) {
        try {
            User user = userService.getCurrentUser();
            Review savedReview = reviewService.submitReview(review, user);
            return ResponseEntity.ok(new ApiResponse("Review submitted", savedReview));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(e.getMessage()));
        }
    }
}
