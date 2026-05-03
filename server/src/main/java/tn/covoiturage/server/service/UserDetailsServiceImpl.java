package tn.covoiturage.server.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import tn.covoiturage.server.model.User;
import tn.covoiturage.server.repository.UserRepository;

import java.util.ArrayList;
import java.util.Collection;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getMotDePasse(),
                getAuthorities(user));
    }

    /**
     * Get authorities based on user role
     */
    private Collection<? extends GrantedAuthority> getAuthorities(User user) {
        Collection<GrantedAuthority> authorities = new ArrayList<>();

        if (user.getRole() != null) {
            authorities.add(new SimpleGrantedAuthority("ROLE_" + user.getRole().toString()));
        } else {
            authorities.add(new SimpleGrantedAuthority("USER"));
        }

        return authorities;
    }
}