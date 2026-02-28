package com.chat.websocket;

import com.chat.pojo.User;
import org.jspecify.annotations.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.util.MultiValueMap;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.logging.Logger;

@Component
public class WebSocketHandler extends TextWebSocketHandler {

  private final Logger logger = Logger.getLogger(WebSocketHandler.class.getName());

  private final Map<User, WebSocketSession> userSessions = new ConcurrentHashMap<>();

  @Override
  public void handleTextMessage(@NonNull WebSocketSession session, TextMessage message) throws IOException {
    logger.info("Sending message: " + message.getPayload() + " to " + userSessions.size() + " sessions.");
    for(WebSocketSession webSocketSession : userSessions.values()) {
      webSocketSession.sendMessage(message);
    }
  }

  @Override
  public void afterConnectionEstablished(@NonNull WebSocketSession session) {
    User user = getUserFromSession(session);
    userSessions.put(user, session);
    logger.info("Added Websocket session, total number of sessions are " + userSessions.size());
  }

  @Override
  public void afterConnectionClosed(@NonNull WebSocketSession session, @NonNull CloseStatus status) throws Exception {
    User user = getUserFromSession(session);
    System.out.println("CLOSING :: " + user.getId() + " " + user.getUserName());
    userSessions.remove(user);
    logger.info("Removed Websocket session, total number of sessions are " + userSessions.size());
  }

  public Set<User> getOnlineUsers() {
    return userSessions.keySet();
  }

  private User getUserFromSession(WebSocketSession session) {
    MultiValueMap<String, String> queryParams = UriComponentsBuilder.fromUriString(Objects.requireNonNull(session.getUri()).toString()).build().getQueryParams();
    return new User(Integer.parseInt(Objects.requireNonNull(queryParams.getFirst("userId"))), queryParams.getFirst("userName"), true);
  }
}