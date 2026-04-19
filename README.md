# OmniCom

OmniCom is a unified inbox prototype for aggregating conversations from multiple communication channels into a single interface.

The current app is a front-end concept showing how email, messaging apps, and social inboxes could be viewed through one shared workspace with provider-aware threads, search, tags, and conversation detail views.

## What it does

- Groups conversations from multiple providers into one inbox
- Separates views into unified inbox, email, instant messaging, and community/social tabs
- Shows provider-specific thread badges and metadata
- Supports search across mocked conversation data
- Includes a thread list, detail panel, and message composer UI
- Simulates background activity updates to test the interaction model
- Includes an "add account" modal for future provider connections

## Included Providers in the Prototype

The mock data and UI currently model providers such as:
- Gmail
- Outlook
- WhatsApp
- Telegram
- Twitter / X
- LinkedIn

## Quick Start

Prerequisites:
- Node.js

Run locally:

```bash
npm install
npm run dev
```

## Project Structure

- `index.tsx` — entire application shell and inbox prototype
- embedded mock data — example threads, messages, tags, and providers
- local UI components inside the same file — navigation, account options, thread views

## Current Scope

This repository currently represents a front-end product prototype. It does not yet include real provider authentication, syncing, or backend persistence.

## Status

Concept / UI prototype for a unified communications product. Useful for validating layout, flows, and information architecture before wiring up real integrations.
