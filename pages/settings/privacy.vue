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
          {{ $t("settings.sections.privacy") }}
        </h1>
      </div>
    </div>

    <!-- Content -->
    <div class="pt-4 pb-20 px-4 max-w-2xl mx-auto">
      <PrivacySettings
        v-if="settings"
        :settings="settings"
        @update="handleSettingUpdate"
        @disconnect="handleDisconnect"
        @export-request="handleExportRequest"
        @deletion-request="handleDeletionRequest"
      />
      <div v-else class="text-center py-12">
        <p class="text-gray-500 dark:text-gray-400">{{ $t("common.loading") }}</p>
      </div>
    </div>

    <!-- Bottom Navigation -->
    <BottomNavigation />

    <!-- Confirmation Dialog -->
    <ConfirmationDialog
      ref="confirmationDialog"
      :title="dialogConfig.title"
      :message="dialogConfig.message"
      :confirm-text="dialogConfig.confirmText"
      :cancel-text="dialogConfig.cancelText"
      :icon="dialogConfig.icon"
      :icon-color="dialogConfig.iconColor"
      :confirm-button-class="dialogConfig.confirmButtonClass"
      :additional-info="dialogConfig.additionalInfo"
      @confirm="handleDialogConfirm"
      @cancel="handleDialogCancel"
    />

    <!-- Toast Notifications -->
    <Toast ref="toast" />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { UserSettings } from "~/types/todo";
import PrivacySettings from "~/components/PrivacySettings.vue";
import ConfirmationDialog from "~/components/ConfirmationDialog.vue";
import Toast from "~/components/Toast.vue";
import BottomNavigation from "~/components/BottomNavigation.vue";

const { t } = useI18n();
const { $telegram } = useNuxtApp();
const { settings, fetchSettings, updateSettings } = useSettings();
const { todos, fetchTodos } = useTodos();
const { projects, fetchProjects } = useProjects();
const toast = ref();
const confirmationDialog = ref();

const dialogConfig = ref({
  title: "",
  message: "",
  confirmText: "Confirm",
  cancelText: "Cancel",
  icon: "fas fa-exclamation-triangle",
  iconColor: "bg-red-500",
  confirmButtonClass: "bg-red-500 hover:bg-red-600",
  additionalInfo: "",
});

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

const handleDisconnect = () => {
  dialogConfig.value = {
    title: t("settings.dialogs.disconnectAccount"),
    message: t("settings.dialogs.disconnectAccountMessage"),
    confirmText: t("settings.privacy.disconnectAccount"),
    cancelText: t("common.cancel"),
    icon: "fas fa-sign-out-alt",
    iconColor: "bg-orange-500",
    confirmButtonClass: "bg-orange-500 hover:bg-orange-600",
    additionalInfo: t("settings.dialogs.disconnectAccountInfo"),
  };
  confirmationDialog.value?.show();
};

const handleExportRequest = () => {
  exportData("json");
};

const handleDeletionRequest = () => {
  dialogConfig.value = {
    title: t("settings.dialogs.deleteAllData"),
    message: t("settings.dialogs.deleteAllDataMessage"),
    confirmText: t("settings.dialogs.deleteEverything"),
    cancelText: t("common.cancel"),
    icon: "fas fa-trash",
    iconColor: "bg-red-500",
    confirmButtonClass: "bg-red-500 hover:bg-red-600",
    additionalInfo: t("settings.dialogs.deleteAllDataInfo"),
  };
  confirmationDialog.value?.show();
};

const handleDialogConfirm = async () => {
  const disconnectTitle = t("settings.dialogs.disconnectAccount");
  const deleteDataTitle = t("settings.dialogs.deleteAllData");

  if (dialogConfig.value.title === disconnectTitle) {
    await disconnectAccount();
  } else if (dialogConfig.value.title === deleteDataTitle) {
    await clearAllData();
  }
};

const handleDialogCancel = () => {
  // Dialog cancelled
};

const exportData = async (format: string = "json") => {
  try {
    toast.value?.showInfo(
      t("settings.messages.exportingData"),
      t("settings.messages.exportingDataDesc")
    );

    const data = await $fetch(`/api/export/${format}`, {
      method: "GET",
      headers: {
        "x-telegram-user-id": $telegram?.user?.id?.toString() || "",
      },
    });

    const sanitizedData = {
      ...data,
      userId: undefined,
      exportedAt: data.exportedAt,
    };

    const jsonString = JSON.stringify(sanitizedData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `todo-export-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast.value?.showSuccess(
      t("settings.messages.exportComplete"),
      t("settings.messages.exportCompleteDesc")
    );
  } catch (error) {
    toast.value?.showError(
      t("settings.messages.exportFailed"),
      t("settings.messages.exportFailedDesc")
    );
    console.error("Export failed:", error);
  }
};

const clearAllData = async () => {
  try {
    toast.value?.showInfo(
      t("settings.messages.clearingData"),
      t("settings.messages.clearingDataDesc")
    );

    const userId = $telegram?.user?.id?.toString();
    if (!userId) {
      throw new Error("User ID not available");
    }

    const headers = {
      "x-telegram-user-id": userId,
    };

    let deletedCount = 0;
    let errorCount = 0;

    const allTodos = [...todos.value];
    for (const todo of allTodos) {
      try {
        await $fetch(`/api/todos/${todo.id}`, {
          method: "DELETE",
          headers,
        });
        deletedCount++;
      } catch (error) {
        console.warn(`Failed to delete todo ${todo.id}:`, error);
        errorCount++;
      }
    }

    const allProjects = [...projects.value];
    for (const project of allProjects) {
      try {
        await $fetch(`/api/projects/${project.id}`, {
          method: "DELETE",
          headers,
        });
        deletedCount++;
      } catch (error) {
        console.warn(`Failed to delete project ${project.id}:`, error);
        errorCount++;
      }
    }

    await Promise.all([fetchTodos(), fetchProjects()]);

    const message =
      errorCount > 0
        ? t("settings.messages.dataClearedWithErrors", {
            count: errorCount,
            deletedCount,
          })
        : t("settings.messages.dataClearedDesc");

    toast.value?.showSuccess(t("settings.messages.dataCleared"), message);
  } catch (error) {
    toast.value?.showError(
      t("settings.messages.clearFailed"),
      t("settings.messages.clearFailedDesc")
    );
    console.error("Clear data failed:", error);
  }
};

const disconnectAccount = async () => {
  try {
    toast.value?.showInfo(
      t("settings.messages.disconnectingAccount"),
      t("settings.messages.disconnectingAccountDesc")
    );

    await clearAllData();

    if (settings.value) {
      await updateSettings({});
    }

    if (typeof localStorage !== "undefined") {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (
          key &&
          (key.startsWith("todo-") ||
            key.startsWith("settings") ||
            key.startsWith("theme"))
        ) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));
    }

    if (typeof sessionStorage !== "undefined") {
      sessionStorage.clear();
    }

    toast.value?.showSuccess(
      t("settings.messages.accountDisconnected"),
      t("settings.messages.accountDisconnectedDesc")
    );
  } catch (error) {
    toast.value?.showError(
      t("settings.messages.disconnectFailed"),
      t("settings.messages.disconnectFailedDesc")
    );
    console.error("Disconnect failed:", error);
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

