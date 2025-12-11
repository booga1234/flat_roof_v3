// Proxy for OpenAI Assistants (server-side). Keeps API keys hidden.
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
  
    var $assistant_id {
      value = $env.openai_assistant_id
    }
  
    precondition ($assistant_id != null && ($assistant_id|strlen) > 0) {
      error_type = "inputerror"
      error = "Assistant ID not configured"
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
  
    // 1) Create thread
    api.request {
      url = "https://api.openai.com/v1/threads"
      method = "POST"
      params = {}
      headers = []
        |push:"Content-Type: application/json"
        |push:("Authorization: Bearer " ~ $env.openai_api_key)
      timeout = 60
    } as $thread_resp
  
    precondition ($thread_resp.response.id != null) {
      error_type = "inputerror"
      error = "Failed to create thread"
    }
  
    var $thread_id {
      value = $thread_resp.response.id
    }
  
    // 2) Add user message
    api.request {
      url = "https://api.openai.com/v1/threads/" ~ $thread_id ~ "/messages"
      method = "POST"
      params = {}
        |set:"role":"user"
        |set:"content":$message_content
      headers = []
        |push:"Content-Type: application/json"
        |push:("Authorization: Bearer " ~ $env.openai_api_key)
      timeout = 60
    } as $msg_resp
  
    precondition ($msg_resp.response.id != null) {
      error_type = "inputerror"
      error = "Failed to create message"
    }
  
    // 3) Run assistant
    api.request {
      url = "https://api.openai.com/v1/threads/" ~ $thread_id ~ "/runs"
      method = "POST"
      params = {}
        |set:"assistant_id":$assistant_id
      headers = []
        |push:"Content-Type: application/json"
        |push:("Authorization: Bearer " ~ $env.openai_api_key)
      timeout = 60
    } as $run_resp
  
    precondition ($run_resp.response.id != null) {
      error_type = "inputerror"
      error = "Failed to start run"
    }
  
    var $run_id {
      value = $run_resp.response.id
    }
  
    // 4) Poll run status (max 10 attempts with 1s sleep)
    var $run_status {
      value = $run_resp.response.status
    }
  
    for (10) {
      each as $i {
        conditional {
          if ($run_status == "queued" || $run_status == "in_progress") {
            util.sleep {
              value = 1
            }
            api.request {
              url = "https://api.openai.com/v1/threads/" ~ $thread_id ~ "/runs/" ~ $run_id
              method = "GET"
              headers = []
                |push:"Content-Type: application/json"
                |push:("Authorization: Bearer " ~ $env.openai_api_key)
              timeout = 60
            } as $run_check
  
            var.update $run_status {
              value = $run_check.response.status
            }
          }
        }
      }
    }
  
    precondition ($run_status == "completed") {
      error_type = "inputerror"
      error = "Assistant run did not complete"
    }
  
    // 5) Fetch messages, get latest assistant text
    api.request {
      url = "https://api.openai.com/v1/threads/" ~ $thread_id ~ "/messages"
      method = "GET"
      headers = []
        |push:"Content-Type: application/json"
        |push:("Authorization: Bearer " ~ $env.openai_api_key)
      timeout = 60
    } as $messages_resp
  
    var $assistant_message {
      value = ""
    }
  
    conditional {
      if ($messages_resp.response.data != null && ($messages_resp.response.data|count) > 0) {
        var $first_message {
          value = $messages_resp.response.data[0]
        }
        conditional {
          if ($first_message.content != null && ($first_message.content|count) > 0) {
            var $first_content {
              value = $first_message.content[0]
            }
            conditional {
              if ($first_content.text != null && $first_content.text.value != null) {
                var.update $assistant_message {
                  value = $first_content.text.value
                }
              }
            }
          }
        }
      }
    }
  }

  response = {text: $assistant_message, raw: $messages_resp.response}
}

