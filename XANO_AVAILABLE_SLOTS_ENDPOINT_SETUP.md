# Available Inspection Time Slots Endpoint Setup

## Overview
This endpoint returns only available inspection time slots that are not already booked. Each slot can only have one appointment (enforced by checking booking status).

## Endpoint Details

**Endpoint:** `GET /available-inspection-time-slots`  
**API Group:** NeOYcc44 (API_V2_BASE_URL)  
**Workspace:** FR LLC (#5)

## Features

- Returns only slots where `is_available = true`
- Excludes slots that have confirmed or pending bookings
- Supports filtering by date, date range, and inspector
- Ensures each slot can only have one appointment

## Setup Instructions

### 1. Create the Endpoint in Xano

1. Go to your Xano workspace
2. Navigate to **API** > **API Groups** > **NeOYcc44**
3. Click **Add Endpoint** > **GET**
4. Name it: `available-inspection-time-slots`
5. Copy the XanoScript from `xano_available_slots_endpoint.xs`
6. Paste it into the endpoint editor

### 2. Alternative: Manual Setup

If you prefer to set up the endpoint manually in Xano:

#### Query Parameters
- `date` (optional, date): Filter by specific date
- `start_date` (optional, date): Filter slots from this date onwards
- `end_date` (optional, date): Filter slots up to this date
- `inspector_id` (optional, uuid): Filter by inspector ID

#### Function Logic

1. **Base Query:** Get all slots where `is_available = true`
   ```javascript
   base_query = database.inspection_time_slots.filter(is_available == true)
   ```

2. **Apply Date Filters:**
   - If `date` provided: filter by exact date
   - If `start_date` provided: filter slots >= start_date
   - If `end_date` provided: filter slots <= end_date

3. **Apply Inspector Filter:**
   - If `inspector_id` provided: filter by inspector_id or null (any inspector)

4. **Exclude Booked Slots:**
   - Get all bookings where `booking_status` is 'confirmed' or 'pending'
   - Extract `time_slot_id` values from those bookings
   - Filter out slots whose `id` is in the booked slot IDs list

5. **Sort Results:**
   - Sort by `slot_date` (ascending)
   - Then by `start_time` (ascending)

6. **Return Response:**
   ```json
   {
     "slots": [...],
     "count": 5
   }
   ```

### 3. Response Format

```json
{
  "slots": [
    {
      "id": "uuid",
      "inspector_id": "uuid | null",
      "slot_date": "2024-11-20",
      "start_time": "09:00:00",
      "end_time": "11:00:00",
      "recurrence_pattern": "weekly | null",
      "recurrence_interval": 1 | null,
      "days_of_week": [1, 3, 5] | null,
      "recurrence_end_date": "2024-12-31" | null,
      "is_available": true,
      "notes": "string | null",
      "created_at": "2024-11-19T10:00:00Z",
      "updated_at": "2024-11-19T10:00:00Z"
    }
  ],
  "count": 1
}
```

## Frontend Integration

The frontend has already been updated to use this endpoint:

### InspectionDate Component
- Fetches available slots for the next 7 days
- Displays only dates that have available slots
- Falls back to generating dates if API fails

### InspectionTime Component
- Fetches available time slots for the selected date
- Displays only time slots that are available
- Formats times as "9:00 AM - 11:00 AM"
- Requires a `selectedDate` prop from InspectionDate

### API Service
The `calendarEventsAPI.getAvailableSlots()` function is available in `src/utils/apiService.js`:

```javascript
// Get available slots
const slots = await calendarEventsAPI.getAvailableSlots({
  date: '2024-11-20',           // Optional: specific date
  start_date: '2024-11-20',     // Optional: start date
  end_date: '2024-11-27',       // Optional: end date
  inspector_id: 'uuid'          // Optional: filter by inspector
})
```

## How It Works

1. **Slot Availability:** A slot is available if:
   - `is_available = true` in the `inspection_time_slots` table
   - No booking exists in `inspection_bookings` with:
     - `time_slot_id` matching the slot's ID
     - `booking_status` of 'confirmed' or 'pending'

2. **One Appointment Per Slot:** 
   - When a booking is created with `booking_status = 'confirmed'` or `'pending'`, that slot is automatically excluded from available slots
   - The endpoint checks `inspection_bookings` table to exclude already booked slots

3. **Date Filtering:**
   - If no date filters provided: returns all available slots
   - If `date` provided: returns only slots for that date
   - If `start_date` and/or `end_date` provided: returns slots in that range

## Testing

### Test Cases

1. **Get all available slots:**
   ```
   GET /available-inspection-time-slots
   ```

2. **Get slots for specific date:**
   ```
   GET /available-inspection-time-slots?date=2024-11-20
   ```

3. **Get slots in date range:**
   ```
   GET /available-inspection-time-slots?start_date=2024-11-20&end_date=2024-11-27
   ```

4. **Get slots for specific inspector:**
   ```
   GET /available-inspection-time-slots?inspector_id=uuid-here
   ```

5. **Combined filters:**
   ```
   GET /available-inspection-time-slots?start_date=2024-11-20&end_date=2024-11-27&inspector_id=uuid-here
   ```

### Expected Behavior

- ✅ Returns only slots with `is_available = true`
- ✅ Excludes slots that have confirmed/pending bookings
- ✅ Returns empty array if no slots available for given filters
- ✅ Sorts results by date and time

## Troubleshooting

### No slots returned
- Check that `inspection_time_slots` table has records with `is_available = true`
- Verify slots are not already booked (check `inspection_bookings` table)
- Check date filters are correct format (YYYY-MM-DD)

### Slots not excluded when booked
- Verify `inspection_bookings` records have correct `time_slot_id`
- Check that `booking_status` is 'confirmed' or 'pending'
- Ensure the endpoint logic correctly filters booked slots

### Frontend shows "No available dates"
- Check API endpoint is accessible
- Verify Xano endpoint returns expected format
- Check browser console for API errors
- Verify authentication if endpoint requires auth

## Notes

- The endpoint assumes the `inspection_time_slots` and `inspection_bookings` tables exist
- Slots can have `inspector_id = null` which means any inspector can use them
- The endpoint sorts results by date and time for consistent ordering
- Frontend components have fallback logic if API fails

