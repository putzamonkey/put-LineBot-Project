<template>
  <div>
    <!-- Navbar -->
    <nav class="bg-blue-600 text-white p-4 flex space-x-4">
      <NuxtLink to="/" class="hover:underline">Home</NuxtLink>
      <NuxtLink to="/about" class="hover:underline">About</NuxtLink>
      <NuxtLink to="/settings" class="hover:underline">Settings</NuxtLink>
    </nav>

    <!-- ใช้ NuxtPage เพื่อโหลด pages -->
    <div class="p-4">
      <NuxtPage />
    </div>
  </div>
</template>
