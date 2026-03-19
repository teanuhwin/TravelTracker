# Travel Tracker

A mobile-first Progressive Web App for tracking shared travel expenses. Supports multiple trips, 25 currencies, live exchange rates, dark mode, and full offline operation. No account, no server, no setup required — install it from Safari and use it like a native app.

---

## Getting Started

1. Open the app URL in **Safari** on your iPhone
2. Tap **Share → Add to Home Screen**
3. Go to **Settings** — set your spending currency and starting cash balance
4. Add your travel group under **Members**
5. Start recording

---

## Features

### Multiple Trips
Create a separate trip for each destination. Each trip has its own name, spending currency, starting balance, members, and transaction history. Switch between trips instantly using the pill strip at the top of the screen.

- Tap **+** to create a new trip or restore an archived one
- Tap **···** on any trip chip to rename, archive, or delete it
- Archived trips are hidden from the strip but preserved — unarchive them any time via the **+** sheet
- Deleting a trip permanently removes all its transactions. If you delete the last trip, a fresh one is created automatically
- Existing data is automatically migrated into the trip system on first launch — no data loss

### Two Tracking Modes

**Debit tab** — tracks cash withdrawals against a shared declining fund. Shows remaining balance, total spent, percentage used, and a subtle progress bar.

**Credit tab** — tracks credit card charges separately with per-member totals and a running group total.

### Live Exchange Rates
The rate for the active currency pair is fetched from three independent APIs in sequence. If all fail, the app falls back to the last cached rate, then to built-in approximate rates (updated March 2026). The rate badge in the header shows the current status:

- 🟢 **Live** — freshly fetched
- 🟡 **Fetching** — request in progress
- 🟠 **Estimate** — using built-in fallback rates
- ⚫ **Cached** — using a previously fetched rate

The rate refreshes every 15 minutes while the app is open. Each trip stores its own cached rate.

### 25 Supported Currencies
JPY · USD · EUR · GBP · AUD · CAD · CHF · CNY · HKD · KRW · SGD · TWD · THB · INR · MXN · BRL · SEK · NOK · DKK · NZD · ZAR · AED · VND · PHP · IDR

Whole-unit currencies (JPY, KRW, VND, TWD, IDR) display and split correctly with no decimal places.

### Entry Form
- Select one or more members — selecting multiple splits the amount evenly, with any indivisible remainder going to the first selected member
- Toggle between entering in the foreign or home currency — the other is shown as a live preview
- Press **Enter** on the amount to jump straight to the note/category picker
- After submitting, the keyboard dismisses and the list scrolls to highlight the new entry with a blue flash animation. Split entries all glow together.

### Undo
A toast appears for 4 seconds after every submission showing who was charged and what category. Tap **Undo** to instantly remove the entry — or all entries from a split — as a single unit.

### Recent Activity
- **Swipe left** on any row to reveal a Delete button
- **Tap any row** to edit the member, amount, date, or note. Edits preserve the original exchange rate unless the amount is changed.
- **Filter** by member or **sort** by date or amount

### Note / Category Picker
- Categories sorted by most-used first
- Each category has a stable unique color derived from its name — consistent across sessions and devices
- Type to filter live; press Enter or **+ Save** to add a new category
- Categories are global across all trips and both tabs

### Dark Mode
Full dark theme with a toggle in Settings. Every surface adapts including cards, modals, banners, and pickers. No flash on load.

---

## Settings

| Setting | Scope | Description |
|---|---|---|
| Spending currency | Per trip | The foreign currency for this trip |
| Tracking currency | Global | Your home currency for all trips |
| Starting balance | Per trip | Initial debit fund in your home currency |
| Members | Per trip | Who is on this trip |
| Categories | Global | Note categories shared across all trips |
| Dark mode | Global | Light or dark theme |
| Data backup | Per trip | CSV export and import |

### Currency Changes
When you change currencies, all past transactions are recalculated to preserve their home-currency value. The starting balance is also converted automatically. The app fetches a live rate on apply, falling back to the static table if offline.

### Data Backup
Download a CSV backup from Settings before clearing browser data. The CSV can be re-imported into any trip. Column headers reflect the active currency pair at time of export.

---

## Split Transactions

Selecting multiple members splits the total evenly. Any indivisible remainder goes to the first selected member. Each share is saved as a separate transaction with the same timestamp and note.

| Scenario | Result |
|---|---|
| 3 members, ¥9,000 | ¥3,000 each |
| 3 members, ¥3,001 | A: ¥1,001 · B, C: ¥1,000 |
| 2 members, €10.01 | A: €5.01 · B: €5.00 |

---

## Installing on iPhone

1. Host `index.html`, `sw.js`, and `manifest.json` in the same folder on any static host (GitHub Pages, Netlify, etc.)
2. Open the URL in **Safari** on your iPhone
3. Tap **Share → Add to Home Screen → Add**

The app launches full-screen with no browser chrome, exactly like a native app.

---

## Offline Support

A service worker caches the full app shell on first load including fonts and Tailwind CSS. Once cached, the app works completely offline.

All data is stored in `localStorage` on the device — no server, no account, no sync. Exchange rate requests fall back gracefully to cached or built-in rates.

> **Important:** Clearing Safari website data (Settings → Safari → Advanced → Website Data) erases both the service worker cache and all your transactions. Download a CSV backup first.

---

## Updating the App

When new files are deployed to your host, the app detects the update in the background. Close and reopen the app to activate the new version.

To force a full cache refresh, bump the version string in `sw.js`:
```js
const CACHE_NAME = 'travel-tracker-v2'; // increment on each release
```

---

## File Structure

```
index.html      Full app — HTML, CSS, JavaScript
sw.js           Service worker for offline caching
manifest.json   PWA manifest (name, icon, display mode)
README.md       This file
quickstart.md   30-second getting started guide
```

---

## Data Model

All data lives in `localStorage`. Per-trip keys are namespaced by a generated trip ID.

```
trips_index              [{id, name, archived, createdAt}]
active_trip_id           currently active trip
trip_{id}_debit          debit transactions
trip_{id}_credit         credit transactions
trip_{id}_members        members array
trip_{id}_balance        starting balance (home currency)
trip_{id}_foreign        foreign currency code
trip_{id}_rate           cached exchange rate
trip_{id}_name           trip display name
home_cur                 global home currency
categories               global note categories
cat_usage                global category usage counts
dark_mode                global theme preference
```

---

## Technical Notes

- **No build step** — drop the three files onto any static host
- **No runtime dependencies** — Tailwind CSS and Google Fonts are loaded from CDN and cached by the service worker on first use
- **Exchange rates** — three free, no-key, CORS-permissive APIs with 5-second timeouts, then per-trip cached rate, then built-in approximate rates (March 2026)
- **Split math** — works in smallest currency units to avoid floating-point errors; respects each currency's decimal precision
- **iOS quirks** — `confirm()` replaced with custom bottom sheet modals; inputs forced to 16px to prevent Safari auto-zoom; safe area insets applied for notched devices
- **Category colours** — stable hash of the name maps to one of ten light/dark colour pairs; no stored state required
- **Swipe dismiss** — the Trips sheet supports swipe-down-to-dismiss with live transform tracking and proportional backdrop dimming
- **Rate preservation** — editing a transaction preserves the original exchange rate unless the foreign amount itself is changed
