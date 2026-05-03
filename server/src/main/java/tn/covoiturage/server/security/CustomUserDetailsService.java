package tn.covoiturage.server.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import tn.covoiturage.server.model.User;
import tn.covoiturage.server.repository.UserRepository;

import java.util.ArrayList;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import java.util.Collections;
import tn.covoiturage.server.model.AccountStatus;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User Not Found with email: " + email));

        boolean enabled = user.getAccountStatus() == AccountStatus.ACTIVE;
        
        GrantedAuthority authority = new SimpleGrantedAuthority(user.getRole().name());

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(), 
                user.getMotDePasse(), 
                enabled, 
                true, 
                true, 
                true, 
                Collections.singletonList(authority));
    }
}
