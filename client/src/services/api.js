/**
 * API service for making HTTP requests to the server
 */

/**
 * Check the health of the API server
 * @returns {Promise<Object>} The API health status
 */
export async function checkHealth() {
  try {
    const response = await fetch('/api/health')
    if (!response.ok) {
      throw new Error(`API health check failed with status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Error checking API health:', error)
    throw error
  }
}

/**
 * Fetch current display settings from the server
 * @typedef {import('../types/display').DisplayResponse} DisplayResponse
 * @returns {Promise<DisplayResponse>} The current display settings and data
 */
export async function getDisplaySettings() {
  try {
    const response = await fetch('/api/display')
    if (!response.ok) {
      throw new Error(`Failed to fetch display settings: ${response.status}`)
    }

    const settings = await response.json()

    return settings
  } catch (error) {
    console.error('Error fetching display settings:', error)
    throw error
  }
}
