// Proxy for OpenAI chat completions. Calls server-side to keep API keys hidden.
query "ai-generate" verb=POST {
  input {
    // User prompt to generate or edit content
    text prompt filters=trim
  
    // Optional existing content to provide edit context
    text existing_content? filters=trim
  }

  stack {
    precondition (($input.prompt|strlen) > 0) {
      error_type = "inputerror"
      error = "prompt is required"
    }
  
    var $message_content {
      value = $input.prompt
    }
  
    conditional {
      if ($input.existing_content != null && ($input.existing_content|strlen) > 0) {
        var.update $message_content {
          value = "Current text:\n" ~ $input.existing_content ~ "\n\nUser request:\n" ~ $input.prompt
        }
      }
    }
  
    api.request {
      url = "https://api.openai.com/v1/chat/completions"
      method = "POST"
      params = {}
        |set:"model":"gpt-4o-mini"
        |set:"messages":([]
          |push:({}
            |set:"role":"user"
            |set:"content":$message_content
          )
        )
      headers = []
        |push:"Content-Type: application/json"
        |push:("Authorization: Bearer " ~ $env.openai_api_key)
      timeout = 60
    } as $ai_response
  
    var $resp {
      value = $ai_response.response
    }
  
    var $choices {
      value = null
    }
  
    conditional {
      if ($resp != null) {
        conditional {
          if ($resp.result != null && $resp.result.choices != null) {
            var.update $choices {
              value = $resp.result.choices
            }
          }
          elseif ($resp.choices != null) {
            var.update $choices {
              value = $resp.choices
            }
          }
        }
      }
    }
  
    var $assistant_message {
      value = ""
    }
  
    conditional {
      if ($choices != null && ($choices|count) > 0) {
        var.update $assistant_message {
          value = $choices[0].message.content
        }
      }
    }
  }

  response = {text: $assistant_message, raw: $ai_response.response}
}