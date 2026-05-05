package tn.covoiturage.server.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import jakarta.persistence.LockModeType;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import tn.covoiturage.server.model.Trip;
import tn.covoiturage.server.model.User;

public interface TripRepository extends JpaRepository<Trip, Long> {

	@Lock(LockModeType.PESSIMISTIC_WRITE)
	@Query("SELECT t FROM Trip t WHERE t.id = :id")
	Optional<Trip> findByIdForUpdate(@Param("id") Long id);

    @Query("SELECT t FROM Trip t WHERE t.status = 'upcoming' ORDER BY t.departureTime ASC")
    List<Trip> findUpcomingTrips(Pageable pageable);

    @Query("SELECT t FROM Trip t WHERE t.depart = :depart AND t.arrivee = :arrivee AND t.date = :date AND t.placesDisponibles >= :nbrPassagers AND t.status = 'upcoming'")
    List<Trip> searchTrips(@Param("depart") String depart,
            @Param("arrivee") String arrivee,
            @Param("date") LocalDate date,
            @Param("nbrPassagers") Integer nbrPassagers);

    @Query("SELECT t FROM Trip t WHERE t.depart = :depart AND t.arrivee = :arrivee AND t.date = :date AND t.placesDisponibles >= :nbrPassagers AND t.prix <= :prixMax AND t.placesDisponibles >= :placesMin AND t.status = 'upcoming'")
    List<Trip> searchTripsWithFilters(@Param("depart") String depart,
            @Param("arrivee") String arrivee,
            @Param("date") LocalDate date,
            @Param("nbrPassagers") Integer nbrPassagers,
            @Param("prixMax") Double prixMax,
            @Param("placesMin") Integer placesMin);

    List<Trip> findByOwner(User owner);

    List<Trip> findByStatus(String status);
}
