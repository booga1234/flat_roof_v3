// XanoScript Table Definitions for Inspection & Calendar Booking System
// Workspace: FR LLC (#5)
// 
// To apply these tables in Xano:
// 1. Go to your Xano workspace
// 2. Navigate to Database > Tables
// 3. Create each table using the XanoScript editor or UI
// 4. Copy and paste each table definition

// ============================================
// Table 1: lead
// ============================================
// Lead records for potential customers (created when someone calls or contacts)
table "lead" {
  auth = false
  schema {
    uuid id {
      description = "Unique identifier for the lead"
    }

    text Name filters=trim {
      description = "Lead name (customer name)"
    }

    text email? filters=trim|lower {
      description = "Lead email address"
    }

    text phone? filters=trim {
      description = "Lead phone number"
    }

    uuid property_id? {
      table = "properties"
      description = "Foreign key reference to properties table"
    }

    text address? {
      description = "Legacy address field (deprecated - use property_id instead)"
    }

    text status? filters=trim {
      description = "Lead status: 'new', 'contacted', 'qualified', 'converted', 'lost'"
    }

    uuid lead_source_id? {
      table = "lead_sources"
      description = "Foreign key reference to lead_sources"
    }

    text notes? {
      description = "General notes about the lead"
    }

    text internal_notes? {
      description = "Internal notes (not visible to customer)"
    }

    uuid assigned_to_id? {
      table = "team"
      description = "Team member assigned to this lead"
    }

    text created_at? {
      description = "Timestamp when the lead was created (ISO 8601 format)"
    }

    text updated_at? {
      description = "Timestamp when the lead was last updated (ISO 8601 format)"
    }
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "status", op: "asc"}]}
    {type: "btree", field: [{name: "lead_source_id", op: "asc"}]}
    {type: "btree", field: [{name: "property_id", op: "asc"}]}
    {type: "btree", field: [{name: "assigned_to_id", op: "asc"}]}
    {type: "btree", field: [{name: "email", op: "asc"}]}
    {type: "btree", field: [{name: "phone", op: "asc"}]}
    {
      type: "btree"
      field: [
        {name: "status", op: "asc"}
        {name: "created_at", op: "desc"}
      ]
    }
  ]
}

// ============================================
// Table 2: inspection_types
// ============================================
// Predefined types of inspections (e.g., "Initial Inspection", "Follow-up", "Warranty")
table "inspection_types" {
  auth = false
  schema {
    uuid id {
      description = "Unique identifier for the inspection type"
    }

    text name filters=trim {
      description = "Inspection type name (e.g., 'Initial Inspection', 'Follow-up', 'Warranty')"
    }

    text description? {
      description = "Description of what this inspection type entails"
    }

    int default_duration_minutes? {
      description = "Default duration in minutes for this inspection type"
    }

    int sort_order? {
      description = "Display order for sorting types"
    }

    bool active?=true {
      description = "Whether this inspection type is currently active"
    }

    text created_at? {
      description = "Timestamp when the inspection type was created (ISO 8601 format)"
    }

    text updated_at? {
      description = "Timestamp when the inspection type was last updated (ISO 8601 format)"
    }
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "sort_order", op: "asc"}]}
    {type: "btree", field: [{name: "active", op: "asc"}]}
  ]
}

// ============================================
// Table 3: inspection_time_slots
// ============================================
// Defines available time slots for booking inspections
// Can be recurring patterns or one-off availability
table "inspection_time_slots" {
  auth = false
  schema {
    uuid id {
      description = "Unique identifier for the time slot"
    }

    uuid inspector_id? {
      table = "team"
      description = "Foreign key reference to team (inspector). Null means any inspector can use this slot"
    }

    date slot_date {
      description = "Date of the time slot"
    }

    text start_time filters=trim {
      description = "Start time of the slot (e.g., '09:00:00' or '09:00')"
    }

    text end_time filters=trim {
      description = "End time of the slot (e.g., '10:00:00' or '10:00')"
    }

    text recurrence_pattern? filters=trim {
      description = "Recurrence pattern: 'daily', 'weekly', 'monthly', 'none' (for one-off slots)"
    }

    int recurrence_interval? {
      description = "Interval for recurrence (e.g., every 2 weeks)"
    }

    json days_of_week? {
      description = "Array of days for weekly recurrence [0-6, Sunday=0] (e.g., [1,3,5] for Mon,Wed,Fri)"
    }

    date recurrence_end_date? {
      description = "End date for recurring slots (null = no end)"
    }

    bool is_available?=true {
      description = "Whether this slot is currently available for booking"
    }

    text notes? {
      description = "Additional notes about this time slot"
    }

    text created_at? {
      description = "Timestamp when the time slot was created (ISO 8601 format)"
    }

    text updated_at? {
      description = "Timestamp when the time slot was last updated (ISO 8601 format)"
    }
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "inspector_id", op: "asc"}]}
    {type: "btree", field: [{name: "slot_date", op: "asc"}]}
    {
      type: "btree"
      field: [
        {name: "slot_date", op: "asc"}
        {name: "start_time", op: "asc"}
      ]
    }
    {type: "btree", field: [{name: "is_available", op: "asc"}]}
  ]
}

// ============================================
// Table 4: inspections
// ============================================
// Core inspection record - links to jobs, inspectors, and bookings
table "inspections" {
  auth = false
  schema {
    uuid id {
      description = "Unique identifier for the inspection"
    }

    uuid lead_id? {
      table = "lead"
      description = "Foreign key reference to lead table (for when someone calls)"
    }

    uuid job_id? {
      table = "jobs"
      description = "Foreign key reference to jobs (nullable - inspections can be standalone)"
    }

    uuid inspection_type_id {
      table = "inspection_types"
      description = "Foreign key reference to inspection_types"
    }

    uuid inspector_id? {
      table = "team"
      description = "Foreign key reference to team (assigned inspector)"
    }

    text status filters=trim {
      description = "Inspection status: 'scheduled', 'in_progress', 'completed', 'cancelled', 'rescheduled'"
    }

    text scheduled_start_time? {
      description = "Scheduled start time for the inspection (ISO 8601 format)"
    }

    text scheduled_end_time? {
      description = "Scheduled end time for the inspection (ISO 8601 format)"
    }

    text actual_start_time? {
      description = "Actual start time (filled when inspection begins, ISO 8601 format)"
    }

    text actual_end_time? {
      description = "Actual end time (filled when inspection completes, ISO 8601 format)"
    }

    uuid property_id? {
      table = "properties"
      description = "Foreign key reference to properties table (inspection location)"
    }

    text location_address? {
      description = "Legacy address field (deprecated - use property_id instead)"
    }

    text company_name? filters=trim {
      description = "Company name for the inspection"
    }

    text customer_name? filters=trim {
      description = "Customer name for the inspection"
    }

    text customer_phone? filters=trim {
      description = "Customer phone number"
    }

    text customer_email? filters=trim|lower {
      description = "Customer email address"
    }

    text roof_accessible? filters=trim {
      description = "Is roof accessible? Enum: 'yes', 'no', 'partial', 'unknown'"
    }

    text reason_for_inspection? {
      description = "Reason for inspection (text area input)"
    }

    bool person_present? {
      description = "Will the person be present at the inspection?"
    }

    text notes? {
      description = "General notes about the inspection"
    }

    text internal_notes? {
      description = "Internal notes (not visible to customer)"
    }

    decimal estimated_duration_minutes? {
      description = "Estimated duration in minutes"
    }

    bool requires_follow_up?=false {
      description = "Whether this inspection requires a follow-up"
    }

    uuid follow_up_inspection_id? {
      table = "inspections"
      description = "Reference to follow-up inspection if one was created"
    }

    text created_at? {
      description = "Timestamp when the inspection was created (ISO 8601 format)"
    }

    text updated_at? {
      description = "Timestamp when the inspection was last updated (ISO 8601 format)"
    }
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "lead_id", op: "asc"}]}
    {type: "btree", field: [{name: "property_id", op: "asc"}]}
    {type: "btree", field: [{name: "job_id", op: "asc"}]}
    {type: "btree", field: [{name: "inspection_type_id", op: "asc"}]}
    {type: "btree", field: [{name: "inspector_id", op: "asc"}]}
    {type: "btree", field: [{name: "status", op: "asc"}]}
    {type: "btree", field: [{name: "scheduled_start_time", op: "asc"}]}
    {
      type: "btree"
      field: [
        {name: "status", op: "asc"}
        {name: "scheduled_start_time", op: "asc"}
      ]
    }
  ]
}

// ============================================
// Table 5: inspection_bookings
// ============================================
// Links inspections to specific time slots
// Handles the booking relationship and allows rescheduling
table "inspection_bookings" {
  auth = false
  schema {
    uuid id {
      description = "Unique identifier for the booking"
    }

    uuid inspection_id {
      table = "inspections"
      description = "Foreign key reference to inspections"
    }

    uuid time_slot_id? {
      table = "inspection_time_slots"
      description = "Foreign key reference to inspection_time_slots (nullable for manual bookings)"
    }

    text booking_status filters=trim {
      description = "Booking status: 'confirmed', 'pending', 'cancelled', 'rescheduled'"
    }

    text booked_at? {
      description = "Timestamp when the booking was made (ISO 8601 format)"
    }

    uuid booked_by_id? {
      table = "team"
      description = "Team member who made the booking"
    }

    text cancellation_reason? {
      description = "Reason for cancellation if cancelled"
    }

    text cancelled_at? {
      description = "Timestamp when booking was cancelled (ISO 8601 format)"
    }

    uuid rescheduled_from_booking_id? {
      table = "inspection_bookings"
      description = "Reference to previous booking if this was a reschedule"
    }

    text notes? {
      description = "Additional notes about the booking"
    }

    text created_at? {
      description = "Timestamp when the booking was created (ISO 8601 format)"
    }

    text updated_at? {
      description = "Timestamp when the booking was last updated (ISO 8601 format)"
    }
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree|unique", field: [{name: "inspection_id", op: "asc"}]}
    {type: "btree", field: [{name: "time_slot_id", op: "asc"}]}
    {type: "btree", field: [{name: "booking_status", op: "asc"}]}
  ]
}

// ============================================
// Table 6: inspection_results
// ============================================
// Detailed results and findings from completed inspections
table "inspection_results" {
  auth = false
  schema {
    uuid id {
      description = "Unique identifier for the inspection result"
    }

    uuid inspection_id {
      table = "inspections"
      description = "Foreign key reference to inspections"
    }

    text overall_condition? {
      description = "Overall condition assessment (e.g., 'Good', 'Fair', 'Poor', 'Critical')"
    }

    text decking_type? filters=trim {
      description = "Decking type: 'wood', 'metal', 'concrete'"
    }

    text insulation_location? filters=trim {
      description = "Insulation under or above decking: 'under', 'above', 'both', 'none'"
    }

    json best_options? {
      description = "Best option(s) as JSON array: ['Repairs', 'Restoration', 'Overlay', 'Tear Off']"
    }

    bool offer_maintenance?=false {
      description = "Offer maintenance option"
    }

    text findings? {
      description = "Detailed findings from the inspection"
    }

    text recommendations? {
      description = "Recommendations based on inspection findings"
    }

    text additional_notes? {
      description = "Space for additional notes"
    }

    bool requires_repair?=false {
      description = "Whether repairs are needed"
    }

    bool requires_replacement?=false {
      description = "Whether replacement is needed"
    }

    decimal estimated_repair_cost? {
      description = "Estimated cost for repairs if needed"
    }

    text weather_conditions? filters=trim {
      description = "Weather conditions during inspection"
    }

    decimal temperature_fahrenheit? {
      description = "Temperature in Fahrenheit during inspection"
    }

    json damage_areas? {
      description = "JSON array of damage areas found (e.g., [{'area': 'North side', 'severity': 'moderate'}])"
    }

    text next_steps? {
      description = "Recommended next steps"
    }

    text completed_at? {
      description = "Timestamp when results were finalized (ISO 8601 format)"
    }

    uuid completed_by_id? {
      table = "team"
      description = "Team member who completed/finalized the results"
    }

    text created_at? {
      description = "Timestamp when the result was created (ISO 8601 format)"
    }

    text updated_at? {
      description = "Timestamp when the result was last updated (ISO 8601 format)"
    }
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree|unique", field: [{name: "inspection_id", op: "asc"}]}
    {type: "btree", field: [{name: "requires_repair", op: "asc"}]}
  ]
}

// ============================================
// Table 7: inspection_checklist
// ============================================
// Checklist items for inspections (front photo, roof photos, etc.)
table "inspection_checklist" {
  auth = false
  schema {
    uuid id {
      description = "Unique identifier for the checklist item"
    }

    uuid inspection_id {
      table = "inspections"
      description = "Foreign key reference to inspections"
    }

    text checklist_item filters=trim {
      description = "Checklist item name (e.g., 'Take photo of front of building', 'Take 3-5 photos of general roof area')"
    }

    bool completed?=false {
      description = "Whether this checklist item has been completed"
    }

    text notes? {
      description = "Notes about this checklist item"
    }

    text completed_at? {
      description = "Timestamp when checklist item was completed (ISO 8601 format)"
    }

    uuid completed_by_id? {
      table = "team"
      description = "Team member who completed this checklist item"
    }

    text created_at? {
      description = "Timestamp when the checklist item was created (ISO 8601 format)"
    }

    text updated_at? {
      description = "Timestamp when the checklist item was last updated (ISO 8601 format)"
    }
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "inspection_id", op: "asc"}]}
    {type: "btree", field: [{name: "completed", op: "asc"}]}
  ]
}

// ============================================
// Table 8: inspection_drains
// ============================================
// Drain information per side of the building
table "inspection_drains" {
  auth = false
  schema {
    uuid id {
      description = "Unique identifier for the drain record"
    }

    uuid inspection_id {
      table = "inspections"
      description = "Foreign key reference to inspections"
    }

    text side filters=trim {
      description = "Side of the building: 'north', 'south', 'east', 'west', 'northeast', 'northwest', 'southeast', 'southwest', 'center', 'other'"
    }

    int drains_count?=0 {
      description = "Number of drains on this side"
    }

    int scuppers_count?=0 {
      description = "Number of scuppers on this side"
    }

    int downspouts_count?=0 {
      description = "Number of downspouts on this side"
    }

    text notes? {
      description = "Additional notes about drains on this side"
    }

    text created_at? {
      description = "Timestamp when the drain record was created (ISO 8601 format)"
    }

    text updated_at? {
      description = "Timestamp when the drain record was last updated (ISO 8601 format)"
    }
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "inspection_id", op: "asc"}]}
    {type: "btree", field: [{name: "side", op: "asc"}]}
    {
      type: "btree"
      field: [
        {name: "inspection_id", op: "asc"}
        {name: "side", op: "asc"}
      ]
    }
  ]
}

// ============================================
// Table 9: inspection_penetrations
// ============================================
// Penetration information per side of the building
table "inspection_penetrations" {
  auth = false
  schema {
    uuid id {
      description = "Unique identifier for the penetration record"
    }

    uuid inspection_id {
      table = "inspections"
      description = "Foreign key reference to inspections"
    }

    text side filters=trim {
      description = "Side of the building: 'north', 'south', 'east', 'west', 'northeast', 'northwest', 'southeast', 'southwest', 'center', 'other'"
    }

    int pipes_count?=0 {
      description = "Number of pipes on this side"
    }

    int vents_count?=0 {
      description = "Number of vents on this side"
    }

    int skylights_count?=0 {
      description = "Number of skylights on this side"
    }

    text notes? {
      description = "Additional notes about penetrations on this side"
    }

    text created_at? {
      description = "Timestamp when the penetration record was created (ISO 8601 format)"
    }

    text updated_at? {
      description = "Timestamp when the penetration record was last updated (ISO 8601 format)"
    }
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "inspection_id", op: "asc"}]}
    {type: "btree", field: [{name: "side", op: "asc"}]}
    {
      type: "btree"
      field: [
        {name: "inspection_id", op: "asc"}
        {name: "side", op: "asc"}
      ]
    }
  ]
}

// ============================================
// Table 10: inspection_problem_areas
// ============================================
// Problem areas with notes and images (like blocks that can be added)
table "inspection_problem_areas" {
  auth = false
  schema {
    uuid id {
      description = "Unique identifier for the problem area"
    }

    uuid inspection_id {
      table = "inspections"
      description = "Foreign key reference to inspections"
    }

    text area_name? filters=trim {
      description = "Name or description of the problem area (e.g., 'North corner', 'Membrane tear near drain')"
    }

    text location? filters=trim {
      description = "Location of the problem area (e.g., 'North side', 'Center of roof')"
    }

    text notes? {
      description = "Notes about the problem area (membrane notes, concerns, etc.)"
    }

    text severity? filters=trim {
      description = "Severity level: 'minor', 'moderate', 'severe', 'critical'"
    }

    int sort_order? {
      description = "Display order for sorting problem areas"
    }

    text created_at? {
      description = "Timestamp when the problem area was created (ISO 8601 format)"
    }

    text updated_at? {
      description = "Timestamp when the problem area was last updated (ISO 8601 format)"
    }
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "inspection_id", op: "asc"}]}
    {type: "btree", field: [{name: "severity", op: "asc"}]}
    {type: "btree", field: [{name: "sort_order", op: "asc"}]}
  ]
}

// ============================================
// Table 11: lead_sources
// ============================================
// Predefined lead sources (phone, website, referral, etc.)
table "lead_sources" {
  auth = false
  schema {
    uuid id {
      description = "Unique identifier for the lead source"
    }

    text name filters=trim {
      description = "Lead source name (e.g., 'Phone', 'Website', 'Referral', 'Walk-in', 'Social Media', 'Google Ads', 'Other')"
    }

    text description? {
      description = "Description of the lead source"
    }

    int sort_order? {
      description = "Display order for sorting sources"
    }

    bool active?=true {
      description = "Whether this lead source is currently active"
    }

    text created_at? {
      description = "Timestamp when the lead source was created (ISO 8601 format)"
    }

    text updated_at? {
      description = "Timestamp when the lead source was last updated (ISO 8601 format)"
    }
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "sort_order", op: "asc"}]}
    {type: "btree", field: [{name: "active", op: "asc"}]}
    {type: "btree|unique", field: [{name: "name", op: "asc"}]}
  ]
}

// ============================================
// Table 13: properties
// ============================================
// Property/address records for buildings and locations
table "properties" {
  auth = false
  schema {
    uuid id {
      description = "Unique identifier for the property"
    }

    text street_address filters=trim {
      description = "Street address (e.g., '123 Main St')"
    }

    text city? filters=trim {
      description = "City"
    }

    text state? filters=trim {
      description = "State (e.g., 'CA', 'NY')"
    }

    text zip_code? filters=trim {
      description = "ZIP code"
    }

    text country? filters=trim {
      description = "Country (default: 'USA')"
    }

    text property_type? filters=trim {
      description = "Property type: 'residential', 'commercial', 'industrial', 'mixed', 'other'"
    }

    text building_name? filters=trim {
      description = "Building name (e.g., 'Downtown Office Complex')"
    }

    text unit_number? filters=trim {
      description = "Unit number or suite (e.g., 'Suite 200', 'Unit 5')"
    }

    decimal latitude? {
      description = "Latitude coordinate for mapping"
    }

    decimal longitude? {
      description = "Longitude coordinate for mapping"
    }

    text notes? {
      description = "Additional notes about the property"
    }

    text created_at? {
      description = "Timestamp when the property was created (ISO 8601 format)"
    }

    text updated_at? {
      description = "Timestamp when the property was last updated (ISO 8601 format)"
    }
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "city", op: "asc"}]}
    {type: "btree", field: [{name: "state", op: "asc"}]}
    {type: "btree", field: [{name: "zip_code", op: "asc"}]}
    {type: "btree", field: [{name: "property_type", op: "asc"}]}
    {
      type: "btree"
      field: [
        {name: "street_address", op: "asc"}
        {name: "city", op: "asc"}
        {name: "state", op: "asc"}
      ]
    }
  ]
}

// ============================================
// Table 14: media
// ============================================
// Generic media table for storing photos/files across the entire system
// Can be linked to inspections, repairs, estimates, materials, projects, etc.
table "media" {
  auth = false
  schema {
    uuid id {
      description = "Unique identifier for the media record"
    }

    text file_url {
      description = "URL to the media file (from Xano file storage or external URL)"
    }

    text media_type filters=trim {
      description = "Type of media: 'inspection', 'repair', 'estimate', 'material', 'project', 'job', etc."
    }

    text related_table filters=trim {
      description = "The table this media belongs to (e.g., 'inspections', 'projects', 'materials', 'jobs')"
    }

    uuid related_id {
      description = "The ID of the record in the related_table"
    }

    text caption? {
      description = "Optional caption or description for the media"
    }

    uuid uploaded_by_id? {
      table = "team"
      description = "Team member who uploaded the media"
    }

    text created_at? {
      description = "Timestamp when the media record was created (ISO 8601 format)"
    }

    text updated_at? {
      description = "Timestamp when the media record was last updated (ISO 8601 format)"
    }
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "media_type", op: "asc"}]}
    {type: "btree", field: [{name: "related_table", op: "asc"}]}
    {type: "btree", field: [{name: "related_id", op: "asc"}]}
    {
      type: "btree"
      field: [
        {name: "related_table", op: "asc"}
        {name: "related_id", op: "asc"}
      ]
    }
    {
      type: "btree"
      field: [
        {name: "media_type", op: "asc"}
        {name: "related_table", op: "asc"}
        {name: "related_id", op: "asc"}
      ]
    }
    {type: "btree", field: [{name: "uploaded_by_id", op: "asc"}]}
  ]
}

