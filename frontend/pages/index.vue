<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">LINE Bot Video Processor</h1>
    
    <div class="flex flex-col space-y-4">
      <input v-model="userMessage" type="text" placeholder="Enter command" class="border p-2 rounded" />
      <button @click="sendCommand" class="bg-blue-500 text-white p-2 rounded">Send Command</button>
    </div>

    <div v-if="responseMessage" class="mt-4 p-2 bg-gray-100 rounded">
      <strong>Response:</strong> {{ responseMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const userMessage = ref('')
const responseMessage = ref('')

const sendCommand = async () => {
  try {
    const response = await fetch('http://localhost:8080/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events: [{ type: 'message', message: { type: 'text', text: userMessage.value } }] })
    })
    const data = await response.json()
    responseMessage.value = JSON.stringify(data)
  } catch (error) {
    responseMessage.value = 'Error sending request'
  }
}
</script>

<style scoped>
.container {
  max-width: 600px;
  margin: auto;
}
</style>
