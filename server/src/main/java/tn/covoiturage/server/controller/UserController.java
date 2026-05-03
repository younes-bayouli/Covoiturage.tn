package tn.covoiturage.server.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.covoiturage.server.dto.ApiResponse;
import tn.covoiturage.server.model.User;
import tn.covoiturage.server.service.UserService;

@RestController
@RequestMapping("/compte")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<?> getOwnProfile() {
        try {
            User user = userService.getCurrentUser();
            return ResponseEntity.ok(new ApiResponse("Profile retrieved", user));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(e.getMessage()));
        }
    }

    @PutMapping
    public ResponseEntity<?> updateProfile(@RequestBody User updates) {
        try {
            User updatedUser = userService.updateProfile(updates);
            return ResponseEntity.ok(new ApiResponse("Profile updated", updatedUser));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(e.getMessage()));
        }
    }

    @DeleteMapping
    public ResponseEntity<?> deleteAccount() {
        try {
            userService.deleteAccount();
            return ResponseEntity.ok(new ApiResponse("Account deleted"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(e.getMessage()));
        }
    }
}
