<!--
  朱雫 — default layout
  貼到：app/layouts/default.vue

  主要變更：
  - 移除原本 body 的 pink/purple/blue 三色漸層
  - 移除 dark mode class
  - 改為紙感底色 + paper-grain overlay
-->
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
