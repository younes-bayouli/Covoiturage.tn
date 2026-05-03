package tn.covoiturage.server.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.covoiturage.server.model.*;
import tn.covoiturage.server.repository.*;

import java.util.List;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ActivityLogService activityLogService;

    // --- USER MANAGEMENT ---

    public Page<User> getAllUsers(Pageable pageable) {
        try {
            return userRepository.findAll(pageable);
        } catch (Exception e) {
            System.err.println("Error retrieving users: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Une erreur inattendue s'est produite lors de la récupération des utilisateurs.",
                    e);
        }
    }

    public User getUserById(Long id) {
        try {
            return userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        } catch (Exception e) {
            System.err.println("Error retrieving user: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Utilisateur non trouvé.", e);
        }
    }

    public User updateAccountStatus(Long id, AccountStatus status) {
        try {
            User user = getUserById(id);
            AccountStatus oldStatus = user.getAccountStatus();
            user.setAccountStatus(status);
            User updatedUser = userRepository.save(user);

            activityLogService.logAction(
                    "ACCOUNT_STATUS_UPDATED",
                    "SUCCESS",
                    "Status changed from " + oldStatus + " to " + status,
                    user,
                    ActivityLog.ActionType.OTHER);

            return updatedUser;
        } catch (Exception e) {
            System.err.println("Error updating account status: " + e.getMessage());
            e.printStackTrace();
            User user = getUserById(id);
            activityLogService.logAction(
                    "ACCOUNT_STATUS_UPDATED",
                    "FAILED",
                    "Error: " + e.getMessage(),
                    user,
                    ActivityLog.ActionType.OTHER);
            throw new RuntimeException(
                    "Une erreur inattendue s'est produite lors de la mise à jour du statut du compte.", e);
        }
    }

    public User verifyIdentityAndPhone(Long id, Boolean identity, Boolean phone) {
        try {
            User user = getUserById(id);
            if (identity != null) {
                user.setIdentiteVerifiee(identity);
            }
            if (phone != null) {
                user.setTelephoneVerifie(phone);
            }
            User updatedUser = userRepository.save(user);

            activityLogService.logAction(
                    "IDENTITY_VERIFIED",
                    "SUCCESS",
                    "Identity: " + identity + ", Phone: " + phone,
                    user,
                    ActivityLog.ActionType.OTHER);

            return updatedUser;
        } catch (Exception e) {
            System.err.println("Error verifying identity: " + e.getMessage());
            e.printStackTrace();
            User user = getUserById(id);
            activityLogService.logAction(
                    "IDENTITY_VERIFIED",
                    "FAILED",
                    "Error: " + e.getMessage(),
                    user,
                    ActivityLog.ActionType.OTHER);
            throw new RuntimeException("Une erreur inattendue s'est produite lors de la vérification d'identité.", e);
        }
    }

    public User resetPassword(Long id, String rawPassword) {
        try {
            if (rawPassword == null || rawPassword.trim().isEmpty()) {
                User user = getUserById(id);
                activityLogService.logAction(
                        "PASSWORD_RESET",
                        "FAILED",
                        "Password cannot be empty",
                        user,
                        ActivityLog.ActionType.OTHER);
                throw new IllegalArgumentException("Password cannot be empty");
            }

            User user = getUserById(id);
            user.setMotDePasse(passwordEncoder.encode(rawPassword));
            User updatedUser = userRepository.save(user);

            activityLogService.logAction(
                    "PASSWORD_RESET",
                    "SUCCESS",
                    "Password reset by admin",
                    user,
                    ActivityLog.ActionType.OTHER);

            return updatedUser;
        } catch (Exception e) {
            System.err.println("Error resetting password: " + e.getMessage());
            e.printStackTrace();
            User user = getUserById(id);
            activityLogService.logAction(
                    "PASSWORD_RESET",
                    "FAILED",
                    "Error: " + e.getMessage(),
                    user,
                    ActivityLog.ActionType.OTHER);
            throw new RuntimeException(
                    "Une erreur inattendue s'est produite lors de la réinitialisation du mot de passe.", e);
        }
    }

    public User adminUpdateUser(Long id, User updates) {
        try {
            User user = getUserById(id);
            if (updates.getNom() != null)
                user.setNom(updates.getNom());
            if (updates.getPrenom() != null)
                user.setPrenom(updates.getPrenom());
            if (updates.getTelephone() != null)
                user.setTelephone(updates.getTelephone());
            if (updates.getVille() != null)
                user.setVille(updates.getVille());

            User updatedUser = userRepository.save(user);

            activityLogService.logAction(
                    "USER_UPDATED",
                    "SUCCESS",
                    "Admin updated user profile",
                    user,
                    ActivityLog.ActionType.OTHER);

            return updatedUser;
        } catch (Exception e) {
            System.err.println("Error updating user: " + e.getMessage());
            e.printStackTrace();
            User user = getUserById(id);
            activityLogService.logAction(
                    "USER_UPDATED",
                    "FAILED",
                    "Error: " + e.getMessage(),
                    user,
                    ActivityLog.ActionType.OTHER);
            throw new RuntimeException("Une erreur inattendue s'est produite lors de la mise à jour de l'utilisateur.",
                    e);
        }
    }

    // --- TRIP MANAGEMENT ---

    public Page<Trip> getAllTrips(Pageable pageable) {
        try {
            return tripRepository.findAll(pageable);
        } catch (Exception e) {
            System.err.println("Error retrieving trips: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Une erreur inattendue s'est produite lors de la récupération des trajets.", e);
        }
    }

    public Trip getTripById(Long id) {
        try {
            return tripRepository.findById(id).orElseThrow(() -> new RuntimeException("Trip not found"));
        } catch (Exception e) {
            System.err.println("Error retrieving trip: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Trajet non trouvé.", e);
        }
    }

    @Transactional
    public void adminCancelTrip(Long tripId, User admin) {
        try {
            Trip trip = getTripById(tripId);
            List<Reservation> reservations = reservationRepository.findByTrip(trip);

            trip.setStatus("cancelled");
            tripRepository.save(trip);

            for (Reservation res : reservations) {
                if ("confirmed".equals(res.getStatus())) {
                    res.setStatus("cancelled");
                    reservationRepository.save(res);
                }
            }

            activityLogService.logAction(
                    "TRIP_CANCELLED",
                    "SUCCESS",
                    "Trip cancelled by admin. Reservations cancelled: " + reservations.size(),
                    admin,
                    ActivityLog.ActionType.DELETE);

        } catch (Exception e) {
            System.err.println("Error cancelling trip: " + e.getMessage());
            e.printStackTrace();
            activityLogService.logAction(
                    "TRIP_CANCELLED",
                    "FAILED",
                    "Error: " + e.getMessage(),
                    admin,
                    ActivityLog.ActionType.DELETE);
            throw new RuntimeException("Une erreur inattendue s'est produite lors de l'annulation du trajet.", e);
        }
    }

    public Page<Reservation> getAllReservations(Pageable pageable) {
        try {
            return reservationRepository.findAll(pageable);
        } catch (Exception e) {
            System.err.println("Error retrieving reservations: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Une erreur inattendue s'est produite lors de la récupération des réservations.",
                    e);
        }
    }

    public Reservation getReservationById(Long id) {
        try {
            return reservationRepository.findById(id).orElseThrow(() -> new RuntimeException("Reservation not found"));
        } catch (Exception e) {
            System.err.println("Error retrieving reservation: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Réservation non trouvée.", e);
        }
    }

    @Transactional
    public void adminCancelReservation(Long reservationId, User admin) {
        try {
            Reservation res = getReservationById(reservationId);

            if ("cancelled".equals(res.getStatus())) {
                activityLogService.logAction(
                        "RESERVATION_CANCELLED",
                        "FAILED",
                        "Reservation already cancelled",
                        admin,
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
                    "Cancelled by admin. Refund: " + res.getPrice() + " TND",
                    admin,
                    ActivityLog.ActionType.DELETE);

        } catch (Exception e) {
            System.err.println("Error cancelling reservation: " + e.getMessage());
            e.printStackTrace();
            activityLogService.logAction(
                    "RESERVATION_CANCELLED",
                    "FAILED",
                    "Error: " + e.getMessage(),
                    admin,
                    ActivityLog.ActionType.DELETE);
            throw new RuntimeException("Une erreur inattendue s'est produite lors de l'annulation de la réservation.",
                    e);
        }
    }

    // --- REVIEW MANAGEMENT ---

    public Page<Review> getAllReviews(Pageable pageable) {
        try {
            return reviewRepository.findAll(pageable);
        } catch (Exception e) {
            System.err.println("Error retrieving reviews: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Une erreur inattendue s'est produite lors de la récupération des avis.", e);
        }
    }

    public Review getReviewById(Long id) {
        try {
            return reviewRepository.findById(id).orElseThrow(() -> new RuntimeException("Review not found"));
        } catch (Exception e) {
            System.err.println("Error retrieving review: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Avis non trouvé.", e);
        }
    }

    @Transactional
    public void deleteReview(Long reviewId, User admin) {
        try {
            Review review = getReviewById(reviewId);
            User targetDriver = review.getTarget();
            reviewRepository.delete(review);
            updateDriverRating(targetDriver);

            activityLogService.logAction(
                    "REVIEW_DELETED",
                    "SUCCESS",
                    "Review deleted by admin",
                    admin,
                    ActivityLog.ActionType.DELETE);

        } catch (Exception e) {
            System.err.println("Error deleting review: " + e.getMessage());
            e.printStackTrace();
            activityLogService.logAction(
                    "REVIEW_DELETED",
                    "FAILED",
                    "Error: " + e.getMessage(),
                    admin,
                    ActivityLog.ActionType.DELETE);
            throw new RuntimeException("Une erreur inattendue s'est produite lors de la suppression de l'avis.", e);
        }
    }

    private void updateDriverRating(User driver) {
        try {
            List<Review> reviews = reviewRepository.findByTarget(driver);
            if (reviews.isEmpty()) {
                driver.setNote(0.0);
            } else {
                double avgRating = reviews.stream()
                        .mapToDouble(Review::getRating)
                        .average()
                        .orElse(0.0);
                driver.setNote(avgRating);
            }
            userRepository.save(driver);
        } catch (Exception e) {
            System.err.println("Error updating driver rating: " + e.getMessage());
            e.printStackTrace();
        }
    }

    // --- CONVERSATION & MESSAGE OVERSIGHT ---

}
