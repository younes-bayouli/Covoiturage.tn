package tn.covoiturage.server.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import tn.covoiturage.server.model.Reservation;
import tn.covoiturage.server.model.Trip;
import tn.covoiturage.server.model.User;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

	@Query("SELECT r FROM Reservation r JOIN FETCH r.trip t JOIN FETCH t.owner WHERE r.passenger = :passenger")
	List<Reservation> findByPassengerWithTripAndOwner(@Param("passenger") User passenger);

    List<Reservation> findByPassenger(User passenger);
    List<Reservation> findByTrip(Trip trip);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(r.price), 0.0) FROM Reservation r WHERE r.status = 'confirmed'")
    Double calculateTotalRevenue();
}
