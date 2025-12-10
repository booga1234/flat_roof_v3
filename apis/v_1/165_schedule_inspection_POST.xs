query "schedule-inspection" verb=POST {
  input {
    timestamp? inspection_date?
    json data?
  }

  stack {
    !db.add "" {
      data = {
        created_at: "now"
        Name      : $input.data.name
        email     : $input.data.email
        phone     : $input.data.phone
        address   : $input.data.address
      }
    } as $created_lead
  
    !db.add "" {
      data = {
        created_at: "now"
        day       : $input.data.inspection_date
        reason    : $input.data.reason
        address   : $input.data.address
        lead_id   : $created_lead
      }
    } as $created_inspection
  
    api.request {
      url = "https://api.telnyx.com/v2/messages"
      method = "POST"
      params = {}
        |set:"from":"+19712881657"
        |set:"messaging_profile_id":"40019a02-b4ce-4f01-b6f8-309f4750ecb5"
        |set:"to":"+15642038721"
        |set:"text":"Hello, World!"
        |set:"subject":"From Telnyx!"
        |!set:"media_urls":([]|push:"http://example.com")
        |set:"webhook_url":"http://example.com/webhooks"
        |!set:"webhook_failover_url":"https://backup.example.com/hooks"
        |!set:"use_profile_webhooks":true
        |set:"type":"SMS"
      headers = []
        |push:"Content-Type: application/json"
        |push:"Accept: application/json"
        |push:"Authorization: Bearer " + $env.telnyx_api_key
    } as $api1
  }

  response = $api1
}