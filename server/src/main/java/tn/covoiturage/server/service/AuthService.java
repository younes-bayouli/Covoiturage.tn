package tn.covoiturage.server.service;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import tn.covoiturage.server.exception.AccountBannedException;
import tn.covoiturage.server.exception.AccountSuspendedException;
import tn.covoiturage.server.exception.UserNotFoundException;
import tn.covoiturage.server.model.AccountStatus;
import tn.covoiturage.server.model.ActivityLog;
import tn.covoiturage.server.model.User;
import tn.covoiturage.server.repository.UserRepository;
import tn.covoiturage.server.security.JwtUtils;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private ActivityLogService activityLogService;

    public User signup(User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            activityLogService.logAction(
                    "SIGNUP",
                    "FAILED",
                    "Email already in use: " + user.getEmail(),
                    user,
                    ActivityLog.ActionType.REGISTER);
            throw new RuntimeException("Email is already in use!");
        }

        user.setMotDePasse(encoder.encode(user.getMotDePasse()));
        User savedUser = userRepository.save(user);

        activityLogService.logAction(
                "SIGNUP",
                "SUCCESS",
                null,
                savedUser,
                ActivityLog.ActionType.REGISTER);

        return savedUser;
    }

    public Map<String, Object> login(String email, String password) {
        try {
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new UserNotFoundException("Utilisateur non trouvé avec l'email : " + email));

            try {
                Authentication authentication = authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(email, password));

                SecurityContextHolder.getContext().setAuthentication(authentication);

                activityLogService.logAction(
                        "LOGIN_ATTEMPT",
                        "SUCCESS",
                        null,
                        user,
                        ActivityLog.ActionType.LOGIN);

            } catch (BadCredentialsException e) {
                activityLogService.logAction(
                        "LOGIN_ATTEMPT",
                        "FAILED",
                        "Invalid password provided",
                        user,
                        ActivityLog.ActionType.LOGIN);
                throw new BadCredentialsException("Mot de passe incorrect.", e);
            } catch (AuthenticationException e) {
                activityLogService.logAction(
                        "LOGIN_ATTEMPT",
                        "FAILED",
                        "Authentication failed: " + e.getMessage(),
                        user,
                        ActivityLog.ActionType.LOGIN);
                throw e;
            }

            if (user.getAccountStatus() == AccountStatus.BANNED) {
                activityLogService.logAction(
                        "LOGIN_ATTEMPT",
                        "BLOCKED",
                        "Account is permanently banned",
                        user,
                        ActivityLog.ActionType.LOGIN);
                throw new AccountBannedException("cet compte a été banni définitivement.");
            }

            if (user.getAccountStatus() == AccountStatus.SUSPENDED) {
                activityLogService.logAction(
                        "LOGIN_ATTEMPT",
                        "BLOCKED",
                        "Account is temporarily suspended",
                        user,
                        ActivityLog.ActionType.LOGIN);
                throw new AccountSuspendedException("cet compte est temporairement suspendu.");
            }

            String jwt = jwtUtils.generateJwtToken(SecurityContextHolder.getContext().getAuthentication());

            Map<String, Object> response = new HashMap<>();
            response.put("token", jwt);
            response.put("user", user);

            return response;

        } catch (UserNotFoundException e) {
            User tempUser = new User();
            tempUser.setEmail(email);
            tempUser.setNom("Unknown");
            tempUser.setPrenom("User");
            activityLogService.logAction(
                    "LOGIN_ATTEMPT",
                    "FAILED",
                    "User not found with email: " + email,
                    tempUser,
                    ActivityLog.ActionType.LOGIN);
            throw e;
        } catch (AccountBannedException | AccountSuspendedException | AuthenticationException e) {
            throw e;
        } catch (Exception e) {
            System.err.println("Unexpected error during login: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Une erreur inattendue s'est produite lors de la connexion.", e);
        }
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }
}
