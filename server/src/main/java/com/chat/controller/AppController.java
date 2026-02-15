package com.chat.controller;

import com.chat.pojo.LoginRequest;
import com.chat.pojo.User;

import com.chat.websocket.WebSocketHandler;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@CrossOrigin
@RestController
public class AppController {

	@Autowired
	private WebSocketHandler webSocketHandler;

	private List<User> validUsers = new ArrayList<>();
	
	@RequestMapping(value = "/user/login", method = RequestMethod.POST)
	public User userLogin(@RequestBody LoginRequest loginRequest, HttpServletResponse response) {
		Optional<User> user = getValidUsers()
								.stream()
								.filter(u -> u.getUserName().equalsIgnoreCase(loginRequest.getName()))
								.findFirst();
		
		if (user.isPresent()) {
			return user.get();
		} else {
			response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
			return null;
		}
	}
	
	@RequestMapping(value = "/user/list", method = RequestMethod.GET)
	public List<User> listUsers() {
		List<User> validUsers = getValidUsers();
		Set<User> onlineUsers = webSocketHandler.getOnlineUsers();
		validUsers.forEach(validUser -> {
			if (onlineUsers.contains(validUser)) {
				validUser.setOnline(true);
			} else {
				validUser.setOnline(false);
			}
		});
		return validUsers;
	}
	
	private List<User> getValidUsers() {
		if (!validUsers.isEmpty()) {
			return validUsers;
		} else {
			validUsers.add(new User(1, "Frodo", false));
			validUsers.add(new User(2, "Samwise", false));
			validUsers.add(new User(3, "Marry", false));
			validUsers.add(new User(4, "Pippin", false));
			validUsers.add(new User(5, "Eowyn", false));
			validUsers.add(new User(6, "Gollum", false));
			validUsers.add(new User(7, "Gandalf", false));
			validUsers.add(new User(8, "Aragorn", false));
			validUsers.add(new User(9, "Arwen", false));
			validUsers.add(new User(10, "Boromir", false));
			validUsers.add(new User(11, "Legolas", false));
			validUsers.add(new User(12, "Galadriel", false));
			validUsers.add(new User(13, "Gimli", false));
			validUsers.add(new User(14, "Sauron", false));
			return validUsers;
		}
	}

}
