// Get all materials organized by category and subcategory for the library page
query "materials-library" verb=GET {
  auth = "user"

  input {
  }

  stack {
    // Get all material categories sorted by sort_order
    db.query material_categories {
      sort = {material_categories.sort_order: "asc"}
      return = {type: "list"}
      output = ["id", "name", "slug", "sort_order", "created_at", "updated_at"]
    } as $categories
  
    // Get all subcategories
    db.query material_subcategories {
      sort = {material_subcategories.name: "asc"}
      return = {type: "list"}
      output = ["id", "name", "category_id", "created_at", "updated_at"]
    } as $subcategories
  
    // Get all manufacturers
    db.query manufacturers {
      return = {type: "list"}
      output = ["id", "name"]
    } as $manufacturers
  
    // Get all vendors
    db.query vendors {
      return = {type: "list"}
      output = ["id", "name"]
    } as $vendors
  
    // Get all materials with related data
    db.query materials {
      sort = {materials.name: "asc"}
      return = {type: "list"}
      output = [
        "id"
        "name"
        "description"
        "product_number"
        "category_id"
        "subcategory_id"
        "manufacturer_id"
        "vendor_id"
        "unit_type"
        "unit_size"
        "created_at"
        "updated_at"
      ]
    } as $materials
  }

  response = {
    categories   : $categories
    subcategories: $subcategories
    manufacturers: $manufacturers
    vendors      : $vendors
    materials    : $materials
  }

  history = false
}