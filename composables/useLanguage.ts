export const useLanguage = () => {
    const { settings, updateSettings } = useSettings()
    const { $i18n } = useNuxtApp()

    const setLanguage = async (language: string) => {
        if (settings.value) {
            await updateSettings({ language })
        }

        // Update i18n locale
        ($i18n.locale as any).value = language

        // Save to localStorage as fallback
        if (process.client) {
            localStorage.setItem('locale', language)
        }
    }

    const setDateFormat = async (dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD') => {
        if (settings.value) {
            await updateSettings({ dateFormat })
        }
    }

    const setTimeFormat = async (timeFormat: '12h' | '24h') => {
        if (settings.value) {
            await updateSettings({ timeFormat })
        }
    }

    const setTimezone = async (timezone: string) => {
        if (settings.value) {
            await updateSettings({ timezone })
        }
    }

    // Initialize language from settings
    watch(() => settings.value?.language, (newLanguage) => {
        if (newLanguage && newLanguage !== ($i18n.locale as any).value) {
            ; ($i18n.locale as any).value = newLanguage
        }
    }, { immediate: true })

    // Initialize from localStorage if no settings
    onMounted(() => {
        if (process.client && !settings.value?.language) {
            const savedLocale = localStorage.getItem('locale')
            if (savedLocale) {
                ; ($i18n.locale as any).value = savedLocale
            }
        }
    })

    return {
        setLanguage,
        setDateFormat,
        setTimeFormat,
        setTimezone
    }
}