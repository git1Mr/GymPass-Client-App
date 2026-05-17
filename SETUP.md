# Getting Started

Setup guide for running the UnityFitness app locally.

## Prerequisites

- [Node.js](https://nodejs.org/) 22+
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (running)
- Git
- (Optional) [Expo Go](https://expo.dev/go) on your phone, or Android/iOS emulator

## 1. Clone and configure

```bash
git clone <repo-url>
cd gympass-client
cp .env.example .env
```

Open `.env` and fill in the placeholder values. At minimum you need:

- `JWT_PRIVATE_KEY` — any long random string (shared between auth and wallet services)
- `MONGO_ROOT_USER` / `MONGO_ROOT_PASS` — pick anything
- `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET` — from your own [Stripe dashboard](https://dashboard.stripe.com/test/apikeys) (test mode is fine)
- `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` — same value as `STRIPE_PUBLISHABLE_KEY`

## 2. Start the backend

```bash
docker compose up -d
```

This pulls the prebuilt images from Docker Hub (`zakarialem/unity-*:v1`) and starts six containers: mongo, auth, wallet, qr-security, settlement, and the gateway. Verify they're up:

```bash
docker compose ps
curl http://localhost:8080/health
```

The gateway listens on `http://localhost:8080`.

## 3. Configure the API URL

In `.env`, set `EXPO_PUBLIC_API_URL` based on where you'll run the client:

| Target | Value |
|---|---|
| Expo web / iOS simulator | `http://localhost:8080/api` |
| Android emulator | `http://10.0.2.2:8080/api` |
| Physical phone (same Wi-Fi) | `http://<your-LAN-ip>:8080/api` |
| Physical phone (over the internet) | use an ngrok / cloudflared tunnel URL |

## 4. Install client dependencies and start Expo

```bash
npm install
npx expo start
```

Then press `w` for web, `a` for Android, `i` for iOS, or scan the QR code with Expo Go.

## Stopping the backend

```bash
docker compose down          # stop containers, keep mongo data
docker compose down -v       # also wipe the mongo volume
```

## Rebuilding the backend (only if you change `backend/` source)

The default `docker compose` setup pulls images from Docker Hub. To rebuild from local source after editing `backend/`:

```bash
docker compose -f docker-compose.yml -f docker-compose.build.yml build
docker compose push                                  # requires Docker Hub login
docker compose up -d --force-recreate
```

## Troubleshooting

- **`docker compose up` fails to pull** — make sure Docker Desktop is running and you have internet. If you see addresses like `198.18.x.x` in errors, restart Docker Desktop (its internal proxy is flaky).
- **Expo client can't reach the backend** — double-check `EXPO_PUBLIC_API_URL` matches your platform (see table above) and that `curl http://localhost:8080/health` returns 200.
- **Stripe payment errors** — confirm `STRIPE_SECRET_KEY` and `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` are from the same Stripe account and both in test mode.
