<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
    <!-- Header -->
    <!-- <AppHeader title="Settings" /> -->

    <!-- Content Area -->
    <div class="pt-4 pb-20 px-4 max-w-2xl mx-auto">
      <!-- Search Bar -->
      <div class="mb-6" role="search">
        <label for="settings-search" class="sr-only">Search settings</label>
        <div class="relative">
          <i
            class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            aria-hidden="true"
          ></i>
          <input
            id="settings-search"
            v-model="searchQuery"
            type="text"
            :placeholder="$t('settings.searchPlaceholder')"
            class="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500"
            aria-describedby="search-help"
            autocomplete="off"
            aria-label="Search through settings"
          />
        </div>
        <div id="search-help" class="sr-only">
          Type to search through available settings
        </div>
      </div>

      <!-- User Profile Section -->
      <div
        class="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 shadow-lg"
        role="region"
        aria-labelledby="profile-heading"
      >
        <div class="flex items-center justify-between mb-4">
          <h2
            id="profile-heading"
            class="text-lg font-semibold text-gray-900 dark:text-white"
          >
            👤 {{ $t('settings.profile.title') }}
          </h2>
          <button
            @click="editProfile = !editProfile"
            class="text-blue-500 hover:text-blue-600 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 rounded"
            :aria-expanded="editProfile"
            aria-controls="profile-edit-form"
          >
            {{ editProfile ? $t('settings.profile.cancel') : $t('settings.profile.edit') }}
          </button>
        </div>

        <div
          v-if="!editProfile"
          class="flex items-center space-x-4"
          @click="openUserProfile"
          role="button"
          tabindex="0"
          @keydown.enter="openUserProfile"
          @keydown.space.prevent="openUserProfile"
          aria-label="Open user profile in Telegram"
        >
          <div
            class="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center overflow-hidden cursor-pointer hover:bg-blue-600 transition-colors"
            aria-hidden="true"
          >
            <img
              v-if="userPhoto"
              :src="userPhoto"
              class="w-full h-full object-cover"
              alt="User profile photo"
            />
            <i
              v-else
              class="fas fa-user text-white text-xl"
              aria-hidden="true"
            ></i>
          </div>
          <div class="flex-1 cursor-pointer">
            <h3 class="font-semibold text-gray-900 dark:text-white">
              {{ userName || $t('settings.profile.user') }}
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ userEmail || $t('settings.profile.telegramUser') }}
            </p>
            <p class="text-xs text-blue-500 mt-1">{{ $t('settings.profile.premiumMember') }}</p>
          </div>
          <i
            class="fas fa-chevron-right text-gray-400 dark:text-gray-500"
            aria-hidden="true"
          ></i>
        </div>

        <div v-else class="space-y-4" id="profile-edit-form">
          <div>
            <label
              for="display-name"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >{{ $t('settings.profile.displayName') }}</label
            >
            <input
              id="display-name"
              v-model="profileForm.displayName"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              :placeholder="$t('settings.profile.displayNamePlaceholder')"
              aria-describedby="display-name-help"
              autocomplete="name"
            />
            <div id="display-name-help" class="sr-only">
              Your display name will be shown to other users
            </div>
          </div>
          <div>
            <label
              for="bio"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >{{ $t('settings.profile.bio') }}</label
            >
            <textarea
              id="bio"
              v-model="profileForm.bio"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              :placeholder="$t('settings.profile.bioPlaceholder')"
              aria-describedby="bio-help"
              maxlength="500"
            ></textarea>
            <div id="bio-help" class="sr-only">
              A short description about yourself (maximum 500 characters)
            </div>
          </div>
          <div>
            <label
              for="profile-visibility"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >{{ $t('settings.profile.profileVisibility') }}</label
            >
            <select
              id="profile-visibility"
              v-model="profileForm.profileVisibility"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-describedby="visibility-help"
            >
              <option value="private">{{ $t('settings.profile.private') }}</option>
              <option value="contacts">{{ $t('settings.profile.contactsOnly') }}</option>
              <option value="public">{{ $t('settings.profile.public') }}</option>
            </select>
            <div id="visibility-help" class="sr-only">
              Choose who can see your profile information
            </div>
          </div>
          <button
            @click="saveProfile"
            :disabled="savingProfile"
            class="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-describedby="save-help"
          >
            {{ savingProfile ? $t('settings.profile.saving') : $t('settings.profile.saveProfile') }}
          </button>
          <div id="save-help" class="sr-only">Save your profile changes</div>
        </div>
      </div>

      <!-- Filtered Settings Sections -->
      <div
        v-for="section in filteredSections"
        :key="section.id"
        class="mb-6"
        role="region"
        :aria-labelledby="`section-${section.id}`"
      >
        <div
          class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
        >
          <!-- Section Header -->
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div class="flex items-center space-x-3">
              <div
                :class="`w-10 h-10 ${section.color} rounded-full flex items-center justify-center`"
                aria-hidden="true"
              >
                <i :class="section.icon" class="text-white"></i>
              </div>
              <div>
                <h3
                  :id="`section-${section.id}`"
                  class="font-semibold text-gray-900 dark:text-white"
                >
                  {{ section.title }}
                </h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  {{ section.description }}
                </p>
              </div>
            </div>
          </div>

          <!-- Section Content -->
          <div class="p-6">
            <!-- Dynamic component rendering -->
            <NotificationSettings
              v-if="section.component === 'NotificationSettings'"
              :settings="settings as UserSettings | null"
              @update="handleSettingUpdate"
            />
            <AppearanceSettings
              v-else-if="section.component === 'AppearanceSettings'"
              :settings="settings as UserSettings | null"
              @update="handleSettingUpdate"
            />
            <BehaviorSettings
              v-else-if="section.component === 'BehaviorSettings'"
              :settings="settings as UserSettings | null"
              @update="handleSettingUpdate"
            />
            <LanguageSettings
              v-else-if="section.component === 'LanguageSettings'"
              :settings="settings as UserSettings | null"
              @update="handleSettingUpdate"
            />
            <DataSettings
              v-else-if="section.component === 'DataSettings'"
              :settings="settings as UserSettings | null"
              @update="handleSettingUpdate"
              @export="handleExport"
              @import="handleImport"
              @clear="handleClear"
              @undo="undoLastChange"
            />
            <PrivacySettings
              v-else-if="section.component === 'PrivacySettings'"
              :settings="settings as UserSettings | null"
              @update="handleSettingUpdate"
              @disconnect="handleDisconnect"
              @export-request="handleExportRequest"
              @deletion-request="handleDeletionRequest"
            />
          </div>
        </div>
      </div>

      <!-- Support Section -->
      <section
        class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
        aria-labelledby="support-heading"
      >
        <h3
          id="support-heading"
          class="font-semibold text-gray-900 dark:text-white mb-4"
        >
          {{ $t('settings.support.title') }}
        </h3>
        <div class="space-y-3" role="list">
          <button
            @click="openHelp"
            class="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            role="listitem"
            aria-label="Open help and FAQ page"
          >
            <div class="flex items-center space-x-3">
              <i
                class="fas fa-question-circle text-blue-500"
                aria-hidden="true"
              ></i>
              <span class="text-sm font-medium text-gray-900 dark:text-white"
                >{{ $t('settings.support.help') }}</span
              >
            </div>
            <i
              class="fas fa-chevron-right text-gray-400 dark:text-gray-500"
              aria-hidden="true"
            ></i>
          </button>
          <button
            @click="contactSupport"
            class="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            role="listitem"
            aria-label="Contact support team"
          >
            <div class="flex items-center space-x-3">
              <i class="fas fa-headset text-green-500" aria-hidden="true"></i>
              <span class="text-sm font-medium text-gray-900 dark:text-white"
                >{{ $t('settings.support.contactSupport') }}</span
              >
            </div>
            <i
              class="fas fa-chevron-right text-gray-400 dark:text-gray-500"
              aria-hidden="true"
            ></i>
          </button>
          <div
            class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            role="listitem"
          >
            <div class="flex items-center space-x-3">
              <i
                class="fas fa-info-circle text-gray-500"
                aria-hidden="true"
              ></i>
              <span class="text-sm font-medium text-gray-900 dark:text-white"
                >{{ $t('settings.support.appVersion') }}</span
              >
            </div>
            <span
              class="text-sm text-gray-600 dark:text-gray-400"
              :aria-label="`${$t('settings.support.appVersion')} 2.1.4`"
              >2.1.4</span
            >
          </div>
        </div>
      </section>
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
import { ref, computed } from "vue";
import type {
  TodoPriority,
  SortOption,
  FontSize,
  SyncFrequency,
  BackupFrequency,
  UserSettings,
} from "~/types/todo";
import AppHeader from "~/components/AppHeader.vue";
import ConfirmationDialog from "~/components/ConfirmationDialog.vue";
import Toast from "~/components/Toast.vue";
import BottomNavigation from "~/components/BottomNavigation.vue";
import NotificationSettings from "~/components/NotificationSettings.vue";
import AppearanceSettings from "~/components/AppearanceSettings.vue";
import BehaviorSettings from "~/components/BehaviorSettings.vue";
import LanguageSettings from "~/components/LanguageSettings.vue";
import DataSettings from "~/components/DataSettings.vue";
import PrivacySettings from "~/components/PrivacySettings.vue";

// Reactive data
const searchQuery = ref("");
const editProfile = ref(false);
const savingProfile = ref(false);
const profileForm = ref({
  displayName: "",
  bio: "",
  profileVisibility: "private" as "public" | "private" | "contacts",
});
const confirmationDialog = ref();
const toast = ref();
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
const maxHistorySize = 5; // Reduced for memory efficiency

// Composables
const { locale, locales, setLocale: i18nSetLocale, t } = useI18n();
const { $telegram } = useNuxtApp();
const { settings, fetchSettings, updateSettings } = useSettings();
const { todos, fetchTodos, createTodo } = useTodos();
const { projects, fetchProjects, createProject } = useProjects();
const { theme, setTheme } = useTheme();

// Computed properties
const availableLocales = computed(() => locales.value);
const currentLocale = computed(() => locale.value);
const selectedTheme = computed({
  get: () => theme.value,
  set: (value) => setTheme(value),
});

const userName = computed(() => {
  const user = $telegram?.user;
  if (user) {
    return `${user.first_name}${user.last_name ? " " + user.last_name : ""}`;
  }
  return null;
});

const userEmail = computed(() => {
  return $telegram?.user?.username ? `@${$telegram.user.username}` : null;
});

const userPhoto = computed(() => {
  return $telegram?.user?.photo_url;
});

// Settings sections
const settingsSections = computed(() => [
  {
    id: "notifications",
    title: t('settings.sections.notifications'),
    description: t('settings.sections.notificationsDesc'),
    icon: "fas fa-bell",
    color: "bg-blue-100 dark:bg-blue-900",
    component: "NotificationSettings",
  },
  {
    id: "appearance",
    title: t('settings.sections.appearance'),
    description: t('settings.sections.appearanceDesc'),
    icon: "fas fa-palette",
    color: "bg-purple-100 dark:bg-purple-900",
    component: "AppearanceSettings",
  },
  {
    id: "behavior",
    title: t('settings.sections.behavior'),
    description: t('settings.sections.behaviorDesc'),
    icon: "fas fa-cogs",
    color: "bg-green-100 dark:bg-green-900",
    component: "BehaviorSettings",
  },
  {
    id: "language",
    title: t('settings.sections.language'),
    description: t('settings.sections.languageDesc'),
    icon: "fas fa-language",
    color: "bg-indigo-100 dark:bg-indigo-900",
    component: "LanguageSettings",
  },
  {
    id: "data",
    title: t('settings.sections.data'),
    description: t('settings.sections.dataDesc'),
    icon: "fas fa-database",
    color: "bg-orange-100 dark:bg-orange-900",
    component: "DataSettings",
  },
  {
    id: "privacy",
    title: t('settings.sections.privacy'),
    description: t('settings.sections.privacyDesc'),
    icon: "fas fa-shield-alt",
    color: "bg-red-100 dark:bg-red-900",
    component: "PrivacySettings",
  },
]);

const filteredSections = computed(() => {
  if (!searchQuery.value) return settingsSections.value;

  const query = searchQuery.value.toLowerCase();
  return settingsSections.value.filter(
    (section) =>
      section.title.toLowerCase().includes(query) ||
      section.description.toLowerCase().includes(query)
  );
});

// TODO: This file is too large (952 lines). Consider splitting into:
// - ProfileSection.vue
// - SettingsSections.vue
// - SupportSection.vue
// - settingsMethods.js for shared logic

// Methods
const setLocale = async (newLocale: "ru" | "en") => {
  await i18nSetLocale(newLocale);
  if (settings.value) {
    await updateSettings({ language: newLocale });
  }
};

const openUserProfile = () => {
  if ($telegram?.user?.username) {
    window.open(`https://t.me/${$telegram.user.username}`, "_blank");
  }
};

const saveProfile = async () => {
  if (savingProfile.value) return; // Prevent double submission

  try {
    savingProfile.value = true;

    // Input validation
    const displayName = profileForm.value.displayName?.trim();
    const bio = profileForm.value.bio?.trim();

    if (displayName && displayName.length > 50) {
      toast.value?.showError(t('settings.profile.invalidInput'), t('settings.profile.displayNameTooLong'));
      return;
    }

    if (bio && bio.length > 500) {
      toast.value?.showError(t('settings.profile.invalidInput'), t('settings.profile.bioTooLong'));
      return;
    }

    if (settings.value) {
      await updateSettings({
        displayName: displayName || undefined,
        bio: bio || undefined,
        profileVisibility: profileForm.value.profileVisibility,
      });
      editProfile.value = false;
      toast.value?.showSuccess(
        t('settings.profile.profileUpdated'),
        t('settings.profile.profileUpdatedDesc')
      );
    }
  } catch (error) {
    toast.value?.showError(
      t('settings.profile.profileUpdateFailed'),
      t('settings.profile.profileUpdateFailedDesc')
    );
    console.error("Profile update failed:", error);
  } finally {
    savingProfile.value = false;
  }
};

const handleSettingUpdate = async (updates: any) => {
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
    // Show success toast with undo option
    toast.value?.showSuccess(
      t('settings.messages.settingsUpdated'),
      t('settings.messages.settingsUpdatedDesc'),
      8000
    );

    // Add undo button to toast (this would need to be implemented in the Toast component)
    // For now, we'll just show the success message
  } catch (error: any) {
    // Show error toast with more specific message
    const errorMessage = error?.data?.message || error?.message || "Unknown error occurred";
    toast.value?.showError(
      t('settings.messages.updateFailed'),
      t('settings.messages.updateFailedDesc', { message: errorMessage })
    );
    console.error("Settings update failed:", error);
  }
};

const saveSettingsToHistory = (currentSettings: UserSettings) => {
  // Add current state to history
  settingsHistory.value.unshift({ ...currentSettings });

  // Limit history size
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
        t('settings.messages.settingsRestored'),
        t('settings.messages.settingsRestoredDesc')
      );
      }
    } catch (error) {
      toast.value?.showError(
        t('settings.messages.undoFailed'),
        t('settings.messages.undoFailedDesc')
      );
      console.error("Undo failed:", error);
    }
  } else {
    toast.value?.showWarning(
      t('settings.messages.nothingToUndo'),
      t('settings.messages.nothingToUndoDesc')
    );
  }
};

const canUndo = computed(() => settingsHistory.value.length > 0);

const handleExport = async (format: string = "json") => {
  await exportData(format);
};

const handleImport = async () => {
  // Trigger file input for import
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";
  input.onchange = async (event) => {
    await importData(event);
  };
  input.click();
};

const handleClear = async () => {
  // Show confirmation dialog
  dialogConfig.value = {
    title: t('settings.dialogs.clearAllData'),
    message: t('settings.dialogs.clearAllDataMessage'),
    confirmText: t('settings.dialogs.deleteEverything'),
    cancelText: t('common.cancel'),
    icon: "fas fa-trash",
    iconColor: "bg-red-500",
    confirmButtonClass: "bg-red-500 hover:bg-red-600",
    additionalInfo: t('settings.dialogs.clearAllDataInfo'),
  };
  confirmationDialog.value?.show();
};

const handleDisconnect = () => {
  // Show confirmation dialog for disconnect
  dialogConfig.value = {
    title: t('settings.dialogs.disconnectAccount'),
    message: t('settings.dialogs.disconnectAccountMessage'),
    confirmText: t('settings.privacy.disconnectAccount'),
    cancelText: t('common.cancel'),
    icon: "fas fa-sign-out-alt",
    iconColor: "bg-orange-500",
    confirmButtonClass: "bg-orange-500 hover:bg-orange-600",
    additionalInfo: t('settings.dialogs.disconnectAccountInfo'),
  };
  confirmationDialog.value?.show();
};

const handleExportRequest = () => {
  // Request data export - trigger immediate export
  exportData('json');
};

const handleDeletionRequest = () => {
  // Show confirmation dialog and trigger data deletion
  dialogConfig.value = {
    title: t('settings.dialogs.deleteAllData'),
    message: t('settings.dialogs.deleteAllDataMessage'),
    confirmText: t('settings.dialogs.deleteEverything'),
    cancelText: t('common.cancel'),
    icon: "fas fa-trash",
    iconColor: "bg-red-500",
    confirmButtonClass: "bg-red-500 hover:bg-red-600",
    additionalInfo: t('settings.dialogs.deleteAllDataInfo'),
  };
  confirmationDialog.value?.show();
};

const showConfirmationDialog = (config: typeof dialogConfig.value) => {
  dialogConfig.value = { ...config };
  confirmationDialog.value?.show();
};

const handleDialogConfirm = async () => {
  // Handle confirmation based on current dialog context
  const clearDataTitle = t('settings.dialogs.clearAllData');
  const deleteDataTitle = t('settings.dialogs.deleteAllData');
  const disconnectTitle = t('settings.dialogs.disconnectAccount');
  
  if (dialogConfig.value.title === clearDataTitle || dialogConfig.value.title === deleteDataTitle) {
    await clearAllData();
  } else if (dialogConfig.value.title === disconnectTitle) {
    await disconnectAccount();
  }
  console.log("Dialog confirmed");
};

const handleDialogCancel = () => {
  // Handle cancellation
  console.log("Dialog cancelled");
};

const exportData = async (format: string = "json") => {
  try {
    toast.value?.showInfo(
      t('settings.messages.exportingData'),
      t('settings.messages.exportingDataDesc')
    );

    if (format === "json") {
      // For JSON, fetch the data and create a downloadable file
      const data = await $fetch(`/api/export/${format}`, {
        method: "GET",
        headers: {
          "x-telegram-user-id": $telegram?.user?.id?.toString() || "",
        },
      });

      // Remove sensitive information from export
      const sanitizedData = {
        ...data,
        userId: undefined, // Remove userId for privacy
        exportedAt: data.exportedAt
      };

      const jsonString = JSON.stringify(sanitizedData, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `todo-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } else {
      // For CSV and Todoist, use the endpoint directly (they have proper download headers)
      const exportUrl = `/api/export/${format}`;
      window.open(exportUrl, "_blank");
    }

    toast.value?.showSuccess(
      t('settings.messages.exportComplete'),
      t('settings.messages.exportCompleteDesc')
    );
  } catch (error) {
    toast.value?.showError(
      t('settings.messages.exportFailed'),
      t('settings.messages.exportFailedDesc')
    );
    console.error("Export failed:", error);
  }
};

const importData = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  // File validation
  if (file.size > 10 * 1024 * 1024) { // 10MB limit
    toast.value?.showError(t('settings.messages.fileTooLarge'), t('settings.messages.fileTooLargeDesc'));
    return;
  }

  if (!file.name.toLowerCase().endsWith('.json')) {
    toast.value?.showError(t('settings.messages.invalidFileType'), t('settings.messages.invalidFileTypeDesc'));
    return;
  }

  try {
    toast.value?.showInfo(t('settings.messages.importingData'), t('settings.messages.importingDataDesc'));

    // Create FormData for file upload
    const formData = new FormData();
    formData.append("file", file);

    // Upload file to import endpoint with proper headers
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
      toast.value?.showSuccess(t('settings.messages.importComplete'), response.message);

      // Refresh data
      await Promise.all([fetchTodos(), fetchProjects(), fetchSettings()]);
    } else {
      throw new Error(response.message);
    }
  } catch (error) {
    toast.value?.showError(
      t('settings.messages.importFailed'),
      t('settings.messages.importFailedDesc')
    );
    console.error("Import failed:", error);
  }
};

const openHelp = () => {
  // TODO: Replace with actual help URL from config
  window.open("https://telegram.org/support", "_blank");
};

const clearAllData = async () => {
  try {
    toast.value?.showInfo(t('settings.messages.clearingData'), t('settings.messages.clearingDataDesc'));

    const userId = $telegram?.user?.id?.toString();
    if (!userId) {
      throw new Error("User ID not available");
    }

    const headers = {
      "x-telegram-user-id": userId,
    };

    let deletedCount = 0;
    let errorCount = 0;

    // Clear all todos by getting all todos and deleting them one by one
    // TODO: Implement bulk delete API endpoint for better performance
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

    // Clear projects
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

    // Refresh data
    await Promise.all([fetchTodos(), fetchProjects()]);

    const message = errorCount > 0
      ? t('settings.messages.dataClearedWithErrors', { count: errorCount, deletedCount })
      : t('settings.messages.dataClearedDesc');

    toast.value?.showSuccess(
      t('settings.messages.dataCleared'),
      message
    );
  } catch (error) {
    toast.value?.showError(
      t('settings.messages.clearFailed'),
      t('settings.messages.clearFailedDesc')
    );
    console.error("Clear data failed:", error);
  }
};

const disconnectAccount = async () => {
  try {
    toast.value?.showInfo(t('settings.messages.disconnectingAccount'), t('settings.messages.disconnectingAccountDesc'));

    // Clear all data
    await clearAllData();

    // Clear settings
    if (settings.value) {
      await updateSettings({});
    }

    // Clear local storage or any cached data
    if (typeof localStorage !== 'undefined') {
      // Clear all app-related localStorage keys
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('todo-') || key.startsWith('settings') || key.startsWith('theme'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    }

    // Clear session storage if used
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.clear();
    }

    toast.value?.showSuccess(
      t('settings.messages.accountDisconnected'),
      t('settings.messages.accountDisconnectedDesc')
    );

    // Optionally redirect to login or refresh
    // window.location.reload();
  } catch (error) {
    toast.value?.showError(
      t('settings.messages.disconnectFailed'),
      t('settings.messages.disconnectFailedDesc')
    );
    console.error("Disconnect failed:", error);
  }
};

const contactSupport = () => {
  // TODO: Replace with actual support channel from config
  window.open("https://telegram.org/support", "_blank");
};

// Initialize
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

  // Authenticate user if we have user data
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

  // Only fetch settings if user is authenticated
  if ($telegram?.user?.id) {
    try {
      await fetchSettings();

      // Initialize profile form and locale in parallel if possible
      if (settings.value) {
        profileForm.value = {
          displayName: settings.value.displayName || "",
          bio: settings.value.bio || "",
          profileVisibility: settings.value.profileVisibility || "private",
        };

        // Set initial locale from settings
        if (settings.value?.language) {
          await i18nSetLocale(settings.value.language as "ru" | "en");
        }
      }
    } catch (error) {
      console.error("Error initializing settings:", error);
      // Continue with defaults if settings fetch fails
    }
  } else {
    console.warn("User ID not available, skipping settings fetch");
  }
});
</script>
