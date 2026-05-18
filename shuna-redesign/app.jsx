// ============================================================
// Shuna redesign — App shell + router + Tweaks
// ============================================================
const { useState: useStateApp, useEffect: useEffectApp } = React;

function useRoute() {
  const [hash, setHash] = useStateApp(window.location.hash || "#/");
  useEffectApp(() => {
    const onHash = () => setHash(window.location.hash || "#/");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  const path = hash.replace(/^#/, "").split("?")[0] || "/";
  const queryStr = (hash.split("?")[1] || "");
  const query = Object.fromEntries(new URLSearchParams(queryStr));
  return { path, query };
}

function renderRoute(route) {
  const { path } = route;
  if (path === "/" || path === "") return <HomePage />;
  if (path === "/shifts") return <ShiftsPage />;
  if (path === "/agents") return <AgentsPage />;
  if (path === "/statistics") return <StatisticsPage />;
  const agentMatch = path.match(/^\/agents\/(.+)$/);
  if (agentMatch) return <AgentDetailPage id={agentMatch[1]} />;
  return <HomePage />;
}

// ---------- Tweaks defaults ----------
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": "shu",
  "fontStyle": "default",
  "density": "default",
  "showLegend": true,
  "showFooter": true
}/*EDITMODE-END*/;

function App() {
  const route = useRoute();
  const [tweaks, setTweak] = window.useTweaks(TWEAK_DEFAULTS);

  // Scroll to top on route change
  useEffectApp(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, [route.path]);

  // Apply palette + density + font to root
  useEffectApp(() => {
    const root = document.documentElement;
    root.setAttribute("data-palette", tweaks.palette);
    root.setAttribute("data-density", tweaks.density);
    root.setAttribute("data-fontstyle", tweaks.fontStyle);
  }, [tweaks.palette, tweaks.density, tweaks.fontStyle]);

  return (
    <div className="app">
      <AppHeader route={route} />
      {renderRoute(route)}
      {tweaks.showFooter && <AppFooter />}

      <window.TweaksPanel title="設計 Tweaks">
        <window.TweakSection title="色彩系統">
          <window.TweakRadio
            label="主色"
            value={tweaks.palette}
            onChange={(v) => setTweak("palette", v)}
            options={[
              { label: "朱 SHU", value: "shu" },
              { label: "抹茶 MATCHA", value: "matcha" },
              { label: "墨 SUMI", value: "sumi" },
              { label: "柚 YUZU", value: "yuzu" },
            ]}
          />
        </window.TweakSection>
        <window.TweakSection title="字型">
          <window.TweakRadio
            label="風格"
            value={tweaks.fontStyle}
            onChange={(v) => setTweak("fontStyle", v)}
            options={[
              { label: "預設 Noto", value: "default" },
              { label: "現代 DM", value: "modern" },
              { label: "活潑 Fraunces", value: "playful" },
            ]}
          />
        </window.TweakSection>
        <window.TweakSection title="排版">
          <window.TweakRadio
            label="密度"
            value={tweaks.density}
            onChange={(v) => setTweak("density", v)}
            options={[
              { label: "舒適", value: "default" },
              { label: "緊湊", value: "compact" },
            ]}
          />
          <window.TweakToggle
            label="顯示頁尾"
            value={tweaks.showFooter}
            onChange={(v) => setTweak("showFooter", v)}
          />
        </window.TweakSection>
      </window.TweaksPanel>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("app"));
root.render(<App />);
