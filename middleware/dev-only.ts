export default defineNuxtRouteMiddleware(() => {
  if (!process.dev) {
    return abortNavigation(
      createError({
        statusCode: 404,
        statusMessage: 'Page Not Found'
      })
    )
  }
})


