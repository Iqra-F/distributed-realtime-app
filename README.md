Distributed Realtime App

A production-focused distributed realtime application built with microservices, WebSockets, Redis pub/sub, PostgreSQL, Docker, and JWT authentication.


---

Architecture Overview

Services

Auth Service

Handles:

User registration

User login

JWT authentication

Refresh token rotation

Session management

Logout


Realtime Server

Handles:

WebSocket connections

Topic subscriptions

Realtime message broadcasting

Redis adapter scaling

Socket authentication


Client

Frontend application using:

Next.js

Socket.io client

Cookie-based authentication


Redis

Used for:

Socket.io Redis adapter

Cross-instance realtime event propagation


PostgreSQL

Primary database storing:

Users

Refresh token sessions


Nginx

Reverse proxy for:

Frontend routing

API gateway routing

WebSocket proxying



---

Current Features

Authentication System

JWT Authentication

Access tokens

Refresh tokens

HTTP-only cookies

Cookie-based auth flow


Refresh Token Rotation

Every refresh request:

1. Revokes previous refresh token


2. Generates a new refresh token


3. Generates a new access token


4. Stores the new session in database



This prevents replay attacks.


---

Database-Backed Sessions

Refresh tokens are stored in PostgreSQL.

Stored fields:

tokenHash

userId

familyId

revoked

replacedBy

createdAt

expiresAt



---

Hashed Refresh Tokens

Refresh tokens are never stored directly.

Instead:

SHA-256 hashes are stored

Raw refresh tokens remain only in HTTP-only cookies


This protects sessions even if database leaks.


---

Refresh Token Reuse Detection

System detects:

reused revoked tokens

stolen refresh tokens

replay attacks


On detection:

all user sessions are revoked automatically


This is a production-grade security mechanism.


---

Centralized Auth Verification

Authentication verification logic has been standardized.

Per-service reusable auth utilities:

auth-service

utils/auth.js

realtime server

utils/auth.js

Benefits:

reduced duplicated JWT logic

consistent verification behavior

cleaner microservice separation

easier future maintenance



---

Realtime System

WebSocket Authentication

Socket connections authenticate using:

accessToken cookie


Unauthenticated sockets are rejected.


---

Redis Adapter Scaling

Socket.io Redis adapter enables:

horizontal scaling

multi-instance realtime broadcasting

distributed websocket communication



---

Dockerized Infrastructure

Services run using Docker Compose.

Includes:

auth-service

realtime server

client

postgres

redis

nginx



---

Security Features

Implemented

Password hashing with bcrypt

Access token expiration

Refresh token rotation

Hashed refresh token storage

Session revocation

Replay attack detection

HTTP-only cookies

Database-backed auth sessions



---

Current Tech Stack

Backend

Node.js

Express.js

Socket.io

Prisma ORM

PostgreSQL

Redis

JWT


Frontend

Next.js

React

Socket.io Client


Infrastructure

Docker

Docker Compose

Nginx



---

Current Project Structure

project-root/
│
├── auth-service/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   └── prisma/
│
├── server/
│   ├── middlewares/
│   ├── utils/
│   └── index.js
│
├── client/
│
├── shared/
│   └── logger/
│
├── nginx/
│
└── docker-compose.yml


---

Upcoming Phase

Silent Authentication (Frontend)

Next implementation goals:

automatic access token refresh

persistent login after browser restart

silent re-authentication

auth recovery without manual login

production-grade frontend auth UX



---

Future Enhancements

Potential future upgrades:

role-based access control (RBAC)

logout all devices

multi-device session management

audit logs

rate limiting

token/device fingerprinting

distributed tracing

centralized monitoring

API gateway auth middleware



---

Development Commands

Start System

docker compose up

Run Detached

docker compose up -d

Stop Containers

docker compose down

Prisma Migration

docker compose exec auth-service npx prisma migrate dev

Prisma Studio

docker compose exec auth-service npx prisma studio


---

Current Status

The system now includes:

distributed realtime infrastructure

websocket scaling

production-style JWT auth

refresh token rotation

database-backed sessions

replay attack detection

centralized auth verification

Dockerized microservices architecture


The next major milestone is implementing silent frontend authentication.
