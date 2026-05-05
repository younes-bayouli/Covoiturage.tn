package tn.covoiturage.server.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import tn.covoiturage.server.dto.ApiResponse;
import tn.covoiturage.server.dto.OpenConversationRequest;
import tn.covoiturage.server.service.ConversationService;

@RestController
@RequestMapping("/conversations")
public class ConversationController {

	@Autowired
	private ConversationService conversationService;

	@GetMapping
	public ResponseEntity<List<Map<String, Object>>> listMine() {
		return ResponseEntity.ok(conversationService.listForCurrentUser());
	}

	@PostMapping("/open")
	public ResponseEntity<?> open(@RequestBody OpenConversationRequest req) {
		try {
			Map<String, Object> conv = conversationService.openOrGetConversation(req.getTripId(), req.getDriverId());
			return ResponseEntity.ok(conv);
		} catch (IllegalArgumentException e) {
			return ResponseEntity.badRequest().body(new ApiResponse(e.getMessage()));
		}
	}
}
