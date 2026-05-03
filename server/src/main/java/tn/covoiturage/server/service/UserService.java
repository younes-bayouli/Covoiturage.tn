package tn.covoiturage.server.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.covoiturage.server.model.User;
import tn.covoiturage.server.model.ActivityLog;
import tn.covoiturage.server.repository.UserRepository;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ActivityLogService activityLogService;

    public User getCurrentUser() {
        try {
            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            String username;
            if (principal instanceof UserDetails) {
                username = ((UserDetails) principal).getUsername();
            } else {
                username = principal.toString();
            }
            User user = userRepository.findByEmail(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            return user;
        } catch (Exception e) {
            System.err.println("Error getting current user: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException(
                    "Une erreur inattendue s'est produite lors de la récupération de l'utilisateur actuel.", e);
        }
    }

    public User updateProfile(User updates) {
        try {
            User user = getCurrentUser();
            if (updates.getNom() != null)
                user.setNom(updates.getNom());
            if (updates.getPrenom() != null)
                user.setPrenom(updates.getPrenom());
            if (updates.getTelephone() != null)
                user.setTelephone(updates.getTelephone());
            if (updates.getVille() != null)
                user.setVille(updates.getVille());
            if (updates.getAvatarUrl() != null)
                user.setAvatarUrl(updates.getAvatarUrl());

            User updatedUser = userRepository.save(user);

            activityLogService.logAction(
                    "PROFILE_UPDATED",
                    "SUCCESS",
                    null,
                    user,
                    ActivityLog.ActionType.OTHER);

            return updatedUser;
        } catch (Exception e) {
            System.err.println("Error updating profile: " + e.getMessage());
            e.printStackTrace();
            activityLogService.logAction(
                    "PROFILE_UPDATED",
                    "FAILED",
                    "Error updating profile: " + e.getMessage(),
                    getCurrentUser(),
                    ActivityLog.ActionType.OTHER);
            throw new RuntimeException("Une erreur inattendue s'est produite lors de la mise à jour du profil.", e);
        }
    }

    @Transactional
    public void deleteAccount() {
        try {
            User user = getCurrentUser();

            activityLogService.logAction(
                    "ACCOUNT_DELETED",
                    "SUCCESS",
                    "User deleted their account",
                    user,
                    ActivityLog.ActionType.DELETE);

            userRepository.delete(user);
        } catch (Exception e) {
            System.err.println("Error deleting account: " + e.getMessage());
            e.printStackTrace();
            User user = getCurrentUser();
            activityLogService.logAction(
                    "ACCOUNT_DELETED",
                    "FAILED",
                    "Error deleting account: " + e.getMessage(),
                    user,
                    ActivityLog.ActionType.DELETE);
            throw new RuntimeException("Une erreur inattendue s'est produite lors de la suppression du compte.", e);
        }
    }
}
