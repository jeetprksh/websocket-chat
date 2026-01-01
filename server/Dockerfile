FROM maven:3.9.4-eclipse-temurin-21 AS builder
WORKDIR /workspace
COPY . .
RUN mvn -B clean package -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /home/websocket-chat
COPY --from=builder /workspace/target/*.jar ./websocket-chat.jar
EXPOSE 8185
ENTRYPOINT ["java", "-jar", "./websocket-chat.jar"]