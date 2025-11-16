<template>
  <div class="space-y-2">
    <div class="flex gap-2 flex-wrap">
      <!-- Кнопки быстрого выбора -->
      <button v-for="(quickDate, index) in quickDates" :key="index" @click="selectQuickDate(quickDate.value)"
        class="flex-1 min-w-[90px] px-2 sm:px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl text-xs sm:text-sm font-medium active:opacity-80 transition-opacity touch-manipulation min-h-[44px]"
        :class="{ 'bg-blue-500 dark:bg-blue-600 text-white': quickDate.selected }">
        <span class="whitespace-nowrap">{{ quickDate.label }}</span>
      </button>
    </div>

    <!-- Поле ввода даты -->
    <input v-model="dateInput" type="date" :min="todayStr"
      class="w-full px-3 sm:px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white text-sm sm:text-base touch-manipulation min-h-[44px]" />

    <!-- Информация о выбранной дате и кнопка очистки -->
    <div v-if="displayDate" class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-2">
      <span class="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
        {{ $t('dateSelector.custom') }}: {{ formatDate(displayDate) }}
      </span>
      <button @click="clearDate"
        class="text-xs sm:text-sm text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-500 transition-colors touch-manipulation whitespace-nowrap">
        {{ $t('common.delete') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

interface Props {
  modelValue?: Date | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:modelValue': [value?: Date | null];
}>();

// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---

// Функция для получения строки YYYY-MM-DD для "сегодня" в локальной временной зоне
const getTodayStr = (): string => {
  const now = new Date();
  // Используем getFullYear, getMonth, getDate, чтобы получить компоненты даты в локальной зоне
  // и создать новую дату, представляющую начало дня в локальной зоне
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  // toISOString() возвращает дату как если бы она была в UTC, но время установлено на 00:00:00 UTC
  // Нам нужна только дата, и браузер корректно отобразит её в input type="date"
  // как дату в локальной временной зоне пользователя.
  // Важно: строка, возвращаемая toISOString().split('T')[0], будет правильной для `min`,
  // если мы хотим, чтобы минимальная дата была *сегодняшним днём* по локальному времени.
  // getTodayDateObject делает это корректно.
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // getMonth() от 0 до 11
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Функция для нормализации Date до начала дня в локальной временной зоне и получения его строки
const getDateStr = (date: Date): string => {
  const normalized = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const year = normalized.getFullYear();
  const month = String(normalized.getMonth() + 1).padStart(2, '0');
  const day = String(normalized.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Функция для создания Date объекта, представляющего начало дня (00:00:00) для заданной строки YYYY-MM-DD в локальной временной зоне
const stringToDate = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  // Month is 0-indexed in Date constructor
  return new Date(year, month - 1, day);
};

// --- СОСТОЯНИЕ ---
const dateInput = ref<string>('');

// --- COMPUTED ---

// Получаем строку "сегодня" один раз при создании компонента
const todayStr = computed(() => getTodayStr());

// Вычисляем быстрые даты, используя нормализованные строки/объекты
const quickDates = computed(() => {
  const todayObj = stringToDate(todayStr.value); // Начало дня "сегодня"
  const todayNormalizedStr = getDateStr(todayObj);

  const tomorrowObj = new Date(todayObj);
  tomorrowObj.setDate(tomorrowObj.getDate() + 1);
  const tomorrowNormalizedStr = getDateStr(tomorrowObj);

  const nextWeekObj = new Date(todayObj);
  nextWeekObj.setDate(nextWeekObj.getDate() + 7);
  const nextWeekNormalizedStr = getDateStr(nextWeekObj);

  // Сравниваем строки или нормализованные даты
  const currentSelectedDateStr = props.modelValue ? getDateStr(props.modelValue) : null;

  const { t } = useI18n()
  return [
    {
      value: todayNormalizedStr, // Передаем строку даты
      label: t('dateSelector.today'),
      selected: currentSelectedDateStr === todayNormalizedStr,
    },
    {
      value: tomorrowNormalizedStr,
      label: t('dateSelector.tomorrow'),
      selected: currentSelectedDateStr === tomorrowNormalizedStr,
    },
    {
      value: nextWeekNormalizedStr,
      label: t('dateSelector.nextWeek'),
      selected: currentSelectedDateStr === nextWeekNormalizedStr,
    },
  ];
});

// Вычисляем дату для отображения в тексте "Выбрано: ..."
const displayDate = computed(() => {
  if (props.modelValue) {
    // Проверяем, что props.modelValue не null и не undefined
    // Можно использовать props.modelValue instanceof Date && props.modelValue
    // или просто props.modelValue
    return props.modelValue;
  }
  return null;
});

// --- WATCHERS ---

// Синхронизируем dateInput с props.modelValue
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      // Преобразуем Date в строку YYYY-MM-DD, нормализуя до начала дня в локальной зоне
      dateInput.value = getDateStr(newVal);
    } else {
      dateInput.value = '';
    }
  },
  { immediate: true } // Выполнить сразу при создании
);

// Синхронизируем props.modelValue с dateInput
watch(dateInput, (newVal) => {
  if (newVal) {
    // Преобразуем строку YYYY-MM-DD в Date объект, представляющий начало дня в локальной зоне
    // Затем устанавливаем время на 23:59:59.999 для этого дня
    const dateObj = stringToDate(newVal);
    dateObj.setHours(23, 59, 59, 999);
    emit('update:modelValue', dateObj);
  } else {
    emit('update:modelValue', null); // Используем null вместо undefined для ясности
  }
});

// --- МЕТОДЫ ---

const selectQuickDate = (dateStr: string) => {
  // Просто устанавливаем строку в v-model input
  dateInput.value = dateStr;
  // Watcher на dateInput автоматически вызовет emit
};

const clearDate = () => {
  dateInput.value = '';
  // Watcher на dateInput автоматически вызовет emit с null
  emit('update:modelValue', null);
};

const formatDate = (date: Date) => {
  // Используем локализованный формат
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};
</script>