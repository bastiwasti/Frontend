# Calendar View Implementation Plan

## Overview
Create a new calendar view (`/calendar` route) that displays all events chronologically in a monthly calendar format with expandable event details.

---

## Design Decisions (Confirmed)

✅ **1. Multi-day events:** Show on each date separately in calendar  
✅ **2. Multiple events per day:** Stack vertically with visible titles  
✅ **3. Filters:** Separate from calendar navigation  
✅ **4. Date filtering:** Auto-navigate calendar to start date  
✅ **5. Event colors:** Category-based colors + city grouping indicator  
✅ **6. Default view:** Start with grid view  
✅ **7. Event details:** Modal/dialog centered on screen  

---

## Implementation Plan

### **Phase 1: Foundation Components**

#### 1.1 Create Dialog Component
**File:** `src/components/ui/dialog.tsx`
- Based on Radix UI Dialog component
- Modal overlay with close button
- Responsive width (mobile-friendly)
- Escape key to close
- Click outside to close

#### 1.2 Create Calendar Event Chip Component
**File:** `src/components/calendar/calendar-event-chip.tsx`
- Category-based background color
- City badge in top-left corner (small icon + city name)
- Title truncated with ellipsis (max 2 lines)
- Hover effect: slight brightness increase + scale
- Click event: Opens event details modal

#### 1.3 Create Event Details Modal
**File:** `src/components/calendar/event-details-modal.tsx`
- Same fields as grid view card
- Responsive modal width (mobile: 90%, desktop: 500px)
- Auto-scroll to top when opened
- Focus management (trap focus in modal)
- City highlighted if present

---

### **Phase 2: Calendar Page**

#### 2.1 Create Calendar Route
**File:** `src/app/(protected)/calendar/page.tsx`

State Management:
```typescript
const [events, setEvents] = useState<Event[]>([]);
const [runs, setRuns] = useState<Run[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
const [filters, setFilters] = useState<FilterState>({...});
```

#### 2.2 Event Grouping by Date
Group events by date for calendar display. Handle multi-day events by adding to all dates in range.

#### 2.3 Category Color Mapping
```typescript
const categoryColors: Record<string, string> = {
  'Sonstige': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
  'Musik': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
  'Sport': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100',
  'Kultur': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
  'default': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100',
};
```

#### 2.4 Custom Calendar Day Cell
- Shows up to 3 events stacked vertically
- Title visible at first glance
- City badge on each chip
- "+3 more" indicator for overflow

#### 2.5 Calendar Component Integration
- Use existing Calendar component
- Show single month view
- Month navigation with prev/next buttons

#### 2.6 Filter Integration
- Reuse same filter state as grid view
- Copy filter section from grid view
- Date range filter: Auto-navigate `currentMonth` to `dateRange.from`

---

### **Phase 3: Navigation & Header**

#### 3.1 Update Protected Layout
**File:** `src/app/(protected)/layout.tsx`
- Add view toggle buttons (Grid View vs Calendar View)
- Simple tab or button toggle
- Link-based navigation

---

### **Phase 4: Refinements & Polish**

#### 4.1 Empty States
- No events in month: Show message
- No events at all: Reuse grid view message

#### 4.2 Loading States
- Skeleton calendar or spinner while fetching
- Smooth fade-in when events load

#### 4.3 Mobile Responsiveness
- Calendar day cell: Fixed height (128px)
- Event chips: Full width on mobile
- Modal: 95% width on mobile, max-width 500px on desktop
- Filters: Stack vertically on mobile

#### 4.4 Keyboard Accessibility
- Tab navigation between events, filters
- Enter/Space: Open event modal from chip
- Escape: Close modal
- Arrow keys: Navigate calendar days

#### 4.5 City Badge Design
- Show only if `city` exists and not empty
- Truncate to 4 characters to save space
- Show full city name in modal
- Small icon + background color

#### 4.6 Filter Date Auto-Navigation
- User selects date range in filter
- Calendar auto-jumps to start date
- Events filter by date range + other filters

---

## Component Structure (Final)

```
src/app/(protected)/
├── layout.tsx (UPDATE - add view toggle)
├── page.tsx (UNCHANGED - grid view)
└── calendar/
    └── page.tsx (NEW - main calendar view)

src/components/
├── ui/
│   ├── dialog.tsx (NEW - base dialog component)
│   ├── calendar.tsx (EXISTING - extend with DayCell)
│   └── ... (other existing)
└── calendar/
    ├── calendar-event-chip.tsx (NEW - event badge)
    └── event-details-modal.tsx (NEW - modal content)
```

---

## Implementation Order

### **Iteration 1: Foundation Components**
- [ ] Create `dialog.tsx` component
- [ ] Create `calendar-event-chip.tsx` component
- [ ] Create `event-details-modal.tsx` component
- [ ] Test modal rendering with mock data

### **Iteration 2: Calendar Page**
- [ ] Create `/calendar` route
- [ ] Implement basic calendar with react-day-picker
- [ ] Fetch events from API (reuse logic)
- [ ] Group events by date

### **Iteration 3: Event Display**
- [ ] Implement custom DayCell with event chips
- [ ] Add category color mapping
- [ ] Add city badges to chips
- [ ] Handle multi-day events (show on all dates)

### **Iteration 4: Interaction**
- [ ] Implement click → open modal
- [ ] Add modal close logic (button, outside click, escape)
- [ ] Test stacking multiple events per day

### **Iteration 5: Filtering**
- [ ] Add filter section (copy from grid view)
- [ ] Connect filters to calendar display
- [ ] Implement date filter → auto-navigate month

### **Iteration 6: Navigation**
- [ ] Update `layout.tsx` with view toggle
- [ ] Add active state styling for view buttons
- [ ] Test navigation between grid and calendar

### **Iteration 7: Polish**
- [ ] Add empty states
- [ ] Add loading states
- [ ] Mobile responsiveness testing
- [ ] Keyboard accessibility testing
- [ ] Edge cases (no datetime, overflow, multi-day)

---

## Edge Cases & Solutions

### **1. Event without start_datetime**
- **Display:** Exclude from calendar
- **Reason:** Can't place in calendar

### **2. Very long event titles**
- **Chip:** Truncate to 2 lines with ellipsis
- **Modal:** Show full title

### **3. 5+ events on same day**
- **Chip:** Show 3 events + "2 more" badge
- **Modal:** Show all events in list

### **4. Event spanning > 1 month**
- **Display:** Show only in current month days
- **Reason:** Simplest implementation

### **5. Category not in color map**
- **Display:** Use "default" gray color
- **Log:** Unknown category for future color addition

### **6. City name too long**
- **Chip:** Truncate to 4 chars ("Dortmund" → "Dorm")
- **Modal:** Show full name ("Dortmund")

### **7. No events in filtered month**
- **Display:** Empty state with message
- **Action:** "Clear filters" button

---

## Data Flow

```
API (/api/events)
  ↓
Fetch & Filter (useEffect)
  ↓
Group by Date (useMemo)
  ↓
Render Calendar Day Cells
  ↓
Display Event Chips
  ↓
User Clicks Chip
  ↓
Open Modal (setSelectedEvent)
  ↓
Show Event Details
```

---

## Testing Scenarios

### **Scenario 1: Single-day event**
- Event: Jugendberufshilfe
- City: Dormagen
- Category: Sonstige
- Expected: Blue chip with "Dorm" badge, click → modal shows details

### **Scenario 2: Multi-day event**
- Event: Conference
- Category: Musik
- Expected: Green chip on Feb 10, Feb 11, Feb 12

### **Scenario 3: Multiple events same day**
- 5 events on Feb 15
- Expected: 3 visible chips stacked, "+2 more" badge

### **Scenario 4: Filter by date range**
- Filter: Feb 1 - Feb 28, 2026
- Expected: Calendar auto-navigates to February month

### **Scenario 5: Category filtering**
- Filter: "Musik" category
- Expected: Only green chips shown, others hidden

### **Scenario 6: City grouping check**
- 3 events in Dormagen, 2 in Köln
- Expected: Chips show "Dorm" and "Köln" badges

---

## Open Questions (Answered)

**Q1: Category colors**
**A:** Start with basic set (Sonstige, Musik, Sport, Kultur, default), expand later

**Q2: City badge truncation**
**A:** 4 characters ("Dortmund" → "Dorm")

**Q3: Multi-day month overflow**
**A:** Show only in current month days (simplest)

**Q4: "3 more" behavior**
**A:** Clicking chip opens modal with that specific event, not all events

**Q5: Month view vs Year view**
**A:** Always show 1 month for better mobile experience

---

## Dependencies

**Already installed:**
- ✅ `react-day-picker` (v9.13.0)
- ✅ `date-fns` (v4.1.0)
- ✅ `radix-ui` (dialog components)
- ✅ `lucide-react` (icons)

**Need to add:**
- None! All dependencies are available.

---

## Timeline Estimate

- **Phase 1:** 1-1.5 hours (foundation components)
- **Phase 2:** 1.5-2 hours (calendar page)
- **Phase 3:** 1-1.5 hours (display logic)
- **Phase 4:** 0.5-1 hours (interaction)
- **Phase 5:** 0.5-1 hours (filtering)
- **Phase 6:** 0.25-0.5 hours (navigation)
- **Phase 7:** 1-1.5 hours (polish)
- **Total:** ~6-8 hours

---

## Implementation Log

### Session 1 - [2026-02-08]
**Status:** Implementation Complete ✅

**Progress:**
- [x] Create dialog component
- [x] Create calendar event chip component
- [x] Create event details modal component
- [x] Create /calendar route
- [x] Implement basic calendar with react-day-picker
- [x] Fetch events from API (reuse logic)
- [x] Group events by date
- [x] Implement custom DayCell with event chips
- [x] Add category color mapping
- [x] Add city badges to chips
- [x] Handle multi-day events (show on all dates)
- [x] Implement click → open modal
- [x] Add modal close logic (button, outside click, escape)
- [x] Add filter section (copy from grid view)
- [x] Connect filters to calendar display
- [x] Implement date filter → auto-navigate month
- [x] Update layout.tsx with view toggle
- [x] Add active state styling for view buttons
- [x] Fixed TypeScript errors (DayCell types)
- [x] Removed problematic useEffect for month navigation
- [x] Build passing ✅
- [x] Lint passing ✅
- [x] **FIXED: Date formatting in DayCell**
  - Issue: `format(String(day))` caused "Invalid time value" error
  - Solution: Use `new Date(day)` to properly convert to Date object
  - Add null check for missing day prop

**Decisions Made:**
- Category colors: Basic set (Sonstige, Musik, Sport, Kultur, default)
- City badge: Truncate to 4 characters for space saving
- Multi-day handling: Show on all dates in range (simpler approach)
- Month navigation: Manual handler to avoid useEffect issues
- Date conversion: Use Date constructor for reliable type handling

**Issues Encountered:**
1. CalendarDay type incompatibility with Date type
   - Fixed: Use String(day) for format calls
2. setState in useEffect causing cascading renders
   - Fixed: Removed problematic useEffect, use manual handler
3. Duplicate imports in layout.tsx
   - Fixed: Rewrote entire file cleanly
4. Runtime error: "Invalid time value" in calendar
   - Fixed: Properly convert day prop to Date before format()

**Next Steps:**
- ✅ Test calendar with actual event data
- ✅ Verify multi-day events display correctly
- ✅ Test filter integration
- ✅ Test responsive behavior
- ✅ Add "3 more" click behavior (optional)
- ✅ Commit changes to git

---



## Notes

- Reuse existing patterns from grid view
- Copy filter logic completely
- Event card styling already complete
- Calendar component exists and ready to use
- Dialog pattern similar to existing popover

---

**Last Updated:** 2026-02-08  
**Status:** Ready to start implementation
