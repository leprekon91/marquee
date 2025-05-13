<template>
  <div class="modal-overlay" @click.self="$emit('cancel')">
    <div class="modal-container">
      <div class="modal-header">
        <h2>{{ isEditing ? 'Edit Category' : 'Add Category' }}</h2>
        <button class="close-button" @click="$emit('cancel')">&times;</button>
      </div>
      
      <form @submit.prevent="handleSubmit" class="modal-body">
        <div class="form-group">
          <label for="category-name">Category Name</label>
          <input
            id="category-name"
            v-model="form.name"
            type="text"
            placeholder="Enter category name"
            required
          />
        </div>
        
        <div class="modal-footer">
          <button type="button" class="secondary-button" @click="$emit('cancel')">
            Cancel
          </button>
          <button type="submit" class="primary-button">
            {{ isEditing ? 'Update' : 'Add' }} Category
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  category: {
    type: Object,
    default: () => ({
      name: ''
    })
  },
  isEditing: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['save', 'cancel'])

const form = ref({
  id: props.category.id || null,
  name: props.category.name || ''
})

onMounted(() => {
  // Focus on the name input field when modal opens
  document.getElementById('category-name')?.focus()
})

function handleSubmit() {
  // Create a copy of the form data
  const formData = { ...form.value }
  
  // Emit the save event with the form data
  emit('save', formData)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal-container {
  background-color: #fff;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  animation: modal-appear 0.3s ease;
}

@keyframes modal-appear {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #eaeaea;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #2c3e50;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  transition: all 0.2s;
}

.close-button:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: #333;
}

.modal-body {
  padding: 24px;
  max-height: 70vh;
  overflow-y: auto;
  width: 100%;
  box-sizing: border-box;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #eaeaea;
  margin-top: 16px;
}

.form-group {
  margin-bottom: 20px;
  width: 100%;
}

label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  color: #2c3e50;
}

input {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s ease;
  box-sizing: border-box;
  max-width: 100%;
}

input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
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

/* Mobile Responsive */
@media (max-width: 600px) {
  .modal-container {
    width: 95%;
    max-height: 90vh;
  }
  
  .modal-body {
    padding: 16px;
  }
  
  .modal-header {
    padding: 12px 16px;
  }
  
  .modal-footer {
    padding-top: 12px;
  }
  
  input {
    font-size: 14px;
    padding: 10px;
  }
}
</style>
