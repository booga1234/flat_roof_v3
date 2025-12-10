table material_pricing {
  auth = false

  schema {
    // Unique identifier for the pricing record
    uuid id
  
    // Foreign key reference to materials
    uuid material_id {
      table = "materials"
    }
  
    // Foreign key reference to vendors
    uuid vendor_id {
      table = "vendors"
    }
  
    // Unit cost from the vendor
    decimal unit_cost filters=min:0
  
    // Date when this pricing becomes effective
    date effective_date
  
    // Additional notes about the pricing
    text notes?
  
    // Timestamp when the pricing record was created
    timestamp created_at?=now
  
    // Timestamp when the pricing record was last updated
    timestamp updated_at?=now
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "material_id", op: "asc"}]}
    {type: "btree", field: [{name: "vendor_id", op: "asc"}]}
    {
      type : "btree"
      field: [{name: "effective_date", op: "desc"}]
    }
    {
      type : "btree"
      field: [
        {name: "material_id", op: "asc"}
        {name: "vendor_id", op: "asc"}
        {name: "effective_date", op: "desc"}
      ]
    }
  ]
}