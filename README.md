# Yen Tracking App Lite

A mobile-first Progressive Web App (PWA) for tracking shared spending across a travel group. Supports multiple trips, 25 currencies, live exchange rates, dark mode, and full offline operation. No account, no server, no setup required.

---

## Features

### Multiple Trips
- Create a trip for each destination — each has its own name, spending currency, starting balance, and members.
- Switch between trips instantly using the pill strip at the top of the screen.
- Tap `···` on any trip chip to rename, archive, or delete it.
- Tap `+` to create a new trip or restore an archived one.
- Archived trips are hidden from the strip but preserved in full — unarchive at any time.
- Deleting a trip permanently removes all its transactions. The last trip cannot be deleted; a fresh one is created instead.
- On first launch after an update, existing data is automatically migrated into the trip system as "My Trip" with no data loss.

### Two Tracking Tabs
- **Debit** — tracks cash withdrawals against a shared declining fund balance. Shows remaining funds, total spent, percentage used, and a subtle progress bar.
- **Credit** — tracks credit card charges separately with per-member totals and a running group total.

### Live Exchange Rate
- Fetches the current rate for the active currency pair from three independent sources in sequence: frankfurter.app, open.er-api.com, exchangerate.host.
- Falls back to the last cached rate (gray dot), then to built-in approximate rates (orange "Estimate" dot) if all APIs are unreachable.
- Rate badge in the header shows live (green), fetching (yellow), estimate (orange), or cached (gray).
- Refreshes every 15 minutes while the app is open. Each trip stores its own cached rate.

### Multi-Currency Support
- Configure spending and tracking currencies independently in Settings → Currency.
- 25 currencies supported: JPY, USD, EUR, GBP, AUD, CAD, CHF, CNY, HKD, KRW, SGD, TWD, THB, INR, MXN, BRL, SEK, NOK, DKK, NZD, ZAR, AED, VND, PHP, IDR.
- Built-in fallback rates (updated March 2026) for offline use.
- Whole-unit currencies (JPY, KRW, VND, TWD, IDR) display and round correctly with no decimal places.
- When changing currency, all past transactions are recalculated to preserve their home-currency value. The starting balance is also converted automatically.
- The home currency ("I track in") is global across all trips. The spending currency ("I'm spending in") is per-trip.

### Entry Form
- **Multi-member selection** — tap one or more member chips to assign an entry. Selecting multiple members splits the amount evenly, with any indivisible remainder going to the first selected member. The converted preview updates in real time to show the per-person breakdown.
- **Currency input toggle** — enter in either the foreign or home currency; the other is calculated instantly.
- **Enter key flow** — pressing Enter on the amount field opens the note/category picker directly with keyboard focused on search.
- **Note / category picker** — bottom sheet with frequency-sorted category pills. Tap to select, type to filter live. Custom entries can be saved to your list or used as one-offs.
- **Undo** — a toast appears for 4 seconds after each submission. Tap Undo to remove the entry (or all splits from a multi-member entry) instantly.

### Recent Activity
- **Swipe left** on any row to reveal a red Delete button.
- **Tap any row** to open the edit sheet — change the member, amount, date, or note after the fact.
- **Filter** by member or **sort** by date or amount.

### Note / Category Picker
- Category pills sorted by most recently used first.
- Each saved category has a unique color derived from its name — stable across sessions and devices.
- Custom one-off notes display in a neutral style without being saved.
- Type to filter; press Enter or tap `+ Save` to add a new category to your list.
- Categories are global — shared across all trips and both tabs.

### Dark Mode
- Full dark theme toggle in Settings. Every surface adapts — cards, modals, banners, pickers, tab bar.
- Applies immediately on load with no flash. Preference persists across sessions.

---

## Settings

### Currency
- "I'm spending in" — the foreign currency for the active trip.
- "I track in" — the home currency (global across all trips).
- Tap **Apply** to fetch the live rate and switch. Past transactions are recalculated to preserve their home-currency values.

### Starting Balance
- The initial debit fund amount in your home currency.
- Symbol and label update automatically when the home currency changes.

### Dark Mode
- Toggle between light and dark themes.

### Members
- Per-trip. Add, rename, or remove members.
- Renaming updates all past transactions for that trip automatically.
- Removing a member keeps their transaction history intact.

### Categories
- Global across all trips. Add or remove note categories used in the picker.
- Removing a category only affects the picker — past transaction notes are never modified.

### Data Backup
- **Download CSV Backup** — exports all transactions for the active trip. Column headers reflect the active currency pair.
- **Upload CSV to Restore** — restores transactions into the current trip. Member names found in the CSV are added to the trip's member list automatically.

### Danger Zone
- **Reset Debit** — clears debit transactions for the current trip.
- **Reset Credit** — clears credit transactions for the current trip.
- **Reset Everything** — wipes all trips, members, categories, and settings from the device.

---

## Installing on iPhone (PWA)

No App Store required. Installs directly from Safari.

1. Host `index.html`, `sw.js`, and `manifest.json` in the **same folder** on a static host (GitHub Pages, Netlify, etc.).
2. Open the URL in **Safari** on your iPhone.
3. Tap **Share** → **Add to Home Screen** → **Add**.

The app launches full-screen like a native app with no browser chrome.

---

## Offline Support

A service worker (`sw.js`) caches the full app shell on first load, including fonts and Tailwind CSS. Once cached, the app works completely offline.

- All data is stored in `localStorage` on the device.
- Exchange rate requests fall back gracefully to cached or built-in rates.
- All entry, editing, deletion, and trip-switching works with no connection.

> **Important:** Clearing Safari website data (Settings → Safari → Advanced → Website Data) erases the service worker cache **and** all transactions. Download a CSV backup before doing this.

---

## Receiving Updates

When new files are uploaded to your host:

1. Open the app — it detects the update in the background.
2. Close and reopen — the new version activates.

Bump the version string in `sw.js` to force a full cache refresh:
```js
const CACHE_NAME = 'yen-tracker-v2'; // increment on each release
```

---

## Split Transactions

Selecting multiple members splits the total evenly. Any remainder (always ≤ n−1 smallest units) goes to the first selected member. Each share is saved as a separate transaction with the same date and note. The split respects each currency's decimal precision.

**Even:** 3 members, ¥9,000 → ¥3,000 each  
**Uneven:** 3 members, ¥3,001 → A gets ¥1,001, B and C get ¥1,000  
**Decimal:** 2 members, €10.01 → A gets €5.01, B gets €5.00

---

## Data Model

```
trips_index              global — [{id, name, archived, createdAt}]
active_trip_id           global — currently active trip
trip_{id}_debit          per-trip — debit transactions
trip_{id}_credit         per-trip — credit transactions
trip_{id}_members        per-trip — members array
trip_{id}_balance        per-trip — starting balance (in home currency)
trip_{id}_foreign        per-trip — foreign currency code
trip_{id}_rate           per-trip — cached exchange rate
trip_{id}_name           per-trip — trip display name
home_cur                 global — home currency code
categories               global — note categories
cat_usage                global — category usage counts
dark_mode                global — theme preference
```

---

## File Structure

```
index.html    — Full app (HTML, CSS, JavaScript)
sw.js         — Service worker for offline caching
manifest.json — PWA manifest (name, icon, theme)
README.md     — This file
```

---

## Technical Notes

- **No build step** — plain HTML/CSS/JS. Deploy by dropping files into any static host.
- **No runtime dependencies** — Tailwind CSS and Google Fonts are cached by the service worker on first load.
- **Storage** — `localStorage` only. No server, no account, no third-party data access.
- **Exchange rates** — three free, no-key, CORS-permissive APIs with 5-second timeouts, then fallback to per-trip cached rate, then built-in approximate rates (March 2026).
- **Currency math** — all splitting, formatting, and CSV export respect each currency's decimal count (0 for JPY/KRW/VND/TWD/IDR, 2 for all others).
- **Dark mode** — CSS custom properties with a `body.dark` class toggle. No flash on load.
- **iOS PWA quirks** — `confirm()` replaced with custom bottom sheet modals; inputs forced to 16px to prevent Safari auto-zoom; safe area insets applied for notched devices.
- **Pill colors** — each category gets a stable color via a hash of its name, with separate light/dark values. No stored state required.
- **Swipe-down modals** — the Trips sheet supports swipe-down-to-dismiss with live transform tracking and proportional backdrop dimming.
