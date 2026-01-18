# Clockify-Inspired UI/UX Redesign

## Overview
Revamp Pomoclockfy to match Clockify's clean, timesheet-focused UX while maintaining Pomodoro functionality.

**Main Branch:** `feature/clockify-inspired-redesign`

**Status:** In Progress  
**Last Updated:** 2026-01-17  
**Started:** 2026-01-17

---

## Phase 1: Timer Bar & Horizontal Layout

**Branch:** `feature/clockify-inspired-redesign/phase-1-timer-bar`

- [X] **1.1** Create `TimerBar.js` component (horizontal layout)
  - [X] Task input field
  - [X] Play/pause button
  - [X] Time display (MM:SS)
  - [X] Session progress dots (●●●○)
  - [X] Settings icon

- [X] **1.2** Update [App.css](pomoclockify-frontend/src/App.css) for sticky header
  - [X] Position timer bar at top (in TimerBar.css)
  - [X] Add drop shadow (in TimerBar.css)
  - [X] Make scrollable content below (TimerBar component is sticky)

- [X] **1.3** Update [App.js](pomoclockify-frontend/src/App.js) to use TimerBar
  - [X] Pass state: `isRunning`, `currentSession`, `currentTask`, `sessionsCompleted`
  - [X] Pass handlers: `onToggle`, `onTaskChange`, `onSettings`
  - [X] Remove old three-column timer layout

- [X] **1.4** Update [Timer.js](pomoclockify-frontend/src/components/Timer.js)
  - [X] Extract time display logic (reuse in TimerBar)
  - [X] Remove progress circle SVG (no longer needed)
  - [X] Keep audio/completion logic

- [X] **1.5** Test timer bar functionality
  - [X] Timer counts down correctly
  - [X] Play/pause works
  - [X] Task input remains editable while running
  - [X] Mobile responsive

---

## Phase 2: Timesheet-Style History View

**Branch:** `feature/clockify-inspired-redesign/phase-2-timesheet-view`

- [ ] **2.1** Create `TimeSheetView.js` component
  - [ ] Display tasks as list (not panels)
  - [ ] Show: Start time | End time | Duration | Task name | Session type
  - [ ] Inline edit capability
  - [ ] Delete button
  - [ ] Group by date with daily totals

- [ ] **2.2** Update [App.css](pomoclockify-frontend/src/App.css)
  - [ ] Remove pagination styles
  - [ ] Add timesheet list styles
  - [ ] Date group headers
  - [ ] Daily total display

- [ ] **2.3** Update [App.js](pomoclockify-frontend/src/App.js)
  - [ ] Replace `groupedTasks` logic with infinite scroll
  - [ ] Remove 7-day pagination state
  - [ ] Add scroll-to-load handler

- [ ] **2.4** Implement infinite scroll / "Load more"
  - [ ] Add intersection observer for bottom of list
  - [ ] Load older tasks on scroll
  - [ ] Show loading spinner

- [ ] **2.5** Add inline editing
  - [ ] Click to edit task name/times
  - [ ] Save/cancel buttons
  - [ ] Sync to backend on save

- [ ] **2.6** Test timesheet view
  - [ ] Scroll loads more entries
  - [ ] Dates group correctly
  - [ ] Totals calculate properly
  - [ ] Inline edits persist

---

## Phase 3: Organization (Tags & Projects)

**Branch:** `feature/clockify-inspired-redesign/phase-3-organization`

- [ ] **3.1** Update Task entity schema
  - [ ] Backend: Add `project` (String) to [Task.java](pomoclockfy-backend/src/main/java/com/pomoclockfy/entity/Task.java)
  - [ ] Backend: Add `tags` (JSON list) to [Task.java](pomoclockfy-backend/src/main/java/com/pomoclockfy/entity/Task.java)
  - [ ] Update [schema.sql](pomoclockfy-backend/src/main/resources/schema.sql)
  - [ ] Frontend: Update task shape in [App.js](pomoclockify-frontend/src/App.js)

- [ ] **3.2** Create `TagInput.js` component
  - [ ] Autocomplete for existing tags
  - [ ] Create new tags inline
  - [ ] Chiplet display

- [ ] **3.3** Create `ProjectSelector.js` component
  - [ ] Dropdown with color coding
  - [ ] Create new project modal

- [ ] **3.4** Update TimerBar with tags/project
  - [ ] Add project selector
  - [ ] Add tag input
  - [ ] Display selected project color

- [ ] **3.5** Add color mapping
  - [ ] Store project colors
  - [ ] Display in timesheet
  - [ ] Update [App.css](pomoclockify-frontend/src/App.css) with color classes

- [ ] **3.6** Update [TaskController.java](pomoclockfy-backend/src/main/java/com/pomoclockfy/controller/TaskController.java)
  - [ ] Accept `project` and `tags` in POST/PUT
  - [ ] Add search filters by project/tag

- [ ] **3.7** Update [api.js](pomoclockify-frontend/src/services/api.js)
  - [ ] Update `createTask` mapper to include project/tags
  - [ ] Update `mapTaskFromBackend` to include project/tags

- [ ] **3.8** Test organization features
  - [ ] Tasks save with project/tags
  - [ ] Filter by project works
  - [ ] Colors display correctly

---

## Phase 4: Analytics & Reports

**Branch:** `feature/clockify-inspired-redesign/phase-4-analytics`

- [ ] **4.1** Create `AnalyticsView.js` component
  - [ ] Tab navigation: [Today] [Week] [Month] [All]
  - [ ] Daily/weekly bar charts
  - [ ] Top tasks list
  - [ ] Time spent by project

- [ ] **4.2** Add chart library (Chart.js or Recharts)
  - [ ] Install dependency
  - [ ] Create bar chart for weekly view
  - [ ] Create pie chart for project breakdown

- [ ] **4.3** Create `WeeklyReport.js`
  - [ ] Show each day's total
  - [ ] Target goal line
  - [ ] Visual progress bars

- [ ] **4.4** Create `TopTasksReport.js`
  - [ ] Rank tasks by time spent
  - [ ] Show percentage of total
  - [ ] Group by project

- [ ] **4.5** Update [TaskRepository.java](pomoclockfy-backend/src/main/java/com/pomoclockfy/repository/TaskRepository.java)
  - [ ] Add query for weekly duration
  - [ ] Add query for tasks by project
  - [ ] Add query for top tasks

- [ ] **4.6** Add new API endpoints (if needed)
  - [ ] `GET /api/tasks/weekly?startDate=...`
  - [ ] `GET /api/tasks/by-project`
  - [ ] `GET /api/tasks/top?limit=10`

- [ ] **4.7** Test analytics
  - [ ] Charts render correctly
  - [ ] Data aggregates properly
  - [ ] Responsive on mobile

---

## Phase 5: Advanced Features

**Branch:** `feature/clockify-inspired-redesign/phase-5-advanced`

- [ ] **5.1** Manual Time Entry
  - [ ] Create `ManualEntryModal.js`
  - [ ] Form: Task | Project | Tags | Start time | End time
  - [ ] Save to backend

- [ ] **5.2** Billable Toggle
  - [ ] Add `billable` field to Task entity
  - [ ] Add toggle in timer bar
  - [ ] Track in analytics

- [ ] **5.3** Weekly Goals
  - [ ] Add to Settings
  - [ ] Show progress toward goal
  - [ ] Notification when goal reached

- [ ] **5.4** Idle Detection
  - [ ] Detect inactivity (5 min default)
  - [ ] Show pause confirmation modal
  - [ ] Auto-pause option

- [ ] **5.5** Browser Notifications
  - [ ] Notify when session ends
  - [ ] Include task name
  - [ ] Request permission on first use

- [ ] **5.6** Keyboard Shortcuts
  - [ ] Space: Start/pause
  - [ ] R: Reset
  - [ ] Esc: Close modals
  - [ ] Ctrl+N: New manual entry

- [ ] **5.7** Time Rounding
  - [ ] Add setting for rounding (off, 5min, 15min)
  - [ ] Apply to all time entries
  - [ ] Update analytics

- [ ] **5.8** Test advanced features
  - [ ] All keyboard shortcuts work
  - [ ] Notifications appear correctly
  - [ ] Idle detection triggers accurately

---

## Phase 6: Polish & Optimization

**Branch:** `feature/clockify-inspired-redesign/phase-6-polish`

- [ ] **6.1** Performance optimization
  - [ ] Lazy load timesheet entries
  - [ ] Memoize components (React.memo)
  - [ ] Optimize re-renders

- [ ] **6.2** Accessibility improvements
  - [ ] Add ARIA labels
  - [ ] Test with screen readers
  - [ ] Fix color contrast
  - [ ] Add focus indicators

- [ ] **6.3** Mobile responsiveness
  - [ ] Test on iOS/Android
  - [ ] Touch-friendly button sizes
  - [ ] Swipe gestures
  - [ ] Vertical layout

- [ ] **6.4** Dark mode (optional)
  - [ ] Add toggle in settings
  - [ ] Update [App.css](pomoclockify-frontend/src/App.css) with dark theme
  - [ ] Persist preference to localStorage

- [ ] **6.5** Error handling
  - [ ] Add retry logic for failed tasks
  - [ ] User-friendly error messages
  - [ ] Offline mode improvements

- [ ] **6.6** Testing
  - [ ] Unit tests for components
  - [ ] Integration tests for API
  - [ ] E2E tests for key flows

- [ ] **6.7** Documentation
  - [ ] Update component docs
  - [ ] Add JSDoc comments
  - [ ] Update README with new features

- [ ] **6.8** Final review & merge
  - [ ] Code review
  - [ ] Manual testing
  - [ ] Performance check
  - [ ] Merge to main

---

## Session Tracking

### Session 1: 2026-01-17
- Created design document and branch structure
- Planned 6 phases with detailed tasks
- Total estimated work: 40-50 hours

### Session 2: [To be filled]
- Phase: 
- Tasks completed: 
- Next steps: 

### Session 3: [To be filled]
- Phase: 
- Tasks completed: 
- Next steps: 

---

## Notes

- All changes maintain **offline-first** pattern (localStorage + optional backend sync)
- **API compatibility**: Update `mapTaskFromBackend`/`mapSessionTypeToBackend` in [api.js](pomoclockify-frontend/src/services/api.js) as schema changes
- **CORS**: Remember to add new origins to [CorsConfig.java](pomoclockfy-backend/src/main/java/com/pomoclockfy/config/CorsConfig.java) if deploying to new domain
- **Database migrations**: Use `spring.jpa.hibernate.ddl-auto=update` for dev; write explicit migrations before prod
- **Backend testing**: Add tests to [pomoclockfy-backend/src/test](pomoclockfy-backend/src/test) for new endpoints
- **Local testing**: Run `mvn spring-boot:run` + `npm start` and test with `REACT_APP_API_URL=http://localhost:8080`

---

## Git Workflow

```bash
# Start new session:
git checkout feature/clockify-inspired-redesign
git pull origin feature/clockify-inspired-redesign

# Work on specific phase:
git checkout feature/clockify-inspired-redesign/phase-1-timer-bar
git pull origin feature/clockify-inspired-redesign/phase-1-timer-bar

# Commit changes:
git add .
git commit -m "[Phase 1] Task description"
git push origin feature/clockify-inspired-redesign/phase-1-timer-bar

# Merge phase when complete:
git checkout feature/clockify-inspired-redesign
git pull origin feature/clockify-inspired-redesign
git merge feature/clockify-inspired-redesign/phase-1-timer-bar
git push origin feature/clockify-inspired-redesign
```
