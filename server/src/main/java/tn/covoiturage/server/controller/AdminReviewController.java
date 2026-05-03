package tn.covoiturage.server.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import tn.covoiturage.server.model.Review;
import tn.covoiturage.server.service.AdminService;

import java.util.Map;

@RestController
@RequestMapping("/admin/reviews")
@PreAuthorize("hasRole('ADMIN')")
public class AdminReviewController {

    @Autowired
    private AdminService adminService;

    @GetMapping
    public ResponseEntity<Page<Review>> getAllReviews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(adminService.getAllReviews(PageRequest.of(page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Review> getReviewById(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getReviewById(id));
    }

    /*

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReview(@PathVariable Long id) {
        adminService.deleteReview(id);
        return ResponseEntity.ok(Map.of("message", "Review deleted successfully"));
    } */
}
