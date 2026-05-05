package tn.covoiturage.server.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import tn.covoiturage.server.model.PaymentTransaction;
import tn.covoiturage.server.model.Reservation;
import tn.covoiturage.server.model.User;

public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {

	List<PaymentTransaction> findByUserOrderByCreatedAtDesc(User user);

	List<PaymentTransaction> findByReservation(Reservation reservation);
}
