package tn.covoiturage.server.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.covoiturage.server.model.ConversationParticipant;

@Repository
public interface ConversationParticipantRepository extends JpaRepository<ConversationParticipant, Long> {

	long countByConversation_IdAndUser_Id(Long conversationId, Long userId);
}
