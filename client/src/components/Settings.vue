<template>
  <div class="settings-container">
    <h1>Settings</h1>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-if="showMessage" class="success-message">
      {{ message }}
    </div>

    <div v-if="loading" class="loading">Loading settings...</div>

    <form v-else class="settings-form">
      <div v-for="setting in settings" :key="setting.key" class="form-group">
        <label :for="setting.key">{{ formatSettingLabel(setting.key) }}</label>

        <!-- Color picker for color settings -->
        <input
          v-if="isColorSetting(setting.key)"
          type="color"
          :id="setting.key"
          v-model="setting.value"
          @input="e => handleSettingChange(setting.key, e.target.value)"
        />

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
        <select
          v-else-if="setting.key === 'font_family'"
          :id="setting.key"
          v-model="setting.value"
          @input="e => handleSettingChange(setting.key, e.target.value)"
        >
          <option value="Arial, sans-serif">Arial</option>
          <option value="Times New Roman, serif">Times New Roman</option>
          <option value="Courier New, monospace">Courier New</option>
          <option value="Georgia, serif">Georgia</option>
          <option value="Verdana, sans-serif">Verdana</option>
          <option value="Impact, sans-serif">Impact</option>
        </select>

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
          Reset to Default Values
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getSettings, updateSetting, resetAllSettings } from '../services/api.js'

const settings = ref([])
const loading = ref(true)
const message = ref('')
const error = ref('')
const showMessage = ref(false)
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
    bg_color: 1,
    text_color: 2,
    font_size: 3,
    font_family: 4,
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
  const excludedSettings = ['current_category', 'current_performer', 'title', 'subtitle', 'current_display']
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
  message.value = msg
  showMessage.value = true
  setTimeout(() => {
    showMessage.value = false
  }, 3000)
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
</script>

<style scoped>
.settings-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.settings-form {
  display: grid;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

label {
  font-weight: bold;
}

input,
select {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
}

input[type='color'] {
  height: 40px;
  cursor: pointer;
}

.font-size-control {
  display: flex;
  align-items: center;
  gap: 15px;
}

.font-size-control input[type='range'] {
  flex-grow: 1;
  width: 100%;
  cursor: pointer;
}

.font-size-value {
  min-width: 45px;
  text-align: right;
  font-weight: 600;
  color: #444;
}

.form-actions {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.reset-button {
  background-color: #f44336;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

.reset-button:hover {
  background-color: #d32f2f;
}

.error-message {
  background-color: #ffebee;
  color: #c62828;
  padding: 10px;
  margin-bottom: 20px;
  border-radius: 4px;
  border-left: 4px solid #c62828;
}

.success-message {
  background-color: #e8f5e9;
  color: #2e7d32;
  padding: 10px;
  margin-bottom: 20px;
  border-radius: 4px;
  border-left: 4px solid #2e7d32;
}

.loading {
  text-align: center;
  padding: 20px;
  font-style: italic;
  color: #666;
}
</style>
