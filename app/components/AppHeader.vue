<script setup lang="ts">
import { BOOKING_URL } from '~~/shared/constant';

const route = useRoute();

const navItems = [
  { to: '/', label: '今日', kanji: '今' },
  { to: '/shifts', label: '班表', kanji: '表' },
  { to: '/agents', label: '探員', kanji: '員' },
  { to: '/statistics', label: '統計', kanji: '計' },
] as const;

function isActive(to: string): boolean {
  if (to === '/') {
    return route.path === '/';
  }

  return route.path === to || route.path.startsWith(`${to}/`);
}
</script>

<template>
  <header class="app-header">
    <NuxtLink to="/" class="app-header__brand">
      <BrandMark :size="36" />
      <span class="app-header__brand-text">
        <span class="serif app-header__name">朱雫</span>
        <span class="stamp-label">SHUNA · MAID CAFÉ</span>
      </span>
    </NuxtLink>

    <nav class="app-header__nav" aria-label="主導覽">
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="nav-link"
        :class="{ 'is-active': isActive(item.to) }"
        :aria-current="isActive(item.to) ? 'page' : undefined"
      >
        <span class="serif nav-link__kanji">{{ item.kanji }}</span>
        <span class="nav-link__label">{{ item.label }}</span>
      </NuxtLink>
    </nav>

    <a
      class="app-header__cta"
      :href="BOOKING_URL"
      target="_blank"
      rel="noopener noreferrer"
    >
      <span>預約</span>
      <span class="stamp-label">RESERVE</span>
    </a>
  </header>
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  gap: 32px;
  padding: 14px 28px;
  background: color-mix(in oklab, var(--color-paper) 90%, transparent);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--color-rule);
}

.app-header__brand {
  display: flex;
  align-items: center;
  gap: 12px;
  transition: opacity 0.15s;
}
.app-header__brand:hover {
  opacity: 0.8;
}
.app-header__brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.05;
}
.app-header__name {
  font-size: 22px;
  letter-spacing: 0.02em;
  color: var(--color-ink);
}

.app-header__nav {
  display: flex;
  gap: 4px;
  margin-left: auto;
}
.nav-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  color: var(--color-ink-soft);
  font-size: 14px;
  transition: color 0.15s, background 0.15s, border-color 0.15s;
}
.nav-link__kanji {
  font-size: 17px;
  opacity: 0.55;
  transition: opacity 0.15s;
}
.nav-link:hover {
  color: var(--color-ink);
  background: var(--color-paper-2);
}
.nav-link.is-active {
  color: var(--color-shu);
  border-color: var(--color-shu-line);
  background: var(--color-shu-soft);
}
.nav-link.is-active .nav-link__kanji {
  opacity: 1;
}

.app-header__cta {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 9px 16px;
  border: 1px solid var(--color-ink);
  border-radius: var(--radius-md);
  background: var(--color-ink);
  color: var(--color-paper);
  font-size: 14px;
  transition: background 0.15s, border-color 0.15s;
}
.app-header__cta:hover {
  background: var(--color-shu);
  border-color: var(--color-shu);
}
.app-header__cta .stamp-label {
  color: color-mix(in oklab, var(--color-paper) 70%, transparent);
}

@media (max-width: 920px) {
  .app-header {
    gap: 16px;
    padding: 10px 16px;
  }
  .app-header__cta {
    display: none;
  }
  .nav-link__label {
    display: none;
  }
  .nav-link {
    padding: 8px 10px;
  }
  .nav-link__kanji {
    font-size: 16px;
  }
}

@media (max-width: 520px) {
  /* 窄螢幕收掉品牌副標，避免羅馬字折行 */
  .app-header__brand-text .stamp-label {
    display: none;
  }
}
</style>
