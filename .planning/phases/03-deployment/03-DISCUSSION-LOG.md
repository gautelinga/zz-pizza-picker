# Phase 3: Deployment - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-22
**Phase:** 03-deployment
**Areas discussed:** Last updated date, Rebuild triggers, Custom domain, Weekly schedule timing

---

## "Last updated" date (DEPL-03)

**Location:**

| Option | Description | Selected |
|--------|-------------|----------|
| Footer, below result card | Subtle, below the picker. Doesn't compete with main UI. | ✓ |
| Under heading, above filters | More prominent, visible on load | |
| Under pizza count (inline) | Contextually near menu metadata | |

**User's choice:** Footer, below result card

**Format:**

| Option | Description | Selected |
|--------|-------------|----------|
| "7 Apr 2026" | Compact, matches ROADMAP.md example | ✓ |
| "April 7, 2026" | Formal, international | |
| Relative ("7 days ago") | Friendly but imprecise | |

**User's choice:** "7 Apr 2026"

---

## Rebuild triggers

| Option | Description | Selected |
|--------|-------------|----------|
| Both: push + weekly cron | Push deploys code changes; cron refreshes menu weekly | ✓ |
| Weekly cron only | No push auto-deploy | |
| Push only | No automatic menu refresh | |

**User's choice:** Both — push to main AND weekly cron

---

## Custom domain

| Option | Description | Selected |
|--------|-------------|----------|
| pages.dev URL | Cloudflare auto-URL, zero DNS setup | ✓ |
| Custom domain | Bring your own domain with DNS config | |

**User's choice:** pages.dev URL

---

## Weekly schedule timing

| Option | Description | Selected |
|--------|-------------|----------|
| Monday 06:00 UTC | Fresh for the week | ✓ |
| Sunday 23:00 UTC | Ready for Monday morning | |
| Claude's discretion | Any sensible time | |

**User's choice:** Monday 06:00 UTC (`cron: '0 6 * * 1'`)

---

## Claude's Discretion

- Exact CF Pages project name if `zz-pizza-picker` is taken
- Whether date formatting lives in frontmatter inline or a utility function

## Deferred Ideas

None.
