query materials verb=POST {
  auth = "user"

  input {
    text name
    text? product_number
    uuid category_id
    uuid manufacturer_id
    uuid? subcategory_id
    text? unit_type
    text? unit_size
    text? description
    text? warranty_level
    bool? requires_ground_shipping
    bool? requires_quote
    bool? active
  }

  stack {
    db.add materials {
      data = {
        name                    : $input.name
        product_number          : $input.product_number
        category_id             : $input.category_id
        manufacturer_id         : $input.manufacturer_id
        subcategory_id          : $input.subcategory_id
        unit_type               : $input.unit_type
        unit_size               : $input.unit_size
        description             : $input.description
        warranty_level          : $input.warranty_level
        requires_ground_shipping: $input.requires_ground_shipping
        requires_quote          : $input.requires_quote
        active                  : $input.active
      }
    } as $new_material
  }

  response = $new_material
}