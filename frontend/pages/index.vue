<template>
  <div class="container mx-auto p-4">
    <h1 class="text-3xl font-bold text-blue-600">LINE Bot Video Processor</h1>
    
    <!-- Input ส่งคำสั่ง -->
    <div class="flex flex-col space-y-4 mt-4">
      <input v-model="userMessage" type="text" placeholder="Enter command (e.g., fps:30)" class="border p-2 rounded" />
      <button @click="sendCommand" class="bg-blue-500 text-white p-2 rounded">Send Command</button>
    </div>

    <!-- แสดงผลลัพธ์ -->
    <div v-if="responseMessage" class="mt-4 p-2 bg-gray-100 rounded">
      <strong>Response:</strong> {{ responseMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const userMessage = ref('')
const responseMessage = ref('')
const API_BASE = 'http://localhost:8080' // Backend URL

// ฟังก์ชันส่งคำสั่งไปที่ API
const sendCommand = async () => {
  if (!userMessage.value) {
    responseMessage.value = "Please enter a command."
    return
  }

  try {
    const response = await fetch(`${API_BASE}/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        events: [
          {
            type: 'message',
            message: { type: 'text', text: userMessage.value }
          }
        ]
      })
    })
    
    const data = await response.json()
    responseMessage.value = JSON.stringify(data, null, 2)
  } catch (error) {
    responseMessage.value = "Error sending request"
  }
}
</script>

<style scoped>
.container {
  max-width: 600px;
  margin: auto;
}
</style>