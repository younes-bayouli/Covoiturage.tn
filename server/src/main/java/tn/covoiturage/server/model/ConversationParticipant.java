package tn.covoiturage.server.model;

import jakarta.persistence.*;

@Entity
@Table(name = "conversation_participants", uniqueConstraints = {
		@UniqueConstraint(columnNames = { "conversation_id", "user_id" })
})
public class ConversationParticipant {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "conversation_id", nullable = false)
	private Conversation conversation;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	public ConversationParticipant() {
	}

	public ConversationParticipant(Conversation conversation, User user) {
		this.conversation = conversation;
		this.user = user;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Conversation getConversation() {
		return conversation;
	}

	public void setConversation(Conversation conversation) {
		this.conversation = conversation;
	}

	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
	}
}
