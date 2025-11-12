<!-- The exported code uses Tailwind CSS. Install Tailwind CSS in your dev environment to ensure all styles work. -->
<template>
<div class="min-h-screen bg-gray-50">
<!-- Header -->
<div class="fixed top-0 w-full bg-white shadow-sm z-50">
<div class="flex items-center justify-between px-4 py-3">
<h1 class="text-xl font-bold text-gray-900">Calendar</h1>
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
<div class="pt-16 pb-20">
<!-- Month Navigation -->
<div class="bg-white shadow-sm px-4 py-3 mb-4">
<div class="flex items-center justify-between">
<button @click="previousMonth" class="p-2 cursor-pointer">
<i class="fas fa-chevron-left text-gray-600"></i>
</button>
<h2 class="text-lg font-semibold text-gray-900">
{{ currentMonthYear }}
</h2>
<button @click="nextMonth" class="p-2 cursor-pointer">
<i class="fas fa-chevron-right text-gray-600"></i>
</button>
</div>
</div>
<!-- Category Filter Bar -->
<div class="px-4 mb-4">
<div class="flex space-x-2 overflow-x-auto">
<button
v-for="category in filterCategories"
:key="category.name"
:class="{
'bg-blue-500 text-white': activeFilter === category.name,
'bg-white text-gray-600': activeFilter !== category.name
}"
class="px-4 py-2 rounded-xl whitespace-nowrap text-sm font-medium shadow-sm cursor-pointer"
@click="activeFilter = category.name"
>
<i :class="category.icon" class="mr-1"></i>
{{ category.name }}
</button>
</div>
</div>
<!-- Calendar Grid -->
<div class="px-4 mb-6">
<div class="bg-white rounded-xl shadow-sm overflow-hidden">
<!-- Week Days Header -->
<div class="grid grid-cols-7 bg-gray-50">
<div
v-for="day in weekDays"
:key="day"
class="p-3 text-center text-sm font-medium text-gray-600"
>
{{ day }}
</div>
</div>
<!-- Calendar Days -->
<div class="grid grid-cols-7">
<div
v-for="date in calendarDays"
:key="date.key"
:class="{
'bg-blue-500 text-white': date.isToday,
'text-gray-400': !date.isCurrentMonth,
'text-gray-900': date.isCurrentMonth && !date.isToday
}"
class="relative p-3 h-16 border-b border-r border-gray-100 cursor-pointer hover:bg-gray-50"
@click="selectDate(date)"
>
<div class="text-sm font-medium">{{ date.day }}</div>
<div class="absolute bottom-1 right-1 flex space-x-1">
<div
v-for="task in getTasksForDate(date.fullDate)"
:key="task.id"
:class="getTaskDotColor(task.category)"
class="w-2 h-2 rounded-full"
></div>
</div>
</div>
</div>
</div>
</div>
<!-- Month Overview Stats -->
<div class="px-4 mb-6">
<div class="bg-white rounded-xl p-4 shadow-sm">
<h3 class="font-medium text-gray-900 mb-3">Month Overview</h3>
<div class="grid grid-cols-3 gap-4">
<div class="text-center">
<div class="text-2xl font-bold text-blue-500">{{ monthStats.total }}</div>
<div class="text-sm text-gray-600">Total Tasks</div>
</div>
<div class="text-center">
<div class="text-2xl font-bold text-green-500">{{ monthStats.completed }}</div>
<div class="text-sm text-gray-600">Completed</div>
</div>
<div class="text-center">
<div class="text-2xl font-bold text-orange-500">{{ monthStats.pending }}</div>
<div class="text-sm text-gray-600">Pending</div>
</div>
</div>
</div>
</div>
</div>
<!-- Daily Task Details Modal -->
<div
v-if="showTaskModal"
class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end"
@click="closeTaskModal"
>
<div
class="bg-white rounded-t-2xl w-full max-h-96 overflow-y-auto"
@click.stop
>
<div class="p-4 border-b border-gray-200">
<div class="flex items-center justify-between">
<h3 class="text-lg font-semibold text-gray-900">
Tasks for {{ formatSelectedDate }}
</h3>
<button @click="closeTaskModal" class="p-2 cursor-pointer">
<i class="fas fa-times text-gray-600"></i>
</button>
</div>
</div>
<div class="p-4">
<div v-if="selectedDateTasks.length === 0" class="text-center py-8">
<i class="fas fa-calendar-check text-gray-300 text-4xl mb-3"></i>
<p class="text-gray-500">No tasks for this date</p>
</div>
<div v-else class="space-y-3">
<div
v-for="task in selectedDateTasks"
:key="task.id"
class="bg-gray-50 rounded-xl p-3"
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
<h4
:class="{ 'line-through text-gray-400': task.completed }"
class="font-medium text-gray-900 mb-1"
>
{{ task.title }}
</h4>
<p
:class="{ 'line-through text-gray-400': task.completed }"
class="text-sm text-gray-600 mb-2"
>
{{ task.description }}
</p>
<div class="flex items-center space-x-3">
<div
:class="getPriorityColor(task.priority)"
class="w-2 h-2 rounded-full"
></div>
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
<i class="fas fa-calendar-alt text-blue-500 text-lg mb-1"></i>
<span class="text-xs text-blue-500 font-medium">Calendar</span>
</button>
<button class="flex flex-col items-center justify-center py-2 cursor-pointer">
<i class="fas fa-chart-bar text-gray-400 text-lg mb-1"></i>
<span class="text-xs text-gray-400">Stats</span>
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
interface Task {
id: number;
title: string;
description: string;
completed: boolean;
priority: 'high' | 'medium' | 'low';
category: string;
dueDate: string;
}
interface CalendarDate {
day: number;
fullDate: string;
isCurrentMonth: boolean;
isToday: boolean;
key: string;
}
interface FilterCategory {
name: string;
icon: string;
}
const currentDate = ref(new Date());
const showTaskModal = ref(false);
const selectedDate = ref<CalendarDate | null>(null);
const activeFilter = ref('All');
const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const filterCategories = ref<FilterCategory[]>([
{ name: 'All', icon: 'fas fa-list' },
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
dueDate: '2025-11-16'
},
{
id: 9,
title: 'Team meeting preparation',
description: 'Prepare slides and agenda for weekly team meeting',
completed: false,
priority: 'high',
category: 'Work',
dueDate: '2025-11-18'
},
{
id: 10,
title: 'Buy birthday gift',
description: 'Find and purchase birthday gift for Sarah',
completed: false,
priority: 'medium',
category: 'Shopping',
dueDate: '2025-11-20'
},
{
id: 11,
title: 'Doctor checkup',
description: 'Annual health checkup appointment',
completed: false,
priority: 'high',
category: 'Health',
dueDate: '2025-11-22'
},
{
id: 12,
title: 'Book vacation',
description: 'Research and book December holiday vacation',
completed: false,
priority: 'low',
category: 'Personal',
dueDate: '2025-11-25'
}
]);
const currentMonthYear = computed(() => {
return currentDate.value.toLocaleDateString('en-US', {
month: 'long',
year: 'numeric'
});
});
const calendarDays = computed(() => {
const year = currentDate.value.getFullYear();
const month = currentDate.value.getMonth();
const firstDay = new Date(year, month, 1);
const lastDay = new Date(year, month + 1, 0);
const startDate = new Date(firstDay);
startDate.setDate(startDate.getDate() - firstDay.getDay());
const days: CalendarDate[] = [];
const today = new Date();
for (let i = 0; i < 42; i++) {
const date = new Date(startDate);
date.setDate(startDate.getDate() + i);
const isCurrentMonth = date.getMonth() === month;
const isToday = date.toDateString() === today.toDateString();
days.push({
day: date.getDate(),
fullDate: date.toISOString().split('T')[0],
isCurrentMonth,
isToday,
key: `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
});
}
return days;
});
const filteredTasks = computed(() => {
if (activeFilter.value === 'All') {
return tasks.value;
}
return tasks.value.filter(task => task.category === activeFilter.value);
});
const monthStats = computed(() => {
const year = currentDate.value.getFullYear();
const month = currentDate.value.getMonth();
const monthTasks = filteredTasks.value.filter(task => {
const taskDate = new Date(task.dueDate);
return taskDate.getFullYear() === year && taskDate.getMonth() === month;
});
const completed = monthTasks.filter(task => task.completed).length;
return {
total: monthTasks.length,
completed,
pending: monthTasks.length - completed
};
});
const selectedDateTasks = computed(() => {
if (!selectedDate.value) return [];
return filteredTasks.value.filter(task => task.dueDate === selectedDate.value?.fullDate);
});
const formatSelectedDate = computed(() => {
if (!selectedDate.value) return '';
const date = new Date(selectedDate.value.fullDate);
return date.toLocaleDateString('en-US', {
weekday: 'long',
month: 'long',
day: 'numeric'
});
});
const getTasksForDate = (date: string) => {
return filteredTasks.value.filter(task => task.dueDate === date);
};
const getTaskDotColor = (category: string) => {
switch (category) {
case 'Work': return 'bg-blue-500';
case 'Personal': return 'bg-green-500';
case 'Shopping': return 'bg-purple-500';
case 'Health': return 'bg-pink-500';
default: return 'bg-gray-400';
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
const getCategoryColor = (category: string) => {
switch (category) {
case 'Work': return 'bg-blue-100 text-blue-800';
case 'Personal': return 'bg-green-100 text-green-800';
case 'Shopping': return 'bg-purple-100 text-purple-800';
case 'Health': return 'bg-pink-100 text-pink-800';
default: return 'bg-gray-100 text-gray-800';
}
};
const previousMonth = () => {
const newDate = new Date(currentDate.value);
newDate.setMonth(newDate.getMonth() - 1);
currentDate.value = newDate;
};
const nextMonth = () => {
const newDate = new Date(currentDate.value);
newDate.setMonth(newDate.getMonth() + 1);
currentDate.value = newDate;
};
const selectDate = (date: CalendarDate) => {
selectedDate.value = date;
showTaskModal.value = true;
};
const closeTaskModal = () => {
showTaskModal.value = false;
selectedDate.value = null;
};
const toggleTask = (id: number) => {
const task = tasks.value.find(t => t.id === id);
if (task) {
task.completed = !task.completed;
}
};
</script>
<style scoped>
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
-webkit-appearance: none;
margin: 0;
}
input[type=number] {
-moz-appearance: textfield;
}
</style>