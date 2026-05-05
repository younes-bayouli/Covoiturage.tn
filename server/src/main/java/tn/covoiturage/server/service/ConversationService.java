package tn.covoiturage.server.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.covoiturage.server.model.*;
import tn.covoiturage.server.repository.ChatMessageRepository;
import tn.covoiturage.server.repository.ConversationParticipantRepository;
import tn.covoiturage.server.repository.ConversationRepository;
import tn.covoiturage.server.repository.TripRepository;
import tn.covoiturage.server.repository.UserRepository;

import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ConversationService {

	@Autowired
	private ConversationRepository conversationRepository;

	@Autowired
	private ChatMessageRepository chatMessageRepository;

	@Autowired
	private TripRepository tripRepository;

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private ConversationParticipantRepository conversationParticipantRepository;

	@Autowired
	private UserService userService;

	private static String displayName(User u) {
		String p = u.getPrenom() != null ? u.getPrenom() : "";
		String n = u.getNom() != null ? u.getNom() : "";
		return (p + " " + n).trim();
	}

	private static String tripLabel(Trip t) {
		return t.getDepart() + " -> " + t.getArrivee();
	}

	private static String tripTime(Trip t) {
		if (t.getDepartureTime() == null) {
			return t.getDate() != null ? t.getDate().toString() : "";
		}
		return t.getDepartureTime().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
	}

	public boolean isParticipant(Long conversationId, Long userId) {
		return conversationParticipantRepository.countByConversation_IdAndUser_Id(conversationId, userId) > 0;
	}

	@Transactional(readOnly = true)
	public List<Map<String, Object>> listForCurrentUser() {
		User me = userService.getCurrentUser();
		List<Conversation> list = conversationRepository.findAllForUser(me.getId());
		return list.stream().map(c -> toView(c, me.getId())).collect(Collectors.toList());
	}

	@Transactional
	public Map<String, Object> openOrGetConversation(Long tripId, Long driverId) {
		User current = userService.getCurrentUser();
		if (current.getId().equals(driverId)) {
			throw new IllegalArgumentException("Vous ne pouvez pas ouvrir une conversation avec vous-meme.");
		}
		Trip trip = tripRepository.findByIdForUpdate(tripId)
				.orElseThrow(() -> new IllegalArgumentException("Trajet introuvable."));
		if (trip.getOwner() == null || !trip.getOwner().getId().equals(driverId)) {
			throw new IllegalArgumentException("Ce conducteur n'est pas le proprietaire de ce trajet.");
		}

		List<Conversation> candidates = conversationRepository.findByTrip_Id(tripId);
		for (Conversation c : candidates) {
			Set<Long> ids = c.getParticipants().stream().map(p -> p.getUser().getId()).collect(Collectors.toSet());
			if (ids.contains(current.getId()) && ids.contains(driverId) && ids.size() == 2) {
				return toView(c, current.getId());
			}
		}

		User driver = userRepository.findById(driverId)
				.orElseThrow(() -> new IllegalArgumentException("Conducteur introuvable."));

		Conversation conv = new Conversation();
		conv.setTrip(trip);
		conv.setTripLabel(tripLabel(trip));
		conv.setTripTime(tripTime(trip));
		conv.setLastMessage("");
		conv.setLastMessageAt(java.time.LocalDateTime.now());

		ConversationParticipant p1 = new ConversationParticipant(conv, current);
		ConversationParticipant p2 = new ConversationParticipant(conv, driver);
		conv.getParticipants().add(p1);
		conv.getParticipants().add(p2);

		Conversation saved = conversationRepository.save(conv);
		Conversation loaded = conversationRepository.findByIdWithParticipants(saved.getId()).orElse(saved);
		return toView(loaded, current.getId());
	}

	public Map<String, Object> toView(Conversation c, Long viewerUserId) {
		Map<String, Object> m = new LinkedHashMap<>();
		m.put("id", c.getId());
		m.put("tripLabel", c.getTripLabel());
		m.put("tripTime", c.getTripTime());
		m.put("lastMessage", c.getLastMessage() != null ? c.getLastMessage() : "");
		m.put("lastMessageAt", c.getLastMessageAt() != null ? c.getLastMessageAt().toString() : null);
		m.put("unread", 0);

		List<Map<String, Object>> plist = new ArrayList<>();
		String otherName = "Unknown";
		for (ConversationParticipant p : c.getParticipants()) {
			User u = p.getUser();
			Map<String, Object> pm = new LinkedHashMap<>();
			pm.put("userId", u.getId());
			pm.put("nom", displayName(u));
			plist.add(pm);
			if (!u.getId().equals(viewerUserId)) {
				otherName = displayName(u);
			}
		}
		m.put("participants", plist);
		m.put("participant", Collections.singletonMap("name", otherName));

		List<ChatMessage> msgs = chatMessageRepository.findByConversation_IdOrderBySentAtAsc(c.getId());
		List<Map<String, Object>> msgViews = new ArrayList<>();
		for (ChatMessage msg : msgs) {
			Map<String, Object> mv = new LinkedHashMap<>();
			mv.put("id", msg.getId());
			mv.put("senderId", msg.getSenderId());
			mv.put("content", msg.getContent());
			mv.put("sentAt", msg.getSentAt().toString());
			msgViews.add(mv);
		}
		m.put("messages", msgViews);
		return m;
	}

	@Transactional
	public Map<String, Object> saveIncomingChatMessage(Long conversationId, User sender, String content) {
		Conversation c = conversationRepository.findById(conversationId)
				.orElseThrow(() -> new IllegalArgumentException("Conversation introuvable."));
		if (!isParticipant(conversationId, sender.getId())) {
			throw new IllegalArgumentException("Acces refuse.");
		}
		ChatMessage msg = new ChatMessage(c, sender.getId(), content.trim());
		c.setLastMessage(content.trim());
		c.setLastMessageAt(msg.getSentAt());
		chatMessageRepository.save(msg);
		conversationRepository.save(c);

		Map<String, Object> mv = new LinkedHashMap<>();
		mv.put("id", msg.getId());
		mv.put("senderId", msg.getSenderId());
		mv.put("content", msg.getContent());
		mv.put("sentAt", msg.getSentAt().toString());
		return mv;
	}
}
