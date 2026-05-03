package tn.covoiturage.server.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.covoiturage.server.model.Review;
import tn.covoiturage.server.model.User;
import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByTarget(User target);
}
