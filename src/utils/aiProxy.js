import { API_V3_BASE_URL } from '../config/api'

// Uses the v3 ai_internal_writer endpoint (GET, auth required).
// Maps existingContent -> original_text, prompt -> instruction.
export async function generateText(prompt, existingContent = '') {
  const token = localStorage.getItem('authToken')
  if (!token) {
    throw new Error('Not authenticated')
  }

  const params = new URLSearchParams()
  if (prompt) params.set('instruction', prompt)
  if (existingContent) params.set('original_text', existingContent)

  const response = await fetch(
    `${API_V3_BASE_URL}/ai_internal_writer?${params.toString()}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  )

  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    throw new Error(errorText || 'AI request failed')
  }

  const data = await response.json()
  // Endpoint returns text at top level.
  return typeof data === 'string' ? data : data?.text || ''
}

