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
 * Advance to the next performer in the display
 * @returns {Promise<Object>} Updated display settings
 */
export async function advanceToNextPerformer() {
  try {
    const response = await fetch('/api/display/next-performer', {
      method: 'POST'
    })
    
    if (!response.ok) {
      throw new Error(`Failed to advance to next performer: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error advancing to next performer:', error)
    throw error
  }
}

/**
 * Change the current display category
 * @param {string} categoryId - The ID of the category to switch to
 * @returns {Promise<Object>} Updated display settings
 */
export async function changeDisplayCategory(categoryId) {
  try {
    const response = await fetch(`/api/display/category/${categoryId}`, {
      method: 'POST'
    })
    
    if (!response.ok) {
      throw new Error(`Failed to change display category: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error changing display category:', error)
    throw error
  }
}

/**
 * Change the display type
 * @param {string} displayType - The new display type ('performer' or 'title')
 * @returns {Promise<Object>} Updated display settings
 */
export async function changeDisplayType(displayType) {
  try {
    const response = await fetch('/api/display/type', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ displayType })
    })
    
    if (!response.ok) {
      throw new Error(`Failed to change display type: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error changing display type:', error)
    throw error
  }
}

/**
 * Override the current performer in the display
 * @param {string} performerId - The ID of the performer to set as current
 * @returns {Promise<Object>} The response message
 */
export async function overrideCurrentPerformer(performerId) {
  try {
    const response = await fetch('/api/display/current-performer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ performerId })
    })
    
    if (!response.ok) {
      throw new Error(`Failed to override current performer: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error overriding current performer:', error)
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

/**
 * Get all categories
 * @returns {Promise<Array>} Array of category objects
 */
export async function getCategories() {
  try {
    const response = await fetch('/api/categories')
    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching categories:', error)
    throw error
  }
}

/**
 * Get a category by ID
 * @param {string} id - The ID of the category to fetch
 * @returns {Promise<Object>} The category object
 */
export async function getCategory(id) {
  try {
    const response = await fetch(`/api/categories/${id}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch category: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching category:', error)
    throw error
  }
}

/**
 * Create a new category
 * @param {string} name - The name of the new category
 * @returns {Promise<Object>} The newly created category
 */
export async function createCategory(name) {
  try {
    const response = await fetch('/api/categories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name })
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `Failed to create category: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error creating category:', error)
    throw error
  }
}

/**
 * Update a category
 * @param {string} id - The ID of the category to update
 * @param {string} name - The new name for the category
 * @returns {Promise<Object>} The updated category
 */
export async function updateCategory(id, name) {
  try {
    const response = await fetch(`/api/categories/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name })
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `Failed to update category: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error updating category:', error)
    throw error
  }
}

/**
 * Delete a category
 * @param {string} id - The ID of the category to delete
 * @returns {Promise<Object>} The response message
 */
export async function deleteCategory(id) {
  try {
    const response = await fetch(`/api/categories/${id}`, {
      method: 'DELETE'
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `Failed to delete category: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error deleting category:', error)
    throw error
  }
}

/**
 * Get all performers or performers filtered by category ID
 * @param {string} [categoryId] - Optional category ID to filter performers
 * @returns {Promise<Array>} Array of performer objects
 */
export async function getPerformers(categoryId = null) {
  try {
    let url = '/api/performers'
    if (categoryId) {
      url += `?categoryId=${categoryId}`
    }
    
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch performers: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching performers:', error)
    throw error
  }
}

/**
 * Get a performer by ID
 * @param {string} id - The ID of the performer to fetch
 * @returns {Promise<Object>} The performer object
 */
export async function getPerformer(id) {
  try {
    const response = await fetch(`/api/performers/${id}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch performer: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching performer:', error)
    throw error
  }
}

/**
 * Create a new performer
 * @param {Object} performer - The performer data
 * @param {string} performer.order - The performer's order
 * @param {string} performer.name - The performer's name
 * @param {string} performer.club - The performer's club
 * @param {string} performer.category_id - The performer's category ID
 * @param {string} [performer.routine] - The performer's routine (optional)
 * @returns {Promise<Object>} The newly created performer
 */
export async function createPerformer(performer) {
  try {
    const response = await fetch('/api/performers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(performer)
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `Failed to create performer: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error creating performer:', error)
    throw error
  }
}

/**
 * Update a performer
 * @param {string} id - The ID of the performer to update
 * @param {Object} performer - The updated performer data
 * @param {string} performer.order - The performer's order
 * @param {string} performer.name - The performer's name
 * @param {string} performer.club - The performer's club
 * @param {string} performer.category_id - The performer's category ID
 * @param {string} [performer.routine] - The performer's routine (optional)
 * @returns {Promise<Object>} The updated performer
 */
export async function updatePerformer(id, performer) {
  try {
    console.log('Sending update for performer:', id, performer);
    
    // Ensure we have all required fields
    if (!performer.order || !performer.name || !performer.club || !performer.category_id) {
      console.error('Missing required fields for performer update:', performer);
      throw new Error('Required fields missing: order, name, club, and category_id are required');
    }
    
    const response = await fetch(`/api/performers/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(performer)
    })
    
    if (!response.ok) {
      // Try to parse error JSON, but fallback if it's not valid JSON
      let errorMessage;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || `Failed to update performer: ${response.status}`;
      } catch (jsonError) {
        errorMessage = `Failed to update performer: ${response.status}`;
      }
      
      console.error(`Error updating performer ${id}:`, errorMessage);
      throw new Error(errorMessage);
    }
    
    return await response.json()
  } catch (error) {
    console.error(`Error updating performer ${id}:`, error);
    throw error;
  }
}

/**
 * Delete a performer
 * @param {string} id - The ID of the performer to delete
 * @returns {Promise<Object>} The response message
 */
export async function deletePerformer(id) {
  try {
    const response = await fetch(`/api/performers/${id}`, {
      method: 'DELETE'
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `Failed to delete performer: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error deleting performer:', error)
    throw error
  }
}
