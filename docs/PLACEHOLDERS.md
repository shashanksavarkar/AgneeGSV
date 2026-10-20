# Agnee 2026 Organizer Placeholder Checklist

This checklist enumerates every unconfirmed data item, placeholder, and third-party integration that festival organizers need to finalize prior to launching Agnee 2026.

---

## 1. General Festival Configuration (`data/site.json`)
- [ ] **Exact Festival Dates**: Replace `"To be announced"` in `dates` with confirmed dates (e.g., `"November 6 – 8, 2026"`).
- [ ] **Countdown ISO Timestamp**: Replace `"datesConfigured": null` with the ISO timestamp of Day 1 start (e.g., `"2026-11-06T09:00:00+05:30"`). Once configured, the hero countdown automatically becomes active.
- [ ] **Festival Theme Tagline**: Confirm or adjust `"Igniting the Spirit of Expression · The Annual Cultural Fest of GSV"`.
- [ ] **Emergency Helpline**: Replace `"To be announced"` in `emergencyHelpline` with on-campus control room / security phone numbers.
- [ ] **Central Registration URL**: Update `registrationUrl` with the official live ticketing / registration link (e.g., Unstop, Google Form, or institutional portal).
- [ ] **Sponsorship Deck Link**: Place the finalized PDF deck in `assets/` and update `deckUrl`.

---

## 2. Competitive Events (`data/events.json`)
- [ ] **Prize Money Allocations**: Update `"prizes": "To be announced"` for all 8 categories once approved by the finance committee:
  - [ ] Battle of the Bands
  - [ ] Nrityakala (Classical Solo Dance)
  - [ ] Step Up (Street & Hip-Hop Crew Battle)
  - [ ] Awaaz (Nukkad Natak / Street Play)
  - [ ] Glamour & Heritage (The Runway Fashion Show)
  - [ ] Rangshala (Live Canvas Painting)
  - [ ] Vimarsh (Parliamentary Debate)
  - [ ] CineCraft (Short Film & Photo Story)
  - [ ] Pixel Arena (Esports Championship)
- [ ] **Event Coordinators Contact Numbers**: Replace `"To be announced"` phone numbers with official student coordinator contacts.
- [ ] **Registration State Toggles**: Change `"registrationState": "soon"` to `"open"` as portals open.
- [ ] **Direct Form Links**: Insert individual competition form URLs in `registrationLink`.

---

## 3. Schedule Itinerary (`data/schedule.json`)
- [ ] **Calendar Dates**: Set `festStartDate` and `festEndDate`.
- [ ] **Day Themes**: Confirm thematic titles for Day 1, Day 2, and Day 3.
- [ ] **Slot Timings**: Verify stage slot times with stage managers and sound crew.

---

## 4. Star Nights, Celebrities & Judges (`data/guests.json`)
- [ ] **Day 1 Cultural Night Artist**: Replace `"To be announced"` with contracted performer name, photo, and biography.
- [ ] **Day 2 Star Night / Rock Band**: Replace `"To be announced"` with contracted headline band.
- [ ] **Day 3 EDM / Finale Artist**: Replace `"To be announced"` with contracted finale DJ/producer.
- [ ] **Panel of Judges**: Add names and photos of external adjudicators for dance, drama, and music tracks.
- [ ] **Reveal States**: Switch `"revealState": "Reveal soon"` to `"Announced"` upon promotional launch.

---

## 5. Corporate Sponsors & Partners (`data/sponsors.json`)
- [ ] **Title Sponsor**: Add confirmed title sponsor name, high-res logo SVG/PNG, and website.
- [ ] **Powered By Sponsor**: Add co-presenting partner details.
- [ ] **Associate Sponsors**: Add category partners.
- [ ] **Beverage & Hospitality Partners**: Add campus food/beverage and accommodation partners.

---

## 6. Organizing Committee Directory (`data/team.json`)
- [ ] **Faculty Advisors**: Verify official names, designations, and GSV contact emails.
- [ ] **Student Core Committee**: Verify convener, events lead, PR lead, and creative team member contact emails and avatars.

---

## 7. Third-Party Services Used
- **Three.js**: Version r128 (CDN via Cloudflare / unpkg with fallback).
- **YouTube Embed**: Used in the Aftermovie section with privacy-enhanced domain (`youtube-nocookie.com`), click-to-load with zero tracking before user click.
- **Ticketing / External Registrations**: Google Forms / Unstop (no proprietary payment SDKs integrated; zero sensitive financial data stored in code).
- **Fonts**: Self-hosted and system-ui font stack (`Inter`, `Georgia`, sans-serif), zero layout shift.

---

## 8. Unverified Assumptions & Technical Notes
- **Campus Coordinates**: 3D positions in `data/places.json` match the campus layout map (`W=751`, `H=430`).
- **Dates**: Kept strictly as placeholders until authorized by GSV festival organizers.
