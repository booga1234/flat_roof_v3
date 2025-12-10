table vendors {
  auth = false

  schema {
    // Unique identifier for the vendor
    uuid id
  
    // Vendor name (e.g., Beacon, ABC, SRS)
    text name filters=trim
  
    // Vendor email address
    text email? filters=trim|lower
  
    // Vendor phone number
    text phone? filters=trim
  
    // Default payment terms (e.g., Net30, Net15)
    text default_terms? filters=trim
  
    // Additional notes about the vendor
    text notes?
  
    // Timestamp when the vendor record was created
    timestamp created_at?=now
  
    // Timestamp when the vendor record was last updated
    timestamp updated_at?=now
  }

  index = [{type: "primary", field: [{name: "id"}]}]
}