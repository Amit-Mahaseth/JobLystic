# Backend services

The backend is split into three independent Node.js ES module packages. Install dependencies in the package you want to run. All use Express 5; Auth and Music also use MongoDB via Mongoose.

| Package | Entry point | Port | Responsibility |
| --- | --- | ---: | --- |
| `Auth/` | `server.js` | 3000 | Registration, login, Google OAuth, cookie/JWT authentication, and profile management |
| `Notification/` | `server.js` | 3001 | RabbitMQ consumer that sends registration and login email notifications |
| `Music/` | `server.js` | 3003 | Music service scaffold with MongoDB model and storage/controller modules; routes are currently empty |

## Start a service

Run commands from its directory:

```powershell
cd Backend/Auth
npm install
npm run dev
```

Use the same commands in `Backend/Notification` or `Backend/Music` to start those services. `npm start` runs each service without nodemon. Auth defines `npm test` (Jest); Music and Notification have placeholder test scripts that exit with an error.

## Auth API

Base path: `/api/auth` (`http://localhost:3000` by default).

| Method | Path | Purpose | Authentication |
| --- | --- | --- | --- |
| `POST` | `/register` | Create an account; publishes `user_registered` | No |
| `POST` | `/login` | Log in; publishes `user_logged_in` | No |
| `GET` | `/google` | Begin Google OAuth | No |
| `GET` | `/google/callback` | Handle Google OAuth callback | OAuth flow |
| `GET` | `/status` | Return current authentication status | No (checks cookie/token as implemented) |
| `POST` | `/logout` | Clear authenticated session | Yes |
| `GET` | `/getuser` | Return current user | Yes |
| `POST` | `/update` | Update account details | Yes |

Routes use request validation and rate limiting where configured. Auth CORS currently allows `http://localhost:5173` with credentials. The frontend sends cookies with credentialed requests. See `src/routes/auth.routes.js`, `src/controllers/auth.controller.js`, and middleware for request/response details.

## Music service

Music listens on port `3003` and mounts its router at `/api/music`. `src/routes/music.route.js` currently exports an empty Express router, so no HTTP endpoints are available yet. The package includes a Mongoose music model and storage/controller modules; update this document when routes become active.

## Notification and event contract

Auth publishes durable RabbitMQ messages to queues named `user_registered` and `user_logged_in`. Notification subscribes to both queues and sends email using Nodemailer. The consumer expects a payload containing `email`, `Fullname.firstname`, `Fullname.lastname`, and `role`. Keep publisher and consumer payloads aligned when changing this contract. Delivery retry and dead-letter behavior are not configured/documented in the current implementation.

## Environment configuration

Create a private `.env` in each service directory. `dotenv` loads the environment when each service's config module is imported. Do not commit credentials.

| Service | Keys read by code |
| --- | --- |
| Auth | `MONGO_URI`, `JWT_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`, `RABBITMQ_URI` |
| Music | `MONGO_URI`, `JWT_SECRET` |
| Notification | `JWT_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`, `GOOGLE_REFRESH_TOKEN`, `EMAIL_USER`, `RABBITMQ_URI` |

Auth and Notification need `RABBITMQ_URI`; Auth and Music need `MONGO_URI`. Google OAuth needs the Google client ID, client secret, and callback URL. Notification's email utility uses the Gmail account and refresh token. No example secret values are included here.

## Source map

```text
Backend/
├── Auth/
│   ├── server.js
│   ├── src/{app.js,brokers,config,controllers,db,middlewares,models,routes}
│   └── tests/                 # Jest tests and helpers
├── Music/
│   ├── server.js
│   └── src/{app.js,config,controllers,db,models,routes,storage}
└── Notification/
    ├── server.js
    └── src/{app.js,brokers,config,utils}
```

Update this guide when package scripts, ports, endpoints, event payloads, or environment keys change.
