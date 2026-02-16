

# Visual Enhancements: Right Border Colors, Bottom Borders, Vertical Line, Dots, and Indentation

## Changes to `src/components/TimelineView.tsx`

### 1. Right Colored Border per Element
Each timeline item (checkpoint or standalone task) gets a colored right border (`border-r-2` or `border-r-3`):
- Checkpoints use their theme color (e.g., `border-r-checkpoint-fajr` for Fajr)
- Standalone tasks use a muted border (`border-r-primary/20`)

### 2. Subtle Bottom Border + Margin
Instead of separator lines, each element gets:
- `mb-3` margin for spacing
- `border-b border-border/30` for a very subtle bottom edge

### 3. Vertical Line on the Right with Dots
- A continuous vertical line on the right side: `absolute right-[7px] top-0 bottom-0 w-px bg-border/40`
- Checkpoints get larger colored dots (`w-3 h-3`) positioned on the line
- Standalone tasks get smaller dots (`w-2 h-2`) on the line
- Dots use checkpoint colors when filled (done) and border-only when not done

### 4. Indentation for Children
- Checkpoint expanded tasks (sunnahs + prayer): increase from `pr-4` to `pr-8`
- Checklist items under main prayer: increase from `pr-6` to `pr-12`

### 5. Color Maps for Dots and Right Borders
Re-introduce two maps:

```text
CHECKPOINT_BORDER_RIGHT:
  الفجر    -> border-r-checkpoint-fajr
  الشروق   -> border-r-checkpoint-sunrise
  الظهر    -> border-r-checkpoint-dhuhr
  العصر    -> border-r-checkpoint-asr
  المغرب   -> border-r-checkpoint-maghrib
  العشاء   -> border-r-checkpoint-isha

CHECKPOINT_DOT (for filled/unfilled states - same color families)
```

### Container
- Main container: `relative pr-8 pl-4 pb-20` to make room for the vertical line and dots on the right

### Element Structure (checkpoint example)
```text
<div className="relative mb-3 border-b border-border/30 border-r-2 border-r-checkpoint-fajr rounded-r-sm pr-3">
  <!-- dot on vertical line -->
  <div className="absolute right-[-22px] top-[12px] w-3 h-3 rounded-full ..." />
  <!-- checkpoint content -->
</div>
```

### Element Structure (standalone task example)
```text
<div className="relative mb-2 border-b border-border/20 border-r-2 border-r-primary/20 rounded-r-sm pr-3">
  <!-- smaller dot -->
  <div className="absolute right-[-20px] top-[14px] w-2 h-2 rounded-full ..." />
  <!-- task content -->
</div>
```

