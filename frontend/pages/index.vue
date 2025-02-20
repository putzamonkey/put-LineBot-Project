<template>
  <div class="min-h-screen bg-white dark:bg-gray-900">
    <!-- Header -->
    <header class="flex items-center justify-between border-b p-4 bg-white dark:bg-gray-900 dark:border-gray-800">
      <h1 class="text-xl font-bold dark:text-white">LINE BOT</h1>
      <div class="relative">
        <button
          @click="isPowerMenuOpen = !isPowerMenuOpen"
          class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <PowerIcon class="h-5 w-5 dark:text-white" />
        </button>
        <!-- Power Menu Dropdown -->
        <div
          v-if="isPowerMenuOpen"
          class="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5"
        >
          <div class="py-1">
            <button
              @click="handleReboot"
              class="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Reboot
            </button>
            <button
              @click="handleShutdown"
              class="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Shutdown
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto p-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Logs Section -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
          <div class="p-4 border-b dark:border-gray-700">
            <h2 class="text-lg font-semibold dark:text-white">Logs</h2>
          </div>
          <div class="p-4 space-y-4">
            <textarea
              v-model="logs"
              class="w-full h-[400px] p-3 rounded-md border dark:border-gray-700 bg-gray-50 dark:bg-gray-900 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-gray-200"
              placeholder="System logs will appear here..."
            ></textarea>
            <div class="flex justify-end gap-2">
              <button
                @click="handleClearLogs"
                class="px-4 py-2 rounded-md border dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200"
              >
                Clear
              </button>
              <button
                @click="handleExportLogs"
                class="px-4 py-2 rounded-md border dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200"
              >
                Export
              </button>
            </div>
          </div>
        </div>

        <!-- Announcement Section -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
          <div class="p-4 border-b dark:border-gray-700">
            <h2 class="text-lg font-semibold dark:text-white">Announcement</h2>
          </div>
          <div class="p-4 space-y-4">
            <textarea
              v-model="announcement"
              class="w-full h-[400px] p-3 rounded-md border dark:border-gray-700 bg-gray-50 dark:bg-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-gray-200"
              placeholder="Type your announcement here..."
            ></textarea>
            <div class="flex justify-end">
              <button
                @click="handleMakeAnnouncement"
                class="px-4 py-2 rounded-md bg-primary-500 text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                Make Announcement
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { PowerIcon } from '@heroicons/vue/24/outline'

// State
const logs = ref('')
const announcement = ref('')
const isPowerMenuOpen = ref(false)

// Methods
const handleClearLogs = () => {
  logs.value = ''
}

const handleExportLogs = () => {
  const blob = new Blob([logs.value], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'logs.txt'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const handleMakeAnnouncement = () => {
  if (announcement.value.trim()) {
    // TODO: Implement announcement functionality
    console.log('Sending announcement:', announcement.value)
    announcement.value = ''
  }
}

const handleReboot = () => {
  // TODO: Implement reboot functionality
  console.log('Rebooting system...')
  isPowerMenuOpen.value = false
}

const handleShutdown = () => {
  // TODO: Implement shutdown functionality
  console.log('Shutting down system...')
  isPowerMenuOpen.value = false
}

// Close power menu when clicking outside
const closeOnClickOutside = (e) => {
  if (isPowerMenuOpen.value) {
    isPowerMenuOpen.value = false
  }
}

// Add click outside listener
onMounted(() => {
  document.addEventListener('click', closeOnClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', closeOnClickOutside)
})
</script>

<style>
/* Add any custom styles here if needed */
</style>