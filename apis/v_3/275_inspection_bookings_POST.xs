query inspection_bookings verb=POST {
  auth = "user"

  input {
    text lead_id? filters=trim
    text inspection_type_id? filters=trim
    text property_id? filters=trim
    text location_id? filters=trim
    text date_of_inspection? filters=trim
    text time_slot_id? filters=trim
    text will_someone_be_present? filters=trim
  }

  stack {
    db.get inspection_time_slots {
      field_name = "id"
      field_value = $input.time_slot_id
    } as $inspection_time_slot
  
    db.add inspections {
      data = {
        lead_id           : $input.lead_id
        inspection_type_id: $input.inspection_type_id
        status            : "scheduled"
        created_at        : "now"
        updated_at        : now
        property_id       : $input.property_id
        location_id       : $input.location_id
      }
    } as $created_inspection
  
    db.add inspection_bookings {
      data = {
        created_at             : "now"
        booking_status         : "confirmed"
        updated_at             : "now"
        date_of_inspection     : $input.date_of_inspection
        booked_by_id           : $auth.id
        inspection_id          : $created_inspection.id
        location_id            : $input.location_id
        will_someone_be_present: $input.will_someone_be_present
        lead_id                : $input.lead_id
        start_time             : $inspection_time_slot.start_time
        end_time               : $inspection_time_slot.end_time
      }
    } as $created_inspection_booking
  }

  response = $created_inspection
}