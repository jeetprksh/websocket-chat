# server (Spring Boot 4) ☕

Local dev 🛠️

```bash
cd server
# run with the Maven wrapper
./mvnw spring-boot:run

# or build and run jar
./mvnw clean package
java -jar target/websocket-chat-0.0.1-SNAPSHOT.jar
```

Notes 📝
- The project targets Java 21 (see `pom.xml`), so use a Java 21 runtime when running locally.
