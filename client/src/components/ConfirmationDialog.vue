<template>
  <div class="confirmation-overlay" @click.self="$emit('cancel')">
    <div class="confirmation-dialog">
      <div class="dialog-header">
        <h3>{{ title }}</h3>
        <button class="close-button" @click="$emit('cancel')">&times;</button>
      </div>
      <div class="dialog-body">
        <p>{{ message }}</p>
      </div>
      <div class="dialog-footer">
        <button class="cancel-button" @click="$emit('cancel')">Cancel</button>
        <button class="confirm-button" @click="$emit('confirm')">Confirm</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  }
})

defineEmits(['confirm', 'cancel'])
</script>

<style scoped>
.confirmation-overlay {
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

.confirmation-dialog {
  background-color: #fff;
  border-radius: 12px;
  width: 100%;
  max-width: 450px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  animation: dialog-appear 0.3s ease;
}

@keyframes dialog-appear {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #eaeaea;
}

.dialog-header h3 {
  margin: 0;
  font-size: 1.4rem;
  color: #e74c3c;
  font-weight: 600;
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

.dialog-body {
  padding: 24px;
}

.dialog-body p {
  margin: 0;
  font-size: 1.1rem;
  line-height: 1.5;
  color: #555;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #eaeaea;
}

.cancel-button {
  background-color: #e0e0e0;
  color: #333;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.cancel-button:hover {
  background-color: #d0d0d0;
  transform: translateY(-2px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.confirm-button {
  background-color: #e74c3c;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(231, 76, 60, 0.2);
}

.confirm-button:hover {
  background-color: #c0392b;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(231, 76, 60, 0.3);
}

/* Mobile Responsive */
@media (max-width: 600px) {
  .confirmation-dialog {
    width: 90%;
  }
  
  .dialog-body {
    padding: 16px;
  }
  
  .dialog-header {
    padding: 12px 16px;
  }
  
  .dialog-footer {
    padding: 12px 16px;
  }
}
</style>
