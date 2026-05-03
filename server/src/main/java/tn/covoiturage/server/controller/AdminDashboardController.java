package tn.covoiturage.server.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tn.covoiturage.server.repository.ReservationRepository;
import tn.covoiturage.server.repository.TripRepository;
import tn.covoiturage.server.repository.UserRepository;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/admin/dashboard")
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        long totalUsers = userRepository.count();
        long totalTrips = tripRepository.count();
        long totalReservations = reservationRepository.count();
        long activeTrips = tripRepository.findByStatus("upcoming").size();
        Double totalRevenue = reservationRepository.calculateTotalRevenue();

        stats.put("totalUsers", totalUsers);
        stats.put("totalTrips", totalTrips);
        stats.put("totalReservations", totalReservations);
        stats.put("activeTrips", activeTrips);
        stats.put("totalRevenue", totalRevenue != null ? totalRevenue : 0.0);

        return ResponseEntity.ok(stats);
    }
}
