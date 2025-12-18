You are a senior backend + security engineer.

I have an existing Next.js (App Router) admin panel that currently uses Firebase client SDK for Firestore and Storage.

Your task is to convert this Next.js app into a secure backend API + admin UI, following the specification below.

NON-NEGOTIABLE RULES

Mobile app is untrusted

Mobile app MUST NOT access Firebase directly

Firebase (Firestore + Storage) must be accessible ONLY via Firebase Admin SDK

Next.js API routes are the single authority

OVPN files must never be exposed via URLs

VPN access must be session-based and temporary

OBJECTIVES

Add secure backend APIs for a VPN app

Refactor admin panel to call backend APIs instead of Firebase directly

Lock down Firebase completely

Ensure backend controls free vs premium access

DELIVERABLES

Next.js API route structure

Authentication flow (Firebase Auth → backend JWT)

VPN session issuance API

Admin CRUD APIs

Firebase Admin SDK integration

Clear separation between:

/api/vpn/* (mobile app)

/api/admin/* (admin panel)

IMPORTANT

Do NOT use Firebase client SDK anywhere except optional Firebase Auth token verification

Assume OpenVPN server auth will be added later; focus on backend control plane

Implement rate limiting hooks

Use the following Markdown spec as the source of truth and implement accordingly.

2️⃣ ENHANCED BACKEND ARCHITECTURE – MARKDOWN SPEC

Save this as:
supervpn-backend-secure-spec.md

# SuperVPN Secure Backend Architecture – Phase 1

## Purpose
Convert an existing Next.js admin panel into a **secure backend API + admin UI** for a VPN application.

This phase focuses on **control plane security**, NOT OpenVPN server internals.

---

## Core Security Principles

- Mobile app is **untrusted**
- Next.js backend is the **single authority**
- Firebase is **private infrastructure**
- No direct Firebase access from mobile app or admin UI
- VPN access is **temporary, session-based**
- OVPN files are **templates**, not assets

---

## Target Architecture



Mobile App (Android / Flutter)
|
| HTTPS + Backend JWT
v
Next.js API Routes (App Router)
|
| Firebase Admin SDK
v
Firestore + Firebase Storage (PRIVATE)


---

## Mandatory Removals

### From Mobile App
- Firebase Firestore SDK
- Firebase Storage SDK
- Direct OVPN file access
- Client-side subscription enforcement

### From Admin Panel (Client Side)
- Client-side Firestore writes
- Client-side Storage uploads
- Reliance on Firebase Security Rules for access control

---

## Backend Folder Structure



/app
/api
/auth
login/route.ts
/app
bootstrap/route.ts
/vpn
servers/route.ts
session/route.ts
revoke/route.ts
/admin
servers/route.ts
users/route.ts
config/route.ts
/internal
firebase.ts
auth.ts
permissions.ts
rateLimit.ts


---

## Authentication Model

### Identity vs Authority
- Firebase Auth = identity provider
- Backend JWT = authorization and access control

---

### POST /api/auth/login

**Input**
```json
{
  "firebaseIdToken": "<firebase_id_token>"
}


Backend Logic

Verify token via Firebase Admin SDK

Fetch user record

Issue backend JWT

Output

{
  "accessToken": "<backend_jwt>",
  "expiresIn": 3600
}

App Bootstrap API
GET /api/app/bootstrap

Purpose

Feature flags

Maintenance mode

App version enforcement

Response

{
  "features": {
    "freeVpn": true,
    "premiumVpn": true
  },
  "forceUpdate": false,
  "message": null
}

VPN Server Listing API
GET /api/vpn/servers

Auth

Optional

Backend Rules

Anonymous → free servers only

Premium users → premium servers

No IPs, ports, or OVPN URLs returned

Response

[
  {
    "id": "srv_au_01",
    "country": "Australia",
    "city": "Adelaide",
    "tier": "free",
    "features": ["basic"]
  }
]

VPN Session Creation API (Critical)
POST /api/vpn/session

Auth

Required for premium

Optional for free

Input

{
  "serverId": "srv_au_01"
}


Backend Logic

Validate user status

Validate subscription tier

Apply rate limits

Fetch OVPN template from Firebase Storage

Generate temporary credentials

Create VPN session record

Output

{
  "ovpnConfig": "<ovpn_template_text>",
  "username": "u_<userId>_<sessionId>",
  "password": "<temporary_token>",
  "expiresAt": 1736000000
}

Admin APIs
POST /api/admin/servers

Rules

Admin-only

Upload OVPN via backend

Store only template (no secrets)

Persist metadata in Firestore

Admin UI must NEVER upload directly to Firebase.

Firebase Rules (Mandatory)
Firestore
allow read, write: if false;

Storage
allow read, write: if false;


Only Firebase Admin SDK is allowed.

Data Models
Servers
{
  "id": "srv_x",
  "tier": "free | premium",
  "ovpnTemplatePath": "storage/path",
  "enabled": true
}

VPN Sessions (NEW)
{
  "sessionId": "sess_abc",
  "userId": "uid | anonymous",
  "serverId": "srv_x",
  "expiresAt": 1736000000,
  "revoked": false,
  "createdAt": "timestamp"
}

Rate Limiting (API Level)

Anonymous users: very low

Free users: limited

Premium users: higher

Rate limiting enforced at backend, not client.

Explicitly Out of Scope (Phase 1)

OpenVPN server auth enforcement

VPNGate security

Bandwidth abuse control

Implementation Order (Strict)

Add API routes

Integrate Firebase Admin SDK

Lock Firebase rules

Refactor admin UI → APIs

Refactor mobile app → APIs

Remove Firebase SDK from mobile app

Security Validation Checklist

 Mobile app has no Firebase SDK

 Admin UI does not write to Firestore directly

 No OVPN URLs exposed

 All access gated by backend JWT

 VPN sessions are temporary

If any checkbox fails, the system is insecure.


---

## Final note (honest, no drama)

This spec is **clean**, **implementable**, and **correct**.  
If another AI (or dev) follows it **exactly**, you’ll have a *real backend*, not a fake one.
s