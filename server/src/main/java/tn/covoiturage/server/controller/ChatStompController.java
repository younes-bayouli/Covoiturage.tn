package tn.covoiturage.server.controller;

import java.security.Principal;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import tn.covoiturage.server.model.User;
import tn.covoiturage.server.repository.UserRepository;
import tn.covoiturage.server.service.ConversationService;

@Controller
public class ChatStompController {

	@Autowired
	private ConversationService conversationService;

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private SimpMessagingTemplate messagingTemplate;

	@MessageMapping("/chat/{conversationId}")
	public void sendChat(@DestinationVariable Long conversationId, @Payload Map<String, Object> payload,
			Principal principal) {
		if (principal == null) {
			return;
		}
		String email = principal.getName();
		User sender = userRepository.findByEmail(email).orElse(null);
		if (sender == null) {
			return;
		}
		Object raw = payload != null ? payload.get("content") : null;
		if (!(raw instanceof String) || ((String) raw).isBlank()) {
			return;
		}
		String content = ((String) raw).trim();
		try {
			Map<String, Object> out = conversationService.saveIncomingChatMessage(conversationId, sender, content);
			messagingTemplate.convertAndSend("/topic/conversation/" + conversationId, out);
		} catch (IllegalArgumentException ignored) {
			// invalid access or bad id — drop message
		}
	}
}
