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
      <!-- Category display - Only show in performer mode -->
      <div v-if="settings.displayType === 'performer' && currentCategory" class="mb-6">
        <h2 class="text-2xl sm:text-3xl mb-2">Current Category</h2>

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
    // Clear interval when component is destroyed
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval)
    }
  },
  methods: {
    async fetchSettings() {
      try {
        const data = await getDisplaySettings()

        if (data) {
          // Create new local variables first before assigning to component data
          // This forces Vue to detect the changes
          let newSettings = null
          let newTitle = null
          let newSubtitle = null
          let newPerformer = null
          let newCategory = null

          // Use type guards to handle the response appropriately
          if (isTitleDisplayResponse(data)) {
            newSettings = { ...data.settings }
            newTitle = data.title || 'Competition Title'
            newSubtitle = data.subtitle || 'Competition Subtitle'
          }
          // Performer display mode
          else if (isPerformerDisplayResponse(data)) {
            newSettings = { ...data.settings }
            newPerformer = data.performer || null
            newCategory = data.category || null
          }

          // Update all component data properties at once for better reactivity
          this.settings = newSettings
          this.title = newTitle
          this.subtitle = newSubtitle
          this.currentPerformer = newPerformer
          this.currentCategory = newCategory
        }

        this.error = null
      } catch (err) {
        this.error = `Failed to load display data: ${err.message}`
        
      }
    },

    // Manual refresh method - can be useful for debugging or adding a refresh button
    forceRefresh() {
      this.fetchSettings()
    },
  },
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.5s ease,
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  
}
</style>
