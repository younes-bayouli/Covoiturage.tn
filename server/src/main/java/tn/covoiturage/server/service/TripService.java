package tn.covoiturage.server.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import tn.covoiturage.server.model.Reservation;
import tn.covoiturage.server.model.Trip;
import tn.covoiturage.server.model.User;
import tn.covoiturage.server.model.ActivityLog;
import tn.covoiturage.server.repository.ReservationRepository;
import tn.covoiturage.server.repository.TripRepository;
import tn.covoiturage.server.support.RideCancellationMoney;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import tn.covoiturage.server.exception.InvalidTripDataException;

@Service
public class TripService {

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private ActivityLogService activityLogService;

    @Autowired
    private PaymentService paymentService;

    public List<Trip> getUpcomingTrips(Integer limit) {
        Pageable pageable = PageRequest.of(0, Math.min(limit, 100));
        return tripRepository.findUpcomingTrips(pageable);
    }

    public List<Trip> search(String depart, String arrivee, LocalDate date, Integer nbrPassagers) {
        return tripRepository.searchTrips(depart, arrivee, date, nbrPassagers);
    }

    public List<Trip> searchTrips(String depart, String arrivee, LocalDate date, Integer nbrPassagers, Double prixMax,
            Integer placesMin) {
        return tripRepository.searchTripsWithFilters(depart, arrivee, date, nbrPassagers, prixMax, placesMin);
    }

    public Trip getById(Long id) {
        return tripRepository.findById(id).orElse(null);
    }

    public Trip createTrip(Trip trip, User owner) {
        try {
            // 1. Vérification de l'utilisateur
            if (owner == null) {
                throw new IllegalArgumentException("L'organisateur du voyage ne peut pas être nul.");
            }

            // 2. Vérification des capacités (Décision via exception)
            if (trip.getSeats() <= 0) {
                throw new InvalidTripDataException("Le nombre de places doit être supérieur à zéro.");
            }

            // 3. Validation de la date (Logique métier)
            if (trip.getDate() != null && trip.getDate().isBefore(LocalDate.now())) {
                throw new InvalidTripDataException("La date de départ ne peut pas être dans le passé.");
            }

            // 4. Initialisation de l'état interne
            trip.setOwner(owner);
            trip.setPlacesDisponibles(trip.getSeats());
            trip.setStatus("upcoming");

            Trip createdTrip = tripRepository.save(trip);

            // Log successful trip creation
            activityLogService.logAction(
                    "TRIP_CREATED",
                    "SUCCESS",
                    null,
                    owner,
                    ActivityLog.ActionType.OTHER);

            return createdTrip;
        } catch (InvalidTripDataException e) {
            activityLogService.logAction(
                    "TRIP_CREATED",
                    "FAILED",
                    e.getMessage(),
                    owner,
                    ActivityLog.ActionType.OTHER);
            throw e;
        } catch (Exception e) {
            System.err.println("Unexpected error creating trip: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Une erreur inattendue s'est produite lors de la création du voyage.", e);
        }
    }

    public List<Trip> getOwnTrips(User owner) {
        return tripRepository.findByOwner(owner);
    }

    @Transactional
    public void cancelTrip(Long tripId, User owner) {
        try {
            Trip trip = tripRepository.findById(tripId)
                    .orElseThrow(() -> new RuntimeException("Trip not found"));

            if (!trip.getOwner().getId().equals(owner.getId())) {
                activityLogService.logAction(
                        "TRIP_CANCELLED",
                        "UNAUTHORIZED",
                        "User attempted to cancel trip they don't own",
                        owner,
                        ActivityLog.ActionType.DELETE);
                throw new RuntimeException("Unauthorized");
            }

            trip.setStatus("cancelled");
            tripRepository.save(trip);

            List<Reservation> reservations = reservationRepository.findByTrip(trip);
            long hoursUntilDeparture = RideCancellationMoney.hoursUntilDeparture(trip);
            double multiplier = RideCancellationMoney.driverCancelPassengerRefundMultiplier(hoursUntilDeparture);
            boolean late = RideCancellationMoney.driverLateCancel(hoursUntilDeparture);
            double driverPenaltyTotal = 0;

            for (Reservation res : reservations) {
                if (res.getStatus() == null || !res.getStatus().equalsIgnoreCase("confirmed")) {
                    continue;
                }
                double refunded = Math.round(res.getPrice() * multiplier * 100.0) / 100.0;
                paymentService.recordDriverCancelPassengerRefund(res.getPassenger(), res, refunded,
                        hoursUntilDeparture);

                if (late) {
                    driverPenaltyTotal += res.getPrice() * RideCancellationMoney.driverLatePenaltyPerPassengerFare();
                }

                res.setStatus("cancelled");
                reservationRepository.save(res);
            }

            if (late && driverPenaltyTotal > 0) {
                driverPenaltyTotal = Math.round(driverPenaltyTotal * 100.0) / 100.0;
                paymentService.recordDriverLateCancelPenalty(owner, trip, driverPenaltyTotal,
                        String.format(
                                "Pénalité simulée (%d h avant trajet): >24h pas de surplus; sinon +20 %% par passager regroupée ici.",
                                hoursUntilDeparture));
            }

            activityLogService.logAction(
                    "TRIP_CANCELLED",
                    "SUCCESS",
                    "Trip cancelled with refunds processed",
                    owner,
                    ActivityLog.ActionType.DELETE);
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().equals("Unauthorized")) {
                throw e;
            }
            System.err.println("Error cancelling trip: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Une erreur inattendue s'est produite lors de l'annulation du voyage.", e);
        }
    }

    @Transactional
    public void updateCompletedTrips() {
        try {
            List<Trip> upcomingTrips = tripRepository.findByStatus("upcoming");
            LocalDateTime now = LocalDateTime.now();

            for (Trip trip : upcomingTrips) {
                if (trip.getDepartureTime().isBefore(now)) {
                    trip.setStatus("completed");

                    // Update stats for owner
                    User owner = trip.getOwner();
                    owner.setTrajetsEffectues(owner.getTrajetsEffectues() + 1);
                    owner.setTrajetsEnTantQueConducteur(owner.getTrajetsEnTantQueConducteur() + 1);

                    // Update stats for passengers
                    List<Reservation> reservations = reservationRepository.findByTrip(trip);
                    for (Reservation res : reservations) {
                        if (res.getStatus().equals("confirmed")) {
                            User passenger = res.getPassenger();
                            passenger.setTrajetsEffectues(passenger.getTrajetsEffectues() + 1);
                            passenger.setTrajetsEnTantQuePassager(passenger.getTrajetsEnTantQuePassager() + 1);
                        }
                    }
                    tripRepository.save(trip);
                }
            }
        } catch (Exception e) {
            System.err.println("Error updating completed trips: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Une erreur inattendue s'est produite lors de la mise à jour des trajets.", e);
        }
    }
}
