

# تطبيق المذكرة اليومية للعبادات - Daily Worship Timeline

## Overview
A beautiful, minimal Arabic RTL daily timeline app for tracking prayers and daily worship acts (عبادات). The app presents each day as a vertical timeline with expandable checkpoints and tasks, all in Arabic with an Islamic-inspired modern design.

---

## Phase 1: Foundation & Data Layer

- **Day data structure** with Gregorian + Hijri dates, prayer times, and ordered timeline items
- **Default daily template** that auto-generates the 5 mandatory locked prayer checkpoints (الفجر، الظهر، العصر، المغرب، العشاء) with their main tasks, sunnah tasks, and checklists
- **Additional daily items**: السحور، الشروق، أذكار الصباح، الضحى، أذكار المساء، القيام، التهجد، الوتر — all in correct timeline order
- **Local storage persistence** so data survives page refreshes
- **Hijri date conversion** using a JavaScript library

## Phase 2: Prayer Times & Location

- **Device geolocation** with permission prompt to get coordinates
- **Manual city fallback** if location permission is denied
- **Prayer time calculation** (Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha) using an Islamic prayer times library/API
- **Cached times** for offline use

## Phase 3: Timeline UI (Core Experience)

- **Full RTL Arabic layout** — right-aligned text, left-aligned checkboxes
- **Vertical timeline** with a thin line on the right side and dot indicators per item
- **Collapsed view by default**: each row shows only the item name and time (if applicable)
- **Tap to expand** with smooth 200-300ms animation:
  - Checkpoints expand to reveal: main prayer task → sunnah tasks → checklist
  - Tasks show their checkbox for completion
- **Visual distinction** between item types:
  - Checkpoints (محطات): bold, with time badge
  - Main tasks: prominent styling
  - Secondary tasks (سنن): slightly muted
  - Regular tasks: standard styling
  - Checklists: indented with individual checkboxes
- **Checkpoint completion indicator**: shows as complete when the main prayer task is checked

## Phase 4: Day Navigation

- **Horizontal scrollable day cards** at the top (RTL)
- **Hijri month/year header** (e.g., "شعبان 1447 هـ")
- **Current day highlighted** with accent color
- **Tap a day card** to load that day's timeline
- **Gregorian date** shown subtly alongside Hijri

## Phase 5: Design & Polish

- **Islamic-inspired modern minimal design**: soft background, maroon/red accent color, clean typography
- **Arabic font** optimized for readability (e.g., Tajawal or Cairo from Google Fonts)
- **Islamic-vibe icons** without borders for prayer-related items
- **Subtle color palette**: warm grays, soft whites, accent maroon
- **Large tap targets** for accessibility
- **Smooth animations** throughout (expand/collapse, page transitions)

## Phase 6: User Customization

- **Add custom tasks** (regular/secondary/main) under any checkpoint or as standalone timeline items
- **Add checklist items** inside checkpoints
- **Delete non-locked items** (mandatory prayer checkpoints cannot be removed)
- **Toggle completion** on any task or checklist item independently

---

## Technical Notes
- All data stored locally in browser (localStorage) — no backend needed initially
- Prayer times calculated client-side using a prayer calculation library
- Hijri conversion handled client-side
- Fully responsive, mobile-first design

