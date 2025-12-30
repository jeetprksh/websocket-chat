FROM openjdk:8
WORKDIR /home/websocket-chat
COPY . .
RUN ./mvnw clean package
ENTRYPOINT ["java", "-jar", "./target/websocket-chat-0.0.1-SNAPSHOT.jar"]
EXPOSE 8185