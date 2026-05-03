package tn.covoiturage.server.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import tn.covoiturage.server.model.Reservation;
import tn.covoiturage.server.service.AdminService;

import java.util.Map;

@RestController
@RequestMapping("/admin/reservations")
@PreAuthorize("hasRole('ADMIN')")
public class AdminReservationController {

    @Autowired
    private AdminService adminService;

    @GetMapping
    public ResponseEntity<Page<Reservation>> getAllReservations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(adminService.getAllReservations(PageRequest.of(page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Reservation> getReservationById(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getReservationById(id));
    }

    /*

    @PostMapping("/{id}/cancel")
    public ResponseEntity<?> cancelReservation(@PathVariable Long id) {
        adminService.adminCancelReservation(id);
        return ResponseEntity.ok(Map.of("message", "Reservation cancelled successfully"));
    } */
}
