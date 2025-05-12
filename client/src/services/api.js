/**
 * API service for making HTTP requests to the server
 */

/**
 * Check the health of the API server
 * @returns {Promise<Object>} The API health status
 */
export async function checkHealth() {
  try {
    const response = await fetch('/api/health');
    if (!response.ok) {
      throw new Error(`API health check failed with status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error checking API health:', error);
    throw error;
  }
}
