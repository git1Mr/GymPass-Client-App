# UnityFitness

A React Native (Expo) mobile app for gym access, payments, and wallet management, backed by a microservice architecture (Node.js + MongoDB) behind an Nginx gateway.

## Architecture

- **Client** — Expo / React Native app (`app/`, `services/`, `context/`)
- **Backend** — five microservices in `backend/`, all containerized and published to Docker Hub:
  - `auth-service` — user auth, JWT signing
  - `wallet-service` — Stripe payments, balance, top-ups
  - `qr-security-service` — QR code generation and validation for gym entry
  - `settlement-engine` — payout aggregation
  - `gateway` — Nginx reverse proxy (port 8080)

## Setup

See **[SETUP.md](./SETUP.md)** for the full step-by-step guide to running the app locally.

Quick version:

```bash
cp .env.example .env       # then fill in your own secrets
docker compose up -d       # starts the backend (pulls from Docker Hub)
npm install
npx expo start
```

## Docker images

Prebuilt and published to Docker Hub under [`zakarialem/`](https://hub.docker.com/u/zakarialem):

- `zakarialem/unity-auth:v1`
- `zakarialem/unity-wallet:v1`
- `zakarialem/unity-qr-security:v1`
- `zakarialem/unity-settlement:v1`
- `zakarialem/unity-gateway:v1`
