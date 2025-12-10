// Retrieves a list of inspections with optional filtering.
query inspections verb=GET {
  auth = "user"

  input {
    // Filter by inspection status
    enum status? {
      values = ["scheduled", "in_progress", "completed", "cancelled"]
    }
  
    // Filter by inspection type ID
    uuid inspection_type_id?
  
    // Filter by inspector ID
    uuid inspector_id?
  
    // Page number for pagination
    int page?=1
  
    enum date_filter? {
      values = ["today", "7_days", "30_days", "all"]
    }
  }

  stack {
    api.lambda {
      code = """
        const dateFilter = $input.date_filter;
        
        // Check if the filter is defined and is not 'all' (case-insensitive)
        if (dateFilter && dateFilter.toLowerCase() !== 'all') {
          const now = new Date();
          
          // Reset hours, minutes, seconds, and ms to 0 to get the start of today
          now.setHours(0, 0, 0, 0);
        
          // Return the raw timestamp value directly
          return now.getTime();
        }
        
        // Return null if the filter is 'all'
        return null;
        """
      timeout = 10
    } as $now_time
  
    !var $now_time {
      value = ""
    }
  
    !conditional {
      if ($input.date_filter != "all") {
        var.update $now_time {
          value = now
        }
      }
    }
  
    api.lambda {
      code = """
        const { startOfDay, addDays, endOfDay } = await import("npm:date-fns");
        
        const { date_filter } = $input;
        
        // Get the start of the current day (00:00:00)
        const today = startOfDay(new Date());
        
        let filterTimestamp = null;
        
        if (date_filter === "today") {
            // Returns start of today (00:00:00)
            filterTimestamp = today.getTime();
        } else if (date_filter === "7_days") {
            // 7 days into the future including today
            // Calculation: Today (Day 1) + 6 days = Day 7
            // We use endOfDay to include the full final day
            filterTimestamp = endOfDay(addDays(today, 6)).getTime();
        } else if (date_filter === "30_days") {
            // Assuming 30 days future logic matches the 7 days pattern
            // Today + 29 days = 30 days total
            filterTimestamp = endOfDay(addDays(today, 29)).getTime();
        }
        
        return filterTimestamp;
        """
      timeout = 10
    } as $filter_timestamp
  
    !debug.stop {
      value = $filter_timestamp
    }
  
    function.run user_current_location_id {
      input = {user_id: $auth.id}
    } as $location_id
  
    db.query inspections {
      join = {
        inspection_bookings: {
          table: "inspection_bookings"
          where: $db.inspection_bookings.inspection_id == $db.inspections.id && $db.inspection_bookings.date_of_inspection <? $filter_timestamp && $db.inspection_bookings.date_of_inspection >? $now_time
        }
      }
    
      where = $db.inspections.status ==? $input.status && $db.inspections.inspection_type_id ==? $input.inspection_type_id && $db.inspections.inspector_id ==? $input.inspector_id && $db.inspections.location_id == $location_id
      sort = {inspections.created_at: "desc"}
      return = {
        type  : "list"
        paging: {page: $input.page, per_page: 100}
      }
    
      addon = [
        {
          name : "lead"
          input: {leads_id: $output.lead_id}
          addon: [
            {
              name : "contact"
              input: {contacts_id: $output.contact_id}
              as   : "contact"
            }
          ]
          as   : "items.lead"
        }
        {
          name : "property"
          input: {properties_id: $output.property_id}
          as   : "items.property"
        }
        {
          name : "inspection_booking_from_inspection"
          input: {inspection_id: $output.id}
          as   : "items.inspection_booking"
        }
      ]
    } as $inspections
  }

  response = $inspections
}