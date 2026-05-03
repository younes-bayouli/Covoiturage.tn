package tn.covoiturage.server.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import tn.covoiturage.server.model.AccountStatus;
import tn.covoiturage.server.model.User;
import tn.covoiturage.server.service.AdminService;

import java.util.Map;

@RestController
@RequestMapping("/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    @Autowired
    private AdminService adminService;

    @GetMapping
    public ResponseEntity<Page<User>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(adminService.getAllUsers(PageRequest.of(page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getUserById(id));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<User> updateAccountStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        AccountStatus status = AccountStatus.valueOf(body.get("status").toUpperCase());
        return ResponseEntity.ok(adminService.updateAccountStatus(id, status));
    }

    @PutMapping("/{id}/verify")
    public ResponseEntity<User> verifyIdentityAndPhone(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        Boolean identity = body.get("identiteVerifiee");
        Boolean phone = body.get("telephoneVerifie");
        return ResponseEntity.ok(adminService.verifyIdentityAndPhone(id, identity, phone));
    }

    @PutMapping("/{id}/reset-password")
    public ResponseEntity<User> resetPassword(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String newPassword = body.get("password");
        return ResponseEntity.ok(adminService.resetPassword(id, newPassword));
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User updates) {
        return ResponseEntity.ok(adminService.adminUpdateUser(id, updates));
    }
}
