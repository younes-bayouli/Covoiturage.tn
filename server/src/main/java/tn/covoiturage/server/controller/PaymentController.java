package tn.covoiturage.server.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import tn.covoiturage.server.dto.ApiResponse;
import tn.covoiturage.server.model.PaymentTransaction;
import tn.covoiturage.server.model.User;
import tn.covoiturage.server.repository.PaymentTransactionRepository;
import tn.covoiturage.server.service.UserService;

@RestController
@RequestMapping("/payments")
public class PaymentController {

	@Autowired
	private PaymentTransactionRepository paymentTransactionRepository;

	@Autowired
	private UserService userService;

	@GetMapping("/me")
	public ResponseEntity<?> myTransactions() {
		User me = userService.getCurrentUser();
		List<PaymentTransaction> rows = paymentTransactionRepository.findByUserOrderByCreatedAtDesc(me);
		return ResponseEntity.ok(new ApiResponse("Paiements et ajustements simulés", rows));
	}
}
