package tn.covoiturage.server.dto;

public class OpenConversationRequest {
	private Long tripId;
	private Long driverId;

	public Long getTripId() {
		return tripId;
	}

	public void setTripId(Long tripId) {
		this.tripId = tripId;
	}

	public Long getDriverId() {
		return driverId;
	}

	public void setDriverId(Long driverId) {
		this.driverId = driverId;
	}
}
