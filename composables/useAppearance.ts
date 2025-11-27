const getAccentClass = (color: string): string | null => {
  const colorMap: Record<string, string> = {
    '#3B82F6': 'accent-blue',
    '#EF4444': 'accent-red',
    '#10B981': 'accent-green',
    '#F59E0B': 'accent-yellow',
    '#8B5CF6': 'accent-purple',
    '#EC4899': 'accent-pink',
    '#6B7280': 'accent-gray',
    '#F97316': 'accent-orange',
    '#06B6D4': 'accent-cyan',
    '#84CC16': 'accent-lime',
    '#6366F1': 'accent-indigo',
    '#14B8A6': 'accent-teal'
  }

  return colorMap[color] || null
}

export const useAppearance = () => {
  const { settings } = useSettings()

  const applyAppearanceSettings = () => {
    if (!process.client || !settings.value) return

    const { accentColor, fontSize, animationsEnabled, compactView } = settings.value

    // Apply accent color
    if (accentColor) {
      // Remove existing accent classes
      document.documentElement.classList.forEach(className => {
        if (className.startsWith('accent-')) {
          document.documentElement.classList.remove(className)
        }
      })

      // Add new accent class based on color
      const accentClass = getAccentClass(accentColor)
      if (accentClass) {
        document.documentElement.classList.add(accentClass)
      }
    }

    // Apply font size
    document.documentElement.classList.remove('text-sm', 'text-base', 'text-lg')
    switch (fontSize) {
      case 'small':
        document.documentElement.classList.add('text-sm')
        break
      case 'large':
        document.documentElement.classList.add('text-lg')
        break
      default:
        document.documentElement.classList.add('text-base')
    }

    // Apply animations
    if (animationsEnabled === false) {
      document.documentElement.classList.add('no-animations')
    } else {
      document.documentElement.classList.remove('no-animations')
    }

    // Apply compact view
    if (compactView) {
      document.documentElement.classList.add('compact-view')
    } else {
      document.documentElement.classList.remove('compact-view')
    }
  }

  // Watch for settings changes
  watch(() => settings.value, () => {
    applyAppearanceSettings()
  }, { deep: true })

  // Apply on mount
  onMounted(() => {
    applyAppearanceSettings()
  })

  return {
    applyAppearanceSettings
  }
}