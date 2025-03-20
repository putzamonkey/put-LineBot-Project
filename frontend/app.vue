<template>
  <div>
    <!-- ✅ Header -->
    <nav class="bg-[#00B900] text-white p-4 flex justify-between items-center">
      <!-- ✅ Title -->
      <span class="text-lg font-bold">Line Bot Admin Panel</span>

      <!-- ✅ Dropdown Menus -->
      <div class="flex space-x-4">
        <!-- Bot Dropdown -->
        <div class="relative group">
          <button class="px-4 py-2 bg-white text-black rounded-md">Bot ⌄</button>
          <div class="absolute left-0 mt-2 w-32 bg-white text-black rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
            <button @click="startBot" class="block px-4 py-2 w-full text-left hover:bg-gray-200">Start Bot</button>
            <button @click="stopBot" class="block px-4 py-2 w-full text-left hover:bg-gray-200">Stop Bot</button>
          </div>
        </div>

        <!-- Ngrok Dropdown -->
        <div class="relative group">
          <button class="px-4 py-2 bg-white text-black rounded-md">Ngrok ⌄</button>
          <div class="absolute left-0 mt-2 w-32 bg-white text-black rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
            <button @click="startNgrok" class="block px-4 py-2 w-full text-left hover:bg-gray-200">Start Ngrok</button>
            <button @click="stopNgrok" class="block px-4 py-2 w-full text-left hover:bg-gray-200">Stop Ngrok</button>
          </div>
        </div>
      </div>
    </nav>

    <!-- ✅ Main Page Content -->
    <div class="p-4">
      <NuxtPage />
    </div>
  </div>
</template>

<script setup>
import { useHead } from 'nuxt/app';

useHead({
  link: [
    {
      rel: 'preconnect',
      href: 'https://fonts.googleapis.com',
    },
    {
      rel: 'preconnect',
      href: 'https://fonts.gstatic.com',
      crossorigin: 'anonymous',
    },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700&display=swap',
    },
  ],
});

const startBot = async () => {
  await fetch("http://localhost:3001/bot/start", { method: "POST" });
  alert("Bot started");
  // location.reload();
};

const stopBot = async () => {
  await fetch("http://localhost:3001/bot/stop", { method: "POST" });
  alert("Bot stopped");
  // location.reload();
};

const startNgrok = async () => {
  await fetch("http://localhost:3001/ngrok/start", { method: "POST" });
  alert("Ngrok started");
  // location.reload();
};

const stopNgrok = async () => {
  await fetch("http://localhost:3001/ngrok/stop", { method: "POST" });
  alert("Ngrok stopped");
  // location.reload();
};
</script>
