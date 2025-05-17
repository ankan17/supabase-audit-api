# Supabase Audit API

A secure, extensible backend for auditing Supabase projects, providing authentication, compliance checks, and an AI chat assistant (Gemini Pro).

## Features
- Supabase authentication and session management
- REST API for compliance checks
- Gemini Pro-powered AI chat endpoint
- CORS, cookie, and error handling middleware
- TypeScript for safety and maintainability

## Tech Stack
- **Node.js**
- **Express**
- **TypeScript**

## Getting Started

### 1. Install dependencies
```sh
npm install
# or
yarn install
```

### 2. Set up environment variables
Create a `.env` file with:
```
PORT=3000
ALLOWED_ORIGINS='["http://localhost:3001"]'

SUPABASE_CLIENT_ID=XXXX
SUPABASE_CLIENT_SECRET=XXXX
SUPABASE_REDIRECT_URI=http://localhost:3000/auth/callback

GEMINI_API_KEY=XXXX
```

- Get your Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
- Adjust `ALLOWED_ORIGINS` for your frontend.

### 3. Run the server
```sh
npm run dev
# or
yarn dev
```

The API will be available at `http://localhost:3000/api/v1` by default.

## Scripts
- `dev` - Start the server with hot reload
- `start` - Start the server in production
- `build` - Build TypeScript
- `lint` - Run ESLint

## API Reference

### Authentication

#### `GET /api/v1/auth/supabase/login`
- **Description:** Initiates Supabase OAuth login. Redirects to Supabase authorization page. Sets a short-lived `code_verifier` cookie.
- **Auth:** None
- **Response:** Redirects to Supabase OAuth.

#### `POST /api/v1/auth/supabase/callback`
- **Description:** Handles OAuth callback. Exchanges code for tokens, sets `access_token`, `refresh_token`, and `auth_type` cookies.
- **Auth:** None
- **Body:**
  ```json
  {
    "code": "<string>",
    "state": "<string>"
  }
  ```
- **Response:**
  ```json
  { "status": "success", "message": "Token exchange successful" }
  ```

#### `GET /api/v1/auth/verify`
- **Description:** Verifies if the user is authenticated (requires valid session).
- **Auth:** Supabase session (cookies)
- **Response:**
  ```json
  { "status": "success", "message": "Authenticated", "data": { "authenticated": true } }
  ```

#### `POST /api/v1/auth/logout`
- **Description:** Logs out the user, revokes refresh token, clears cookies.
- **Auth:** Supabase session (cookies)
- **Response:**
  ```json
  { "message": "Logged out" }
  ```

---

### User

#### `GET /api/v1/users/supabase/organisations`
- **Description:** Lists organizations accessible to the authenticated user.
- **Auth:** Supabase session (cookies)
- **Response:**
  ```json
  { "status": "success", "data": [ /* organizations */ ] }
  ```

---

### Compliance Checks

All endpoints below require a valid Supabase session (cookies). Pass `orgId` as a query parameter.

#### `GET /api/v1/checks/supabase/mfa?orgId=<organizationId>`
- **Description:** Checks if Multi-Factor Authentication (MFA) is enabled for the organization.
- **Response:**
  ```json
  { "status": "success", "data": { /* MFA check result */ } }
  ```

#### `GET /api/v1/checks/supabase/rls?orgId=<organizationId>`
- **Description:** Checks if Row Level Security (RLS) is enabled for the organization.
- **Response:**
  ```json
  { "status": "success", "data": { /* RLS check result */ } }
  ```

#### `GET /api/v1/checks/supabase/pitr?orgId=<organizationId>`
- **Description:** Checks if Point-In-Time Recovery (PITR) is enabled for the organization.
- **Response:**
  ```json
  { "status": "success", "data": { /* PITR check result */ } }
  ```

---

### AI Chat (Gemini Pro)

#### `POST /api/v1/chat/`
- **Description:** Sends a message and optional history to Gemini Pro AI. Returns the AI's response.
- **Auth:** Supabase session (cookies)
- **Body:**
  ```json
  {
    "message": "Your question here",
    "history": [
      { "role": "user", "parts": [{ "text": "..." }] },
      { "role": "model", "parts": [{ "text": "..." }] }
    ]
  }
  ```
- **Response:**
  ```json
  { "message": "AI response" }
  ```

## Security Notes
- Never expose your Gemini API key to the frontend.
- All sensitive routes are protected by authentication middleware.
- CORS is restricted to allowed origins.

## License
MIT
