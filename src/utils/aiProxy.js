import { API_BASE_URL } from '../config/api'

export async function generateText(prompt, existingContent = '') {
  const body = {
    prompt,
    existing_content: existingContent || undefined
  }

  const response = await fetch(`${API_BASE_URL}/ai-generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    throw new Error(errorText || 'AI request failed')
  }

  const data = await response.json()
  return data?.text || ''
}

