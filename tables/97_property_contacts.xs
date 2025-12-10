table property_contacts {
  auth = false

  schema {
    uuid id
    timestamp created_at?=now
    timestamp updated_at?=now
    uuid? property_id? {
      table = "properties"
    }
  
    uuid? contact_id? {
      table = "contacts"
    }
  
    enum relationship_to_property? {
      values = [
        "owner"
        "tenant"
        "property_manager"
        "maintenance_staff"
        "realtor"
        "contractor"
        "family_member"
        "billing_contact"
        "other"
      ]
    }
  
    bool is_primary?
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "created_at", op: "desc"}]}
  ]
}