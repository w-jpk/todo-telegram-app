<!-- The exported code uses Tailwind CSS. Install Tailwind CSS in your dev environment to ensure all styles work. -->
<template>
<div class="min-h-screen bg-gray-50">
<!-- Header -->
<div class="fixed top-0 w-full bg-white shadow-sm z-50">
<div class="flex items-center justify-between px-4 py-3">
<h1 class="text-xl font-bold text-gray-900">Stats</h1>
<div class="flex items-center space-x-3">
<div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
<i class="fas fa-user text-white text-sm"></i>
</div>
<button class="p-1 cursor-pointer">
<i class="fas fa-ellipsis-v text-gray-600"></i>
</button>
</div>
</div>
</div>
<!-- Content Area -->
<div class="pt-16 pb-20 px-4">
<!-- Time Period Selector -->
<div class="flex space-x-2 mb-6 overflow-x-auto">
<button
v-for="period in timePeriods"
:key="period"
:class="{
'bg-blue-500 text-white': activePeriod === period,
'bg-white text-gray-600': activePeriod !== period
}"
class="px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium shadow-sm cursor-pointer !rounded-button"
@click="activePeriod = period"
>
{{ period }}
</button>
</div>
<!-- Overview Cards -->
<div class="grid grid-cols-2 gap-4 mb-6">
<div class="bg-white rounded-xl p-4 shadow-sm">
<div class="text-2xl font-bold text-gray-900">{{ totalCompleted }}</div>
<div class="text-sm text-gray-600">Tasks Completed</div>
</div>
<div class="bg-white rounded-xl p-4 shadow-sm">
<div class="text-2xl font-bold text-blue-500">{{ completionRate }}%</div>
<div class="text-sm text-gray-600">Completion Rate</div>
</div>
<div class="bg-white rounded-xl p-4 shadow-sm">
<div class="text-2xl font-bold text-green-500">{{ averageDaily }}</div>
<div class="text-sm text-gray-600">Daily Average</div>
</div>
<div class="bg-white rounded-xl p-4 shadow-sm">
<div class="text-2xl font-bold text-purple-500">{{ currentStreak }}</div>
<div class="text-sm text-gray-600">Current Streak</div>
</div>
</div>
<!-- Completion Rate Chart -->
<div class="bg-white rounded-xl p-4 mb-6 shadow-sm">
<h3 class="font-medium text-gray-900 mb-4">Completion Trends</h3>
<div class="relative">
<img
src="https://readdy.ai/api/search-image?query=Professional%20line%20chart%20showing%20task%20completion%20trends%20over%20time%20with%20smooth%20blue%20gradient%20curves%2C%20clean%20white%20background%2C%20modern%20data%20visualization%20style%2C%20upward%20trending%20performance%20metrics%2C%20minimalist%20design%20with%20grid%20lines%2C%20business%20analytics%20dashboard%20aesthetic%2C%20high%20quality%20rendering&width=320&height=180&seq=chart001&orientation=landscape"
alt="Completion Rate Chart"
class="w-full h-32 object-cover rounded-lg"
/>
</div>
</div>
<!-- Category Distribution -->
<div class="bg-white rounded-xl p-4 mb-6 shadow-sm">
<h3 class="font-medium text-gray-900 mb-4">Tasks by Category</h3>
<div class="flex items-center justify-between">
<div class="relative w-32 h-32">
<img
src="https://readdy.ai/api/search-image?query=Clean%20donut%20chart%20visualization%20showing%20task%20distribution%20by%20categories%20with%20vibrant%20colors%2C%20modern%20flat%20design%2C%20white%20background%2C%20professional%20business%20analytics%20style%2C%20colorful%20segments%20for%20work%20personal%20shopping%20health%20categories%2C%20minimalist%20pie%20chart&width=128&height=128&seq=chart002&orientation=squarish"
alt="Category Distribution Chart"
class="w-full h-full object-cover rounded-lg"
/>
</div>
<div class="flex-1 ml-6 space-y-2">
<div v-for="category in categoryStats" :key="category.name" class="flex items-center justify-between">
<div class="flex items-center space-x-2">
<div :class="category.color" class="w-3 h-3 rounded-full"></div>
<span class="text-sm text-gray-700">{{ category.name }}</span>
</div>
<span class="text-sm font-medium text-gray-900">{{ category.count }}</span>
</div>
</div>
</div>
</div>
<!-- Priority Level Analytics -->
<div class="bg-white rounded-xl p-4 mb-6 shadow-sm">
<h3 class="font-medium text-gray-900 mb-4">Tasks by Priority</h3>
<div class="space-y-3">
<div v-for="priority in priorityStats" :key="priority.level" class="flex items-center space-x-3">
<div class="w-16 text-sm text-gray-600">{{ priority.level }}</div>
<div class="flex-1 bg-gray-200 rounded-full h-3">
<div
:class="priority.color"
:style="{ width: priority.percentage + '%' }"
class="h-3 rounded-full transition-all duration-300"
></div>
</div>
<div class="text-sm font-medium text-gray-900">{{ priority.completed }}/{{ priority.total }}</div>
</div>
</div>
</div>
<!-- Daily Progress Heatmap -->
<div class="bg-white rounded-xl p-4 mb-6 shadow-sm">
<h3 class="font-medium text-gray-900 mb-4">Daily Activity</h3>
<div class="grid grid-cols-7 gap-1">
<div v-for="day in heatmapData" :key="day.date" class="text-center">
<div class="text-xs text-gray-500 mb-1">{{ day.dayName }}</div>
<div
:class="getHeatmapColor(day.intensity)"
class="w-8 h-8 rounded-lg mx-auto flex items-center justify-center"
>
<span class="text-xs font-medium">{{ day.day }}</span>
</div>
</div>
</div>
</div>
<!-- Performance Insights -->
<div class="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-4 mb-6 text-white">
<h3 class="font-medium mb-3">Performance Insights</h3>
<div class="space-y-2">
<div class="flex items-start space-x-2">
<i class="fas fa-lightbulb text-yellow-300 mt-0.5"></i>
<p class="text-sm">Your productivity peaks on Tuesday and Wednesday. Consider scheduling important tasks during these days.</p>
</div>
<div class="flex items-start space-x-2">
<i class="fas fa-trophy text-yellow-300 mt-0.5"></i>
<p class="text-sm">Great job! You've maintained a 7-day completion streak. Keep up the momentum!</p>
</div>
<div class="flex items-start space-x-2">
<i class="fas fa-chart-line text-green-300 mt-0.5"></i>
<p class="text-sm">Your work category completion rate improved by 15% this week compared to last week.</p>
</div>
</div>
</div>
<!-- Weekly Comparison -->
<div class="bg-white rounded-xl p-4 shadow-sm">
<h3 class="font-medium text-gray-900 mb-4">Weekly Comparison</h3>
<div class="relative">
<img
src="https://readdy.ai/api/search-image?query=Professional%20bar%20chart%20comparing%20weekly%20task%20completion%20performance%20with%20blue%20and%20purple%20gradient%20bars%2C%20clean%20white%20background%2C%20modern%20business%20analytics%20style%2C%20multiple%20weeks%20comparison%20data%20visualization%2C%20minimalist%20design%20with%20labels%2C%20dashboard%20aesthetic&width=320&height=160&seq=chart003&orientation=landscape"
alt="Weekly Comparison Chart"
class="w-full h-28 object-cover rounded-lg"
/>
</div>
<div class="flex justify-between mt-3 text-xs text-gray-600">
<span>Week 1</span>
<span>Week 2</span>
<span>Week 3</span>
<span>Current</span>
</div>
</div>
</div>
<!-- Bottom Navigation -->
<div class="fixed bottom-0 w-full bg-white border-t border-gray-200">
<div class="grid grid-cols-4 py-2">
<a href="https://readdy.ai/home/8cc98c7a-ec01-4154-a73d-39f45242ddc5/08b4e91d-a55e-4e2c-bfd7-bf7642c5bd84" data-readdy="true" class="flex flex-col items-center justify-center py-2 cursor-pointer">
<i class="fas fa-tasks text-gray-400 text-lg mb-1"></i>
<span class="text-xs text-gray-400">Tasks</span>
</a>
<button class="flex flex-col items-center justify-center py-2 cursor-pointer">
<i class="fas fa-calendar-alt text-gray-400 text-lg mb-1"></i>
<span class="text-xs text-gray-400">Calendar</span>
</button>
<button class="flex flex-col items-center justify-center py-2 cursor-pointer">
<i class="fas fa-chart-bar text-blue-500 text-lg mb-1"></i>
<span class="text-xs text-blue-500 font-medium">Stats</span>
</button>
<button class="flex flex-col items-center justify-center py-2 cursor-pointer">
<i class="fas fa-cog text-gray-400 text-lg mb-1"></i>
<span class="text-xs text-gray-400">Settings</span>
</button>
</div>
</div>
</div>
</template>
<script lang="ts" setup>
import { ref, computed } from 'vue';
interface CategoryStat {
name: string;
count: number;
color: string;
}
interface PriorityStat {
level: string;
completed: number;
total: number;
percentage: number;
color: string;
}
interface HeatmapDay {
date: string;
day: number;
dayName: string;
intensity: number;
}
const activePeriod = ref('Weekly');
const timePeriods = ref(['Daily', 'Weekly', 'Monthly']);
const totalCompleted = ref(47);
const completionRate = ref(78);
const averageDaily = ref(6.2);
const currentStreak = ref(7);
const categoryStats = ref<CategoryStat[]>([
{ name: 'Work', count: 18, color: 'bg-blue-500' },
{ name: 'Personal', count: 12, color: 'bg-green-500' },
{ name: 'Shopping', count: 8, color: 'bg-purple-500' },
{ name: 'Health', count: 9, color: 'bg-pink-500' }
]);
const priorityStats = ref<PriorityStat[]>([
{ level: 'High', completed: 12, total: 15, percentage: 80, color: 'bg-red-500' },
{ level: 'Medium', completed: 20, total: 24, percentage: 83, color: 'bg-yellow-500' },
{ level: 'Low', completed: 15, total: 18, percentage: 83, color: 'bg-green-500' }
]);
const heatmapData = ref<HeatmapDay[]>([
{ date: '2025-11-06', day: 6, dayName: 'Wed', intensity: 0.8 },
{ date: '2025-11-07', day: 7, dayName: 'Thu', intensity: 0.6 },
{ date: '2025-11-08', day: 8, dayName: 'Fri', intensity: 0.9 },
{ date: '2025-11-09', day: 9, dayName: 'Sat', intensity: 0.4 },
{ date: '2025-11-10', day: 10, dayName: 'Sun', intensity: 0.3 },
{ date: '2025-11-11', day: 11, dayName: 'Mon', intensity: 0.7 },
{ date: '2025-11-12', day: 12, dayName: 'Tue', intensity: 0.8 }
]);
const getHeatmapColor = (intensity: number) => {
if (intensity >= 0.8) return 'bg-blue-500 text-white';
if (intensity >= 0.6) return 'bg-blue-400 text-white';
if (intensity >= 0.4) return 'bg-blue-300 text-gray-700';
if (intensity >= 0.2) return 'bg-blue-200 text-gray-700';
return 'bg-gray-200 text-gray-600';
};
</script>
<style scoped>
.\!rounded-button {
border-radius: 12px;
}
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
-webkit-appearance: none;
margin: 0;
}
input[type=number] {
-moz-appearance: textfield;
}
</style>