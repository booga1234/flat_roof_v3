query slack verb=POST {
  input {
    text text? filters=trim
  }

  stack {
    function.run slack_webhook {
      input = {url: $env.slack_webhook_url, text: $input.text}
    } as $slack_webhook
  }

  response = $slack_webhook
}