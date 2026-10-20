# Agnee 2026 Registration Architecture & Data Flow

This document details the registration architecture, adapter interfaces, data security protocols, and privacy boundaries for Agnee 2026 at Gati Shakti Vishwavidyalaya (GSV), Vadodara.

---

## 1. Adapter Architecture Overview

Because festival ticketing and payment gateways require institutional merchant accounts and server-side secret keys, the registration system is structured behind a modular adapter pattern:

```
                      ┌───────────────────────────────────┐
                      │    Registration UI & Hub          │
                      │       (src/ui/register.js)        │
                      └─────────────────┬─────────────────┘
                                        │
                         ┌──────────────┴──────────────┐
                         ▼                             ▼
              [Default Adapter]               [Optional Adapter]
        External Portals with UTM Tags     On-Site Multi-Step Flow
     (Unstop / Google Forms / Eventbrite) (Client-Side Validated Draft)
                         │                             │
                         ▼                             ▼
             Official Verified Gateway         Serverless Function /
             (PCI-DSS Hosted Checkout)          Configurable Webhook
```

---

## 2. Default Adapter: External Official Gateways
- **Configuration**: Managed directly in `data/site.json` (`registrationUrl`) and per event in `data/events.json` (`registrationLink`).
- **Flow**:
  1. The user selects a competition or pass tier.
  2. The button opens the configured external portal in a secure new tab (`rel="noopener noreferrer"`).
  3. Campaign UTM parameters (`utm_source=agnee_site&utm_medium=web&utm_campaign=agnee2026`) are appended automatically for referral tracking.
- **Benefits**:
  - Zero liability for storing payment credentials on the static site.
  - Full compliance with RBI guidelines for payment tokenization and 3D Secure 2.0.

---

## 3. Optional Adapter: On-Site Self-Service Flow
- **Purpose**: Provides a zero-dependency fallback for participant intake when third-party portals are undergoing maintenance, or for internal student contingents.
- **Multi-Step Form Steps**:
  1. **Participant Identity**: Full name, email, 10-digit mobile number, college/institution, student roll ID, optional ambassador referral code.
  2. **Competitions Selection**: Multi-select of available cultural events (capped at 3 maximum per delegate).
  3. **Logistics & Accommodation**: Inbound transit mode (rail/air/road), accommodation assistance flag, emergency contact name and phone.
  4. **Review & Consent**: Summary card review, anti-spam honeypot verification, code of conduct agreement checkbox.
- **Draft Persistence**:
  - Saved in browser `localStorage` (`agnee2026_reg_draft`) wrapped in `try/catch`.
  - Enables delegates to pause and resume registration without data loss.

---

## 4. Privacy, Data Flow & Security Principles

1. **No Payment Card Data in Client Code**:
   - The static website never handles, prompts for, or caches credit card numbers, CVVs, UPI PINs, or banking passwords.
   - Any financial checkout must utilize hosted payment windows (Razorpay, Cashfree, CCAvenue) with server-side webhook reconciliation.
2. **Anti-Spam Controls**:
   - **Honeypot Trap**: An invisible form field (`website_url` / `user_verification_field`) that catches automated spam bots while remaining invisible to assistive technology.
   - **Timing Safeguard**: Submissions executed faster than 2.0 seconds from page render are flagged and rejected as bot requests.
3. **Campus Ambassador Referral Attribution**:
   - Uses URL search parameter parsing (`?ref=CODE` or `?utm_source=ambassador_CODE`).
   - No cross-site third-party tracking cookies or fingerprinting scripts.

---

## 5. Pass Tiers & State Definitions
All pricing is marked `"To be announced"` (TBA) until formal institutional sanction:
- **Festival Delegate Pass (Visitor)**: 3-day general admission to festival grounds, exhibition stalls, flea market.
- **All-Access Competition Pass**: Multi-event competition participation, soundcheck access, delegate kit, star night entry.
- **College Delegation Pass**: Group package for recognized college troupes, bands, and dance crews.
