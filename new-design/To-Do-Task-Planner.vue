<!-- The exported code uses Tailwind CSS. Install Tailwind CSS in your dev environment to ensure all styles work. -->
<template>
<div class="min-h-screen bg-gray-50">
<!-- Header -->
<div class="fixed top-0 w-full bg-white shadow-sm z-50">
<div class="flex items-center justify-between px-4 py-3">
<h1 class="text-xl font-bold text-gray-900">To-Do</h1>
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
<!-- Quick Stats Dashboard -->
<div class="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-4 mb-6 text-white">
<div class="flex justify-between items-center">
<div class="text-center">
<div class="text-2xl font-bold">8</div>
<div class="text-sm opacity-90">Tasks Today</div>
</div>
<div class="text-center">
<div class="text-2xl font-bold">5</div>
<div class="text-sm opacity-90">Completed</div>
</div>
<div class="text-center">
<div class="text-2xl font-bold">3</div>
<div class="text-sm opacity-90">Pending</div>
</div>
</div>
<div class="mt-3 bg-white bg-opacity-20 rounded-full h-2">
<div class="bg-white rounded-full h-2 w-3/5"></div>
</div>
</div>
<!-- Add New Task -->
<div class="bg-white rounded-xl p-4 mb-6 shadow-sm">
<div class="flex items-center space-x-3">
<div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center cursor-pointer">
<i class="fas fa-plus text-blue-500"></i>
</div>
<input
type="text"
placeholder="Add a new task..."
class="flex-1 text-gray-700 placeholder-gray-400 border-none outline-none"
v-model="newTask"
@keyup.enter="addTask"
>
</div>
</div>
<!-- Task Categories -->
<div class="flex space-x-2 mb-6 overflow-x-auto">
<button
v-for="category in categories"
:key="category.name"
:class="{
'bg-blue-500 text-white': activeCategory === category.name,
'bg-white text-gray-600': activeCategory !== category.name
}"
class="px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium shadow-sm cursor-pointer !rounded-button"
@click="activeCategory = category.name"
>
<i :class="category.icon" class="mr-1"></i>
{{ category.name }}
</button>
</div>
<!-- Task List -->
<div class="space-y-3">
<div
v-for="task in filteredTasks"
:key="task.id"
class="bg-white rounded-xl p-4 shadow-sm"
>
<div class="flex items-start space-x-3">
<button
:class="{
'bg-green-500 border-green-500': task.completed,
'border-gray-300': !task.completed
}"
class="w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 cursor-pointer"
@click="toggleTask(task.id)"
>
<i v-if="task.completed" class="fas fa-check text-white text-xs"></i>
</button>
<div class="flex-1">
<div class="flex items-center justify-between mb-1">
<h3
:class="{ 'line-through text-gray-400': task.completed }"
class="font-medium text-gray-900"
>
{{ task.title }}
</h3>
<div class="flex items-center space-x-2">
<div
:class="getPriorityColor(task.priority)"
class="w-2 h-2 rounded-full"
></div>
<button class="cursor-pointer">
<i class="fas fa-ellipsis-h text-gray-400 text-sm"></i>
</button>
</div>
</div>
<p
:class="{ 'line-through text-gray-400': task.completed }"
class="text-sm text-gray-600 mb-2"
>
{{ task.description }}
</p>
<div class="flex items-center justify-between">
<div class="flex items-center space-x-3">
<div
:class="getDueDateColor(task.dueDate)"
class="flex items-center space-x-1 text-xs"
>
<i class="fas fa-calendar-alt"></i>
<span>{{ formatDate(task.dueDate) }}</span>
</div>
<span
:class="getCategoryColor(task.category)"
class="px-2 py-1 rounded-full text-xs font-medium"
>
{{ task.category }}
</span>
</div>
</div>
</div>
</div>
</div>
</div>
<!-- Progress Visualization -->
<div class="bg-white rounded-xl p-4 mt-6 shadow-sm">
<div class="flex items-center justify-between mb-3">
<h3 class="font-medium text-gray-900">Today's Progress</h3>
<span class="text-sm text-gray-600">{{ completionPercentage }}%</span>
</div>
<div class="bg-gray-200 rounded-full h-2">
<div
:style="{ width: completionPercentage + '%' }"
class="bg-gradient-to-r from-blue-500 to-purple-600 rounded-full h-2 transition-all duration-300"
></div>
</div>
</div>
</div>
<!-- Floating Action Button -->
<button class="fixed bottom-24 right-4 w-14 h-14 bg-blue-500 rounded-full shadow-lg flex items-center justify-center cursor-pointer !rounded-button">
<i class="fas fa-plus text-white text-xl"></i>
</button>
<!-- Bottom Navigation -->
<div class="fixed bottom-0 w-full bg-white border-t border-gray-200">
<div class="grid grid-cols-4 py-2">
<button class="flex flex-col items-center justify-center py-2 cursor-pointer">
<i class="fas fa-tasks text-blue-500 text-lg mb-1"></i>
<span class="text-xs text-blue-500 font-medium">Tasks</span>
</button>
<a href="https://readdy.ai/home/8cc98c7a-ec01-4154-a73d-39f45242ddc5/3545899f-8ad8-4647-b0d4-95a8faae848c" data-readdy="true" class="flex flex-col items-center justify-center py-2 cursor-pointer">
<i class="fas fa-calendar-alt text-gray-400 text-lg mb-1"></i>
<span class="text-xs text-gray-400">Calendar</span>
</a>
<a href="https://readdy.ai/home/8cc98c7a-ec01-4154-a73d-39f45242ddc5/6b325a00-22c6-4d4b-b0c7-6243b510c026" data-readdy="true" class="flex flex-col items-center justify-center py-2 cursor-pointer">
<i class="fas fa-chart-bar text-gray-400 text-lg mb-1"></i>
<span class="text-xs text-gray-400">Stats</span>
</a>
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
interface Task {
id: number;
title: string;
description: string;
completed: boolean;
priority: 'high' | 'medium' | 'low';
category: string;
dueDate: string;
}
interface Category {
name: string;
icon: string;
}
const newTask = ref('');
const activeCategory = ref('All');
const categories = ref<Category[]>([
{ name: 'All', icon: 'fas fa-list' },
{ name: 'Today', icon: 'fas fa-calendar-day' },
{ name: 'Work', icon: 'fas fa-briefcase' },
{ name: 'Personal', icon: 'fas fa-user' },
{ name: 'Shopping', icon: 'fas fa-shopping-cart' },
{ name: 'Health', icon: 'fas fa-heart' }
]);
const tasks = ref<Task[]>([
{
id: 1,
title: 'Complete project proposal',
description: 'Finish the quarterly project proposal for the marketing team',
completed: false,
priority: 'high',
category: 'Work',
dueDate: '2025-11-12'
},
{
id: 2,
title: 'Buy groceries',
description: 'Get milk, bread, eggs, and vegetables from the supermarket',
completed: true,
priority: 'medium',
category: 'Shopping',
dueDate: '2025-11-12'
},
{
id: 3,
title: 'Morning workout',
description: '30 minutes cardio and strength training at the gym',
completed: true,
priority: 'medium',
category: 'Health',
dueDate: '2025-11-12'
},
{
id: 4,
title: 'Call dentist appointment',
description: 'Schedule regular checkup for next month',
completed: false,
priority: 'low',
category: 'Personal',
dueDate: '2025-11-13'
},
{
id: 5,
title: 'Review team presentations',
description: 'Go through all team member presentations before tomorrow meeting',
completed: true,
priority: 'high',
category: 'Work',
dueDate: '2025-11-11'
},
{
id: 6,
title: 'Plan weekend trip',
description: 'Research destinations and book accommodation for weekend getaway',
completed: false,
priority: 'low',
category: 'Personal',
dueDate: '2025-11-15'
},
{
id: 7,
title: 'Update website content',
description: 'Add new blog posts and update product descriptions',
completed: false,
priority: 'medium',
category: 'Work',
dueDate: '2025-11-14'
},
{
id: 8,
title: 'Prepare healthy meals',
description: 'Meal prep for the week with balanced nutrition',
completed: true,
priority: 'medium',
category: 'Health',
dueDate: '2025-11-12'
}
]);
const filteredTasks = computed(() => {
if (activeCategory.value === 'All') {
return tasks.value;
}
if (activeCategory.value === 'Today') {
const today = new Date().toISOString().split('T')[0];
return tasks.value.filter(task => task.dueDate === today);
}
return tasks.value.filter(task => task.category === activeCategory.value);
});
const completionPercentage = computed(() => {
const todayTasks = tasks.value.filter(task => {
const today = new Date().toISOString().split('T')[0];
return task.dueDate === today;
});
if (todayTasks.length === 0) return 0;
const completed = todayTasks.filter(task => task.completed).length;
return Math.round((completed / todayTasks.length) * 100);
});
const addTask = () => {
if (newTask.value.trim()) {
const today = new Date().toISOString().split('T')[0];
tasks.value.push({
id: Date.now(),
title: newTask.value.trim(),
description: 'New task added',
completed: false,
priority: 'medium',
category: 'Personal',
dueDate: today
});
newTask.value = '';
}
};
const toggleTask = (id: number) => {
const task = tasks.value.find(t => t.id === id);
if (task) {
task.completed = !task.completed;
}
};
const getPriorityColor = (priority: string) => {
switch (priority) {
case 'high': return 'bg-red-500';
case 'medium': return 'bg-yellow-500';
case 'low': return 'bg-green-500';
default: return 'bg-gray-400';
}
};
const getDueDateColor = (dueDate: string) => {
const today = new Date().toISOString().split('T')[0];
const taskDate = new Date(dueDate);
const todayDate = new Date(today);
if (taskDate < todayDate) return 'text-red-500';
if (taskDate.getTime() === todayDate.getTime()) return 'text-orange-500';
return 'text-gray-500';
};
const getCategoryColor = (category: string) => {
switch (category) {
case 'Work': return 'bg-blue-100 text-blue-800';
case 'Personal': return 'bg-green-100 text-green-800';
case 'Shopping': return 'bg-purple-100 text-purple-800';
case 'Health': return 'bg-pink-100 text-pink-800';
default: return 'bg-gray-100 text-gray-800';
}
};
const formatDate = (dateString: string) => {
const date = new Date(dateString);
const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
if (date.toDateString() === today.toDateString()) return 'Today';
if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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