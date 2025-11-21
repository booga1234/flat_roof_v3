// XanoScript Table Definitions for Materials Management System
// Workspace: FR LLC (#5)
// 
// To apply these tables in Xano:
// 1. Go to your Xano workspace
// 2. Navigate to Database > Tables
// 3. Create each table using the XanoScript editor or UI
// 4. Copy and paste each table definition

// ============================================
// Table 1: manufacturers
// ============================================
table "manufacturers" {
  auth = false
  schema {
    uuid id {
      description = "Unique identifier for the manufacturer"
    }

    text name filters=trim {
      description = "Manufacturer name"
    }

    text website? filters=trim {
      description = "Manufacturer website URL"
    }

    text phone? filters=trim {
      description = "Manufacturer phone number"
    }

    text notes? {
      description = "Additional notes about the manufacturer"
    }

    timestamp created_at?=now {
      description = "Timestamp when the manufacturer record was created"
    }

    timestamp updated_at?=now {
      description = "Timestamp when the manufacturer record was last updated"
    }
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
  ]
}

// ============================================
// Table 2: material_categories
// ============================================
table "material_categories" {
  auth = false
  schema {
    uuid id {
      description = "Unique identifier for the material category"
    }

    text name filters=trim {
      description = "Category name (e.g., Membrane, ISO, Fasteners, Adhesives)"
    }

    text slug filters=trim {
      description = "URL-friendly slug for the category"
    }

    int sort_order? {
      description = "Display order for sorting categories"
    }

    timestamp created_at?=now {
      description = "Timestamp when the category was created"
    }

    timestamp updated_at?=now {
      description = "Timestamp when the category was last updated"
    }
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "sort_order", op: "asc"}]}
  ]
}

// ============================================
// Table 3: material_subcategories
// ============================================
table "material_subcategories" {
  auth = false
  schema {
    uuid id {
      description = "Unique identifier for the material subcategory"
    }

    uuid category_id {
      table = "material_categories"
      description = "Foreign key reference to material_categories"
    }

    text name filters=trim {
      description = "Subcategory name (e.g., PVC, TPO, Flat ISO, Tapered ISO)"
    }

    text slug filters=trim {
      description = "URL-friendly slug for the subcategory"
    }

    int sort_order? {
      description = "Display order for sorting subcategories within a category"
    }

    timestamp created_at?=now {
      description = "Timestamp when the subcategory was created"
    }

    timestamp updated_at?=now {
      description = "Timestamp when the subcategory was last updated"
    }
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "category_id", op: "asc"}]}
    {type: "btree", field: [{name: "sort_order", op: "asc"}]}
  ]
}

// ============================================
// Table 4: vendors
// ============================================
table "vendors" {
  auth = false
  schema {
    uuid id {
      description = "Unique identifier for the vendor"
    }

    text name filters=trim {
      description = "Vendor name (e.g., Beacon, ABC, SRS)"
    }

    text email? filters=trim|lower {
      description = "Vendor email address"
    }

    text phone? filters=trim {
      description = "Vendor phone number"
    }

    text default_terms? filters=trim {
      description = "Default payment terms (e.g., Net30, Net15)"
    }

    text notes? {
      description = "Additional notes about the vendor"
    }

    timestamp created_at?=now {
      description = "Timestamp when the vendor record was created"
    }

    timestamp updated_at?=now {
      description = "Timestamp when the vendor record was last updated"
    }
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
  ]
}

// ============================================
// Table 5: materials (MASTER TABLE)
// ============================================
table "materials" {
  auth = false
  schema {
    uuid id {
      description = "Unique identifier for the material"
    }

    uuid manufacturer_id {
      table = "manufacturers"
      description = "Foreign key reference to manufacturers"
    }

    uuid category_id {
      table = "material_categories"
      description = "Foreign key reference to material_categories"
    }

    uuid subcategory_id? {
      table = "material_subcategories"
      description = "Foreign key reference to material_subcategories (nullable)"
    }

    text name filters=trim {
      description = "Material name (e.g., 'IB PVC 60mil 6' x 80'')"
    }

    text product_number? filters=trim {
      description = "Product number from manufacturer (e.g., '1-60W' from IB PDFs)"
    }

    text sku? filters=trim {
      description = "Internal standardized SKU"
    }

    text description? {
      description = "Detailed description of the material"
    }

    text unit_type? filters=trim {
      description = "Unit type (roll, board, bucket, piece, lf, square)"
    }

    text unit_size? filters=trim {
      description = "Unit size (e.g., '100' roll', '4x8 board', '5 gal bucket')"
    }

    decimal roll_size_sqft? {
      description = "Roll size in square feet"
    }

    text board_dimensions? filters=trim {
      description = "Board dimensions (e.g., '4x8')"
    }

    decimal thickness_mil? {
      description = "Thickness in mils"
    }

    decimal thickness_inches? {
      description = "Thickness in inches"
    }

    decimal width_inches? {
      description = "Width in inches"
    }

    decimal length_feet? {
      description = "Length in feet"
    }

    text color? filters=trim {
      description = "Default color"
    }

    json colors_available? {
      description = "Array of available colors (e.g., ['White','Tan','Gray'])"
    }

    text warranty_level? filters=trim {
      description = "Warranty level (15yr/20yr/30yr)"
    }

    text packaging_type? filters=trim {
      description = "Packaging type (e.g., '12 rolls/pallet')"
    }

    decimal weight_per_unit_lbs? {
      description = "Weight per unit in pounds"
    }

    bool requires_quote?=false {
      description = "Whether this material requires a quote"
    }

    bool requires_ground_shipping?=false {
      description = "Whether this material requires ground shipping"
    }

    bool active?=true {
      description = "Whether this material is currently active"
    }

    timestamp created_at?=now {
      description = "Timestamp when the material record was created"
    }

    timestamp updated_at?=now {
      description = "Timestamp when the material record was last updated"
    }
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "manufacturer_id", op: "asc"}]}
    {type: "btree", field: [{name: "category_id", op: "asc"}]}
    {type: "btree", field: [{name: "subcategory_id", op: "asc"}]}
    {type: "btree", field: [{name: "active", op: "asc"}]}
    {type: "gin", field: [{name: "colors_available"}]}
  ]
}

// ============================================
// Table 6: material_variants
// ============================================
table "material_variants" {
  auth = false
  schema {
    uuid id {
      description = "Unique identifier for the material variant"
    }

    uuid material_id {
      table = "materials"
      description = "Foreign key reference to materials"
    }

    text attribute_name filters=trim {
      description = "Attribute name (e.g., 'color', 'thickness_mil', 'width', 'length')"
    }

    text attribute_value filters=trim {
      description = "Attribute value (e.g., 'White', '60', '50ft')"
    }

    text display_name? filters=trim {
      description = "Display name for the variant (e.g., '60mil - White', 'Gray - 80mil')"
    }

    text sku_override? filters=trim {
      description = "Override SKU if variant has its own SKU"
    }

    text product_number_override? filters=trim {
      description = "Override product number if variant has its own product number"
    }

    bool requires_ground_shipping_override? {
      description = "Override ground shipping requirement for this variant"
    }

    timestamp created_at?=now {
      description = "Timestamp when the variant was created"
    }

    timestamp updated_at?=now {
      description = "Timestamp when the variant was last updated"
    }
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "material_id", op: "asc"}]}
    {
      type: "btree"
      field: [{name: "material_id", op: "asc"}, {name: "attribute_name", op: "asc"}]
    }
  ]
}

// ============================================
// Table 7: material_pricing
// ============================================
table "material_pricing" {
  auth = false
  schema {
    uuid id {
      description = "Unique identifier for the pricing record"
    }

    uuid material_id {
      table = "materials"
      description = "Foreign key reference to materials"
    }

    uuid vendor_id {
      table = "vendors"
      description = "Foreign key reference to vendors"
    }

    decimal unit_cost filters=min:0 {
      description = "Unit cost from the vendor"
    }

    date effective_date {
      description = "Date when this pricing becomes effective"
    }

    text notes? {
      description = "Additional notes about the pricing"
    }

    timestamp created_at?=now {
      description = "Timestamp when the pricing record was created"
    }

    timestamp updated_at?=now {
      description = "Timestamp when the pricing record was last updated"
    }
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "material_id", op: "asc"}]}
    {type: "btree", field: [{name: "vendor_id", op: "asc"}]}
    {type: "btree", field: [{name: "effective_date", op: "desc"}]}
    {
      type: "btree"
      field: [
        {name: "material_id", op: "asc"}
        {name: "vendor_id", op: "asc"}
        {name: "effective_date", op: "desc"}
      ]
    }
  ]
}

