<template>
  <div class="settings-container">
    <h1>Settings</h1>

    <transition name="fade">
      <div v-if="error" class="error-message">
        <i class="icon">⚠️</i>
        {{ error }}
      </div>
    </transition>

    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <span>Loading settings...</span>
    </div>

    <form v-else class="settings-form">
      <div v-for="setting in settings" :key="setting.key" class="form-group">
        <label :for="setting.key">{{ formatSettingLabel(setting.key) }}</label>

        <!-- Competition title/subtitle fields -->
        <div v-if="setting.key === 'title' || setting.key === 'subtitle'" class="text-input-wrapper">
          <input
            type="text"
            :id="setting.key"
            v-model="setting.value"
            @input="e => handleSettingChange(setting.key, e.target.value)"
            :placeholder="setting.key === 'title' ? 'Enter competition title' : 'Enter competition subtitle'"
            class="title-input"
          />
          <div class="text-preview" :style="{ fontFamily: getFontFamily() }">
            {{ setting.value || (setting.key === 'title' ? 'Competition Title Preview' : 'Competition Subtitle Preview') }}
          </div>
        </div>

        <!-- Logo upload fields -->
        <div v-else-if="isLogoSetting(setting.key)" class="logo-upload-wrapper">
          <div class="logo-preview-container">
            <img 
              v-if="setting.value && isValidImagePath(setting.value)" 
              :src="getLogoUrl(setting.value)" 
              :alt="`${formatSettingLabel(setting.key)} logo`" 
              class="logo-preview" 
            />
            <div v-else class="logo-placeholder">
              No logo uploaded
            </div>
          </div>
          
          <div class="logo-upload-controls">
            <label :for="`file-${setting.key}`" class="file-upload-button">
              <span class="upload-icon">↑</span>
              Upload Logo
            </label>
            <input
              type="file"
              :id="`file-${setting.key}`"
              accept="image/png, image/jpeg, image/gif"
              @change="e => handleLogoUpload(e, setting.key)"
              class="file-input"
            />
            
            <button 
              v-if="setting.value" 
              type="button" 
              @click="handleLogoClear(setting.key)" 
              class="clear-button"
            >
              <span class="clear-icon">✕</span>
              Clear
            </button>
          </div>
        </div>

        <!-- Color picker for color settings -->
        <div v-else-if="isColorSetting(setting.key)" class="color-picker-wrapper">
          <input
            type="color"
            :id="setting.key"
            v-model="setting.value"
            @input="e => handleSettingChange(setting.key, e.target.value)"
          />
          <span class="color-value">{{ setting.value }}</span>
        </div>

        <!-- Font size input -->
        <div v-else-if="setting.key === 'font_size'" class="font-size-control">
          <input
            type="range"
            :id="setting.key"
            :value="parseInt(setting.value)"
            min="8"
            max="128"
            step="1"
            @input="e => handleSettingChange(setting.key, parseInt(e.target.value))"
          />
          <span class="font-size-value">{{ setting.value }}</span>
        </div>

        <!-- Font family select -->
        <div v-else-if="setting.key === 'font_family'" class="font-family-wrapper">
          <select
            :id="setting.key"
            v-model="setting.value"
            @change="e => handleSettingChange(setting.key, e.target.value)"
          >
            <option value="Arial, sans-serif">Arial</option>
            <option value="Times New Roman, serif">Times New Roman</option>
            <option value="Courier New, monospace">Courier New</option>
            <option value="Georgia, serif">Georgia</option>
            <option value="Verdana, sans-serif">Verdana</option>
            <option value="Impact, sans-serif">Impact</option>
          </select>
          <div class="font-preview" :style="{ fontFamily: setting.value }">
            Sample Text
          </div>
        </div>

        <!-- Text input for other settings -->
        <input
          v-else
          type="text"
          :id="setting.key"
          v-model="setting.value"
          @input="e => handleSettingChange(setting.key, e.target.value)"
        />
      </div>

      <div class="form-actions">
        <button type="button" @click="handleResetSettings" class="reset-button">
          <span class="reset-icon">↺</span>
          Reset to Default Values
        </button>
      </div>
    </form>

    <div class="navigation-links">
      <router-link to="/" class="nav-link">Admin</router-link>
      <router-link to="/display" class="nav-link">Display</router-link>
      <router-link to="/data" class="nav-link">Data Management</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getSettings, updateSetting, resetAllSettings, uploadLogo } from '../services/api.js'

const settings = ref([])
const loading = ref(true)
const error = ref('')
const debounceTimers = ref({})

// Simple debounce function to delay API calls
const debounce = (func, key, delay = 500) => {
  // Clear existing timeout for this key (if any)
  if (debounceTimers.value[key]) {
    clearTimeout(debounceTimers.value[key])
  }
  
  // Set new timeout
  debounceTimers.value[key] = setTimeout(() => {
    func()
    // Clear the timer reference once executed
    debounceTimers.value[key] = null
  }, delay)
}

// Order settings in a consistent way
const orderSettings = settingsArray => {
  // Define a specific order for common settings
  const orderPriority = {
    title: 1,
    subtitle: 2,
    display_logo_left: 3,
    display_logo_center: 4,
    display_logo_right: 5,
    bg_color: 6,
    text_color: 7,
    font_size: 8,
    font_family: 9,
  }

  // Sort the settings based on the defined order or alphabetically if not in the order list
  return [...settingsArray].sort((a, b) => {
    const orderA = orderPriority[a.key] || 100
    const orderB = orderPriority[b.key] || 100

    if (orderA === orderB) {
      // If both have the same priority (or are both not in the order list),
      // sort alphabetically by key
      return a.key.localeCompare(b.key)
    }

    return orderA - orderB
  })
}

// Filter out settings that shouldn't be displayed
const filterSettings = settingsArray => {
  const excludedSettings = ['current_category', 'current_performer', 'current_display']
  return settingsArray.filter(setting => !excludedSettings.includes(setting.key))
}

// Fetch settings on component mount
onMounted(async () => {
  try {
    loading.value = true
    const fetchedSettings = await getSettings()
    // First filter out excluded settings, then order the remaining ones
    settings.value = orderSettings(filterSettings(fetchedSettings))
  } catch (err) {
    error.value = `Failed to load settings: ${err.message}`
  } finally {
    loading.value = false
  }
})

// Update a single setting
const handleSettingChange = async (key, value) => {
  try {
    // Process value if necessary
    let processedValue = value

    // For font_size, ensure we're working with a number
    if (key === 'font_size') {
      // Ensure it's a number
      const fontSizeValue = typeof value === 'string' && value.includes('px')
        ? parseInt(value)
        : value
        
      // Clamp the value between 8 and 128
      const clampedValue = Math.min(Math.max(fontSizeValue, 8), 128)
      processedValue = `${clampedValue}px`
    }

    // Update the local settings state immediately for responsive UI
    const settingIndex = settings.value.findIndex(s => s.key === key)
    if (settingIndex !== -1) {
      settings.value[settingIndex] = { ...settings.value[settingIndex], value: processedValue }
    }
    
    // Debounce the API call
    debounce(async () => {
      try {
        await updateSetting(key, processedValue)
        showSuccessMessage('Setting updated successfully')
      } catch (err) {
        error.value = err.message
        // If the API call fails, revert the local change
        if (settingIndex !== -1) {
          // Fetch the current value from the server to ensure consistency
          const fetchedSettings = await getSettings()
          const currentSetting = fetchedSettings.find(s => s.key === key)
          if (currentSetting) {
            settings.value[settingIndex].value = currentSetting.value
          }
        }
      }
    }, key) // Use the setting key as the debounce identifier
  } catch (err) {
    error.value = err.message
  }
}

// Handle logo file upload
const handleLogoUpload = async (event, key) => {
  try {
    const file = event.target.files[0]
    if (!file) return
    
    // Check file size (limit to 2MB)
    if (file.size > 2 * 1024 * 1024) {
      error.value = 'Logo file size must be less than 2MB'
      return
    }
    
    // Check file type
    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
      error.value = 'Only JPEG, PNG, and GIF files are allowed'
      return
    }
    
    // Show loading indicator
    loading.value = true
    
    // Create form data for the upload
    const formData = new FormData()
    formData.append('logo', file)
    formData.append('key', key)
    
    // Upload the logo
    const response = await uploadLogo(formData)
    
    // Update the setting with the new logo path
    const settingIndex = settings.value.findIndex(s => s.key === key)
    if (settingIndex !== -1) {
      settings.value[settingIndex].value = response.path
    }
    
    showSuccessMessage('Logo uploaded successfully')
  } catch (err) {
    error.value = `Failed to upload logo: ${err.message}`
  } finally {
    loading.value = false
    // Reset the file input
    event.target.value = ''
  }
}

// Clear a logo
const handleLogoClear = async (key) => {
  try {
    loading.value = true
    // Update with empty string to clear the logo
    await updateSetting(key, '')
    
    // Update the local state
    const settingIndex = settings.value.findIndex(s => s.key === key)
    if (settingIndex !== -1) {
      settings.value[settingIndex].value = ''
    }
    
    showSuccessMessage('Logo cleared successfully')
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

// Check if setting is for a logo
const isLogoSetting = key => {
  return key.includes('display_logo')
}

// Check if setting is a valid image path
const isValidImagePath = (path) => {
  return path && (
    path.startsWith('/uploads/') || 
    path.startsWith('http://') || 
    path.startsWith('https://')
  )
}

// Get the full URL for a logo path
const getLogoUrl = (path) => {
  // If it's already a full URL, return it
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  // Otherwise, assume it's a relative path on the server
  return path
}

// Reset all settings to default values
const handleResetSettings = async () => {
  if (!confirm('Are you sure you want to reset all settings to default values?')) {
    return
  }

  try {
    loading.value = true
    await resetAllSettings()
    // Reload settings after reset
    const fetchedSettings = await getSettings()
    // First filter out excluded settings, then order the remaining ones
    settings.value = orderSettings(filterSettings(fetchedSettings))
    showSuccessMessage('Settings reset to default values')
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const showSuccessMessage = msg => {
  // Success messages removed
  console.log(msg)
}

// Helper function to determine if a setting is a color
const isColorSetting = key => {
  return key.includes('color')
}

// Helper function to format setting label
const formatSettingLabel = key => {
  return key
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Helper function to get font family for preview
const getFontFamily = () => {
  const fontFamilySetting = settings.value.find(s => s.key === 'font_family')
  return fontFamilySetting ? fontFamilySetting.value : 'Arial, sans-serif'
}
</script>

<style scoped>
.settings-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  color: #333;
  box-sizing: border-box;
  width: 100%;
}

.settings-container h1 {
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  color: #2c3e50;
  text-align: center;
  font-weight: 600;
  border-bottom: 2px solid #eaeaea;
  padding-bottom: 0.75rem;
}

.settings-form {
  display: grid;
  gap: 2rem;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  padding: 1.5rem;
  width: 100%;
  box-sizing: border-box;
  max-width: 100%;
  overflow: hidden;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  position: relative;
  padding: 1rem;
  border-radius: 10px;
  transition: all 0.2s ease;
  background-color: #f9fafc;
  border: 1px solid #edf2f7;
}

.form-group:hover {
  background-color: #f0f4f8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transform: translateY(-1px);
}

label {
  font-weight: 600;
  font-size: 1.1rem;
  color: #2c3e50;
}

input,
select {
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s ease;
  background-color: #ffffff;
}

input:focus,
select:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
}

/* Color picker styling */
.color-picker-wrapper {
  display: flex;
  align-items: center;
  gap: 15px;
  width: 100%;
  box-sizing: border-box;
}

input[type='color'] {
  height: 50px;
  cursor: pointer;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 2px;
  flex: 0 0 100px;
  max-width: 100px;
  min-width: 80px;
  box-sizing: border-box;
  -webkit-appearance: none;
  appearance: none;
}

/* Prevent Firefox custom color picker */
input[type='color']::-webkit-color-swatch-wrapper {
  padding: 0;
  border-radius: 6px;
}

input[type='color']::-webkit-color-swatch {
  border: none;
  border-radius: 6px;
}

input[type='color']::-moz-color-swatch {
  border: none;
  border-radius: 6px;
}

.color-value {
  font-family: monospace;
  padding: 8px 12px;
  background: #f1f1f1;
  border-radius: 6px;
  font-weight: 500;
  min-width: 70px;
  text-align: center;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Font size control */
.font-size-control {
  display: flex;
  align-items: center;
  gap: 20px;
  width: 100%;
  box-sizing: border-box;
}

.font-size-control input[type='range'] {
  flex: 1;
  width: auto;
  min-width: 0; /* Important for preventing overflow */
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
  height: 8px;
  border-radius: 6px;
  background: linear-gradient(to right, #3498db, #2ecc71);
  margin: 0;
  padding: 0;
}

.font-size-control input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #ffffff;
  border: 2px solid #3498db;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.font-size-control input[type='range']::-moz-range-thumb {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #ffffff;
  border: 2px solid #3498db;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.font-size-value {
  min-width: 60px;
  text-align: center;
  font-weight: 600;
  color: #333;
  font-size: 1.1rem;
  background-color: #f2f2f2;
  padding: 8px 12px;
  border-radius: 8px;
}

/* Font family styling */
.font-family-wrapper {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.font-family-wrapper select {
  width: 100%;
}

.font-preview {
  padding: 10px;
  text-align: center;
  font-size: 1.2rem;
  background-color: #fff;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  margin-top: 8px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Title and subtitle input styling */
.text-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.title-input {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s ease;
  background-color: #ffffff;
}

.title-input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
}

.text-preview {
  padding: 10px;
  text-align: center;
  font-size: 1.2rem;
  background-color: #fff;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  margin-top: 8px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Logo upload styles */
.logo-upload-wrapper {
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
}

.logo-preview-container {
  height: 100px;
  width: 100%;
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background-color: #f9f9f9;
}

.logo-placeholder {
  color: #999;
  font-style: italic;
}

.logo-preview {
  max-height: 100%;
  max-width: 100%;
  object-fit: contain;
}

.logo-upload-controls {
  display: flex;
  gap: 10px;
}

.file-upload-button {
  background-color: #3498db;
  color: white;
  padding: 10px 15px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: background-color 0.3s;
  font-size: 14px;
  font-weight: 500;
}

.file-upload-button:hover {
  background-color: #2980b9;
}

.upload-icon, .clear-icon {
  font-size: 16px;
}

.file-input {
  position: absolute;
  width: 0.1px;
  height: 0.1px;
  opacity: 0;
  overflow: hidden;
  z-index: -1;
}

.clear-button {
  background-color: #e74c3c;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: background-color 0.3s;
  font-size: 14px;
  font-weight: 500;
}

.clear-button:hover {
  background-color: #c0392b;
}

.form-actions {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
  padding-top: 1.5rem;
  border-top: 2px solid #eaeaea;
}

.reset-button {
  background-color: #f44336;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(244, 67, 54, 0.2);
  display: flex;
  align-items: center;
  gap: 8px;
}

.reset-button:hover {
  background-color: #d32f2f;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(244, 67, 54, 0.3);
}

.reset-button:active {
  transform: translateY(0);
}

.reset-icon {
  display: inline-block;
  font-size: 1.2rem;
}

.error-message {
  padding: 16px;
  margin-bottom: 20px;
  border-radius: 10px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: #ffebee;
  color: #c62828;
  border-left: 5px solid #c62828;
  box-shadow: 0 2px 8px rgba(198, 40, 40, 0.1);
}

.icon {
  font-size: 1.5rem;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 20px;
  color: #666;
  font-size: 1.1rem;
  gap: 15px;
}

.loading-spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border-left-color: #3498db;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Animation transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Navigation Links */
.navigation-links {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #eaeaea;
  justify-content: center;
}

.nav-link {
  color: #3498db;
  text-decoration: none;
  font-weight: bold;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  background-color: #f8f9fa;
  transition: all 0.2s ease;
  border: 1px solid #e0e0e0;
}

.nav-link:hover {
  background-color: #3498db;
  color: white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

/* Responsive styles for navigation links */
@media (max-width: 600px) {
  .navigation-links {
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }
  
  .nav-link {
    width: 100%;
    text-align: center;
  }
}

/* Responsive styles for mobile */
@media (max-width: 600px) {
  .settings-container {
    padding: 10px 5px;
    width: 100%;
    max-width: 100%;
  }

  .settings-container h1 {
    font-size: 1.8rem;
    margin-bottom: 1rem;
  }

  .settings-form {
    padding: 1rem;
    gap: 1.5rem;
    width: 100%;
    box-sizing: border-box;
    margin: 0;
    border-radius: 8px;
  }

  .form-group {
    padding: 1rem;
    margin: 0;
    width: 100%;
    box-sizing: border-box;
  }

  label {
    font-size: 1.1rem;
    margin-bottom: 8px;
  }

  /* Font size control - keep horizontal but improve sizing */
  .font-size-control {
    flex-direction: row;
    align-items: center;
    gap: 15px;
    width: 100%;
    box-sizing: border-box;
    max-width: 100%;
  }

  .font-size-control input[type='range'] {
    height: 10px; /* Thicker slider for easier mobile tapping */
    flex: 1;
    min-width: 0;
    width: auto;
  }

  .font-size-value {
    min-width: 60px;
    padding: 10px;
    font-size: 1.1rem;
    text-align: center;
    flex-shrink: 0;
  }

  /* Color picker improvements */
  .color-picker-wrapper {
    flex-direction: row;
    align-items: center;
    width: 100%;
    max-width: 100%;
    gap: 15px;
  }

  input[type='color'] {
    flex: 0 0 80px;
    height: 50px;
    min-width: 80px;
  }

  .color-value {
    flex: 1;
    padding: 10px;
    font-size: 0.9rem;
    text-align: center;
  }

  /* Font family improvements */
  .font-family-wrapper select {
    padding: 12px;
    height: 50px; /* Taller for touch */
    font-size: 1rem;
  }

  .font-preview {
    height: 55px;
    font-size: 1.1rem;
  }

  .reset-button {
    width: 100%;
    padding: 15px 20px;
    font-size: 1rem;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  /* Ensure inputs fill the width */
  input, select {
    width: 100%;
    box-sizing: border-box;
    padding: 14px; /* Larger touch targets */
    font-size: 16px; /* Prevent zooming on iOS */
  }
  
  /* Fix for Safari mobile which may have slider issues */
  input[type='range']::-webkit-slider-thumb {
    width: 26px;
    height: 26px;
  }
  
  input[type='range']::-moz-range-thumb {
    width: 26px;
    height: 26px;
  }
  
  /* Title/subtitle text input styling */
  .text-input-wrapper {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
  }
  
  .title-input {
    width: 100%;
    padding: 12px;
    font-size: 16px;
  }
  
  .text-preview {
    padding: 10px 12px;
    background-color: #f0f4f8;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    min-height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    text-align: center;
    transition: all 0.3s ease;
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  /* Logo upload improvements */
  .logo-upload-wrapper {
    flex-direction: column;
  }
  
  .logo-upload-controls {
    flex-direction: row;
    width: 100%;
  }
  
  .file-upload-button, .clear-button {
    flex: 1;
    justify-content: center;
    padding: 12px;
    font-size: 14px;
  }
}
</style>
