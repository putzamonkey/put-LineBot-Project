<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Video Information Extractor</h1>
    <div class="mb-4">
      <input type="file" @change="handleFileUpload" accept="video/*" class="mb-2" />
      <button @click="processVideo" class="bg-blue-500 text-white px-4 py-2 rounded">
        Process Video
      </button>
    </div>
    <div v-if="videoInfo" class="bg-gray-100 p-4 rounded">
      <h2 class="text-xl font-semibold mb-2">Video Information:</h2>
      <p><strong>FPS:</strong> {{ videoInfo.fps }}</p>
      <p><strong>Resolution:</strong> {{ videoInfo.resolution }}</p>
      <p><strong>Quality:</strong> {{ videoInfo.quality }}</p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      selectedFile: null,
      videoInfo: null,
    }
  },
  methods: {
    handleFileUpload(event) {
      this.selectedFile = event.target.files[0]
    },
    async processVideo() {
      if (!this.selectedFile) {
        alert('Please select a video file first.')
        return
      }

      const formData = new FormData()
      formData.append('video', this.selectedFile)

      try {
        const response = await this.$axios.post('/api/process-video', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        this.videoInfo = response.data
      } catch (error) {
        console.error('Error processing video:', error)
        alert('An error occurred while processing the video.')
      }
    },
  },
}
</script>