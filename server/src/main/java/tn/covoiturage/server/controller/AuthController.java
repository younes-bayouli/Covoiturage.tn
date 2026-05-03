package tn.covoiturage.server.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.covoiturage.server.dto.ApiResponse;
import tn.covoiturage.server.model.User;
import tn.covoiturage.server.service.AuthService;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody User user) {
        try {
            User savedUser = authService.signup(user);
            return new ResponseEntity<>(new ApiResponse("User registered successfully", savedUser), HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
        try {
            Map<String, Object> response = authService.login(loginRequest.get("email"), loginRequest.get("motDePasse"));
            return ResponseEntity.ok(new ApiResponse("Login successful", response));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ApiResponse("Invalid email or password"));
        }
    }
}
