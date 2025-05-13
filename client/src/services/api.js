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

/**
 * Get all application settings
 * @returns {Promise<Array>} Array of setting objects with keys and values
 */
export async function getSettings() {
  try {
    const response = await fetch('/api/settings')
    if (!response.ok) {
      throw new Error(`Failed to fetch settings: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching settings:', error)
    throw error
  }
}

/**
 * Update a single setting
 * @param {string} key - The setting key to update
 * @param {string} value - The new value for the setting
 * @returns {Promise<Object>} The response message
 */
export async function updateSetting(key, value) {
  try {
    const response = await fetch('/api/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ key, value })
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `Failed to update setting: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error updating setting:', error)
    throw error
  }
}

/**
 * Reset all settings to their default values
 * @returns {Promise<Object>} The response message
 */
export async function resetAllSettings() {
  try {
    const response = await fetch('/api/settings/reset', {
      method: 'POST'
    })
    
    if (!response.ok) {
      throw new Error(`Failed to reset settings: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error resetting settings:', error)
    throw error
  }
}
