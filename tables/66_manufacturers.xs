table manufacturers {
  auth = false

  schema {
    // Unique identifier for the manufacturer
    uuid id
  
    // Manufacturer name
    text name filters=trim
  
    // Manufacturer website URL
    text website? filters=trim
  
    // Manufacturer phone number
    text phone? filters=trim
  
    // Additional notes about the manufacturer
    text notes?
  
    // Timestamp when the manufacturer record was created
    timestamp created_at?=now
  
    // Timestamp when the manufacturer record was last updated
    timestamp updated_at?=now
  }

  index = [{type: "primary", field: [{name: "id"}]}]
}