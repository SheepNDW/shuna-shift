import { describe, expect, it } from 'vitest';
import { isNavLinkActive } from '../../nav';

describe('isNavLinkActive', () => {
  describe('首頁採精確比對', () => {
    it('目前在首頁時，首頁連結為 active', () => {
      expect(isNavLinkActive('/', '/')).toBe(true);
    });

    it('目前不在首頁時，首頁連結不為 active', () => {
      expect(isNavLinkActive('/shifts', '/')).toBe(false);
      expect(isNavLinkActive('/agents/rin', '/')).toBe(false);
    });
  });

  describe('其他頁面採前綴比對', () => {
    it('路徑完全相符時為 active', () => {
      expect(isNavLinkActive('/shifts', '/shifts')).toBe(true);
      expect(isNavLinkActive('/agents', '/agents')).toBe(true);
    });

    it('巢狀路由仍高亮上層導覽項', () => {
      expect(isNavLinkActive('/agents/rin', '/agents')).toBe(true);
      expect(isNavLinkActive('/agents/123', '/agents')).toBe(true);
    });

    it('不相符的路徑不為 active', () => {
      expect(isNavLinkActive('/statistics', '/shifts')).toBe(false);
      expect(isNavLinkActive('/', '/shifts')).toBe(false);
    });

    it('僅字串前綴相符但非路徑分段時不為 active', () => {
      expect(isNavLinkActive('/agentsfoo', '/agents')).toBe(false);
      expect(isNavLinkActive('/shifts-archive', '/shifts')).toBe(false);
    });
  });
});
