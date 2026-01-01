# websocket-chat 🚀

This repo contains a simple WebSocket chat demo (Spring Boot backend + Angular frontend).

## Getting up and running ⚡

It will require two terminals to run server and frontend:

## Prerequisites ✅

- Docker & Docker Compose (recommended)
- (optional) Node.js & npm (for local frontend dev)
- (optional) Java 21 & Maven (for local backend dev)

---

## Run locally (individually)

### Backend (server)

From the `server/` folder:

```bash
# run with the Maven wrapper
./mvnw spring-boot:run

# or build and run jar
./mvnw clean package
java -jar target/websocket-chat-0.0.1-SNAPSHOT.jar
```

The backend exposes a WebSocket endpoint at `ws://localhost:8185/websocket`.



---

## Run both with Docker Compose (recommended) 🐳

From the repository root run:

```bash
docker compose up --build
```

This will build and start the two services:

- `websocket-chat-server` -> host port 8185
- `websocket-chat-ui` -> host port 80

Open `http://localhost` in your browser to access the app. The frontend will reach the backend WebSocket at `ws://<browser-hostname>:8185/websocket`.

### Build images manually

If you want to build the images manually:

```bash
# backend
docker build -t websocket-chat-server ./server

# frontend
docker build -t websocket-chat-ui ./chat-ui
```

Run manually:

```bash
docker run --rm -p 8185:8185 websocket-chat-server
docker run --rm -p 80:80 websocket-chat-ui
```

---

## Notes & Troubleshooting ⚠️

- 🖥️ The frontend resolves the WebSocket hostname from the browser, so accessing `http://localhost` will make the WebSocket target `ws://localhost:8185/websocket`.
- If you access the frontend using a different host/IP, ensure the backend port 8185 is reachable from that host.
- 🧩 The server Dockerfile uses a multi-stage build and a Java 21 runtime to match the project `pom.xml` (`<java.version>21</java.version>`).

---