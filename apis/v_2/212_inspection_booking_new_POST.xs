query "inspection-booking-new" verb=POST {
  auth = "user"

  input {
    uuid inspection_id
    uuid? time_slot_id
    text booking_status
    uuid? booked_by_id
    uuid? rescheduled_from_booking_id
    text? notes
  }

  stack {
    db.add inspection_bookings {
      data = {
        inspection_id              : $input.inspection_id
        time_slot_id               : $input.time_slot_id
        booking_status             : $input.booking_status || "confirmed"
        booked_at                  : now()
        booked_by_id               : $input.booked_by_id
        rescheduled_from_booking_id: $input.rescheduled_from_booking_id
        notes                      : $input.notes
        created_at                 : now()
        updated_at                 : now()
      }
    } as $new_booking
  }

  response = $new_booking
}