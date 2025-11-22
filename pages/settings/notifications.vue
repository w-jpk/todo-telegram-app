<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
    <!-- Header -->
    <div class="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
      <div class="flex items-center space-x-3 max-w-2xl mx-auto">
        <NuxtLink
          to="/settings"
          class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          aria-label="Back to settings"
        >
          <i class="fas fa-arrow-left text-xl"></i>
        </NuxtLink>
        <h1 class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ $t("settings.sections.notifications") }}
        </h1>
      </div>
    </div>

    <!-- Content -->
    <div class="pt-4 pb-20 px-4 max-w-2xl mx-auto">
      <NotificationSettings
        v-if="settings"
        :settings="settings"
        @update="handleSettingUpdate"
      />
      <div v-else class="text-center py-12">
        <p class="text-gray-500 dark:text-gray-400">{{ $t("common.loading") }}</p>
      </div>
    </div>

    <!-- Bottom Navigation -->
    <BottomNavigation />

    <!-- Toast Notifications -->
    <Toast ref="toast" />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { UserSettings } from "~/types/todo";
import NotificationSettings from "~/components/NotificationSettings.vue";
import Toast from "~/components/Toast.vue";
import BottomNavigation from "~/components/BottomNavigation.vue";

const { t } = useI18n();
const { $telegram } = useNuxtApp();
const { settings, fetchSettings, updateSettings } = useSettings();
const toast = ref();

// Settings history for undo functionality
const settingsHistory = ref<UserSettings[]>([]);
const maxHistorySize = 5;

const handleSettingUpdate = async (updates: Partial<UserSettings>) => {
  if (!settings.value) {
    console.warn("No settings available for update");
    return;
  }

  if (!updates || Object.keys(updates).length === 0) {
    console.warn("No updates provided");
    return;
  }

  try {
    // Save current state to history before updating
    saveSettingsToHistory(JSON.parse(JSON.stringify(settings.value)));

    await updateSettings(updates);
    toast.value?.showSuccess(
      t("settings.messages.settingsUpdated"),
      t("settings.messages.settingsUpdatedDesc"),
      3000
    );
  } catch (error: any) {
    const errorMessage =
      error?.data?.message || error?.message || "Unknown error occurred";
    toast.value?.showError(
      t("settings.messages.updateFailed"),
      t("settings.messages.updateFailedDesc", { message: errorMessage })
    );
    console.error("Settings update failed:", error);
  }
};

const saveSettingsToHistory = (currentSettings: UserSettings) => {
  settingsHistory.value.unshift({ ...currentSettings });
  if (settingsHistory.value.length > maxHistorySize) {
    settingsHistory.value = settingsHistory.value.slice(0, maxHistorySize);
  }
};

onMounted(async () => {
  const waitForTelegram = (): Promise<void> => {
    return new Promise((resolve) => {
      if ($telegram?.isReady && $telegram?.user) {
        resolve();
        return;
      }

      const checkInterval = setInterval(() => {
        if ((window as any).Telegram?.WebApp) {
          const tg = (window as any).Telegram.WebApp;
          if (tg.initDataUnsafe?.user) {
            if ($telegram) {
              $telegram.user = tg.initDataUnsafe.user;
              $telegram.initData = tg.initData || "";
              $telegram.initDataUnsafe = tg.initDataUnsafe || {};
              $telegram.isReady = true;
            }
            clearInterval(checkInterval);
            resolve();
          } else if ($telegram?.user) {
            clearInterval(checkInterval);
            resolve();
          }
        } else if ($telegram?.user) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);

      setTimeout(() => {
        clearInterval(checkInterval);
        resolve();
      }, 3000);
    });
  };

  await waitForTelegram();

  if ($telegram?.user) {
    try {
      await $fetch("/api/auth/telegram", {
        method: "POST",
        body: {
          user: $telegram.user,
          initData: $telegram.initData,
        },
      });
    } catch (error) {
      console.error("Error authenticating user:", error);
    }
  }

  if ($telegram?.user?.id) {
    try {
      await fetchSettings();
    } catch (error) {
      console.error("Error initializing settings:", error);
    }
  }
});
</script>

