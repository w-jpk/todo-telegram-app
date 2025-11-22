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
          {{ $t("settings.sections.data") }}
        </h1>
      </div>
    </div>

    <!-- Content -->
    <div class="pt-4 pb-20 px-4 max-w-2xl mx-auto">
      <DataSettings
        v-if="settings"
        :settings="settings"
        @update="handleSettingUpdate"
        @export="handleExport"
        @import="handleImport"
        @clear="handleClear"
        @undo="undoLastChange"
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
import DataSettings from "~/components/DataSettings.vue";
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

const undoLastChange = async () => {
  if (settingsHistory.value.length > 0) {
    try {
      const previousSettings = settingsHistory.value.shift();
      if (previousSettings && settings.value) {
        await updateSettings(previousSettings);
        toast.value?.showInfo(
          t("settings.messages.settingsRestored"),
          t("settings.messages.settingsRestoredDesc")
        );
      }
    } catch (error) {
      toast.value?.showError(
        t("settings.messages.undoFailed"),
        t("settings.messages.undoFailedDesc")
      );
      console.error("Undo failed:", error);
    }
  } else {
    toast.value?.showWarning(
      t("settings.messages.nothingToUndo"),
      t("settings.messages.nothingToUndoDesc")
    );
  }
};

const handleExport = async (format: string = "json") => {
  await exportData(format);
};

const handleImport = async () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";
  input.onchange = async (event) => {
    await importData(event);
  };
  input.click();
};

const handleClear = async () => {
  dialogConfig.value = {
    title: t("settings.dialogs.clearAllData"),
    message: t("settings.dialogs.clearAllDataMessage"),
    confirmText: t("settings.dialogs.deleteEverything"),
    cancelText: t("common.cancel"),
    icon: "fas fa-trash",
    iconColor: "bg-red-500",
    confirmButtonClass: "bg-red-500 hover:bg-red-600",
    additionalInfo: t("settings.dialogs.clearAllDataInfo"),
  };
  confirmationDialog.value?.show();
};

const handleDialogConfirm = async () => {
  const clearDataTitle = t("settings.dialogs.clearAllData");
  if (dialogConfig.value.title === clearDataTitle) {
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

    if (format === "json") {
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
    } else {
      const exportUrl = `/api/export/${format}`;
      window.open(exportUrl, "_blank");
    }

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

const importData = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  if (file.size > 10 * 1024 * 1024) {
    toast.value?.showError(
      t("settings.messages.fileTooLarge"),
      t("settings.messages.fileTooLargeDesc")
    );
    return;
  }

  if (!file.name.toLowerCase().endsWith(".json")) {
    toast.value?.showError(
      t("settings.messages.invalidFileType"),
      t("settings.messages.invalidFileTypeDesc")
    );
    return;
  }

  try {
    toast.value?.showInfo(
      t("settings.messages.importingData"),
      t("settings.messages.importingDataDesc")
    );

    const formData = new FormData();
    formData.append("file", file);

    const response = await $fetch<{
      success: boolean;
      message: string;
      results: any;
    }>("/api/import", {
      method: "POST",
      headers: {
        "x-telegram-user-id": $telegram?.user?.id?.toString() || "",
      },
      body: formData,
    });

    if (response.success) {
      toast.value?.showSuccess(
        t("settings.messages.importComplete"),
        response.message
      );
      await Promise.all([fetchTodos(), fetchProjects(), fetchSettings()]);
    } else {
      throw new Error(response.message);
    }
  } catch (error) {
    toast.value?.showError(
      t("settings.messages.importFailed"),
      t("settings.messages.importFailedDesc")
    );
    console.error("Import failed:", error);
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

