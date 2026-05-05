package tn.covoiturage.server.support;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

import tn.covoiturage.server.model.Trip;

/**
 * In-app monetary rules (no external PSP). Threshold: >= 24h before departure vs &lt; 24h (late cancel).
 */
public final class RideCancellationMoney {

	private RideCancellationMoney() {
	}

	public static LocalDateTime effectiveDeparture(Trip trip) {
		if (trip.getDepartureTime() != null) {
			return trip.getDepartureTime();
		}
		if (trip.getDate() != null) {
			return trip.getDate().atStartOfDay();
		}
		return LocalDateTime.now();
	}

	public static long hoursUntilDeparture(Trip trip) {
		return ChronoUnit.HOURS.between(LocalDateTime.now(), effectiveDeparture(trip));
	}

	/** Passenger cancels own booking: refunded fraction of paid price. */
	public static double passengerSelfCancelRefundFraction(long hoursUntilDeparture) {
		return hoursUntilDeparture >= 24 ? 1.0 : 0.90;
	}

	/** Driver cancels trip: multiple of each passenger reservation price refunded to that passenger. */
	public static double driverCancelPassengerRefundMultiplier(long hoursUntilDeparture) {
		return hoursUntilDeparture >= 24 ? 1.0 : 1.20;
	}

	public static boolean driverLateCancel(long hoursUntilDeparture) {
		return hoursUntilDeparture < 24;
	}

	/** Driver late-cancel: simulated penalty proportional to passenger fare (bonus paid to passenger). */
	public static double driverLatePenaltyPerPassengerFare() {
		return 0.20;
	}
}
