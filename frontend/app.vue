<template>
  <div>
    <nav class="bg-blue-600 text-white p-4 flex space-x-4">
      <NuxtLink to="/" class="hover:underline">Home</NuxtLink>
      <NuxtLink to="/about" class="hover:underline">About</NuxtLink>
      <NuxtLink to="/settings" class="hover:underline">Settings</NuxtLink>
    </nav>
    <div class="p-4">
      <slot />
    </div>
  </div>
</template>
