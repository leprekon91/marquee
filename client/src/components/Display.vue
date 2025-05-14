<template>
  <div
    class="flex flex-col items-center justify-center min-h-screen p-4"
    :style="{
      backgroundColor: settings?.bgColor || '#000000',
      color: settings?.textColor || '#FFFFFF',
      fontFamily: settings?.fontFamily || 'Arial, sans-serif',
    }"
  >
    <!-- Error state -->
    <div v-if="error" class="bg-red-900/40 p-6 rounded-lg max-w-md text-center">
      <h2 class="text-2xl font-bold mb-4">Error</h2>
      <p class="text-red-300">{{ error }}</p>
      <button
        @click="fetchSettings"
        class="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md"
      >
        Try Again
      </button>
    </div>

    <!-- Display content -->
    <div
      v-else-if="settings"
      class="w-full max-w-5xl text-center"
      :style="{ fontSize: settings?.fontSize || '16px' }"
    >
    
      <!-- Logo bar - only show if at least one logo is present -->
      <div class="logo-bar w-full flex justify-between items-center mb-4" 
           v-if="isValidLogoPath(settings.logoLeft) || isValidLogoPath(settings.logoCenter) || isValidLogoPath(settings.logoRight)">
        <!-- Left logo -->
        <div class="logo-container" v-if="isValidLogoPath(settings.logoLeft)">
          <img :src="getImageUrl(settings.logoLeft)" alt="Left logo" class="logo max-h-20" />
        </div>
        <div v-else class="logo-placeholder"></div>
        
        <!-- Center logo -->
        <div class="logo-container" v-if="isValidLogoPath(settings.logoCenter)">
          <img :src="getImageUrl(settings.logoCenter)" alt="Center logo" class="logo max-h-20" />
        </div>
        <div v-else class="logo-placeholder"></div>
        
        <!-- Right logo -->
        <div class="logo-container" v-if="isValidLogoPath(settings.logoRight)">
          <img :src="getImageUrl(settings.logoRight)" alt="Right logo" class="logo max-h-20" />
        </div>
        <div v-else class="logo-placeholder"></div>
      </div>
      
      <!-- Category display - Only show in performer mode -->
      <div v-if="settings.displayType === 'performer' && currentCategory" class="mb-6">
        <div class="p-4 rounded-lg">
          <p class="text-3xl sm:text-4xl font-bold">
            {{ currentCategory.name || 'No Category' }}
          </p>
        </div>
      </div>

      <!-- Main display area -->
      <div class="mb-8">
        <transition name="fade" mode="out-in">
          <!-- Performer Mode -->
          <div
            v-if="settings.displayType === 'performer' && currentPerformer"
            :key="'performer-' + (currentPerformer ? currentPerformer.id : 'none')"
            class="p-8 rounded-lg"
          >
            <h1 class="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-4">
              {{ currentPerformer.name || 'No Performer' }}
            </h1>
            <p v-if="currentPerformer.club" class="text-2xl sm:text-3xl mb-3">
              {{ currentPerformer.club }}
            </p>
            <p v-if="currentPerformer.routine" class="text-xl sm:text-2xl mb-2">
              {{ currentPerformer.routine }}
            </p>
            <p v-if="currentPerformer.description" class="text-xl sm:text-2xl">
              {{ currentPerformer.description }}
            </p>
          </div>

          <!-- Title Mode -->
          <div v-else :key="'title-' + (title || 'default')" class="p-8 rounded-lg">
            <h1 class="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-4">
              {{ title || 'Competition Title' }}
            </h1>
            <p class="text-xl sm:text-2xl">
              {{ subtitle || 'Competition Subtitle' }}
            </p>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script>
import { getDisplaySettings } from '../services/api'
import { isTitleDisplayResponse, isPerformerDisplayResponse } from '../types/display'

export default {
  name: 'Display',
  data() {
    return {
      error: null,
      refreshInterval: null,
      settings: null,
      title: null,
      subtitle: null,
      currentPerformer: null,
      currentCategory: null,
      showDebug: false // Set to true to show debugging information
    }
  },

  mounted() {
    this.fetchSettings()

    // Set up auto refresh every 5 seconds (reduced from 1 second to avoid race conditions)
    this.refreshInterval = setInterval(() => {
      this.fetchSettings()
    }, 1000)
  },

  beforeUnmount() {
    // Clear the refresh interval when component is unmounted
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval)
    }
  },

  methods: {
    async fetchSettings() {
      try {
        const displayData = await getDisplaySettings()

        if (!displayData) {
          console.error('Empty display data received')
          return
        }

        console.log('Display data received:', displayData)

        // Store common settings
        this.settings = {
          bgColor: displayData.settings?.bgColor || '#000000',
          textColor: displayData.settings?.textColor || '#FFFFFF',
          fontSize: displayData.settings?.fontSize || '16px',
          fontFamily: displayData.settings?.fontFamily || 'Arial, sans-serif',
          displayType: displayData.settings?.displayType || 'title',
          // Add logo fields
          logoLeft: displayData.settings?.displayLogoLeft || '',
          logoCenter: displayData.settings?.displayLogoCenter || '',
          logoRight: displayData.settings?.displayLogoRight || '',
        }

        if (isTitleDisplayResponse(displayData)) {
          // Process title display
          this.title = displayData.title || 'Competition Title'
          this.subtitle = displayData.subtitle || 'Competition Subtitle'
          this.currentPerformer = null
          this.currentCategory = null
        } else if (isPerformerDisplayResponse(displayData)) {
          // Process performer display
          this.title = null
          this.subtitle = null
          this.currentPerformer = displayData.performer || null
          this.currentCategory = displayData.category || null
        } else {
          console.error('Unknown display data format', displayData)
        }

        // Clear error if successful
        this.error = null
      } catch (err) {
        console.error('Error fetching display settings', err)
        this.error = `Failed to retrieve display: ${err.message}`
      }
    },
    
    // Check if logo path is valid
    isValidLogoPath(path) {
      if (path) {
        const isValid = path && (
          path.startsWith('/uploads/') || 
          path.startsWith('http://') || 
          path.startsWith('https://')
        );
        return isValid;
      }
      return false;
    },
    
    // Get proper URL for images, ensuring they're served from the correct location
    getImageUrl(path) {
      if (!path) return '';
      
      console.log('Getting image URL for:', path);
      
      // If path already includes the full URL, return it as is
      if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
      }
      
      // For development, use the Vite proxy
      // For production, use the path as is
      return path;
    }
  }
}
</script>

<style scoped>
.logo-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  width: 100%;
}

.logo-container {
  flex: 0 0 30%;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo {
  max-height: 250px;
  max-width: 100%;
  object-fit: contain;
}

.logo-placeholder {
  flex: 0 0 30%;
  height: 80px;
}

.debug-info {
  font-family: monospace;
  border-radius: 4px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
