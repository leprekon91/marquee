<template>
  <div v-if="modelValue" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Import Performers from CSV</h2>
        <button class="close-button" @click="closeModal">×</button>
      </div>
      <div class="modal-body">
        <div class="csv-info">
          <p>Upload a CSV file with the following columns:</p>
          <ul>
            <li><strong>name</strong>: Performer name (required)</li>
            <li><strong>club</strong>: Performer club (required)</li>
            <li><strong>category</strong>: Category name (required)</li>
            <li><strong>routine</strong>: Performer routine (optional)</li>
          </ul>
          <div class="info-alert">
            <p><strong>Warning:</strong> Importing will replace all existing categories and performers!</p>
          </div>
        </div>

        <div class="file-upload-container">
          <label for="csv-file" class="file-upload-label">
            <span v-if="!selectedFile">Choose CSV File</span>
            <span v-else>{{ selectedFile.name }}</span>
          </label>
          <input
            type="file"
            id="csv-file"
            ref="fileInput"
            accept=".csv"
            @change="handleFileSelected"
          />
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </div>
      <div class="modal-footer">
        <button class="secondary-button" @click="closeModal">Cancel</button>
        <button
          class="primary-button"
          @click="handleImport"
          :disabled="importing || !selectedFile"
        >
          <span v-if="importing">Importing...</span>
          <span v-else>Import</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, watch } from 'vue'
import { importPerformersFromCsv } from '../services/api'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'import-success', 'import-error'])

const selectedFile = ref(null)
const error = ref('')
const importing = ref(false)
const fileInput = ref(null)

// Reset the form when the modal is closed
watch(
  () => props.modelValue,
  (isOpen) => {
    if (!isOpen) {
      resetForm()
    }
  }
)

function handleFileSelected(event) {
  const file = event.target.files[0]
  if (file && file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
    error.value = 'Please select a valid CSV file'
    selectedFile.value = null
    return
  }
  
  selectedFile.value = file
  error.value = ''
}

async function handleImport() {
  if (!selectedFile.value) {
    error.value = 'Please select a CSV file'
    return
  }

  try {
    importing.value = true
    error.value = ''
    
    const result = await importPerformersFromCsv(selectedFile.value)
    emit('import-success', result)
    closeModal()
  } catch (err) {
    error.value = err.message || 'Failed to import data'
    emit('import-error', err)
  } finally {
    importing.value = false
  }
}

function closeModal() {
  emit('update:modelValue', false)
}

function resetForm() {
  selectedFile.value = null
  error.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
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
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eaeaea;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.6rem;
  color: #2c3e50;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.8rem;
  cursor: pointer;
  color: #666;
}

.close-button:hover {
  color: #333;
}

.modal-body {
  padding: 20px;
}

.modal-footer {
  padding: 16px 20px;
  border-top: 1px solid #eaeaea;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.csv-info {
  margin-bottom: 20px;
}

.csv-info ul {
  background-color: #f9f9f9;
  padding: 12px 12px 12px 32px;
  border-radius: 6px;
  border-left: 3px solid #2c3e50;
}

.csv-info li {
  margin-bottom: 6px;
}

.info-alert {
  margin-top: 16px;
  padding: 12px;
  background-color: #fff3cd;
  color: #856404;
  border-radius: 4px;
  border-left: 4px solid #ffeeba;
}

.file-upload-container {
  margin-bottom: 20px;
}

.file-upload-label {
  display: block;
  padding: 12px;
  background-color: #f8f9fa;
  border: 2px dashed #ccc;
  border-radius: 4px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.file-upload-label:hover {
  border-color: #4299e1;
  background-color: #ebf8ff;
}

input[type="file"] {
  display: none;
}

.error-message {
  color: #e53e3e;
  margin-top: 12px;
  padding: 10px;
  background-color: #fed7d7;
  border-radius: 4px;
}

.primary-button,
.secondary-button {
  padding: 10px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.primary-button {
  background-color: #4299e1;
  color: white;
}

.primary-button:hover:not(:disabled) {
  background-color: #3182ce;
}

.primary-button:disabled {
  background-color: #a0aec0;
  cursor: not-allowed;
}

.secondary-button {
  background-color: #e2e8f0;
  color: #2d3748;
}

.secondary-button:hover {
  background-color: #cbd5e0;
}
</style>
