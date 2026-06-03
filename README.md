Distributed Realtime App

A production-focused distributed realtime application built with microservices, WebSockets, Redis Pub/Sub, PostgreSQL, Docker, Nginx, and JWT authentication.

---

Architecture Overview

Services

Auth Service

Responsible for:

- User registration
- User login
- JWT access token generation
- Refresh token generation
- Refresh token rotation
- Session management
- Session recovery
- Logout
- Session revocation
- Refresh token reuse detection

---

Realtime Server

Responsible for:

- WebSocket connections
- Socket authentication
- Topic subscriptions
- Realtime message broadcasting
- Redis adapter integration
- Cross-instance event propagation

---

Client (Next.js)

Responsible for:

- User authentication flows
- Silent authentication
- Session persistence
- Automatic token refresh
- Realtime communication
- Topic subscription UI
- Message publishing and receiving

---

Redis

Used for:

- Socket.IO Redis adapter
- Cross-instance event propagation
- Distributed realtime communication

---

PostgreSQL

Stores:

- Users
- Refresh token sessions
- Session metadata

---

Nginx

Acts as:

- Reverse proxy
- API gateway
- WebSocket proxy
- Frontend routing layer

---

Architecture

Browser
   │
   ▼
Nginx
   │
   ├── /auth/* ─────► Auth Service
   │
   ├── /socket.io/* ─► Realtime Server
   │
   └── / ───────────► Next.js Client

Realtime Server
      │
      ▼
Redis Adapter
      │
      ▼
Other Realtime Instances

Auth Service
      │
      ▼
PostgreSQL

---

Authentication System

JWT Authentication

Uses:

- Access Tokens (15 minutes)
- Refresh Tokens (7 days)
- HTTP-only Cookies

Authentication flow:

Login
  │
  ▼
Generate Access Token
Generate Refresh Token
  │
  ▼
Store Refresh Session
  │
  ▼
Send Cookies

---

Cookie-Based Authentication

Tokens are stored in:

- HTTP-only cookies
- Not accessible via JavaScript
- Automatically included in requests

Cookies:

accessToken
refreshToken

---

Silent Authentication

When an access token expires:

1. Frontend automatically detects the failure
2. Calls "/auth/refresh"
3. Backend rotates the refresh token
4. New access token is issued
5. Original request is retried automatically

User remains authenticated without seeing a login screen.

---

Automatic Access Token Refresh

The frontend uses a centralized authenticated fetch wrapper.

Features:

- Detects expired access tokens
- Automatically refreshes session
- Retries original request
- Prevents unnecessary logouts
- Works transparently for protected requests

---

Persistent Login

Users remain authenticated after:

- Browser restart
- Closing and reopening tabs
- Page refresh

As long as a valid refresh token session exists.

---

Session Recovery

If:

access token expired
refresh token valid

The application automatically restores authentication and continues operating without requiring manual login.

---

Refresh Token Rotation

Every refresh request:

1. Validates refresh token
2. Revokes previous token
3. Generates new refresh token
4. Generates new access token
5. Stores new session record

Benefits:

- Prevents replay attacks
- Limits stolen token usefulness
- Improves session security

---

Hashed Refresh Token Storage

Refresh tokens are never stored directly.

Database stores:

SHA-256(token)

Benefits:

- Database leak protection
- Session security
- Industry-standard practice

---

Refresh Token Reuse Detection

Detects:

- Stolen refresh tokens
- Reused revoked tokens
- Replay attacks

On detection:

All user sessions revoked

This is a production-grade security mechanism used by modern authentication systems.

---

Database-Backed Sessions

Refresh token sessions are stored in PostgreSQL.

Stored fields:

tokenHash
userId
familyId
revoked
replacedBy
createdAt
expiresAt

Benefits:

- Session revocation
- Future multi-device support
- Session auditing
- Device management foundation

---

Realtime System

Socket Authentication

Socket connections require:

accessToken cookie

Authentication occurs during the Socket.IO handshake.

Unauthorized connections are rejected before establishing a realtime connection.

---

Topic-Based Messaging

Clients can:

Subscribe to topic
Publish message to topic
Receive messages from topic

Examples:

sports
news
chat
alerts

---

Redis Adapter Scaling

Socket.IO Redis adapter enables:

- Horizontal scaling
- Multi-instance communication
- Distributed event broadcasting

Messages published on one instance are automatically delivered to subscribers connected to other instances.

---

Cross-Client Realtime Messaging

Verified working:

- Multiple browser tabs
- Multiple authenticated users
- Shared topic subscriptions
- Realtime message propagation

---

Security Features

Implemented:

✅ Password hashing (bcrypt)

✅ JWT access tokens

✅ Refresh tokens

✅ HTTP-only cookies

✅ Refresh token rotation

✅ Hashed refresh token storage

✅ Database-backed sessions

✅ Session revocation

✅ Refresh token reuse detection

✅ Silent authentication

✅ Automatic token refresh

✅ Persistent login

✅ Session recovery

✅ Socket authentication

✅ Protected websocket connections

---

Configuration Management

Environment variables are centralized through Docker.

Example:

DATABASE_URL=postgresql://postgres:postgres@postgres:5432/app_db

JWT_SECRET=your-secret
JWT_REFRESH_SECRET=your-refresh-secret

Benefits:

- Consistent secrets across services
- Easier deployment
- Reduced configuration drift

---

Dockerized Infrastructure

Services run via Docker Compose.

Included containers:

client
auth-service
server
redis
postgres
nginx

---

Start System

docker compose up

---

Build and Start

docker compose up --build

---

Detached Mode

docker compose up -d

---

Stop System

docker compose down

---

Database Commands

Prisma Migration

docker compose exec auth-service npx prisma migrate dev

---

Prisma Studio

docker compose exec auth-service npx prisma studio

---

Project Structure

project-root/
│
├── .env
│
├── auth-service/
│   ├── controllers/
│   │   └── auth.controller.js
│   │
│   ├── routes/
│   │   └── auth.routes.js
│   │
│   ├── services/
│   │   └── auth.service.js
│   │
│   ├── utils/
│   │   ├── auth.js
│   │   ├── jwt.js
│   │   └── hashToken.js
│   │
│   ├── prisma/
│   │   └── schema.prisma
│   │
│   ├── Dockerfile
│   └── index.js
│
├── server/
│   ├── middlewares/
│   │   └── socketAuth.js
│   │
│   ├── utils/
│   │   └── auth.js
│   │
│   ├── Dockerfile
│   └── index.js
│
├── client/
│   ├── app/
│   │   ├── hooks/
│   │   │   └── useAuthRedirect.ts
│   │   │
│   │   ├── lib/
│   │   │   └── authFetch.ts
│   │   │
│   │   ├── login/
│   │   │   └── page.tsx
│   │   │
│   │   ├── register/
│   │   │   └── page.tsx
│   │   │
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   │
│   ├── public/
│   ├── Dockerfile
│   └── package.json
│
├── shared/
│   └── logger/
│
├── nginx/
│   └── nginx.conf
│
├── docker-compose.yml
│
└── README.md

---

Tech Stack

Backend

- Node.js
- Express.js
- Socket.IO
- Prisma ORM
- PostgreSQL
- Redis
- JWT
- bcrypt

---

Frontend

- Next.js
- React
- Socket.IO Client

---

Infrastructure

- Docker
- Docker Compose
- Nginx

---

Current Status

Implemented:

✅ Distributed realtime messaging

✅ Socket.IO Redis adapter

✅ JWT authentication

✅ Access token & refresh token architecture

✅ Refresh token rotation

✅ Hashed refresh token storage

✅ Database-backed sessions

✅ Session revocation

✅ Refresh token reuse detection

✅ Cookie-based authentication

✅ Silent authentication

✅ Automatic access token refresh

✅ Persistent login after browser restart

✅ Session recovery without manual login

✅ Socket authentication

✅ Protected websocket connections

✅ Dockerized microservices

✅ Nginx reverse proxy

✅ Environment-based configuration

✅ Cross-client realtime messaging

---

Upcoming Milestones

Realtime Improvements

- Socket reconnection strategy
- Automatic room rejoin after reconnect
- Presence tracking
- User activity indicators

---

Security

- Role-Based Access Control (RBAC)
- Logout from all devices
- Multi-device session management
- Rate limiting
- Audit logs
- Device fingerprinting

---

Infrastructure

- Multi-instance load testing
- Centralized monitoring
- Distributed tracing
- API gateway authentication
- CI/CD pipeline

---

Developer Experience

- Shared configuration module
- Structured error handling
- Centralized logging improvements
- Health monitoring endpoints

---

Goal

Build a production-style distributed system demonstrating:

- Secure authentication
- Session management
- Realtime communication
- Horizontal scalability
- Microservice architecture
- Containerized deployment
- Modern backend engineering practices

This project is designed as a learning and portfolio-grade example of how distributed realtime systems are built and secured in modern production environments.
