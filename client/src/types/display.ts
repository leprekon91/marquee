/**
 * Types for display settings and related data on the client side
 * Based on the server-side displayService implementation
 */

/**
 * Display settings returned from the API
 */
export interface DisplaySettings {
  bgColor: string;
  textColor: string;
  fontSize: string;
  fontFamily: string;
  displayType: 'performer' | 'title';
}

/**
 * Performer data structure
 */
export interface Performer {
  id: string;
  name: string;
  description?: string;
  title?: string;
  subtitle?: string;
  category_id: string;
  order: string;
}

/**
 * Category data structure
 */
export interface Category {
  id: string;
  name: string;
  description?: string;
}

/**
 * Response when displayType is 'title'
 */
export interface TitleDisplayResponse {
  title: string;
  subtitle: string;
  settings: DisplaySettings;
}

/**
 * Response when displayType is 'performer'
 */
export interface PerformerDisplayResponse {
  performer: Performer;
  category: Category;
  settings: DisplaySettings;
}

/**
 * Union type for all possible display responses
 */
export type DisplayResponse = TitleDisplayResponse | PerformerDisplayResponse;

/**
 * Type guard to check if response is a TitleDisplayResponse
 */
export function isTitleDisplayResponse(response: DisplayResponse): response is TitleDisplayResponse {
  return response.settings.displayType === 'title' && 'title' in response && 'subtitle' in response;
}

/**
 * Type guard to check if response is a PerformerDisplayResponse
 */
export function isPerformerDisplayResponse(response: DisplayResponse): response is PerformerDisplayResponse {
  return response.settings.displayType === 'performer' && 'performer' in response && 'category' in response;
}
