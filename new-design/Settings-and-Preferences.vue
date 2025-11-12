<!-- The exported code uses Tailwind CSS. Install Tailwind CSS in your dev environment to ensure all styles work. -->
<template>
<div class="min-h-screen bg-gray-50">
<!-- Header -->
<div class="fixed top-0 w-full bg-white shadow-sm z-50">
<div class="flex items-center justify-between px-4 py-3">
<h1 class="text-xl font-bold text-gray-900">Settings</h1>
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
<!-- User Profile Card -->
<div class="bg-white rounded-xl p-4 mb-6 shadow-sm">
<div class="flex items-center space-x-4">
<div class="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
<i class="fas fa-user text-white text-xl"></i>
</div>
<div class="flex-1">
<h3 class="font-semibold text-gray-900">Sarah Johnson</h3>
<p class="text-sm text-gray-600">sarah.johnson@email.com</p>
<p class="text-xs text-blue-500 mt-1">Premium Member</p>
</div>
<button class="cursor-pointer">
<i class="fas fa-chevron-right text-gray-400"></i>
</button>
</div>
</div>
<!-- Notification Preferences -->
<div class="bg-white rounded-xl p-4 mb-6 shadow-sm">
<div class="flex items-center space-x-3 mb-4">
<div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
<i class="fas fa-bell text-blue-500"></i>
</div>
<h3 class="font-medium text-gray-900">Notification Preferences</h3>
</div>
<div class="space-y-4">
<div class="flex items-center justify-between">
<div>
<p class="text-sm font-medium text-gray-900">Push Notifications</p>
<p class="text-xs text-gray-600">Receive task reminders and updates</p>
</div>
<div class="relative">
<input
type="checkbox"
:checked="pushNotifications"
@change="pushNotifications = !pushNotifications"
class="sr-only"
/>
<div
:class="{ 'bg-blue-500': pushNotifications, 'bg-gray-300': !pushNotifications }"
class="w-12 h-6 rounded-full cursor-pointer transition-colors"
@click="pushNotifications = !pushNotifications"
>
<div
:class="{ 'translate-x-6': pushNotifications, 'translate-x-1': !pushNotifications }"
class="w-4 h-4 bg-white rounded-full mt-1 transition-transform"
></div>
</div>
</div>
</div>
<div class="flex items-center justify-between">
<div>
<p class="text-sm font-medium text-gray-900">Email Alerts</p>
<p class="text-xs text-gray-600">Daily summary and important updates</p>
</div>
<div class="relative">
<input
type="checkbox"
:checked="emailAlerts"
@change="emailAlerts = !emailAlerts"
class="sr-only"
/>
<div
:class="{ 'bg-blue-500': emailAlerts, 'bg-gray-300': !emailAlerts }"
class="w-12 h-6 rounded-full cursor-pointer transition-colors"
@click="emailAlerts = !emailAlerts"
>
<div
:class="{ 'translate-x-6': emailAlerts, 'translate-x-1': !emailAlerts }"
class="w-4 h-4 bg-white rounded-full mt-1 transition-transform"
></div>
</div>
</div>
</div>
<div class="flex items-center justify-between">
<div>
<p class="text-sm font-medium text-gray-900">Task Reminders</p>
<p class="text-xs text-gray-600">Get notified before due dates</p>
</div>
<div class="relative">
<input
type="checkbox"
:checked="taskReminders"
@change="taskReminders = !taskReminders"
class="sr-only"
/>
<div
:class="{ 'bg-blue-500': taskReminders, 'bg-gray-300': !taskReminders }"
class="w-12 h-6 rounded-full cursor-pointer transition-colors"
@click="taskReminders = !taskReminders"
>
<div
:class="{ 'translate-x-6': taskReminders, 'translate-x-1': !taskReminders }"
class="w-4 h-4 bg-white rounded-full mt-1 transition-transform"
></div>
</div>
</div>
</div>
</div>
</div>
<!-- Theme Customization -->
<div class="bg-white rounded-xl p-4 mb-6 shadow-sm">
<div class="flex items-center space-x-3 mb-4">
<div class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
<i class="fas fa-palette text-purple-500"></i>
</div>
<h3 class="font-medium text-gray-900">Theme Customization</h3>
</div>
<div class="space-y-3">
<div
v-for="theme in themes"
:key="theme.value"
:class="{ 'border-blue-500 bg-blue-50': selectedTheme === theme.value, 'border-gray-200': selectedTheme !== theme.value }"
class="flex items-center justify-between p-3 border-2 rounded-lg cursor-pointer"
@click="selectedTheme = theme.value"
>
<div class="flex items-center space-x-3">
<i :class="theme.icon" class="text-lg"></i>
<div>
<p class="text-sm font-medium text-gray-900">{{ theme.name }}</p>
<p class="text-xs text-gray-600">{{ theme.description }}</p>
</div>
</div>
<div
:class="{ 'text-blue-500': selectedTheme === theme.value, 'text-gray-300': selectedTheme !== theme.value }"
>
<i class="fas fa-check-circle"></i>
</div>
</div>
</div>
</div>
<!-- Data Management -->
<div class="bg-white rounded-xl p-4 mb-6 shadow-sm">
<div class="flex items-center space-x-3 mb-4">
<div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
<i class="fas fa-database text-green-500"></i>
</div>
<h3 class="font-medium text-gray-900">Data Management</h3>
</div>
<div class="space-y-3">
<button class="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer !rounded-button">
<div class="flex items-center space-x-3">
<i class="fas fa-download text-blue-500"></i>
<div class="text-left">
<p class="text-sm font-medium text-gray-900">Export Data</p>
<p class="text-xs text-gray-600">Download your tasks and settings</p>
</div>
</div>
<i class="fas fa-chevron-right text-gray-400"></i>
</button>
<button class="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer !rounded-button">
<div class="flex items-center space-x-3">
<i class="fas fa-upload text-green-500"></i>
<div class="text-left">
<p class="text-sm font-medium text-gray-900">Import Data</p>
<p class="text-xs text-gray-600">Restore from backup file</p>
</div>
</div>
<i class="fas fa-chevron-right text-gray-400"></i>
</button>
<button class="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer !rounded-button">
<div class="flex items-center space-x-3">
<i class="fas fa-sync text-purple-500"></i>
<div class="text-left">
<p class="text-sm font-medium text-gray-900">Sync Settings</p>
<p class="text-xs text-gray-600">Manage cloud synchronization</p>
</div>
</div>
<div class="flex items-center space-x-2">
<span class="text-xs text-green-600">Active</span>
<i class="fas fa-chevron-right text-gray-400"></i>
</div>
</button>
</div>
</div>
<!-- Privacy Settings -->
<div class="bg-white rounded-xl p-4 mb-6 shadow-sm">
<div class="flex items-center space-x-3 mb-4">
<div class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
<i class="fas fa-shield-alt text-red-500"></i>
</div>
<h3 class="font-medium text-gray-900">Privacy Settings</h3>
</div>
<div class="space-y-3">
<button class="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer !rounded-button">
<div class="flex items-center space-x-3">
<i class="fas fa-eye text-blue-500"></i>
<div class="text-left">
<p class="text-sm font-medium text-gray-900">Data Privacy</p>
<p class="text-xs text-gray-600">Control what data is collected</p>
</div>
</div>
<i class="fas fa-chevron-right text-gray-400"></i>
</button>
<button class="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer !rounded-button">
<div class="flex items-center space-x-3">
<i class="fas fa-share-alt text-green-500"></i>
<div class="text-left">
<p class="text-sm font-medium text-gray-900">Data Sharing</p>
<p class="text-xs text-gray-600">Manage third-party integrations</p>
</div>
</div>
<i class="fas fa-chevron-right text-gray-400"></i>
</button>
<button class="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer !rounded-button">
<div class="flex items-center space-x-3">
<i class="fas fa-lock text-purple-500"></i>
<div class="text-left">
<p class="text-sm font-medium text-gray-900">Security Options</p>
<p class="text-xs text-gray-600">Password and biometric settings</p>
</div>
</div>
<i class="fas fa-chevron-right text-gray-400"></i>
</button>
</div>
</div>
<!-- Account Management -->
<div class="bg-white rounded-xl p-4 mb-6 shadow-sm">
<div class="flex items-center space-x-3 mb-4">
<div class="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
<i class="fas fa-user-cog text-yellow-500"></i>
</div>
<h3 class="font-medium text-gray-900">Account Management</h3>
</div>
<div class="space-y-3">
<button class="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer !rounded-button">
<div class="flex items-center space-x-3">
<i class="fas fa-crown text-blue-500"></i>
<div class="text-left">
<p class="text-sm font-medium text-gray-900">Subscription</p>
<p class="text-xs text-gray-600">Premium plan - Expires Dec 15, 2025</p>
</div>
</div>
<i class="fas fa-chevron-right text-gray-400"></i>
</button>
<button class="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer !rounded-button">
<div class="flex items-center space-x-3">
<i class="fas fa-credit-card text-green-500"></i>
<div class="text-left">
<p class="text-sm font-medium text-gray-900">Billing Information</p>
<p class="text-xs text-gray-600">Manage payment methods</p>
</div>
</div>
<i class="fas fa-chevron-right text-gray-400"></i>
</button>
<button class="w-full flex items-center justify-between p-3 bg-red-50 rounded-lg cursor-pointer !rounded-button">
<div class="flex items-center space-x-3">
<i class="fas fa-trash text-red-500"></i>
<div class="text-left">
<p class="text-sm font-medium text-red-600">Delete Account</p>
<p class="text-xs text-red-400">Permanently remove your account</p>
</div>
</div>
<i class="fas fa-chevron-right text-red-400"></i>
</button>
</div>
</div>
<!-- Quick Actions -->
<div class="bg-white rounded-xl p-4 mb-6 shadow-sm">
<h3 class="font-medium text-gray-900 mb-4">Quick Actions</h3>
<div class="grid grid-cols-2 gap-3">
<div class="bg-blue-50 rounded-lg p-3 text-center">
<i class="fas fa-cloud-upload-alt text-blue-500 text-xl mb-2"></i>
<p class="text-sm font-medium text-gray-900">Backup Now</p>
<p class="text-xs text-gray-600">Last: Nov 10, 2025</p>
</div>
<div class="bg-green-50 rounded-lg p-3 text-center">
<i class="fas fa-sync-alt text-green-500 text-xl mb-2"></i>
<p class="text-sm font-medium text-gray-900">Sync Data</p>
<p class="text-xs text-gray-600">All devices synced</p>
</div>
</div>
</div>
<!-- Support and Information -->
<div class="bg-white rounded-xl p-4 shadow-sm">
<h3 class="font-medium text-gray-900 mb-4">Support & Information</h3>
<div class="space-y-3">
<button class="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer !rounded-button">
<div class="flex items-center space-x-3">
<i class="fas fa-question-circle text-blue-500"></i>
<span class="text-sm font-medium text-gray-900">Help & FAQ</span>
</div>
<i class="fas fa-chevron-right text-gray-400"></i>
</button>
<button class="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer !rounded-button">
<div class="flex items-center space-x-3">
<i class="fas fa-headset text-green-500"></i>
<span class="text-sm font-medium text-gray-900">Contact Support</span>
</div>
<i class="fas fa-chevron-right text-gray-400"></i>
</button>
<button class="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer !rounded-button">
<div class="flex items-center space-x-3">
<i class="fas fa-file-alt text-purple-500"></i>
<span class="text-sm font-medium text-gray-900">Terms of Service</span>
</div>
<i class="fas fa-chevron-right text-gray-400"></i>
</button>
<button class="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer !rounded-button">
<div class="flex items-center space-x-3">
<i class="fas fa-shield-alt text-red-500"></i>
<span class="text-sm font-medium text-gray-900">Privacy Policy</span>
</div>
<i class="fas fa-chevron-right text-gray-400"></i>
</button>
<div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
<div class="flex items-center space-x-3">
<i class="fas fa-info-circle text-gray-500"></i>
<span class="text-sm font-medium text-gray-900">App Version</span>
</div>
<span class="text-sm text-gray-600">2.1.4</span>
</div>
</div>
</div>
</div>
<!-- Bottom Navigation -->
<div class="fixed bottom-0 w-full bg-white border-t border-gray-200">
<div class="grid grid-cols-4 py-2">
<a href="https://readdy.ai/home/8cc98c7a-ec01-4154-a73d-39f45242ddc5/6b325a00-22c6-4d4b-b0c7-6243b510c026" data-readdy="true" class="flex flex-col items-center justify-center py-2 cursor-pointer">
<i class="fas fa-tasks text-gray-400 text-lg mb-1"></i>
<span class="text-xs text-gray-400">Tasks</span>
</a>
<button class="flex flex-col items-center justify-center py-2 cursor-pointer">
<i class="fas fa-calendar-alt text-gray-400 text-lg mb-1"></i>
<span class="text-xs text-gray-400">Calendar</span>
</button>
<button class="flex flex-col items-center justify-center py-2 cursor-pointer">
<i class="fas fa-chart-bar text-gray-400 text-lg mb-1"></i>
<span class="text-xs text-gray-400">Stats</span>
</button>
<button class="flex flex-col items-center justify-center py-2 cursor-pointer">
<i class="fas fa-cog text-blue-500 text-lg mb-1"></i>
<span class="text-xs text-blue-500 font-medium">Settings</span>
</button>
</div>
</div>
</div>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
interface Theme {
value: string;
name: string;
description: string;
icon: string;
}
const pushNotifications = ref(true);
const emailAlerts = ref(false);
const taskReminders = ref(true);
const selectedTheme = ref('light');
const themes = ref<Theme[]>([
{
value: 'light',
name: 'Light Mode',
description: 'Clean and bright interface',
icon: 'fas fa-sun text-yellow-500'
},
{
value: 'dark',
name: 'Dark Mode',
description: 'Easy on the eyes in low light',
icon: 'fas fa-moon text-blue-500'
},
{
value: 'auto',
name: 'Auto Mode',
description: 'Follows system preference',
icon: 'fas fa-adjust text-gray-500'
}
]);
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