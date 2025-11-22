<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
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
            {{ $t("settings.profile.title") }}
          </h2>
          <button
            @click="editProfile = !editProfile"
            class="text-blue-500 hover:text-blue-600 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 rounded"
            :aria-expanded="editProfile"
            aria-controls="profile-edit-form"
          >
            {{
              editProfile
                ? $t("settings.profile.cancel")
                : $t("settings.profile.edit")
            }}
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
              {{ userName || $t("settings.profile.user") }}
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ userEmail || $t("settings.profile.telegramUser") }}
            </p>
            <p class="text-xs text-blue-500 mt-1">
              {{ $t("settings.profile.premiumMember") }}
            </p>
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
              >{{ $t("settings.profile.displayName") }}</label
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
              >{{ $t("settings.profile.bio") }}</label
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
              >{{ $t("settings.profile.profileVisibility") }}</label
            >
            <select
              id="profile-visibility"
              v-model="profileForm.profileVisibility"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-describedby="visibility-help"
            >
              <option value="private">
                {{ $t("settings.profile.private") }}
              </option>
              <option value="contacts">
                {{ $t("settings.profile.contactsOnly") }}
              </option>
              <option value="public">
                {{ $t("settings.profile.public") }}
              </option>
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
            {{
              savingProfile
                ? $t("settings.profile.saving")
                : $t("settings.profile.saveProfile")
            }}
          </button>
          <div id="save-help" class="sr-only">Save your profile changes</div>
        </div>
      </div>

      <!-- Settings Sections -->
      <div
        v-for="section in filteredSections"
        :key="section.id"
        class="mb-4"
      >
        <NuxtLink
          :to="section.route"
          class="block bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
        >
          <div class="px-6 py-4">
            <div class="flex items-center space-x-3">
              <div
                :class="`w-12 h-12 ${section.color} rounded-full flex items-center justify-center`"
                aria-hidden="true"
              >
                <i :class="section.icon" class="text-white text-lg"></i>
              </div>
              <div class="flex-1">
                <h3 class="font-semibold text-gray-900 dark:text-white">
                  {{ section.title }}
                </h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  {{ section.description }}
                </p>
              </div>
              <i
                class="fas fa-chevron-right text-gray-400 dark:text-gray-500"
                aria-hidden="true"
              ></i>
            </div>
          </div>
        </NuxtLink>
      </div>

      <!-- Support Section -->
      <section
        class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mt-6"
        aria-labelledby="support-heading"
      >
        <h3
          id="support-heading"
          class="font-semibold text-gray-900 dark:text-white mb-4"
        >
          {{ $t("settings.support.title") }}
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
              <span class="text-sm font-medium text-gray-900 dark:text-white">{{
                $t("settings.support.help")
              }}</span>
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
              <span class="text-sm font-medium text-gray-900 dark:text-white">{{
                $t("settings.support.contactSupport")
              }}</span>
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
              <span class="text-sm font-medium text-gray-900 dark:text-white">{{
                $t("settings.support.appVersion")
              }}</span>
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

    <!-- Toast Notifications -->
    <Toast ref="toast" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import type { UserSettings } from "~/types/todo";
import Toast from "~/components/Toast.vue";
import BottomNavigation from "~/components/BottomNavigation.vue";

// Reactive data
const searchQuery = ref("");
const editProfile = ref(false);
const savingProfile = ref(false);
const profileForm = ref({
  displayName: "",
  bio: "",
  profileVisibility: "private" as "public" | "private" | "contacts",
});
const toast = ref();

// Composables
const { t } = useI18n();
const { $telegram } = useNuxtApp();
const { settings, fetchSettings, updateSettings } = useSettings();

// Computed properties
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
    title: t("settings.sections.notifications"),
    description: t("settings.sections.notificationsDesc"),
    icon: "fas fa-bell",
    color: "bg-blue-500",
    route: "/settings/notifications",
  },
  {
    id: "appearance",
    title: t("settings.sections.appearance"),
    description: t("settings.sections.appearanceDesc"),
    icon: "fas fa-palette",
    color: "bg-purple-500",
    route: "/settings/appearance",
  },
  {
    id: "behavior",
    title: t("settings.sections.behavior"),
    description: t("settings.sections.behaviorDesc"),
    icon: "fas fa-cogs",
    color: "bg-green-500",
    route: "/settings/behavior",
  },
  {
    id: "language",
    title: t("settings.sections.language"),
    description: t("settings.sections.languageDesc"),
    icon: "fas fa-language",
    color: "bg-indigo-500",
    route: "/settings/language",
  },
  {
    id: "data",
    title: t("settings.sections.data"),
    description: t("settings.sections.dataDesc"),
    icon: "fas fa-database",
    color: "bg-orange-500",
    route: "/settings/data",
  },
  {
    id: "privacy",
    title: t("settings.sections.privacy"),
    description: t("settings.sections.privacyDesc"),
    icon: "fas fa-shield-alt",
    color: "bg-red-500",
    route: "/settings/privacy",
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

// Methods
const openUserProfile = () => {
  if ($telegram?.user?.username) {
    window.open(`https://t.me/${$telegram.user.username}`, "_blank");
  }
};

const saveProfile = async () => {
  if (savingProfile.value) return;

  try {
    savingProfile.value = true;

    const displayName = profileForm.value.displayName?.trim();
    const bio = profileForm.value.bio?.trim();

    if (displayName && displayName.length > 50) {
      toast.value?.showError(
        t("settings.profile.invalidInput"),
        t("settings.profile.displayNameTooLong")
      );
      return;
    }

    if (bio && bio.length > 500) {
      toast.value?.showError(
        t("settings.profile.invalidInput"),
        t("settings.profile.bioTooLong")
      );
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
        t("settings.profile.profileUpdated"),
        t("settings.profile.profileUpdatedDesc")
      );
    }
  } catch (error) {
    toast.value?.showError(
      t("settings.profile.profileUpdateFailed"),
      t("settings.profile.profileUpdateFailedDesc")
    );
    console.error("Profile update failed:", error);
  } finally {
    savingProfile.value = false;
  }
};

const openHelp = () => {
  window.open("https://telegram.org/support", "_blank");
};

const contactSupport = () => {
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

      if (settings.value) {
        profileForm.value = {
          displayName: settings.value.displayName || "",
          bio: settings.value.bio || "",
          profileVisibility: settings.value.profileVisibility || "private",
        };
      }
    } catch (error) {
      console.error("Error initializing settings:", error);
    }
  } else {
    console.warn("User ID not available, skipping settings fetch");
  }
});
</script>

