query "available-inspection-slots" verb=GET {
  input {
  }

  stack {
    db.query "" {
      return = {type: "list"}
    } as $set_inspections
  
    api.lambda {
      code = """
        const inspections = $var.set_inspections || [];
        const daysToCheck = 7;
        const maxInspectionsPerDay = 2;
        const allowedDays = [1, 2, 4]; // Monday=1, Tuesday=2, Thursday=4
        
        const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
        const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
        
        const inspectionCounts = {};
        for (const inspection of inspections) {
            if (!inspection.day || typeof inspection.day !== 'number') {
                continue;
            }
            try {
                const dateStr = new Date(inspection.day).toISOString().slice(0, 10);
                inspectionCounts[dateStr] = (inspectionCounts[dateStr] || 0) + 1;
            } catch (error) {
                console.log(`Skipping inspection with invalid date timestamp: ${inspection.day}`);
            }
        }
        
        const availableDays = [];
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        
        for (let i = 0; i < daysToCheck; i++) {
            const currentDate = new Date(today);
            currentDate.setUTCDate(currentDate.getUTCDate() + i);
        
            const dayOfWeek = currentDate.getUTCDay();
        
            if (!allowedDays.includes(dayOfWeek)) {
                continue;
            }
        
            const currentDateStr = currentDate.toISOString().slice(0, 10);
            const dailyCount = inspectionCounts[currentDateStr] || 0;
        
            if (dailyCount < maxInspectionsPerDay) {
                const bookingDate = new Date(currentDate);
                bookingDate.setUTCHours(13, 0, 0, 0);
                const timestamp = bookingDate.getTime();
                
                const availableDayObject = {
                    day_of_week: dayNames[currentDate.getUTCDay()],
                    month: monthNames[currentDate.getUTCMonth()],
                    day: currentDate.getUTCDate(),
                    timestamp: timestamp
                };
                
                availableDays.push(availableDayObject);
            }
        }
        
        return availableDays;
        """
      timeout = 10
    } as $x1
  }

  response = $x1
}