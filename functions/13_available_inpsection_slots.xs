function available_inpsection_slots {
  input {
  }

  stack {
    api.lambda {
      code = """
          const now = new Date();
          now.setHours(0, 0, 0, 0);
          const startDate = now.getTime();
          const endDate = startDate + (14 * 24 * 60 * 60 * 1000);
          return {
            start_date_ts: startDate,
            end_date_ts: endDate
          };
        """
      timeout = 10
    } as $dates
  
    db.query inspection_bookings {
      where = $db.inspection_bookings.date_of_inspection > $dates.start_date_ts
      return = {type: "list"}
    } as $inspection_bookings
  
    db.query inspection_time_slots {
      where = `$db.inspection_time_slots.is_available`
      return = {type: "list"}
    } as $inspection_time_slots
  
    !debug.stop {
      value = $inspection_time_slots
    }
  
    api.lambda {
      code = """
        const { start_date_ts, end_date_ts } = $var.dates;
        const bookings = $var.inspection_bookings;
        const timeSlots = $var.inspection_time_slots;
        
        // Constants
        const ONE_DAY_MS = 86400000;
        const MIN_NOTICE_MS = 86400000; // 24 hours
        
        // The earliest allowed timestamp for a slot to be valid
        const minBookingTime = start_date_ts + MIN_NOTICE_MS;
        
        // Helper for day names matching the boolean keys in days_of_week
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        
        // 1. Create a lookup Set for existing bookings to optimize filtering.
        // We store a composite key: "slotID_timestamp".
        // We handle cases where booking.date might be the slot start time OR the day start time.
        const bookedKeys = new Set();
        bookings.forEach(b => {
          if (b.booking_status && b.booking_status !== 'cancelled') {
            bookedKeys.add(`${b.time_slot_id}_${b.date}`);
          }
        });
        
        const availableDays = [];
        
        // 2. Setup iteration variables
        // We normalize the iterator to the start of the day (Midnight UTC) of the start_date_ts
        // This ensures we correctly calculate offsets for slots.
        let iterDate = new Date(start_date_ts);
        iterDate.setUTCHours(0, 0, 0, 0);
        
        // We iterate until the end of the end_date
        const endDateObj = new Date(end_date_ts);
        endDateObj.setUTCHours(23, 59, 59, 999);
        
        // 3. Iterate through each day in the range
        while (iterDate.getTime() <= endDateObj.getTime()) {
          const currentDayTs = iterDate.getTime();
          const dayIndex = iterDate.getUTCDay();
          const dayName = dayNames[dayIndex];
        
          const daySlots = [];
        
          // 4. Check each time slot definition
          timeSlots.forEach(slot => {
            // Skip if slot is globally unavailable or not active for this day of week
            if (!slot.is_available) return;
            if (!slot.days_of_week[dayName]) return;
        
            // Determine milliseconds from midnight for start/end
            // Handles cases where start_time might be a full timestamp or just an offset
            let msFromMidnightStart = slot.start_time;
            let msFromMidnightEnd = slot.end_time;
        
            if (slot.start_time >= ONE_DAY_MS) {
              const d = new Date(slot.start_time);
              msFromMidnightStart = (d.getUTCHours() * 3600000) + (d.getUTCMinutes() * 60000) + (d.getUTCSeconds() * 1000);
            }
            if (slot.end_time >= ONE_DAY_MS) {
              const d = new Date(slot.end_time);
              msFromMidnightEnd = (d.getUTCHours() * 3600000) + (d.getUTCMinutes() * 60000) + (d.getUTCSeconds() * 1000);
            }
        
            const slotStartTs = currentDayTs + msFromMidnightStart;
            const slotEndTs = currentDayTs + msFromMidnightEnd;
        
            // 5. Filter: Must be at least 24 hours after the initial start_date_ts
            if (slotStartTs < minBookingTime) return;
        
            // 6. Filter: Must not be already booked
            // Check against exact slot time
            if (bookedKeys.has(`${slot.id}_${slotStartTs}`)) return;
            // Check against day start time (fallback if booking.date stores day only)
            if (bookedKeys.has(`${slot.id}_${currentDayTs}`)) return;
        
            // Add to available slots
            daySlots.push({
              slot_id: slot.id,
              start_ts: slotStartTs,
              end_ts: slotEndTs,
              start_time_formatted: new Date(slotStartTs).toISOString().substr(11, 5),
              end_time_formatted: new Date(slotEndTs).toISOString().substr(11, 5)
            });
          });
        
          // Only add the day if there are available slots
          if (daySlots.length > 0) {
            daySlots.sort((a, b) => a.start_ts - b.start_ts);
            availableDays.push({
              date_ts: currentDayTs,
              date_formatted: iterDate.toISOString().split('T')[0],
              day_name: dayName,
              slots: daySlots
            });
          }
        
          // Move to next day
          iterDate.setUTCDate(iterDate.getUTCDate() + 1);
        }
        
        return availableDays;
        """
      timeout = 10
    } as $available_slots
  }

  response = $available_slots
  history = 100
}