package tn.covoiturage.server.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.covoiturage.server.model.Reservation;
import tn.covoiturage.server.model.Trip;
import tn.covoiturage.server.model.User;
import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    List<Reservation> findByPassenger(User passenger);
    List<Reservation> findByTrip(Trip trip);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(r.price), 0.0) FROM Reservation r WHERE r.status = 'confirmed'")
    Double calculateTotalRevenue();
}
