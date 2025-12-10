table material_subcategories {
  auth = false

  schema {
    // Unique identifier for the material subcategory
    uuid id
  
    // Foreign key reference to material_categories
    uuid category_id {
      table = "material_categories"
    }
  
    // Subcategory name (e.g., PVC, TPO, Flat ISO, Tapered ISO)
    text name filters=trim
  
    // URL-friendly slug for the subcategory
    text slug filters=trim
  
    // Display order for sorting subcategories within a category
    int sort_order?
  
    // Timestamp when the subcategory was created
    timestamp created_at?=now
  
    // Timestamp when the subcategory was last updated
    timestamp updated_at?=now
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "category_id", op: "asc"}]}
    {type: "btree", field: [{name: "sort_order", op: "asc"}]}
  ]
}