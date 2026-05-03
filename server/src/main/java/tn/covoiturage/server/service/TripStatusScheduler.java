package tn.covoiturage.server.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class TripStatusScheduler {

    @Autowired
    private TripService tripService;

    // Run every hour
    @Scheduled(fixedRate = 3600000)
    public void checkTripStatus() {
        System.out.println("Running scheduled trip status update...");
        tripService.updateCompletedTrips();
    }
}
