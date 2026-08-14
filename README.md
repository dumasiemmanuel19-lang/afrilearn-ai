# AfriLearn AI

AI-powered quiz generator and chat tutor for exam prep — WASSCE, SAT, A-Levels, IB, GCSE, university, or anything else you type in.

## What's different from the artifact prototype

The earlier version called the Anthropic API directly from the browser with no key — that only works inside Claude.ai's sandboxed artifact preview. A real deployed app needs its own API key, and that key must **never** live in browser code (anyone could open dev tools and steal it). So this version adds a small serverless function (`netlify/functions/claude.js`) that holds the key server-side; the React app only ever talks to your own `/.netlify/functions/claude` endpoint.

## 1. Install dependencies

```bash
npm install
