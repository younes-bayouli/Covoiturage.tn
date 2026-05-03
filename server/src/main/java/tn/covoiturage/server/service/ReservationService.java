package tn.covoiturage.server.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.covoiturage.server.model.Reservation;
import tn.covoiturage.server.model.Trip;
import tn.covoiturage.server.model.User;
import tn.covoiturage.server.model.ActivityLog;
import tn.covoiturage.server.repository.ReservationRepository;
import tn.covoiturage.server.repository.TripRepository;

import java.util.List;

@Service
public class ReservationService {

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private ActivityLogService activityLogService;

    @Transactional
    public Reservation bookSeats(Long tripId, Integer seats, User passenger) {
        try {
            Trip trip = tripRepository.findById(tripId)
                    .orElseThrow(() -> new RuntimeException("Trip not found"));

            if (trip.getPlacesDisponibles() < seats) {
                activityLogService.logAction(
                        "RESERVATION_BOOKED",
                        "FAILED",
                        "Not enough seats available. Required: " + seats + ", Available: "
                                + trip.getPlacesDisponibles(),
                        passenger,
                        ActivityLog.ActionType.OTHER);
                throw new RuntimeException("Pas assez de places disponibles pour cette réservation.");
            }

            if (trip.getOwner().getId().equals(passenger.getId())) {
                activityLogService.logAction(
                        "RESERVATION_BOOKED",
                        "FAILED",
                        "Driver cannot book their own trip",
                        passenger,
                        ActivityLog.ActionType.OTHER);
                throw new RuntimeException("Vous ne pouvez pas réserver votre propre trajet.");
            }

            Reservation reservation = new Reservation();
            reservation.setTrip(trip);
            reservation.setPassenger(passenger);
            reservation.setSeats(seats);
            reservation.setPrice(trip.getPrix() * seats);
            reservation.setStatus("confirmed");

            trip.setPlacesDisponibles(trip.getPlacesDisponibles() - seats);
            tripRepository.save(trip);


            Reservation savedReservation = reservationRepository.save(reservation);

            activityLogService.logAction(
                    "RESERVATION_BOOKED",
                    "SUCCESS",
                    null,
                    passenger,
                    ActivityLog.ActionType.OTHER);

            return savedReservation;
        } catch (RuntimeException e) {
            System.err.println("Error booking seats: " + e.getMessage());
            e.printStackTrace();
            throw e;
        } catch (Exception e) {
            System.err.println("Unexpected error booking seats: " + e.getMessage());
            e.printStackTrace();
            activityLogService.logAction(
                    "RESERVATION_BOOKED",
                    "FAILED",
                    "Unexpected error: " + e.getMessage(),
                    passenger,
                    ActivityLog.ActionType.OTHER);
            throw new RuntimeException("Une erreur inattendue s'est produite lors de la réservation.", e);
        }
    }

    public List<Reservation> getOwnReservations(User passenger) {
        try {
            return reservationRepository.findByPassenger(passenger);
        } catch (Exception e) {
            System.err.println("Error retrieving reservations: " + e.getMessage());
            e.printStackTrace();
            activityLogService.logAction(
                    "RESERVATIONS_RETRIEVED",
                    "FAILED",
                    "Error retrieving reservations: " + e.getMessage(),
                    passenger,
                    ActivityLog.ActionType.OTHER);
            throw new RuntimeException("Une erreur inattendue s'est produite lors de la récupération des réservations.",
                    e);
        }
    }

    @Transactional
    public void cancelReservation(Long reservationId, User passenger) {
        try {
            Reservation res = reservationRepository.findById(reservationId)
                    .orElseThrow(() -> new RuntimeException("Reservation not found"));

            if (!res.getPassenger().getId().equals(passenger.getId())) {
                activityLogService.logAction(
                        "RESERVATION_CANCELLED",
                        "FAILED",
                        "Unauthorized cancellation attempt",
                        passenger,
                        ActivityLog.ActionType.DELETE);
                throw new RuntimeException("Vous n'êtes pas autorisé à annuler cette réservation.");
            }

            if ("cancelled".equals(res.getStatus())) {
                activityLogService.logAction(
                        "RESERVATION_CANCELLED",
                        "FAILED",
                        "Reservation already cancelled",
                        passenger,
                        ActivityLog.ActionType.DELETE);
                throw new RuntimeException("Cette réservation a déjà été annulée.");
            }

            Trip trip = res.getTrip();
            trip.setPlacesDisponibles(trip.getPlacesDisponibles() + res.getSeats());
            tripRepository.save(trip);

            res.setStatus("cancelled");
            reservationRepository.save(res);

            activityLogService.logAction(
                    "RESERVATION_CANCELLED",
                    "SUCCESS",
                    "Refunded: " + res.getPrice() + " TND",
                    passenger,
                    ActivityLog.ActionType.DELETE);

        } catch (Exception e) {
            System.err.println("Error cancelling reservation: " + e.getMessage());
            e.printStackTrace();
            activityLogService.logAction(
                    "RESERVATION_CANCELLED",
                    "FAILED",
                    "Error: " + e.getMessage(),
                    passenger,
                    ActivityLog.ActionType.DELETE);
            throw new RuntimeException("Une erreur inattendue s'est produite lors de l'annulation de la réservation.",
                    e);
        }
    }
}
