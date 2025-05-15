<template>
  <div class="admin-container">
    <h1>Admin Panel</h1>

    <!-- Error messages -->
    <transition name="fade">
      <div v-if="error" class="error-message">
        <span class="icon">⚠️</span>
        <span>{{ error }}</span>
      </div>
    </transition>

    <!-- Loading indicator -->
    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <span>Loading data...</span>
    </div>

    <div v-else class="admin-panels">
      <!-- Display Type Control -->
      <div class="panel display-type-panel">
        <div class="panel-header">
          <h2>Display Mode</h2>
        </div>
        <div class="display-mode-selector">
          <div class="mode-option" :class="{ active: displayType === 'title' }">
            <input
              type="radio"
              id="title-mode"
              value="title"
              v-model="displayType"
              @change="handleDisplayTypeChange"
            />
            <label for="title-mode">Title Display</label>
            <p class="mode-description">Show competition title and subtitle</p>
          </div>
          
          <div class="mode-option" :class="{ active: displayType === 'performer' }">
            <input
              type="radio"
              id="performer-mode"
              value="performer"
              v-model="displayType"
              @change="handleDisplayTypeChange"
            />
            <label for="performer-mode">Performer Display</label>
            <p class="mode-description">Show current performer and category</p>
          </div>
        </div>
      </div>

      <!-- Categories Panel -->
      <div class="panel categories-panel">
        <div class="panel-header">
          <h2>Category Selection</h2>
        </div>
        
        <div v-if="categoriesLoading" class="loading-inline">
          <div class="loading-spinner"></div>
          <span>Loading categories...</span>
        </div>
        
        <div v-else-if="categories.length === 0" class="no-data">
          No categories available. Please add categories in the Data Management section.
        </div>
        
        <div v-else class="categories-list">
          <div
            v-for="category in categories"
            :key="category.id"
            @click="selectCategory(category)"
            :class="['category-item', { active: currentCategory && currentCategory.id === category.id }]"
          >
            <span class="category-name">{{ category.name }}</span>
            <span v-if="currentCategory && currentCategory.id === category.id" class="current-indicator">Current</span>
          </div>
        </div>
      </div>

      <!-- Performers Panel -->
      <div class="panel performers-panel">
        <div class="panel-header">
          <h2>{{ currentCategory ? `Performers in ${currentCategory.name}` : 'Select a category first' }}</h2>
        </div>

        <div v-if="!currentCategory" class="no-selection">
          Please select a category from the list to manage performers.
        </div>

        <div v-else-if="performersLoading" class="loading-inline">
          <div class="loading-spinner"></div>
          <span>Loading performers...</span>
        </div>

        <div v-else-if="performers.length === 0" class="no-data">
          No performers found in this category. Add performers in the Data Management section.
        </div>

        <div v-else class="performers-management">
          <div class="current-performer-info" v-if="currentPerformer">
            <h3>Current Performer:</h3>
            <div class="info-panel">
              <div class="info-row">
                <span class="info-label">Name:</span>
                <span class="info-value">{{ currentPerformer.name }}</span>
              </div>
              <div class="info-row" v-if="currentPerformer.club">
                <span class="info-label">Club:</span>
                <span class="info-value">{{ currentPerformer.club }}</span>
              </div>
              <div class="info-row" v-if="currentPerformer.routine">
                <span class="info-label">Routine:</span>
                <span class="info-value">{{ currentPerformer.routine }}</span>
              </div>
            </div>
          </div>

          <div class="action-buttons">
            <button @click="handleNextPerformer" class="primary-button next-button">
              <span class="button-icon">▶</span>
              Next Performer
            </button>
          </div>

          <div class="performers-list">
            <h3>All Performers:</h3>
            <table class="performers-table">
              <thead>
                <tr>
                  <th class="order-column">#</th>
                  <th class="name-column">Name</th>
                  <th class="club-column">Club</th>
                 <th class="routine-column">Routine</th> 
                  <th class="action-column">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="(performer, index) in performers" 
                  :key="performer.id"
                  :class="{ 'current-row': currentPerformer && currentPerformer.id === performer.id }"
                >
                  <td>{{ performer.order }}</td>
                  <td>{{ performer.name }}</td>
                  <td>{{ performer.club || '—' }}</td>
                  <td>{{ performer.routine || '—' }}</td>
                  <td>
                    <button 
                      @click="selectPerformer(performer)" 
                      class="select-button"
                      :disabled="currentPerformer && currentPerformer.id === performer.id"
                    >
                      {{ currentPerformer && currentPerformer.id === performer.id ? 'Current' : 'Select' }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <div class="navigation-links">
      <router-link to="/settings" class="nav-link">Settings</router-link>
      <router-link to="/display" class="nav-link">Display</router-link>
      <router-link to="/data" class="nav-link">Data Management</router-link>
    </div>
  </div>
</template>

<script>
import { 
  getCategories, 
  getPerformers, 
  getDisplaySettings, 
  changeDisplayType, 
  changeDisplayCategory, 
  overrideCurrentPerformer,
  advanceToNextPerformer 
} from '../services/api';
import { isPerformerDisplayResponse } from '../types/display';

export default {
  name: 'Admin',
  data() {
    return {
      loading: true,
      error: null,
      
      // Display settings
      displayType: 'title',
      
      // Categories
      categories: [],
      currentCategory: null,
      categoriesLoading: false,
      
      // Performers
      performers: [],
      currentPerformer: null,
      performersLoading: false
    }
  },
  
  async mounted() {
    try {
      this.loading = true;
      await this.fetchInitialData();
      this.loading = false;
    } catch (err) {
      this.loading = false;
      this.error = "Failed to load initial data. Please refresh and try again.";
      console.error("Error loading initial data:", err);
    }
  },
  
  methods: {
    /**
     * Initialize the admin panel by fetching all necessary data
     */
    async fetchInitialData() {
      // Get current display settings to determine mode and current performers
      const displayData = await getDisplaySettings();
      
      // Set display type
      this.displayType = displayData.settings.displayType;
      
      // If we're in performer mode, set current performer and category
      if (isPerformerDisplayResponse(displayData)) {
        this.currentPerformer = displayData.performer;
        this.currentCategory = displayData.category;
      }
      
      // Load all categories
      await this.loadCategories();
      
      // If we have a current category, load its performers
      if (this.currentCategory) {
        await this.loadPerformers(this.currentCategory.id);
      }
    },
    
    /**
     * Load all available categories
     */
    async loadCategories() {
      try {
        this.categoriesLoading = true;
        this.categories = await getCategories();
        this.categoriesLoading = false;
      } catch (err) {
        this.categoriesLoading = false;
        this.error = "Failed to load categories.";
        console.error("Error loading categories:", err);
      }
    },
    
    /**
     * Load performers for a specific category
     */
    async loadPerformers(categoryId) {
      try {
        this.performersLoading = true;
        this.performers = await getPerformers(categoryId);
        this.performersLoading = false;
      } catch (err) {
        this.performersLoading = false;
        this.error = `Failed to load performers for the selected category.`;
        console.error("Error loading performers:", err);
      }
    },
    
    /**
     * Handle display type change
     */
    async handleDisplayTypeChange() {
      try {
        await changeDisplayType(this.displayType);
        this.showSuccessMessage(`Display changed to ${this.displayType === 'title' ? 'Title' : 'Performer'} mode`);
        
        // Refresh display data to get current state
        const displayData = await getDisplaySettings();
        
        if (isPerformerDisplayResponse(displayData)) {
          this.currentPerformer = displayData.performer;
          this.currentCategory = displayData.category;
          
          // Make sure performers are loaded for this category
          if (this.currentCategory) {
            await this.loadPerformers(this.currentCategory.id);
          }
        } else {
          // In title mode, we don't have a current performer
          this.currentPerformer = null;
        }
      } catch (err) {
        this.error = `Failed to change display type.`;
        console.error("Error changing display type:", err);
      }
    },
    
    /**
     * Select a category and load its performers
     */
    async selectCategory(category) {
      try {
        // Update the current category
        this.currentCategory = category;
        
        // Change the category on the server
        await changeDisplayCategory(category.id);
        
        // Load performers for this category
        await this.loadPerformers(category.id);
        
        // Refresh display data to get current state
        const displayData = await getDisplaySettings();
        
        if (isPerformerDisplayResponse(displayData)) {
          this.currentPerformer = displayData.performer;
        }
        
        this.showSuccessMessage(`Category changed to ${category.name}`);
      } catch (err) {
        this.error = "Failed to change category.";
        console.error("Error selecting category:", err);
      }
    },
    
    /**
     * Select a specific performer
     */
    async selectPerformer(performer) {
      try {
        await overrideCurrentPerformer(performer.id);
        this.currentPerformer = performer;
        this.showSuccessMessage(`Current performer set to ${performer.name}`);
      } catch (err) {
        this.error = "Failed to select performer.";
        console.error("Error selecting performer:", err);
      }
    },
    
    /**
     * Advance to the next performer
     */
    async handleNextPerformer() {
      try {
        const result = await advanceToNextPerformer();
        
        // Refresh display data to get current state
        const displayData = await getDisplaySettings();
        
        if (isPerformerDisplayResponse(displayData)) {
          this.currentPerformer = displayData.performer;
          this.currentCategory = displayData.category;
        }
        
        this.showSuccessMessage("Advanced to next performer");
      } catch (err) {
        this.error = "Failed to advance to next performer.";
        console.error("Error advancing to next performer:", err);
      }
    },
    
    /**
     * Success message handler (removed)
     */
    showSuccessMessage(message) {
      // Success messages removed
      console.log(message);
    },
  }
}
</script>

<style scoped>
/* Container */
.admin-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

h1 {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
}

h2 {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
}

h3 {
  font-size: 1.2rem;
  font-weight: bold;
  margin-top: 1rem;
  margin-bottom: 0.75rem;
}

/* Admin panels layout */
.admin-panels {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

@media (min-width: 768px) {
  .admin-panels {
    grid-template-columns: 1fr 1fr;
  }
  
  .display-type-panel {
    grid-column: 1 / -1;
  }
}

/* Panel styling */
.panel {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 0.5rem;
  overflow: hidden;
}

.panel-header {
  padding: 1rem;
  background-color: #e9ecef;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Display Type Panel */
.display-mode-selector {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
}

@media (min-width: 640px) {
  .display-mode-selector {
    flex-direction: row;
    gap: 2rem;
  }
}

.mode-option {
  padding: 1rem;
  border: 1px solid #dee2e6;
  border-radius: 0.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mode-option:hover {
  background-color: #e9ecef;
}

.mode-option.active {
  border-color: #0d6efd;
  background-color: rgba(13, 110, 253, 0.1);
}

.mode-option label {
  font-weight: bold;
  cursor: pointer;
}

.mode-description {
  font-size: 0.875rem;
  color: #6c757d;
  margin: 0;
}

/* Categories List */
.categories-list {
  max-height: 300px;
  overflow-y: auto;
  padding: 0.5rem;
}

.category-item {
  padding: 0.75rem 1rem;
  border-radius: 0.25rem;
  margin-bottom: 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  background-color: #fff;
  border: 1px solid #dee2e6;
  transition: all 0.2s ease;
}

.category-item:hover {
  background-color: #f1f3f5;
}

.category-item.active {
  border-color: #0d6efd;
  background-color: rgba(13, 110, 253, 0.1);
}

.current-indicator {
  background-color: #0d6efd;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
}

/* Performers Table */
.performers-management {
  padding: 1rem;
}

.performers-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

.performers-table th,
.performers-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #dee2e6;
}

.performers-table th {
  background-color: #e9ecef;
  font-weight: bold;
}

.performers-table tr:hover {
  background-color: #f1f3f5;
}

.current-row {
  background-color: rgba(13, 110, 253, 0.1);
}

.order-column {
  width: 50px;
}

.action-column {
  width: 100px;
  text-align: center;
}

/* Current Performer Info */
.current-performer-info {
  background-color: #e9ecef;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1rem;
}

.info-panel {
  background-color: white;
  border-radius: 0.25rem;
  padding: 0.75rem;
}

.info-row {
  display: flex;
  margin-bottom: 0.5rem;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-label {
  font-weight: bold;
  width: 80px;
}

/* Buttons */
.primary-button {
  background-color: #0d6efd;
  color: white;
  border: none;
  border-radius: 0.25rem;
  padding: 0.5rem 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
}

.primary-button:hover {
  background-color: #0b5ed7;
}

.next-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
}

.button-icon {
  font-size: 0.875rem;
}

.select-button {
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 0.25rem;
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.select-button:hover {
  background-color: #5a6268;
}

.select-button:disabled {
  background-color: #28a745;
  cursor: default;
}

.action-buttons {
  margin: 1rem 0;
  display: flex;
  gap: 0.5rem;
}

/* Navigation Links */
.navigation-links {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #dee2e6;
}

.nav-link {
  color: #0d6efd;
  text-decoration: none;
  font-weight: bold;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  transition: all 0.2s;
}

.nav-link:hover {
  background-color: rgba(13, 110, 253, 0.1);
}

/* Messages */
.error-message {
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #f8d7da;
  color: #842029;
  border: 1px solid #f5c2c7;
}

.icon {
  font-size: 1.25rem;
}

/* Loading */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  gap: 1rem;
}

.loading-inline {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  gap: 0.5rem;
}

.loading-spinner {
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-top-color: #0d6efd;
  border-radius: 50%;
  width: 2rem;
  height: 2rem;
  animation: spin 1s linear infinite;
}

.loading-inline .loading-spinner {
  width: 1.5rem;
  height: 1.5rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* No data states */
.no-data,
.no-selection {
  padding: 2rem;
  text-align: center;
  color: #6c757d;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>