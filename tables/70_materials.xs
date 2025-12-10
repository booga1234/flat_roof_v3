table materials {
  auth = false

  schema {
    // Unique identifier for the material
    uuid id
  
    // Foreign key reference to manufacturers
    uuid manufacturer_id {
      table = "manufacturers"
    }
  
    // Foreign key reference to material_categories
    uuid category_id {
      table = "material_categories"
    }
  
    // Foreign key reference to material_subcategories (nullable)
    uuid subcategory_id? {
      table = "material_subcategories"
    }
  
    // Material name (e.g., 'IB PVC 60mil 6' x 80'')
    text name filters=trim
  
    // Product number from manufacturer (e.g., '1-60W' from IB PDFs)
    text product_number? filters=trim
  
    // Internal standardized SKU
    text sku? filters=trim
  
    // Detailed description of the material
    text description?
  
    // Unit type (roll, board, bucket, piece, lf, square)
    text unit_type? filters=trim
  
    // Unit size (e.g., '100' roll', '4x8 board', '5 gal bucket')
    text unit_size? filters=trim
  
    // Roll size in square feet
    decimal roll_size_sqft?
  
    // Board dimensions (e.g., '4x8')
    text board_dimensions? filters=trim
  
    // Thickness in mils
    decimal thickness_mil?
  
    // Thickness in inches
    decimal thickness_inches?
  
    // Width in inches
    decimal width_inches?
  
    // Length in feet
    decimal length_feet?
  
    // Default color
    text color? filters=trim
  
    // Array of available colors (e.g., ['White','Tan','Gray'])
    json colors_available?
  
    // Warranty level (15yr/20yr/30yr)
    text warranty_level? filters=trim
  
    // Packaging type (e.g., '12 rolls/pallet')
    text packaging_type? filters=trim
  
    // Weight per unit in pounds
    decimal weight_per_unit_lbs?
  
    // Whether this material requires a quote
    bool requires_quote?
  
    // Whether this material requires ground shipping
    bool requires_ground_shipping?
  
    // Whether this material is currently active
    bool active?=true
  
    // Timestamp when the material record was created
    timestamp created_at?=now
  
    // Timestamp when the material record was last updated
    timestamp updated_at?=now
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {
      type : "btree"
      field: [{name: "manufacturer_id", op: "asc"}]
    }
    {type: "btree", field: [{name: "category_id", op: "asc"}]}
    {type: "btree", field: [{name: "subcategory_id", op: "asc"}]}
    {type: "btree", field: [{name: "active", op: "asc"}]}
    {type: "gin", field: [{name: "colors_available"}]}
  ]
}