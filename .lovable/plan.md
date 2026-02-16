

# Restructuring: Checkpoints as Time Markers, Prayer as Expandable Task

## The Key Insight

Checkpoints (الفجر، الظهر، etc.) are **time markers** on the timeline. Inside each checkpoint lives:
- **Sunnah tasks (before prayer)** - secondary tasks
- **The prayer itself (main task)** - which expands to show the 3-item checklist (جماعة، في الوقت، أذكار الصلاة)
- **Sunnah tasks (after prayer)** - secondary tasks

Currently, sunnahs are placed as standalone tasks outside checkpoints. This needs to change: **all sunnahs belong inside their checkpoint**, ordered before/after the main prayer task.

---

## Data Changes (`src/lib/default-day.ts`)

Move all sunnah tasks **inside** their respective checkpoint's `tasks[]` array, in the correct order:

| Checkpoint | Tasks (in order) |
|---|---|
| الفجر | سنة الفجر (ركعتان) -> صلاة الفجر |
| الظهر | سنة قبل الظهر (٤ ركعات) -> صلاة الظهر -> سنة بعد الظهر (ركعتان) |
| العصر | سنة قبل العصر (٤ ركعات) -> صلاة العصر |
| المغرب | صلاة المغرب -> سنة بعد المغرب (ركعتان) |
| العشاء | صلاة العشاء -> سنة بعد العشاء (ركعتان) |

The standalone timeline items will be reduced to only: السحور، أذكار الصباح، الشروق، الضحى، أذكار المساء، القيام، التهجد، الوتر.

Update `makePrayerCheckpoint` to accept pre-prayer and post-prayer sunnah arrays and place them before/after the main task.

## UI Changes (`src/components/TimelineView.tsx`)

### Checkpoint expansion - two levels:
1. **Tap checkpoint** -> expands to show all tasks (sunnahs + main prayer), each with a checkbox
2. **Tap main prayer task** -> expands further to show the 3 checklist items (جماعة، في الوقت، أذكار الصلاة)

### Structure when expanded:
```text
05:12
الفجر                          v
  سنة الفجر (ركعتان)      [ ]
  صلاة الفجر               [ ]  v
    جماعة                  [ ]
    في الوقت               [ ]
    أذكار الصلاة           [ ]
```

- Track two expansion states: `expandedCheckpoint` (which checkpoint is open) and `expandedPrayer` (which main task shows its checklist)
- All sunnah tasks inside checkpoint get checkboxes
- Main prayer task gets a checkbox AND an expand arrow for checklist

## Technical Details

### `src/lib/default-day.ts`
- Modify `makePrayerCheckpoint` to accept `preSunnah` and `postSunnah` task arrays
- Place pre-sunnah tasks before the main task, post-sunnah after in the `tasks[]` array
- Remove all standalone sunnah `TimelineItem` entries from the timeline
- Keep `سنة قبل العصر` as `regular_task` type, all others as `secondary_task`

### `src/components/TimelineView.tsx`
- Add `expandedPrayerId` state alongside `expandedId`
- When checkpoint expands: render each task in `cp.tasks[]` with checkbox and proper styling
- When a `main_task` is tapped: toggle its nested checklist visibility with animation
- Checklist items render indented under the main prayer task

### `src/types/worship.ts`
- No changes needed; the existing `Checkpoint.tasks[]` and `Checkpoint.checklist[]` structure supports this

### localStorage
- Users will need to clear cached data for the new structure to take effect on existing days

