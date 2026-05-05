package tn.covoiturage.server.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import tn.covoiturage.server.security.JwtUtils;
import tn.covoiturage.server.service.UserDetailsServiceImpl;

@Component
public class StompJwtChannelInterceptor implements ChannelInterceptor {

	@Autowired
	private JwtUtils jwtUtils;

	@Autowired
	private UserDetailsServiceImpl userDetailsService;

	@Override
	public Message<?> preSend(Message<?> message, MessageChannel channel) {
		StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
		if (accessor == null) {
			return message;
		}

		if (StompCommand.CONNECT.equals(accessor.getCommand())) {
			String header = accessor.getFirstNativeHeader("Authorization");
			String jwt = null;
			if (StringUtils.hasText(header) && header.startsWith("Bearer ")) {
				jwt = header.substring(7);
			}
			if (jwt != null && jwtUtils.validateJwtToken(jwt)) {
				String email = jwtUtils.getUserNameFromJwtToken(jwt);
				UserDetails ud = userDetailsService.loadUserByUsername(email);
				UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(ud, null,
						ud.getAuthorities());
				accessor.setUser(auth);
				SecurityContextHolder.getContext().setAuthentication(auth);
			}
		} else if (accessor.getUser() instanceof UsernamePasswordAuthenticationToken auth) {
			SecurityContextHolder.getContext().setAuthentication(auth);
		}

		return message;
	}
}
