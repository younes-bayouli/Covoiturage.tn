package tn.covoiturage.server.model;

import java.time.LocalDateTime;

import jakarta.persistence.*;

/**
 * Simulated ledger: bookings, refunds, penalties. Amounts are in TND unless noted in note.
 */
@Entity
@Table(name = "payment_transactions")
public class PaymentTransaction {

	public static final String STATUS_SIMULATED_PAID = "SIMULATED_PAID";

	public static final String CATEGORY_BOOKING = "BOOKING_PAYMENT";
	public static final String CATEGORY_PASSENGER_CANCEL_REFUND = "PASSENGER_CANCEL_REFUND";
	public static final String CATEGORY_DRIVER_CANCEL_PASSENGER_REFUND = "DRIVER_CANCEL_PASSENGER_REFUND";
	public static final String CATEGORY_DRIVER_LATE_CANCEL_PENALTY = "DRIVER_LATE_CANCEL_PENALTY";

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(optional = false, fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id")
	private User user;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "reservation_id")
	private Reservation reservation;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "trip_id")
	private Trip trip;

	@Column(nullable = false, length = 64)
	private String category;

	/** Main monetary line (booking charge, gross refund credited, etc.) */
	@Column(nullable = false)
	private Double amount = 0.0;

	/** Withheld passenger penalty or component for audit */
	private Double penaltyAmount = 0.0;

	private String simulatedMethod = "IN_APP_SIMULATION";

	@Column(length = 32)
	private String status = STATUS_SIMULATED_PAID;

	private LocalDateTime createdAt = LocalDateTime.now();

	@Column(length = 500)
	private String note;

	public PaymentTransaction() {
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
	}

	public Reservation getReservation() {
		return reservation;
	}

	public void setReservation(Reservation reservation) {
		this.reservation = reservation;
	}

	public Trip getTrip() {
		return trip;
	}

	public void setTrip(Trip trip) {
		this.trip = trip;
	}

	public String getCategory() {
		return category;
	}

	public void setCategory(String category) {
		this.category = category;
	}

	public Double getAmount() {
		return amount;
	}

	public void setAmount(Double amount) {
		this.amount = amount;
	}

	public Double getPenaltyAmount() {
		return penaltyAmount;
	}

	public void setPenaltyAmount(Double penaltyAmount) {
		this.penaltyAmount = penaltyAmount;
	}

	public String getSimulatedMethod() {
		return simulatedMethod;
	}

	public void setSimulatedMethod(String simulatedMethod) {
		this.simulatedMethod = simulatedMethod;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public String getNote() {
		return note;
	}

	public void setNote(String note) {
		this.note = note;
	}
}
