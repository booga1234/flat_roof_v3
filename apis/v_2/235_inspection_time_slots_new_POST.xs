// Create a new inspection time slot
query "inspection-time-slots-new" verb=POST {
  auth = "user"

  input {
    // Start time (e.g., '1:00 PM') or timestamp
    text start_time
  
    // End time (e.g., '6:00 PM') or timestamp
    text end_time
  
    // Days of week object (e.g., {sunday: true, monday: true})
    json days_of_week?
  
    // Repeat pattern (Daily, Weekly, Monthly, Yearly)
    text recurrence_pattern?=Daily
  
    // Whether the time slot is available
    bool is_available?=true
  }

  stack {
    // Convert time strings to timestamps if needed
    var $start_timestamp {
      value = (typeof($input.start_time) == "number") ? $input.start_time : (now|to_timestamp)
    }
  
    var $end_timestamp {
      value = (typeof($input.end_time) == "number") ? $input.end_time : (now|to_timestamp)
    }
  
    db.add inspection_time_slots {
      data = {
        start_time        : $start_timestamp
        end_time          : $end_timestamp
        days_of_week      : $input.days_of_week ?: {}
        recurrence_pattern: $input.recurrence_pattern
        is_available      : $input.is_available
        created_at        : "now"
        updated_at        : "now"
      }
    } as $new_slot
  }

  response = $new_slot
}