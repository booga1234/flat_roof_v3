query inspection_booking_reschedule verb=POST {
  auth = "user"

  input {
    text inspection_booking_id? filters=trim
    text date_of_inspection? filters=trim
    text time_slot_id? filters=trim
    text inspection_id? filters=trim
    text location_id? filters=trim
    text lead_id? filters=trim
    text will_someone_be_present? filters=trim
    text cancellation_reason? filters=trim
  }

  stack {
    db.get inspection_time_slots {
      field_name = "id"
      field_value = $input.time_slot_id
    } as $inspection_time_slot
  
    db.add inspection_bookings {
      data = {
        created_at                 : "now"
        booking_status             : "confirmed"
        updated_at                 : "now"
        date_of_inspection         : $input.date_of_inspection
        booked_by_id               : $auth.id
        inspection_id              : $input.inspection_id
        rescheduled_from_booking_id: $input.inspection_booking_id
        location_id                : $input.location_id
        will_someone_be_present    : $input.will_someone_be_present
        lead_id                    : $input.lead_id
        start_time                 : $inspection_time_slot.start_time
        end_time                   : $inspection_time_slot.end_time
      }
    } as $new_booking
  
    db.edit inspection_bookings {
      field_name = "id"
      field_value = $input.inspection_booking_id
      data = {
        booking_status             : "rescheduled"
        cancelled_at               : now
        cancellation_reason        : $input.cancellation_reason
        rescheduled_from_booking_id: $new_booking.id
      }
    } as $old_booking
  }

  response = $old_booking
}