<template>
  <div class="flex space-x-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
    <button
      v-for="category in categories"
      :key="category.name"
      :class="{
        'bg-blue-500 text-white': activeCategory === category.name,
        'bg-white text-gray-600': activeCategory !== category.name
      }"
      class="px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium shadow-sm cursor-pointer transition-colors flex items-center gap-2"
      @click="$emit('category-change', category.name)">
      <!-- Color indicator for projects -->
      <div
        v-if="category.color"
        class="w-2 h-2 rounded-full shrink-0"
        :style="{ backgroundColor: category.color || '#2481cc' }"
      ></div>
      <!-- Icon for system categories -->
      <i v-else :class="category.icon" class="text-xs"></i>
      {{ category.name }}
    </button>
  </div>
</template>

<script setup lang="ts">
interface Category {
  name: string
  icon: string
  color?: string
}

interface Props {
  categories: Category[]
  activeCategory: string
}

defineProps<Props>()

defineEmits<{
  'category-change': [category: string]
}>()
</script>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>