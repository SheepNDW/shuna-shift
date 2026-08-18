<script setup lang="ts">
// Nuxt 錯誤頁。原本沒有這支，`/agents/[id]` 對不存在的探員丟出的 404 會落到 Nuxt
// 預設錯誤頁 —— 白底、無襯線、英文堆疊，與站上其餘畫面完全斷開。
//
// 刻意**不**包 `<NuxtLayout>`：default layout 的 AppFooter 會 `await useSchedules()`，
// 而這頁最常出現的時機之一正是班表 API 掛掉。錯誤頁再打一次同一支 API，除了讓錯誤
// 畫面多等一個 round-trip 之外沒有任何補償。改為直接掛 AppHeader（純靜態、無資料
// 相依），導覽與品牌感都保留，footer 則捨棄。
import type { NuxtError } from '#app';

const { error } = defineProps<{ error: NuxtError }>();

const isNotFound = computed(() => error.statusCode === 404);

// 404 用「迷」（迷路）、其餘用「障」（故障），與全站空狀態的單漢字圖章一致
const kanji = computed(() => (isNotFound.value ? '迷' : '障'));

const title = computed(() => (isNotFound.value ? '找不到這一頁' : '系統暫時無法回應'));

/**
 * 呼叫端明確指定要給使用者看的文案。
 *
 * 刻意不採用 `statusMessage`：那個欄位混了三種來源 —— 我們自己寫的中文（探員頁的
 * 「找不到該探員」）、Nuxt router 的 `Page not found: /no-such-page`，以及
 * `/api/sheet` 把上游錯誤原文轉出來的字串（見該檔的 catch）。後兩者不該出現在
 * 使用者眼前，而三者在型別上完全一樣，分不開。改成 opt-in：只有在 `createError`
 * 明確帶上 `data.userMessage` 的才會呈現。
 */
const userMessage = computed(() => {
  const { data } = error;
  if (data && typeof data === 'object' && 'userMessage' in data) {
    const message = (data as Partial<UserFacingErrorData>).userMessage;
    if (typeof message === 'string' && message) return message;
  }
  return '';
});

const subtitle = computed(() => {
  if (userMessage.value) return userMessage.value;
  if (isNotFound.value) return '這個網址可能已經失效，或是探員代號打錯了。';
  return '請稍後再重新整理；若持續發生，可能是班表資料來源暫時中斷。';
});

const stamp = computed(() => `ERROR · ${error.statusCode ?? 500}`);

// 用 clearError 而非 <NuxtLink>：單純換路由不會清掉錯誤狀態，畫面會卡在錯誤頁。
function backToHome() {
  clearError({ redirect: '/' });
}

useHead({
  // getter 而非字串:`error` 是 prop,同一個實例被換上另一個 error 時 title 才跟著走
  title: () => `${title.value} · 朱雫查班工具`,
  // 錯誤頁不該被索引，否則搜尋結果會長出指向 404 的條目
  meta: [{ name: 'robots', content: 'noindex' }],
});
</script>

<template>
  <div class="min-h-screen flex flex-col paper-grain">
    <AppHeader />

    <main class="flex-1 relative z-10">
      <UContainer class="py-16 md:py-24">
        <div class="mb-6 flex justify-end">
          <span class="stamp-label" data-testid="error-stamp">{{ stamp }}</span>
        </div>

        <!-- heading-level 1:本頁不包 layout、也沒有 PageHeader,這個標題就是頁面主標 -->
        <EmptyState :kanji="kanji" :title="title" :subtitle="subtitle" :heading-level="1">
          <template #action>
            <div class="flex flex-wrap items-center justify-center gap-3">
              <button type="button" class="btn shu" @click="backToHome">回今日班表</button>
              <NuxtLink to="/agents" class="btn ghost">探員圖鑑 →</NuxtLink>
            </div>
          </template>
        </EmptyState>
      </UContainer>
    </main>
  </div>
</template>
