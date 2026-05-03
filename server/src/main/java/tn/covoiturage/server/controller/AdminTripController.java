package tn.covoiturage.server.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import tn.covoiturage.server.model.Trip;
import tn.covoiturage.server.service.AdminService;

import java.util.Map;

@RestController
@RequestMapping("/admin/trips")
@PreAuthorize("hasRole('ADMIN')")
public class AdminTripController {

    @Autowired
    private AdminService adminService;

    @GetMapping
    public ResponseEntity<Page<Trip>> getAllTrips(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(adminService.getAllTrips(PageRequest.of(page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Trip> getTripById(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getTripById(id));
    }

    /*

    @PostMapping("/{id}/cancel")
    public ResponseEntity<?> cancelTrip(@PathVariable Long id) {
        adminService.adminCancelTrip(id);
        return ResponseEntity.ok(Map.of("message", "Trip cancelled successfully"));
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<Trip> markTripAsCompleted(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.markTripAsCompleted(id));
    } */
}
