package com.chat.websocket;

import com.chat.enums.MessageType;
import com.chat.pojo.Message;
import com.chat.pojo.User;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.logging.Logger;

@Component
public class WebSocketHandler extends TextWebSocketHandler {

  private Logger logger = Logger.getLogger(WebSocketHandler.class.getName());

  private Map<User, WebSocketSession> userSessions = new ConcurrentHashMap<>();

  @Override
  public void handleTextMessage(WebSocketSession session, TextMessage message) throws IOException {
    logger.info("Sending message: " + message.getPayload() + " to " + userSessions.size() + " sessions.");
    String payload = message.getPayload();
    ObjectMapper mapper = new ObjectMapper();
    Message obj = mapper.readValue(payload, Message.class);

    User user = new User(obj.getFrom(), obj.getFromUserName(), true);
    if (obj.getType().equalsIgnoreCase(MessageType.JOINED.toString())) {
      logger.info(user.getUserName() + " Joined the chat");
      userSessions.put(user, session);
    } else if (obj.getType().equalsIgnoreCase(MessageType.LEFT.toString())) {
      logger.info(user.getUserName() + " Left the chat");
      userSessions.remove(user);
    }

    for(WebSocketSession webSocketSession : userSessions.values()) {
      webSocketSession.sendMessage(message);
    }
  }

  @Override
  public void afterConnectionEstablished(WebSocketSession session) {
    logger.info("Added Websocket session, total number of sessions are " + userSessions.size());
  }

  @Override
  public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
    logger.info("Removed Websocket session, total number of sessions are " + userSessions.size());
  }

  public Set<User> getOnlineUsers() {
    return userSessions.keySet();
  }
}