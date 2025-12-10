query "inspection-result-new" verb=POST {
  auth = "user"

  input {
    uuid inspection_id
    text? overall_condition
    text? decking_type
    text? insulation_location
    json? best_options
    bool? offer_maintenance
    text? findings
    text? recommendations
    text? additional_notes
    bool? requires_repair
    bool? requires_replacement
    decimal? estimated_repair_cost
    text? weather_conditions
    decimal? temperature_fahrenheit
    json? damage_areas
    text? next_steps
    uuid? completed_by_id
  }

  stack {
    db.add inspection_results {
      data = {
        inspection_id         : $input.inspection_id
        overall_condition     : $input.overall_condition
        decking_type          : $input.decking_type
        insulation_location   : $input.insulation_location
        best_options          : $input.best_options
        offer_maintenance     : $input.offer_maintenance || false
        findings              : $input.findings
        recommendations       : $input.recommendations
        additional_notes      : $input.additional_notes
        requires_repair       : $input.requires_repair || false
        requires_replacement  : $input.requires_replacement || false
        estimated_repair_cost : $input.estimated_repair_cost
        weather_conditions    : $input.weather_conditions
        temperature_fahrenheit: $input.temperature_fahrenheit
        damage_areas          : $input.damage_areas
        next_steps            : $input.next_steps
        completed_by_id       : $input.completed_by_id
        created_at            : now()
        updated_at            : now()
      }
    } as $new_result
  }

  response = $new_result
}