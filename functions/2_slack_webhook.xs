// Slack Webhook
function slack_webhook {
  input {
    // Webhook Channel URL
    text url? filters=trim
  
    text text? filters=trim
  }

  stack {
    api.request {
      url = $input.url
      method = "POST"
      params = {}|set:"text":$input.text
      headers = []
        |push:"Content-type: application/json"
    } as $slack
  }

  response = $slack.response
}