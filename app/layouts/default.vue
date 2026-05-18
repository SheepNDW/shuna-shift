<template>
  <div class="min-h-screen flex flex-col paper-grain">
    <AppHeader />

    <main class="flex-1 relative z-10">
      <slot />
    </main>

    <AppFooter />
    <BackToTop />
  </div>
</template>
