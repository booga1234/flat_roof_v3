# Inspection System Design - Brainstorming Document
## Xano Workspace #5 (FR LLC)

## Current State Analysis

### Existing Tables
- ✅ `lead` (id: 48) - Already exists
- ✅ `media_library` (id: 50) - Exists, but we'll use generic `media` table
- ✅ `jobs` (id: 53) - Exists
- ✅ `location` (id: 54) - Exists
- ✅ `client` (id: 55) - Exists
- ✅ `contacts` (id: 56) - Exists
- ✅ `team` (id: 57) - Exists (for inspectors)

### Existing APIs (V1 - App ID 22)
- ✅ `GET /available-inspection-slots` - Currently hardcoded, needs proper time slots table
- ✅ `POST /schedule-inspection` - Creates lead + inspection, but inspection table seems incomplete

### Current Issues
1. Inspection scheduling uses hardcoded logic instead of time slots table
2. No proper `inspections` table structure visible
3. No rescheduling capability
4. No inspection notes system
5. Media is in `media_library` but should be generic `media` table

---

## Proposed Database Structure

### 1. **inspection_types** (NEW)
**Purpose:** Predefined types of inspections
- Initial Inspection
- Follow-up Inspection
- Warranty Inspection
- Damage Assessment
- Pre-work Inspection
- Post-work Inspection

**Fields:**
- `id` (uuid)
- `name` (text) - "Initial Inspection", "Follow-up", etc.
- `description` (text, optional)
- `default_duration_minutes` (int, optional) - e.g., 60, 90
- `sort_order` (int, optional)
- `active` (bool, default: true)
- `created_at` (text, ISO 8601)
- `updated_at` (text, ISO 8601)

**Why:** Standardizes inspection types, makes reporting easier, allows default durations

---

### 2. **inspection_time_slots** (NEW)
**Purpose:** Available time slots for booking (replaces hardcoded logic)

**Fields:**
- `id` (uuid)
- `inspector_id` (uuid, optional) - Links to `team` table, null = any inspector
- `slot_date` (date) - The date of the slot
- `start_time` (text) - "09:00" or "09:00:00"
- `end_time` (text) - "10:00" or "10:00:00"
- `recurrence_pattern` (text, optional) - "daily", "weekly", "monthly", "none"
- `recurrence_interval` (int, optional) - e.g., every 2 weeks
- `days_of_week` (json, optional) - [1,3,5] for Mon,Wed,Fri
- `recurrence_end_date` (date, optional) - When recurring slots end
- `is_available` (bool, default: true)
- `notes` (text, optional)
- `created_at` (text, ISO 8601)
- `updated_at` (text, ISO 8601)

**Why:** 
- Replaces hardcoded availability logic
- Supports recurring patterns (e.g., every Monday/Wednesday/Friday 9-11 AM)
- Can be inspector-specific or general
- Flexible for one-off slots or recurring schedules

**Usage Examples:**
- Recurring: Every Mon/Wed/Fri 9-11 AM for next 3 months
- One-off: Specific date/time for special appointment
- Inspector-specific: John's availability Mon-Fri 8-5

---

### 3. **inspections** (NEW/REPLACE)
**Purpose:** Core inspection record

**Fields:**
- `id` (uuid)
- `lead_id` (uuid, optional) - **Links to existing `lead` table**
- `job_id` (uuid, optional) - Links to `jobs` if inspection is for existing job
- `inspection_type_id` (uuid) - Links to `inspection_types`
- `inspector_id` (uuid, optional) - Links to `team` table
- `status` (text) - "scheduled", "in_progress", "completed", "cancelled", "rescheduled"
- `scheduled_start_time` (text, ISO 8601) - When inspection is scheduled
- `scheduled_end_time` (text, ISO 8601) - When inspection should end
- `actual_start_time` (text, ISO 8601, optional) - When inspection actually started
- `actual_end_time` (text, ISO 8601, optional) - When inspection actually ended
- `location_address` (text, optional) - Can override lead/job location
- `customer_name` (text, optional) - Quick reference
- `customer_phone` (text, optional) - Quick reference
- `customer_email` (text, optional) - Quick reference
- `notes` (text, optional) - General notes
- `internal_notes` (text, optional) - Internal-only notes
- `estimated_duration_minutes` (decimal, optional)
- `requires_follow_up` (bool, default: false)
- `follow_up_inspection_id` (uuid, optional) - Self-reference for follow-ups
- `created_at` (text, ISO 8601)
- `updated_at` (text, ISO 8601)

**Why:**
- Central record for all inspections
- Links to existing `lead` table (your requirement)
- Can be standalone or linked to jobs
- Tracks status through lifecycle
- Supports follow-up inspections

**Relationship to Leads:**
- `lead_id` → `lead` table
- When someone calls/contacts, create lead first, then book inspection
- Inspection can exist without lead (direct booking), but typically linked

---

### 4. **inspection_bookings** (NEW)
**Purpose:** Links inspections to time slots, handles rescheduling

**Fields:**
- `id` (uuid)
- `inspection_id` (uuid) - Links to `inspections`
- `time_slot_id` (uuid, optional) - Links to `inspection_time_slots` (nullable for manual bookings)
- `booking_status` (text) - "confirmed", "pending", "cancelled", "rescheduled"
- `booked_at` (text, ISO 8601) - When booking was made
- `booked_by_id` (uuid, optional) - User who made booking (from `team`)
- `cancellation_reason` (text, optional)
- `cancelled_at` (text, ISO 8601, optional)
- `rescheduled_from_booking_id` (uuid, optional) - **Links to previous booking for rescheduling**
- `notes` (text, optional)
- `created_at` (text, ISO 8601)
- `updated_at` (text, ISO 8601)

**Why:**
- Separates booking logic from inspection record
- Enables rescheduling (via `rescheduled_from_booking_id`)
- Tracks booking history
- Can handle manual bookings (no time slot) or slot-based bookings

**Rescheduling Flow:**
1. Mark old booking as "rescheduled"
2. Create new booking with `rescheduled_from_booking_id` pointing to old booking
3. Update inspection `scheduled_start_time` and `scheduled_end_time`

---

### 5. **inspection_results** (NEW)
**Purpose:** Detailed findings and notes from completed inspections

**Fields:**
- `id` (uuid)
- `inspection_id` (uuid) - Links to `inspections` (one-to-one)
- `overall_condition` (text, optional) - "Good", "Fair", "Poor", "Critical"
- `findings` (text, optional) - Detailed findings
- `recommendations` (text, optional) - What should be done
- `requires_repair` (bool, default: false)
- `requires_replacement` (bool, default: false)
- `estimated_repair_cost` (decimal, optional)
- `weather_conditions` (text, optional)
- `temperature_fahrenheit` (decimal, optional)
- `damage_areas` (json, optional) - Array of damage locations
- `next_steps` (text, optional)
- `completed_at` (text, ISO 8601, optional)
- `completed_by_id` (uuid, optional) - Inspector who completed
- `created_at` (text, ISO 8601)
- `updated_at` (text, ISO 8601)

**Why:**
- Separates inspection metadata from results
- Allows inspector to take notes during/after inspection
- Can be filled incrementally (start with basic notes, add details later)
- Supports structured data (damage areas as JSON)

---

### 6. **media** (NEW - REPLACES media_library)
**Purpose:** Generic media table for all photos/files (inspections, repairs, estimates, materials, etc.)

**Fields:**
- `id` (uuid)
- `file_url` (text) - URL to the file (Xano file storage or external)
- `media_type` (text) - "inspection", "repair", "estimate", "material", "project", "job", "lead"
- `related_table` (text) - "inspections", "repairs", "estimates", "materials", "jobs", "leads"
- `related_id` (uuid) - ID of the record in related_table
- `caption` (text, optional)
- `uploaded_by_id` (uuid, optional) - Links to `team`
- `created_at` (text, ISO 8601)
- `updated_at` (text, ISO 8601)

**Why:**
- Single table for all media across the system
- Flexible linking via `related_table` + `related_id`
- Can query: "Get all inspection photos" or "Get all media for this lead"
- Replaces `media_library` with more flexible structure

**Usage:**
```javascript
// Inspection photo
{ media_type: "inspection", related_table: "inspections", related_id: "..." }

// Lead photo
{ media_type: "lead", related_table: "leads", related_id: "..." }

// Material photo
{ media_type: "material", related_table: "materials", related_id: "..." }
```

---

## Data Flow & Relationships

### Booking Flow
```
1. User selects available time slot
   ↓
2. Create/select lead (if new customer, create lead first)
   ↓
3. Create inspection record (linked to lead)
   ↓
4. Create inspection_booking (links inspection to time slot)
   ↓
5. Mark time slot as unavailable (or create booking record)
```

### Rescheduling Flow
```
1. Find existing inspection_booking
   ↓
2. Mark old booking as "rescheduled"
   ↓
3. Select new time slot
   ↓
4. Create new inspection_booking with rescheduled_from_booking_id
   ↓
5. Update inspection scheduled_start_time/end_time
```

### Inspection Execution Flow
```
1. Inspector arrives → Update inspection status to "in_progress"
   ↓
2. Set actual_start_time
   ↓
3. Take notes in inspection_results (can be done incrementally)
   ↓
4. Upload photos → Create media records
   ↓
5. Complete inspection → Update status to "completed"
   ↓
6. Set actual_end_time, completed_at
   ↓
7. Finalize inspection_results
```

---

## Integration with Existing Tables

### Lead Table Integration
- **inspections.lead_id** → **lead.id**
- When someone calls for inspection:
  1. Create lead (or find existing)
  2. Create inspection linked to lead
  3. Book time slot

### Job Table Integration
- **inspections.job_id** → **jobs.id** (optional)
- Inspection can be for:
  - New lead (standalone, just lead_id)
  - Existing job (job_id, may also have lead_id)

### Team Table Integration
- **inspections.inspector_id** → **team.id**
- **inspection_time_slots.inspector_id** → **team.id**
- **inspection_bookings.booked_by_id** → **team.id**

### Location Table Integration
- Can use existing `location` table if needed
- Or store `location_address` directly in inspection
- Depends on your location table structure

---

## API Endpoints Needed

### Time Slots
- `GET /inspection-time-slots` - Get available slots (filter by date, inspector)
- `POST /inspection-time-slots` - Create time slot(s)
- `PATCH /inspection-time-slots/:id` - Update time slot
- `DELETE /inspection-time-slots/:id` - Delete time slot

### Inspections
- `GET /inspections` - List inspections (with filters: status, date, inspector, lead)
- `GET /inspections/:id` - Get single inspection (with related data)
- `POST /inspections` - Create inspection
- `PATCH /inspections/:id` - Update inspection
- `DELETE /inspections/:id` - Cancel inspection

### Bookings
- `POST /inspection-bookings` - Book inspection
- `PATCH /inspection-bookings/:id` - Update booking (for rescheduling)
- `POST /inspection-bookings/:id/reschedule` - Reschedule booking
- `GET /inspection-bookings` - List bookings

### Results
- `GET /inspection-results/:inspection_id` - Get results for inspection
- `POST /inspection-results` - Create/update results
- `PATCH /inspection-results/:id` - Update results

### Media
- `POST /media` - Upload media (generic, works for all types)
- `GET /media` - Get media (filter by media_type, related_table, related_id)
- `DELETE /media/:id` - Delete media

---

## Key Design Decisions

### 1. Lead Connection
✅ **Decision:** `inspections.lead_id` links to existing `lead` table
- Supports "when someone calls" workflow
- Inspection can exist without lead (direct booking)
- Lead can have multiple inspections (follow-ups)

### 2. Rescheduling
✅ **Decision:** Use `inspection_bookings.rescheduled_from_booking_id`
- Maintains history of all booking attempts
- Can track why rescheduled (via notes)
- Old booking marked as "rescheduled", new one as "confirmed"

### 3. Time Slots vs Manual Booking
✅ **Decision:** Support both
- `time_slot_id` can be null for manual bookings
- Allows flexibility for special appointments
- Most bookings will use time slots

### 4. Inspection Notes
✅ **Decision:** Separate `inspection_results` table
- Allows incremental note-taking
- Can start with basic notes, add details later
- Separates scheduling metadata from inspection findings

### 5. Media Table
✅ **Decision:** Generic `media` table (replaces `media_library`)
- Single source of truth for all media
- Flexible linking via `related_table` + `related_id`
- Can query by type or by related record

### 6. Status Tracking
✅ **Decision:** Status in `inspections` table
- Simple status field: "scheduled", "in_progress", "completed", "cancelled", "rescheduled"
- Easy to filter and report on
- Can add more statuses later if needed

---

## Migration Considerations

### From Current System
1. **Existing `/schedule-inspection` API:**
   - Currently creates lead + inspection in unnamed table
   - Need to migrate to new `inspections` table structure
   - Update API to use proper table names

2. **Existing `/available-inspection-slots` API:**
   - Currently hardcoded logic
   - Replace with query to `inspection_time_slots` table
   - Support recurring patterns

3. **Existing `media_library` table:**
   - Decide: Migrate to `media` table or keep both?
   - If migrate: Map old records to new structure
   - If keep both: Use `media` for new records, `media_library` for legacy

---

## Questions to Consider

1. **Time Slot Management:**
   - Who can create time slots? (Admin only? Inspectors?)
   - How far in advance can slots be booked?
   - Buffer time between inspections?

2. **Lead Creation:**
   - Auto-create lead when booking inspection?
   - Or require lead to exist first?
   - What if same person books multiple times?

3. **Inspector Assignment:**
   - Auto-assign based on availability?
   - Manual assignment only?
   - Can customer choose inspector?

4. **Notifications:**
   - Email/SMS confirmations?
   - Reminder notifications?
   - Rescheduling notifications?

5. **Recurring Slots:**
   - How to handle holidays?
   - Can slots be temporarily disabled?
   - How to handle inspector time off?

6. **Media:**
   - File size limits?
   - Image compression?
   - Video support?

---

## Next Steps

1. ✅ Review this design document
2. ✅ Confirm table structure matches your needs
3. ✅ Decide on migration strategy for existing data
4. ✅ Get XanoScript for all tables
5. ✅ Create tables in Xano
6. ✅ Build API endpoints
7. ✅ Update frontend to use new APIs

---

## Summary

**New Tables Needed:**
1. `inspection_types` - Predefined types
2. `inspection_time_slots` - Available booking slots
3. `inspections` - Core inspection records (links to `lead`)
4. `inspection_bookings` - Booking records (enables rescheduling)
5. `inspection_results` - Inspection notes and findings
6. `media` - Generic media table (replaces `media_library`)

**Key Features:**
- ✅ Booking system (no Calendly needed)
- ✅ Rescheduling capability
- ✅ Links to existing `lead` table
- ✅ Inspection notes system
- ✅ Generic media table for all photos

**Integration:**
- Works with existing `lead`, `jobs`, `team`, `location` tables
- Replaces hardcoded inspection logic
- Flexible and extensible

