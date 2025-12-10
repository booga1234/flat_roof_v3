// Get all material categories for dropdown selection
query "material-categories" verb=GET {
  auth = "user"

  input {
  }

  stack {
    // Get all material categories sorted by sort_order (ascending)
    db.query material_categories {
      sort = {material_categories.sort_order: "asc"}
      return = {type: "list"}
      output = ["id", "name", "slug", "sort_order"]
    } as $categories
  }

  response = {categories: $categories}
  history = false
}