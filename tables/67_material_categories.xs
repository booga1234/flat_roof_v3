table material_categories {
  auth = false

  schema {
    // Unique identifier for the material category
    uuid id
  
    // Category name (e.g., Membrane, ISO, Fasteners, Adhesives)
    text name filters=trim
  
    // URL-friendly slug for the category
    text slug filters=trim
  
    // Display order for sorting categories
    int sort_order?
  
    // Timestamp when the category was created
    timestamp created_at?=now
  
    // Timestamp when the category was last updated
    timestamp updated_at?=now
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "sort_order", op: "asc"}]}
  ]
}