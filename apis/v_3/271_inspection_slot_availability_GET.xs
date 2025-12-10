query "inspection-slot-availability" verb=GET {
  input {
    text location_id? filters=trim
  }

  stack {
    db.query inspection_time_slots {
      where = $db.inspection_time_slots.is_available && $db.inspection_time_slots.location_id == $input.location_id
      return = {type: "list"}
    } as $inspection_time_slots
  
    db.query inspection_bookings {
      where = $db.inspection_bookings.date_of_inspection > now && $db.inspection_bookings.location_id == $input.location_id
      return = {type: "list"}
    } as $inspection_bookings
  
    api.lambda {
      code = """
        const { addDays, 
          startOfDay, 
          getDay, 
          areIntervalsOverlapping, 
          isBefore,
          isSameDay } = await import("npm:date-fns");
        
        const LOOKAHEAD_DAYS = 30;
        const slots = $var.inspection_time_slots || [];
        const bookings = $var.inspection_bookings || [];
        
        // Map integer day (0=Sunday) to schema keys
        const dayMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        
        const now = new Date();
        // We use startOfDay to ensure we iterate through full calendar days starting from today
        const startOfToday = startOfDay(now);
        const results = [];
        
        // Pre-process bookings into Date objects for faster comparison
        const bookingIntervals = bookings.map(b => ({
          start: new Date(b.start_time),
          end: new Date(b.end_time)
        }));
        
        // Iterate through the next 30 days
        for (let i = 0; i < LOOKAHEAD_DAYS; i++) {
          const targetDate = addDays(startOfToday, i);
          const dayIndex = targetDate.getDay(); // Local day index
          const dayName = dayMap[dayIndex];
        
          for (const slot of slots) {
            // Skip if slot is globally unavailable
            if (!slot.is_available) continue;
        
            let candidateStart = null;
            let candidateEnd = null;
        
            // 1. Handle Recurring Slots
            if (slot.recurrence_pattern && slot.days_of_week) {
              // Check if the slot is enabled for this specific day of the week
              if (slot.days_of_week[dayName]) {
                const originalStart = new Date(slot.start_time);
                const originalEnd = new Date(slot.end_time);
                const duration = originalEnd.getTime() - originalStart.getTime();
        
                // Project the original time-of-day onto the target date
                // We construct a new date using the target's Year/Month/Day and the slot's Hours/Minutes
                const newStart = new Date(targetDate);
                newStart.setHours(originalStart.getHours());
                newStart.setMinutes(originalStart.getMinutes());
                newStart.setSeconds(0);
                newStart.setMilliseconds(0);
        
                candidateStart = newStart;
                candidateEnd = new Date(newStart.getTime() + duration);
              }
            } 
            // 2. Handle One-Time Slots
            else if (!slot.recurrence_pattern) {
              const specificStart = new Date(slot.start_time);
              // Check if the one-time slot occurs on the target date
              if (isSameDay(specificStart, targetDate)) {
                candidateStart = specificStart;
                candidateEnd = new Date(slot.end_time);
              }
            }
        
            // If a valid candidate slot was generated
            if (candidateStart && candidateEnd) {
              // Filter out slots that have already passed (e.g., earlier today)
              if (isBefore(candidateStart, now)) continue;
        
              // Check for conflicts with existing bookings
              const isBlocked = bookingIntervals.some(booking => 
                areIntervalsOverlapping(
                  { start: candidateStart, end: candidateEnd },
                  { start: booking.start, end: booking.end }
                )
              );
        
              if (!isBlocked) {
                results.push({
                  slot_id: slot.id,
                  start_time: candidateStart.getTime(),
                  end_time: candidateEnd.getTime(),
                  date_iso: candidateStart.toISOString()
                });
              }
            }
          }
        }
        
        // Sort results chronologically
        results.sort((a, b) => a.start_time - b.start_time);
        
        return results;
        """
      timeout = 10
    } as $x1
  }

  response = $x1
}