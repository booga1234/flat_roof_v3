table material_variants {
  auth = false

  schema {
    // Unique identifier for the material variant
    uuid id
  
    // Foreign key reference to materials
    uuid material_id {
      table = "materials"
    }
  
    // Attribute name (e.g., 'color', 'thickness_mil', 'width', 'length')
    text attribute_name filters=trim
  
    // Attribute value (e.g., 'White', '60', '50ft')
    text attribute_value filters=trim
  
    // Display name for the variant (e.g., '60mil - White', 'Gray - 80mil')
    text display_name? filters=trim
  
    // Override SKU if variant has its own SKU
    text sku_override? filters=trim
  
    // Override product number if variant has its own product number
    text product_number_override? filters=trim
  
    // Override ground shipping requirement for this variant
    bool requires_ground_shipping_override?
  
    // Timestamp when the variant was created
    timestamp created_at?=now
  
    // Timestamp when the variant was last updated
    timestamp updated_at?=now
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "material_id", op: "asc"}]}
    {
      type : "btree"
      field: [
        {name: "material_id", op: "asc"}
        {name: "attribute_name", op: "asc"}
      ]
    }
  ]
}