<template>
  <div class="data-container">
    <h1>Data Management</h1>

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

    <div v-else class="data-panels">
      <!-- Categories Panel -->
      <div class="panel categories-panel">
        <div class="panel-header">
          <h2>Categories</h2>
          <button @click="showAddCategoryForm = true" class="primary-button">Add Category</button>
        </div>

        <div class="categories-list">
          <div
            v-for="category in categories"
            :key="category.id"
            @click="selectCategory(category)"
            :class="[
              'category-item',
              { active: selectedCategory && selectedCategory.id === category.id },
            ]"
          >
            <span class="category-name">{{ category.name }}</span>
            <div class="category-actions">
              <button @click.stop="editCategory(category)" class="icon-button edit">✏️</button>
              <button @click.stop="confirmDeleteCategory(category)" class="icon-button delete">
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Performers Panel -->
      <div class="panel performers-panel">
        <div class="panel-header">
          <h2>
            {{ selectedCategory ? `Performers in ${selectedCategory.name}` : 'Select a category' }}
          </h2>
          <button
            v-if="selectedCategory"
            @click="showAddPerformerForm = true"
            class="primary-button"
          >
            Add Performer
          </button>
        </div>

        <div v-if="!selectedCategory" class="no-selection">
          Please select a category from the list to manage performers.
        </div>

        <div v-else-if="performersLoading" class="loading">
          <div class="loading-spinner"></div>
          <span>Loading performers...</span>
        </div>

        <div v-else class="performers-container">
          <!-- Performers List -->
          <div v-if="performers.length === 0" class="no-performers">
            No performers found in this category. Add your first performer!
          </div>

          <div v-else class="performers-table-wrapper">
            <table class="performers-table">
              <thead>
                <tr>
                  <th class="order-column">#</th>
                  <th class="handle-column"></th>
                  <th class="name-column">Name</th>
                  <th class="club-column">Club</th>
                  <th class="routine-column">Routine</th>
                  <th class="actions-column">Actions</th>
                </tr>
              </thead>
              <draggable
                tag="tbody"
                v-model="sortablePerformers"
                item-key="id"
                handle=".drag-handle"
                @end="onReorderEnd"
                :animation="200"
                ghost-class="ghost-row"
              >
                <template #item="{ element: performer, index }">
                  <tr class="performer-row">
                    <td class="order-cell">{{ index + 1 }}</td>
                    <td class="handle-column">
                      <div class="drag-handle" title="Drag to reorder">
                        <span class="drag-icon">⠿</span>
                      </div>
                    </td>
                    <td class="name-cell">{{ performer.name }}</td>
                    <td class="club-cell">{{ performer.club }}</td>
                    <td class="routine-cell">{{ performer.routine || '—' }}</td>
                    <td class="actions-cell">
                      <div class="row-actions">
                        <button
                          @click="editPerformer(performer)"
                          class="icon-button edit"
                          title="Edit performer"
                        >
                          ✏️
                        </button>
                        <button
                          @click="confirmDeletePerformer(performer)"
                          class="icon-button delete"
                          title="Delete performer"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                </template>
              </draggable>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Performer Form Modal -->
    <PerformerFormModal
      v-if="showAddPerformerForm || isEditingPerformer"
      :performer="performerForm"
      :category-id="selectedCategory?.id"
      :is-editing="isEditingPerformer"
      @save="savePerformer"
      @cancel="cancelPerformerEdit"
    />

    <!-- Category Form Modal -->
    <CategoryFormModal
      v-if="showAddCategoryForm || isEditingCategory"
      :category="categoryForm"
      :is-editing="isEditingCategory"
      @save="saveCategory"
      @cancel="cancelCategoryEdit"
    />

    <!-- Confirmation Dialog -->
    <ConfirmationDialog
      v-if="showConfirmationDialog"
      :title="confirmationDialog.title"
      :message="confirmationDialog.message"
      @confirm="confirmationDialog.onConfirm"
      @cancel="showConfirmationDialog = false"
    />

    <div class="navigation-links">
      <router-link to="/" class="nav-link">Admin</router-link>
      <router-link to="/settings" class="nav-link">Settings</router-link>
      <router-link to="/display" class="nav-link">Display</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getPerformers,
  createPerformer,
  updatePerformer,
  deletePerformer,
} from '../services/api.js'
import PerformerFormModal from './PerformerFormModal.vue'
import CategoryFormModal from './CategoryFormModal.vue'
import ConfirmationDialog from './ConfirmationDialog.vue'
import draggable from 'vuedraggable'

// Register components
const components = {
  draggable,
}

// State
const categories = ref([])
const performers = ref([])
const selectedCategory = ref(null)
const loading = ref(true)
const performersLoading = ref(false)
const error = ref('')

// Category form state
const categoryForm = ref({ name: '' })
const isEditingCategory = ref(false)
const showAddCategoryForm = ref(false)

// Performer form state
const performerForm = ref({
  order: '',
  name: '',
  club: '',
  routine: '',
  category_id: '',
})
const isEditingPerformer = ref(false)
const showAddPerformerForm = ref(false)

// Confirmation dialog state
const showConfirmationDialog = ref(false)
const confirmationDialog = ref({
  title: '',
  message: '',
  onConfirm: () => {},
})

// Computed properties
// Initial sorted performers
const sortedPerformers = computed(() => {
  return [...performers.value].sort((a, b) => {
    // Sort by order field (convert to number to ensure proper numeric sorting)
    // Always provide a default value of 0 if order is undefined
    const aValue = Number(a.order || 0)
    const bValue = Number(b.order || 0)
    return aValue - bValue
  })
})

// Sortable performers - automatically updates when drag-and-drop reordering is done
const sortablePerformers = computed({
  get() {
    return sortedPerformers.value
  },
  set(newValue) {
    // Simply update the performers array with the new order
    // Don't modify the order property here - we'll do that in onReorderEnd
    performers.value = [...newValue]
  },
})

// Handle reordering of performers
async function onReorderEnd(event) {
  try {
    const { newIndex, oldIndex } = event
    if (newIndex === oldIndex) return // No change

    // Update loading state
    performersLoading.value = true
    error.value = '' // Clear any previous errors

    // Get the currently sorted performers array after the drag operation
    const updatedPerformers = [...performers.value]

    // Log for debugging
    console.log('Updating performer orders...')

    // Calculate the range of indexes that need updating
    const startIndex = Math.min(oldIndex, newIndex)
    const endIndex = Math.max(oldIndex, newIndex)

    // Create a batch of updates for all performers in the affected range
    const updatePromises = []

    // Update each performer in the affected range
    for (let i = 0; i < updatedPerformers.length; i++) {
      const performer = updatedPerformers[i]

      // Make sure we have the required data
      if (!performer?.id || !performer?.name || !performer?.club || !performer?.category_id) {
        console.error('Missing required data for performer:', performer)
        continue
      }

      // Update all performers with a new order value
      const order = String(i + 1) // order is 1-based

      // Only update if the order has changed
      if (performer.order !== order) {
        // Create a clean update object with all required fields
        const updateData = {
          order,
          name: performer.name,
          club: performer.club,
          category_id: performer.category_id,
          routine: performer.routine || '',
        }

        console.log(`Updating performer ${performer.name} to order ${updateData.order}`)

        // Update the local representation
        performer.order = updateData.order

        // Add to our batch of updates
        updatePromises.push(
          updatePerformer(performer.id, updateData).catch(error => {
            console.error(`Error updating performer ${performer.name}:`, error)
            throw error
          })
        )
      }
    }

    // Wait for all updates to complete
    if (updatePromises.length > 0) {
      await Promise.all(updatePromises)
      console.log(`Updated the order of ${updatePromises.length} performers successfully`)
    } else {
      console.log('No performer order changes were needed')
    }

    // Apply a tiny delay then run a refresh to ensure data consistency
    setTimeout(async () => {
      if (selectedCategory.value) {
        console.log('Refreshing performers from server...')
        await fetchPerformersForCategory(selectedCategory.value.id)
      }
    }, 300)
  } catch (err) {
    error.value = `Failed to update performer order: ${err.message}`
    // If there's an error, reset by reloading the performers
    if (selectedCategory.value) {
      await fetchPerformersForCategory(selectedCategory.value.id)
    }
  } finally {
    performersLoading.value = false
  }
}

// Fetch data on component mount
onMounted(async () => {
  try {
    loading.value = true
    await fetchCategories()
  } catch (err) {
    error.value = `Failed to load data: ${err.message}`
  } finally {
    loading.value = false
  }
})

// Watch for changes to selected category to load its performers
watch(selectedCategory, async newCategory => {
  if (newCategory) {
    await fetchPerformersForCategory(newCategory.id)
  } else {
    performers.value = []
  }
})

// Fetch all categories
async function fetchCategories() {
  try {
    categories.value = await getCategories()
  } catch (err) {
    error.value = `Failed to load categories: ${err.message}`
    throw err
  }
}

// Fetch performers for a specific category
async function fetchPerformersForCategory(categoryId) {
  try {
    performersLoading.value = true
    // Clear performers first to avoid stale data
    performers.value = []
    // Then fetch fresh data
    const fetchedPerformers = await getPerformers(categoryId)

    // Sort performers by order before assigning to ensure consistent order display
    const sortedFetchedPerformers = [...fetchedPerformers].sort((a, b) => {
      return Number(a.order || 0) - Number(b.order || 0)
    })

    // Use assignment after fetch and sort to ensure reactivity
    performers.value = sortedFetchedPerformers
  } catch (err) {
    error.value = `Failed to load performers: ${err.message}`
  } finally {
    performersLoading.value = false
  }
}

// Select a category
function selectCategory(category) {
  selectedCategory.value = category
  // Reset category form when selecting a new category
  resetCategoryForm()
}

// Category CRUD operations
function editCategory(category) {
  // Create a copy of the category
  categoryForm.value = { ...category }
  isEditingCategory.value = true
  showAddCategoryForm.value = true
}

function cancelCategoryEdit() {
  resetCategoryForm()

  // No need to refresh data as we haven't changed anything
}

function resetCategoryForm() {
  categoryForm.value = { name: '' }
  isEditingCategory.value = false
  showAddCategoryForm.value = false
}

async function saveCategory(category) {
  try {
    if (isEditingCategory.value) {
      await updateCategory(category.id, category.name)
    } else {
      const newCategory = await createCategory(category.name)
      categories.value.push(newCategory)
    }

    // Close the form first for better UI responsiveness
    resetCategoryForm()

    // Then refresh categories list
    await fetchCategories()
  } catch (err) {
    error.value = err.message
  }
}

function confirmDeleteCategory(category) {
  confirmationDialog.value = {
    title: 'Delete Category',
    message: `Are you sure you want to delete the category "${category.name}"? This will also delete all performers in this category!`,
    onConfirm: async () => {
      try {
        await deleteCategory(category.id)
        categories.value = categories.value.filter(c => c.id !== category.id)

        // If the deleted category was selected, clear selection
        if (selectedCategory.value && selectedCategory.value.id === category.id) {
          selectedCategory.value = null
        }

        showConfirmationDialog.value = false
      } catch (err) {
        error.value = err.message
      }
    },
  }
  showConfirmationDialog.value = true
}

// Performer CRUD operations
function editPerformer(performer) {
  // Create a copy of the performer
  const performerData = {
    ...performer,
  }
  performerForm.value = performerData
  isEditingPerformer.value = true
  showAddPerformerForm.value = true
}

async function cancelPerformerEdit() {
  resetPerformerForm()

  // Refresh the performer list when modal is closed to ensure up-to-date data
  if (selectedCategory.value) {
    await fetchPerformersForCategory(selectedCategory.value.id)
  }
}

function resetPerformerForm() {
  // Reset form fields
  performerForm.value = {
    order: '',
    name: '',
    club: '',
    routine: '',
    category_id: selectedCategory.value ? selectedCategory.value.id : '',
  }
  // Close modal by setting both flags to false
  isEditingPerformer.value = false
  showAddPerformerForm.value = false
}

async function savePerformer(performer) {
  try {
    // Make a copy of the performer data
    let performerData = { ...performer }

    if (!isEditingPerformer.value) {
      // For new performers, calculate the next order number (highest + 1)
      const highestOrder = performers.value.reduce((max, p) => {
        const currentOrder = parseInt(p.order || 0)
        return currentOrder > max ? currentOrder : max
      }, 0)

      // Set order field
      performerData.order = String(highestOrder + 1)
    }

    if (isEditingPerformer.value) {
      // Ensure we use the correct format when updating a performer
      await updatePerformer(performerData.id, {
        order: performerData.order,
        name: performerData.name,
        club: performerData.club,
        category_id: performerData.category_id,
        routine: performerData.routine || '',
      })
    } else {
      await createPerformer(performerData)
    }

    // First close the form to improve UI responsiveness
    resetPerformerForm()

    // Then refresh performers list
    if (selectedCategory.value) {
      await fetchPerformersForCategory(selectedCategory.value.id)
    }
  } catch (err) {
    error.value = err.message
  }
}

function confirmDeletePerformer(performer) {
  confirmationDialog.value = {
    title: 'Delete Performer',
    message: `Are you sure you want to delete the performer "${performer.name}"?`,
    onConfirm: async () => {
      try {
        await deletePerformer(performer.id)
        performers.value = performers.value.filter(p => p.id !== performer.id)
        showConfirmationDialog.value = false
      } catch (err) {
        error.value = err.message
      }
    },
  }
  showConfirmationDialog.value = true
}
</script>

<style scoped>
.data-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  color: #333;
  box-sizing: border-box;
  width: 100%;
}

.data-container h1 {
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  color: #2c3e50;
  text-align: center;
  font-weight: 600;
  border-bottom: 2px solid #eaeaea;
  padding-bottom: 0.75rem;
}

.data-panels {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 20px;
}

.panel {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  padding: 1.5rem;
  box-sizing: border-box;
  max-width: 100%;
  overflow: hidden;
}

.panel h2 {
  font-size: 1.8rem;
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #2c3e50;
  border-bottom: 2px solid #eaeaea;
  padding-bottom: 0.5rem;
}

.panel h3 {
  font-size: 1.4rem;
  margin-top: 1.5rem;
  margin-bottom: 1rem;
  color: #2c3e50;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.panel-header h2 {
  margin: 0;
  border-bottom: none;
  padding-bottom: 0;
}

/* Categories Panel Styles */
.categories-list {
  margin-bottom: 2rem;
  max-height: 300px;
  overflow-y: auto;
}

.category-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 8px;
  background-color: #f9fafc;
  border: 1px solid #edf2f7;
  cursor: pointer;
  transition: all 0.2s ease;
}

.category-item:hover {
  background-color: #f0f4f8;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.category-item.active {
  background-color: #e6f7ff;
  border-color: #91d5ff;
  border-left: 4px solid #1890ff;
}

.category-name {
  font-weight: 500;
  font-size: 1.1rem;
}

.category-actions {
  display: flex;
  gap: 8px;
}

.icon-button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-button:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.icon-button.edit:hover {
  background-color: rgba(52, 152, 219, 0.1);
  color: #3498db;
}

.icon-button.delete:hover {
  background-color: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
}

/* Performers Panel Styles */
.performers-container {
  max-height: 600px;
  overflow-y: auto;
}

.performers-table-wrapper {
  width: 100%;
  overflow-x: auto;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.performers-table {
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
  background-color: #fff;
  font-size: 0.95rem;
}

.performers-table thead {
  background-color: #f8fafc;
  position: sticky;
  top: 0;
  z-index: 10;
}

.performers-table th {
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: #2c3e50;
  border-bottom: 2px solid #eaeaea;
}

.performers-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #edf2f7;
  vertical-align: middle;
}

.order-column {
  width: 40px;
  text-align: center;
}

.handle-column {
  width: 30px;
  text-align: center;
}

.name-column {
  width: 25%;
}

.club-column {
  width: 25%;
}

.actions-column {
  width: 100px;
  text-align: center;
}

.drag-handle {
  cursor: grab;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 1.2rem;
  user-select: none;
}

.drag-handle:hover {
  color: #555;
}

.drag-icon {
  transform: rotate(90deg);
  display: inline-block;
}

.ghost-row {
  opacity: 0.5;
  background: #c8ebfb !important;
}

.order-cell {
  font-weight: 600;
  color: #1890ff;
  text-align: center;
}

.name-cell {
  font-weight: 500;
}

.routine-cell {
  color: #666;
}

.actions-cell {
  text-align: center;
}

.row-actions {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.performer-row {
  transition: all 0.2s ease;
}

.performer-row:hover {
  background-color: #f0f4f8;
}

.no-performers,
.no-selection {
  padding: 32px;
  text-align: center;
  color: #666;
  background-color: #f9fafc;
  border-radius: 8px;
  border: 1px dashed #ddd;
}

/* Form Styles */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

label {
  font-weight: 600;
  font-size: 1.1rem;
  color: #2c3e50;
}

input {
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s ease;
  background-color: #ffffff;
}

input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
}

.form-actions {
  display: flex;
  gap: 12px;
}

.primary-button {
  background-color: #3498db;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(52, 152, 219, 0.2);
}

.primary-button:hover {
  background-color: #2980b9;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(52, 152, 219, 0.3);
}

.secondary-button {
  background-color: #e0e0e0;
  color: #333;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.secondary-button:hover {
  background-color: #d0d0d0;
  transform: translateY(-2px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

/* Navigation Links */
.navigation-links {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
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

/* Message and Loading Styles */
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
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Animation transitions */
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.3s,
    transform 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Responsive Styles */
@media (max-width: 768px) {
  .data-panels {
    grid-template-columns: 1fr;
  }

  .data-container h1 {
    font-size: 1.8rem;
  }

  .panel h2 {
    font-size: 1.5rem;
  }

  .performers-table {
    font-size: 0.9rem;
  }

  .performers-table th,
  .performers-table td {
    padding: 10px 8px;
  }

  .routine-column,
  .routine-cell {
    display: none; /* Hide the routine column on small screens */
  }

  .order-column {
    width: 30px;
  }

  .handle-column {
    width: 25px;
  }

  .actions-column {
    width: 80px;
  }
}

@media (max-width: 480px) {
  .club-column,
  .club-cell {
    display: none; /* Hide the club column on very small screens */
  }

  .performers-table th,
  .performers-table td {
    padding: 8px 6px;
  }

  .order-column {
    width: 25px;
  }

  .handle-column {
    width: 20px;
  }
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
</style>
