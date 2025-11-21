// XanoScript for Available Inspection Time Slots Endpoint
// Workspace: FR LLC (#5)
// API Group: NeOYcc44 (API_V2_BASE_URL)
//
// Endpoint: GET /available-inspection-time-slots
// Purpose: Returns only available inspection time slots (not already booked)
//          Each slot can only have one appointment (enforced by booking status check)

api "available-inspection-time-slots" {
  method = GET
  auth = false  // Set to true if you want authentication required
  
  // Query parameters
  query {
    date? {
      type = date
      description = "Filter by specific date (optional)"
    }
    start_date? {
      type = date
      description = "Filter slots from this date onwards (optional)"
    }
    end_date? {
      type = date
      description = "Filter slots up to this date (optional)"
    }
    inspector_id? {
      type = uuid
      description = "Filter by inspector ID (optional)"
    }
  }
  
  // Function logic
  function {
    // Step 1: Get base query for inspection_time_slots
    // Only get slots where is_available = true
    base_query = database.inspection_time_slots
      .filter(is_available == true)
    
    // Step 2: Apply date filters if provided
    if (query.date) {
      base_query = base_query.filter(slot_date == query.date)
    }
    if (query.start_date) {
      base_query = base_query.filter(slot_date >= query.start_date)
    }
    if (query.end_date) {
      base_query = base_query.filter(slot_date <= query.end_date)
    }
    
    // Step 3: Apply inspector filter if provided
    if (query.inspector_id) {
      base_query = base_query.filter(
        (inspector_id == query.inspector_id) || (inspector_id == null)
      )
    }
    
    // Step 4: Get all slots matching the filters
    all_slots = base_query.get()
    
    // Step 5: Get all confirmed/pending bookings to exclude booked slots
    bookings = database.inspection_bookings
      .filter(
        (booking_status == "confirmed") || 
        (booking_status == "pending")
      )
      .get()
    
    // Step 6: Create a set of booked time_slot_ids
    booked_slot_ids = bookings
      .filter(time_slot_id != null)
      .map(time_slot_id)
      .unique()
    
    // Step 7: Filter out slots that are already booked
    available_slots = all_slots
      .filter(id not in booked_slot_ids)
    
    // Step 8: Sort by date and time
    sorted_slots = available_slots
      .sort(slot_date asc, start_time asc)
    
    // Step 9: Return the available slots
    return {
      slots: sorted_slots,
      count: sorted_slots.length
    }
  }
  
  // Response format
  response {
    slots: array {
      id: uuid
      inspector_id: uuid?
      slot_date: date
      start_time: text
      end_time: text
      recurrence_pattern: text?
      recurrence_interval: int?
      days_of_week: json?
      recurrence_end_date: date?
      is_available: bool
      notes: text?
      created_at: text?
      updated_at: text?
    }
    count: int
  }
}

