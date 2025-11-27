export const usePrivacy = () => {
    const { settings, updateSettings } = useSettings()

    const setAnalyticsEnabled = async (enabled: boolean) => {
        if (settings.value) {
            await updateSettings({ analyticsEnabled: enabled })

            // Enable/disable analytics tracking
            if (process.client) {
                if (enabled) {
                    // Enable analytics (placeholder for actual analytics service)
                    console.log('Analytics enabled')
                    // Example: gtag('config', 'GA_MEASUREMENT_ID')
                } else {
                    // Disable analytics
                    console.log('Analytics disabled')
                    // Example: gtag('config', 'GA_MEASUREMENT_ID', { 'anonymize_ip': true })
                }
            }
        }
    }

    const setCrashReportingEnabled = async (enabled: boolean) => {
        if (settings.value) {
            await updateSettings({ crashReportingEnabled: enabled })

            // Enable/disable crash reporting
            if (process.client) {
                if (enabled) {
                    // Enable crash reporting (placeholder for actual service)
                    console.log('Crash reporting enabled')
                    // Example: Sentry.init({ dsn: '...' })
                } else {
                    // Disable crash reporting
                    console.log('Crash reporting disabled')
                    // Example: Sentry.close()
                }
            }
        }
    }

    const setDataEncryptionEnabled = async (enabled: boolean) => {
        if (settings.value) {
            await updateSettings({ dataEncryptionEnabled: enabled })

            // Note: Data encryption would require backend changes
            // This is just a setting that could be used by the backend
            console.log('Data encryption setting updated:', enabled)
        }
    }

    // Initialize privacy settings on mount
    onMounted(() => {
        if (settings.value) {
            // Apply current privacy settings
            if (settings.value.analyticsEnabled === false) {
                console.log('Analytics disabled by user setting')
            }
            if (settings.value.crashReportingEnabled === false) {
                console.log('Crash reporting disabled by user setting')
            }
        }
    })

    return {
        setAnalyticsEnabled,
        setCrashReportingEnabled,
        setDataEncryptionEnabled
    }
}