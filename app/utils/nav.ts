/**
 * 判斷導覽連結是否對應目前路徑。
 *
 * - 首頁（`'/'`）採精確比對，避免每一頁都把首頁連結點亮。
 * - 其餘採「完全相符或為路徑分段前綴」比對，使巢狀路由
 *   （如 `/agents/rin`）仍能高亮對應的上層導覽項；
 *   前綴後固定接 `/`，避免 `/agentsfoo` 誤判命中 `/agents`。
 */
export function isNavLinkActive(currentPath: string, to: string): boolean {
  if (to === '/') {
    return currentPath === '/';
  }

  return currentPath === to || currentPath.startsWith(`${to}/`);
}
