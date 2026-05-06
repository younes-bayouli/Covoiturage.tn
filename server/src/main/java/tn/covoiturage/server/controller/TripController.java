package tn.covoiturage.server.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import tn.covoiturage.server.dto.ApiResponse;
import tn.covoiturage.server.model.Trip;
import tn.covoiturage.server.model.User;
import tn.covoiturage.server.service.TripService;
import tn.covoiturage.server.service.UserService;

@RestController
public class TripController {

    @Autowired
    private TripService tripService;

    @Autowired
    private UserService userService;

    // Get all upcoming trips (with limit)
    @GetMapping("/voyages/upcoming")
    public ResponseEntity<?> getUpcomingTrips() {
        List<Trip> trips = tripService.getUpcomingTrips(100);
        return ResponseEntity.ok(new ApiResponse("Upcoming trips", trips));
    }

    // Public search - date is now optional
    @GetMapping("/voyages/recherche")
    public ResponseEntity<?> searchTrips(
            @RequestParam String depart,
            @RequestParam String arrivee,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam Integer nbrPassagers,
            @RequestParam(defaultValue = "50") Double prixMax,
            @RequestParam(defaultValue = "1") Integer placesMin) {
        List<Trip> trips = tripService.searchTrips(depart, arrivee, date, nbrPassagers, prixMax, placesMin);
        return ResponseEntity.ok(new ApiResponse("Search results", trips));
    }

    // Public details
    @GetMapping("/voyages/{id}")
    public ResponseEntity<?> getTripDetails(@PathVariable Long id) {
        Trip trip = tripService.getById(id);
        if (trip == null)
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiResponse("Trip not found"));
        return ResponseEntity.ok(new ApiResponse("Trip details", trip));
    }

    // Driver management
    @PostMapping("/voyages")
    public ResponseEntity<?> createTrip(@RequestBody Trip trip) {
        try {
            User user = userService.getCurrentUser();
            Trip savedTrip = tripService.createTrip(trip, user);
            return new ResponseEntity<>(new ApiResponse("Trip created", savedTrip), HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(e.getMessage()));
        }
    }

    @GetMapping("/trips")
    public ResponseEntity<?> getOwnTrips() {
        try {
            User user = userService.getCurrentUser();
            List<Trip> trips = tripService.getOwnTrips(user);
            return ResponseEntity.ok(new ApiResponse("My trips", trips));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(e.getMessage()));
        }
    }

    @PostMapping("/trips/{id}/cancel")
    public ResponseEntity<?> cancelTrip(@PathVariable Long id) {
        try {
            User user = userService.getCurrentUser();
            tripService.cancelTrip(id, user);
            return ResponseEntity.ok(new ApiResponse("Trip cancelled and passengers notified"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(e.getMessage()));
        }
    }
}
