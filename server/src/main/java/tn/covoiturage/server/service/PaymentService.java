package tn.covoiturage.server.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import tn.covoiturage.server.model.PaymentTransaction;
import tn.covoiturage.server.model.Reservation;
import tn.covoiturage.server.model.Trip;
import tn.covoiturage.server.model.User;
import tn.covoiturage.server.repository.PaymentTransactionRepository;

@Service
public class PaymentService {

	@Autowired
	private PaymentTransactionRepository paymentTransactionRepository;

	@Transactional
	public PaymentTransaction recordSimulatedBookingPayment(User passenger, Reservation reservation, double totalPrice,
			String methodLabel, String maskedPan) {
		PaymentTransaction p = new PaymentTransaction();
		p.setUser(passenger);
		p.setReservation(reservation);
		p.setTrip(reservation.getTrip());
		p.setCategory(PaymentTransaction.CATEGORY_BOOKING);
		p.setAmount(totalPrice);
		p.setPenaltyAmount(0.0);
		p.setSimulatedMethod(methodLabel != null ? methodLabel : "IN_APP_SIMULATION");
		String extra = maskedPan != null && !maskedPan.isBlank() ? (" ref=" + maskedPan) : "";
		p.setNote("Reservation #" + reservation.getId() + " — paiement simulé" + extra);
		p.setStatus(PaymentTransaction.STATUS_SIMULATED_PAID);
		return paymentTransactionRepository.save(p);
	}

	@Transactional
	public PaymentTransaction recordPassengerCancelRefund(User passenger, Reservation reservation, double refundAmount,
			double penaltyWithheld, long hoursUntilDeparture) {
		PaymentTransaction p = new PaymentTransaction();
		p.setUser(passenger);
		p.setReservation(reservation);
		p.setTrip(reservation.getTrip());
		p.setCategory(PaymentTransaction.CATEGORY_PASSENGER_CANCEL_REFUND);
		p.setAmount(refundAmount);
		p.setPenaltyAmount(penaltyWithheld);
		p.setSimulatedMethod("ADJUSTMENT");
		p.setNote(String.format(
				"Annulation passager — remboursement simulé %.2f TND — pénalité retenue %.2f TND (%.0fh avant trajet)",
				refundAmount, penaltyWithheld, (double) hoursUntilDeparture));
		p.setStatus(PaymentTransaction.STATUS_SIMULATED_PAID);
		return paymentTransactionRepository.save(p);
	}

	@Transactional
	public PaymentTransaction recordDriverCancelPassengerRefund(User passenger, Reservation reservation,
			double refundedAmount,
			long hoursUntilDeparture) {
		PaymentTransaction p = new PaymentTransaction();
		p.setUser(passenger);
		p.setReservation(reservation);
		p.setTrip(reservation.getTrip());
		p.setCategory(PaymentTransaction.CATEGORY_DRIVER_CANCEL_PASSENGER_REFUND);
		p.setAmount(refundedAmount);
		p.setPenaltyAmount(0.0);
		p.setSimulatedMethod("ADJUSTMENT");
		p.setNote(String.format(
				"Annulation conducteur — remboursement passager simulé %.2f TND (%dh avant trajet)",
				refundedAmount, hoursUntilDeparture));
		p.setStatus(PaymentTransaction.STATUS_SIMULATED_PAID);
		return paymentTransactionRepository.save(p);
	}

	@Transactional
	public PaymentTransaction recordDriverLateCancelPenalty(User driver, Trip trip, double penaltyAmount,
			String detail) {
		PaymentTransaction p = new PaymentTransaction();
		p.setUser(driver);
		p.setReservation(null);
		p.setTrip(trip);
		p.setCategory(PaymentTransaction.CATEGORY_DRIVER_LATE_CANCEL_PENALTY);
		p.setAmount(penaltyAmount);
		p.setPenaltyAmount(penaltyAmount);
		p.setSimulatedMethod("PENALTY");
		p.setNote(detail);
		p.setStatus(PaymentTransaction.STATUS_SIMULATED_PAID);
		return paymentTransactionRepository.save(p);
	}
}
