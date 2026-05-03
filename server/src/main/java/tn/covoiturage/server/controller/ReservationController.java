package tn.covoiturage.server.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import tn.covoiturage.server.dto.ApiResponse;
import tn.covoiturage.server.model.Reservation;
import tn.covoiturage.server.model.User;
import tn.covoiturage.server.service.ReservationService;
import tn.covoiturage.server.service.UserService;

@RestController
@RequestMapping("/reservations")
public class ReservationController {

    @Autowired
    private ReservationService reservationService;

    @Autowired
    private UserService userService;

    @PostMapping
    public ResponseEntity<?> bookSeats(@RequestBody Map<String, Object> request) {
        try {
            Long tripId = Long.valueOf(request.get("voyageId").toString());
            Integer seats = Integer.valueOf(request.get("nombrePlaces").toString());
            User user = userService.getCurrentUser();
            Reservation res = reservationService.bookSeats(tripId, seats, user);
            return ResponseEntity.ok(new ApiResponse("Reservation confirmed", res));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> getOwnReservations() {
        try {
            User user = userService.getCurrentUser();
            List<Reservation> reservations = reservationService.getOwnReservations(user);
            return ResponseEntity.ok(new ApiResponse("My reservations", reservations));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(e.getMessage()));
        }
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<?> cancelReservation(@PathVariable Long id) {
        try {
            User user = userService.getCurrentUser();
            reservationService.cancelReservation(id, user);
            return ResponseEntity.ok(new ApiResponse("Reservation cancelled"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(e.getMessage()));
        }
    }
}


