<script setup lang="ts">
import { BOOKING_URL } from '~~/shared/constant';

// 班表資料來源（公開的 Google 試算表，現有頁尾即已對外連結）
const SHEET_URL =
  'https://docs.google.com/spreadsheets/d/1Fe39ZrJdp8LFIIg886VoqiAC6H5k8Td4fwZVp85sInw/';

const currentYear = getCurrentYear();
const scheduleStore = useScheduleStore();

const lastUpdated = computed(() =>
  scheduleStore.lastUpdated ? formatDateTime(scheduleStore.lastUpdated) : '同步中…',
);
</script>

<template>
  <footer class="app-footer">
    <UContainer>
      <div class="app-footer__inner">
        <div class="app-footer__brand">
          <BrandMark :size="32" />
          <div>
            <div class="serif app-footer__name">喫茶 朱雫</div>
            <div class="stamp-label">SHUNA · MAID CAFÉ</div>
          </div>
        </div>

        <div class="app-footer__cols">
          <div class="app-footer__col">
            <div class="stamp-label">頁面</div>
            <NuxtLink class="app-footer__link" to="/">今日班表</NuxtLink>
            <NuxtLink class="app-footer__link" to="/shifts">完整班表</NuxtLink>
            <NuxtLink class="app-footer__link" to="/agents">探員圖鑑</NuxtLink>
            <NuxtLink class="app-footer__link" to="/statistics">出勤統計</NuxtLink>
          </div>

          <div class="app-footer__col">
            <div class="stamp-label">營業</div>
            <p class="app-footer__hours">早班 11:00 – 18:00</p>
            <p class="app-footer__hours">晚班 18:00 – 24:00</p>
            <p class="app-footer__hours mono">店休 · 不定休</p>
          </div>

          <div class="app-footer__col">
            <div class="stamp-label">資料</div>
            <a
              class="app-footer__link"
              :href="SHEET_URL"
              target="_blank"
              rel="noopener noreferrer"
            >朱雫班表 Google 表單</a>
            <a
              class="app-footer__link"
              :href="BOOKING_URL"
              target="_blank"
              rel="noopener noreferrer"
            >線上訂位</a>
            <p class="app-footer__hours mono">UPDATED · {{ lastUpdated }}</p>
          </div>
        </div>
      </div>

      <div class="app-footer__base">
        <span class="stamp-label">© {{ currentYear }} 朱雫查班工具 · 非官方</span>
        <span class="stamp-label mono">v2.0 — paper edition</span>
      </div>
    </UContainer>
  </footer>
</template>

<style scoped>
.app-footer {
  position: relative;
  z-index: 10;
  margin-top: 64px;
  padding: 48px 0 24px;
  border-top: 1px solid var(--color-rule);
  background: var(--color-paper-2);
}

.app-footer__inner {
  display: grid;
  grid-template-columns: 1.2fr 2fr;
  gap: 48px;
  margin-bottom: 40px;
  padding-bottom: 32px;
  border-bottom: 1px solid var(--color-rule);
}

.app-footer__brand {
  display: flex;
  align-items: center;
  gap: 12px;
}
.app-footer__name {
  font-size: 22px;
  color: var(--color-ink);
}

.app-footer__cols {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
}
.app-footer__col {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.app-footer__col > .stamp-label {
  margin-bottom: 6px;
  color: var(--color-ink);
}

.app-footer__link {
  width: fit-content;
  color: var(--color-ink-soft);
  font-size: 14px;
  transition: color 0.15s;
}
.app-footer__link:hover {
  color: var(--color-shu);
}

.app-footer__hours {
  margin: 0;
  color: var(--color-ink-soft);
  font-size: 13px;
}

.app-footer__base {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

@media (max-width: 920px) {
  .app-footer__inner {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  .app-footer__cols {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 520px) {
  .app-footer__base {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
