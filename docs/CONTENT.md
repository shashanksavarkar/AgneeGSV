# Agnee 2026 Content & Data Schema Guide

All public content on the Agnee 2026 festival website is strictly data-driven and lives in JSON files within the `/data/` directory. Festival organizers can update event rules, guest lineups, schedules, sponsors, and announcements by editing these files without altering any JavaScript or CSS.

---

## 1. Directory Structure
```
data/
├── site.json       # General festival metadata, tagline, dates, social links, announcements
├── events.json     # All competitive and showcase cultural events
├── schedule.json   # Day-wise and stage-wise schedule slots, tracks, and live indicators
├── guests.json     # Celebrity performers, judges, and keynote guests
├── sponsors.json   # Tiered sponsor partners and deck download link
├── team.json       # Faculty advisors and core student committee
├── faqs.json       # Common participant questions categorized
└── places.json     # Campus landmarks, venues, walking directions, and 3D map coordinates
```

---

## 2. File Schemas & Guidelines

### `data/site.json`
Controls the overarching website branding, dates, and global links.
- `festName` (string): Full festival name (e.g., `"Agnee 2026"`).
- `dates` (string): Display date range. Keep as `"To be announced"` until official.
- `datesConfigured` (ISO string or null): e.g. `"2026-11-06T09:00:00+05:30"`. When non-null, activates the live countdown on the hero. When `null`, the countdown automatically hides and displays the "Dates Announcing Soon" status badge.
- `tagline` (string): Festival tagline.
- `registrationUrl` (string): Global registration / portal URL.

### `data/events.json`
Defines each cultural competition.
- `id` (string): Unique kebab-case slug (e.g., `"battle-of-the-bands"`).
- `name` (string): Full event name.
- `category` (string): One of `"Music"`, `"Dance"`, `"Drama"`, `"Fashion"`, `"Art & Design"`, `"Literary"`, `"Photography/Film"`, `"Gaming/Fun"`.
- `teamSize` (object): `{ "min": 1, "max": 8 }`.
- `eligibility` (string): Educational / institutional eligibility.
- `rules` (array of strings): Specific guidelines and restrictions.
- `judgingCriteria` (array of strings): Evaluation metrics with percentages.
- `prizes` (string): Keep as `"To be announced"` until prize money is sanctioned.
- `schedule` (object): `{ "day": "Day 2", "time": "To be announced", "venueId": "stage", "venueName": "Main Stage (Oval Ground)" }`. `venueId` must match an `id` in `places.json` to enable 3D map fly-to deep linking.
- `registrationState` (string): One of `"open"`, `"soon"`, `"closed"`, `"sold_out"`.
- `registrationLink` (string): Specific Google Form / Unstop event URL.
- `featured` (boolean): Whether to highlight the event on the home page.

### `data/schedule.json`
Defines the festival itinerary.
- `festTimezone` (string): `"Asia/Kolkata"`. Used for real-time "Happening Now" and "Up Next" slot detection.
- `days` (array): List of days containing:
  - `id` (string): `"day-1"`, `"day-2"`, etc.
  - `name` (string): e.g. `"Day 1"`.
  - `theme` (string): Day narrative theme.
  - `stages` (array): Venue tracks (`stageId`, `stageName`, `slots`).
    - `slots`: Objects containing `{ id, title, category, startTime, endTime, timeLabel, venueId, venueName, eventId, description }`.

### `data/guests.json`
- `id`, `name`, `role`, `category`, `day`, `revealState` (`"Reveal soon"` or `"Announced"`), `bio`, `photo`.

### `data/sponsors.json`
- `deckDownloadUrl`: Link to brochure/deck PDF.
- `tiers`: Array of sponsorship tiers (`"title"`, `"powered-by"`, `"associate"`, `"partners"`). Each sponsor has `{ name, placeholder, logo, website }`.

### `data/places.json`
Coordinates must match the 3D campus model origin (`W=751`, `H=430`).
- `id` (string): e.g. `"oval-ground"`, `"stage"`, `"palace"`, `"main-gate"`.
- `name` (string): Landmark display name.
- `walkTimeMinutes` (number): Walking time from Main Gate.
- `directionsFromGate` (string): Step-by-step walking instructions.
- `pose` (object): `{ distance, tilt, heading }` for camera animation.

---

## 3. Strict Content Integrity Rule
**Never invent dates, celebrity artists, prize money, sponsors, prices, schedules, or statistics.**
If any information is unconfirmed, set it to `"To be announced"` or `"Announcing soon"`. The UI components automatically render designed empty/placeholder states with badges.
