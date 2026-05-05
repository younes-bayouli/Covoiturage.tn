package tn.covoiturage.server.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tn.covoiturage.server.model.Conversation;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {

	@Query("SELECT DISTINCT c FROM Conversation c JOIN c.participants p WHERE p.user.id = :userId")
	List<Conversation> findAllForUser(@Param("userId") Long userId);

	List<Conversation> findByTrip_Id(Long tripId);

	@Query("SELECT DISTINCT c FROM Conversation c JOIN FETCH c.participants p JOIN FETCH p.user WHERE c.id = :id")
	Optional<Conversation> findByIdWithParticipants(@Param("id") Long id);
}
