table inspection_bookings {
  auth = false

  schema {
    // Unique identifier for the booking
    uuid id
  
    timestamp? created_at?=now
  
    // Booking status: 'confirmed', 'pending', 'cancelled', 'rescheduled'
    enum booking_status {
      values = ["confirmed", "pending", "cancelled", "rescheduled"]
    }
  
    timestamp? updated_at?=now
    timestamp? date_of_inspection?
  
    // Timestamp when booking was cancelled (ISO 8601 format)
    timestamp cancelled_at?
  
    // Reason for cancellation if cancelled
    text cancellation_reason?
  
    // Team member who made the booking
    uuid booked_by_id? {
      table = "user"
    }
  
    // Foreign key reference to inspections
    uuid inspection_id {
      table = "inspections"
    }
  
    // Reference to previous booking if this was a reschedule
    uuid? rescheduled_from_booking_id? {
      table = "inspection_bookings"
    }
  
    uuid? location_id? {
      table = "locations"
    }
  
    enum will_someone_be_present? {
      values = ["yes", "no", "unknown", "maybe"]
    }
  
    uuid? lead_id? {
      table = "leads"
    }
  
    timestamp? start_time?
    timestamp? end_time?
  }

  index = [{type: "primary", field: [{name: "id"}]}]
}