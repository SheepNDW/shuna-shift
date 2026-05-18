// ============================================================
// Shuna redesign — shared components
// All written with the kissaten / paper-tone design system.
// ============================================================
const { useState, useEffect, useMemo, useRef } = React;

// ---------- Brand mark ----------
function BrandMark({ size = 44 }) {
  return (
    <span
      className="shu-stamp"
      style={{ width: size, height: size, fontSize: size * 0.5 }}
      aria-label="朱雫"
    >朱</span>
  );
}

// ---------- Page header ----------
// One reusable header for every page.
// kanji = 2-char stamp label, label = romaji caption, title = display title
function PageHeader({ kanji, label, title, subtitle, meta }) {
  return (
    <header className="page-header">
      <div className="page-header__line">
        <span className="kanji-mark serif">{kanji}</span>
        <span className="stamp-label">{label}</span>
        <span className="page-header__rule" />
        {meta && <span className="stamp-label page-header__meta">{meta}</span>}
      </div>
      <h1 className="page-header__title serif">{title}</h1>
      {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
    </header>
  );
}

// ---------- Section divider (with optional ornament) ----------
function SectionRule({ label, kanji }) {
  return (
    <div className="section-rule">
      <span className="section-rule__line" />
      {(kanji || label) && (
        <span className="section-rule__center">
          {kanji && <span className="serif section-rule__kanji">{kanji}</span>}
          {label && <span className="stamp-label">{label}</span>}
        </span>
      )}
      <span className="section-rule__line" />
    </div>
  );
}

// ---------- Shift label (sun/moon) ----------
function ShiftMark({ type, count }) {
  const isDay = type === "day";
  return (
    <div className={`shift-mark shift-mark--${type}`}>
      <span className="shift-mark__icon" aria-hidden>
        {isDay
          ? <SunGlyph />
          : <MoonGlyph />}
      </span>
      <span className="serif shift-mark__name">{isDay ? "早班" : "晚班"}</span>
      <span className="mono tnum shift-mark__count">{String(count ?? 0).padStart(2, "0")}</span>
      <span className="shift-mark__sub stamp-label">{isDay ? "DAY · 11–18" : "NIGHT · 18–24"}</span>
    </div>
  );
}

function SunGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.5 4.5l2.1 2.1M17.4 17.4l2.1 2.1M19.5 4.5l-2.1 2.1M6.6 17.4l-2.1 2.1" />
    </svg>
  );
}
function MoonGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.5 14.5A8.5 8.5 0 1 1 9.5 3.5a7 7 0 0 0 11 11Z" />
    </svg>
  );
}

// ---------- Agent chip (compact name + dot) ----------
function AgentChip({ agent, highlighted, onClick }) {
  const data = window.SHUNA_DATA.AGENT_MAP.get(agent.name);
  const id = data?.id;
  const handleClick = onClick || (id ? () => (window.location.hash = `#/agents/${id}`) : undefined);
  return (
    <button
      type="button"
      className={`agent-chip${highlighted ? " is-highlighted" : ""}`}
      onClick={handleClick}
      style={{ "--agent-color": agent.textColor || data?.color || "var(--color-ink)" }}
    >
      <span className="agent-chip__dot" />
      <span className="agent-chip__name">{agent.name}</span>
      {data?.emoji && <span className="agent-chip__emoji" aria-hidden>{data.emoji}</span>}
    </button>
  );
}

// ---------- Agent portrait card (larger, on home and lists) ----------
function AgentPortrait({ agent, size = 96, showName = true, showIG = false, badge }) {
  const data = window.SHUNA_DATA.AGENT_MAP.get(agent.name) || agent;
  const id = data.id;
  return (
    <a
      className="agent-portrait"
      href={id ? `#/agents/${id}` : undefined}
      style={{ "--agent-color": agent.textColor || data.color || "var(--color-ink)" }}
    >
      <div className="agent-portrait__photo" style={{ width: size, height: size }}>
        {data.picture
          ? <img src={data.picture} alt={data.name} loading="lazy" />
          : <span className="agent-portrait__placeholder serif">{data.name?.[0]}</span>}
        {badge && <span className="agent-portrait__badge">{badge}</span>}
        {data.emoji && <span className="agent-portrait__emoji" aria-hidden>{data.emoji}</span>}
      </div>
      {showName && (
        <div className="agent-portrait__meta">
          <span className="agent-portrait__name serif">{data.name}</span>
          {showIG && data.instagram && <span className="agent-portrait__ig stamp-label">@{data.instagram.split("/").filter(Boolean).pop()}</span>}
        </div>
      )}
    </a>
  );
}

// ---------- Date tag (used on daily cards + timeline) ----------
function DateTag({ schedule, large = false }) {
  const { date, isToday } = schedule;
  const [m, d] = date.datetime.split("/");
  return (
    <div className={`date-tag${large ? " date-tag--lg" : ""}${isToday ? " is-today" : ""}`}>
      <div className="date-tag__mono">
        <span className="date-tag__month mono tnum">{m}</span>
        <span className="date-tag__slash">／</span>
        <span className="date-tag__day mono tnum">{d}</span>
      </div>
      <div className="date-tag__dow serif">星期{date.dow}</div>
      {isToday && <span className="date-tag__today stamp-label">今日 · TODAY</span>}
      {date.description && !isToday && (
        <span className="date-tag__desc">{date.description}</span>
      )}
    </div>
  );
}

// ---------- Daily schedule card ----------
function DailyCard({ schedule, highlightedNames, dense = false }) {
  const { date, day, night, isToday, isClosed } = schedule;
  const isHighlighted = (name) => highlightedNames && highlightedNames.has(name);

  return (
    <article className={`daily-card${isToday ? " is-today" : ""}${dense ? " is-dense" : ""}`}>
      <div className="daily-card__head">
        <DateTag schedule={schedule} />
        {date.description && (
          <span className="daily-card__note stamp-label">※ {date.description}</span>
        )}
      </div>
      <div className="daily-card__body">
        {isClosed ? (
          <div className="daily-card__closed">
            <span className="serif daily-card__closed-kanji">休</span>
            <span className="stamp-label">CLOSED · 店休日</span>
          </div>
        ) : (
          <>
            <ShiftRow type="day" agents={day} isHighlighted={isHighlighted} />
            <div className="daily-card__divider" />
            <ShiftRow type="night" agents={night} isHighlighted={isHighlighted} />
          </>
        )}
      </div>
    </article>
  );
}

function ShiftRow({ type, agents, isHighlighted }) {
  return (
    <div className={`shift-row shift-row--${type}`}>
      <div className="shift-row__label">
        <span className={`shift-row__icon shift-row__icon--${type}`}>
          {type === "day" ? <SunGlyph /> : <MoonGlyph />}
        </span>
        <span className="serif shift-row__name">{type === "day" ? "早班" : "晚班"}</span>
        <span className="mono tnum shift-row__count">{String(agents.length).padStart(2, "0")}</span>
      </div>
      <div className="shift-row__agents">
        {agents.length === 0 ? (
          <span className="shift-row__empty stamp-label">無排班</span>
        ) : (
          agents.map((a) => (
            <AgentChip key={a.name} agent={a} highlighted={isHighlighted ? isHighlighted(a.name) : false} />
          ))
        )}
      </div>
    </div>
  );
}

// ---------- Color legend ----------
function ColorLegend() {
  const agents = window.SHUNA_DATA.AGENTS;
  return (
    <section className="legend">
      <div className="legend__head">
        <span className="serif legend__kanji">色</span>
        <div>
          <div className="stamp-label">COLOR LEGEND</div>
          <div className="legend__title serif">每位探員的代表色</div>
        </div>
      </div>
      <div className="legend__grid">
        {agents.map((a) => (
          <div key={a.id} className="legend__item">
            <span className="legend__swatch" style={{ background: a.color }} />
            <span className="legend__name">{a.name}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

// ---------- Footer + Header ----------
function AppHeader({ route }) {
  const items = [
    { href: "#/", label: "今日", kanji: "今" },
    { href: "#/shifts", label: "班表", kanji: "表" },
    { href: "#/agents", label: "探員", kanji: "員" },
    { href: "#/statistics", label: "統計", kanji: "計" },
  ];
  return (
    <header className="app-header">
      <a className="app-header__brand" href="#/">
        <BrandMark size={36} />
        <div className="app-header__brand-text">
          <span className="serif app-header__name">朱雫</span>
          <span className="stamp-label">SHUNA · MAID CAFÉ</span>
        </div>
      </a>
      <nav className="app-header__nav">
        {items.map((it) => {
          const active = route.path === it.href.slice(1) || (it.href === "#/" && route.path === "/");
          return (
            <a key={it.href} href={it.href} className={`nav-link${active ? " is-active" : ""}`}>
              <span className="nav-link__kanji serif">{it.kanji}</span>
              <span className="nav-link__label">{it.label}</span>
            </a>
          );
        })}
      </nav>
      <a className="app-header__cta" href="https://inline.app/booking/-NdeCHclNdQ-Yuxen_np:inline-live-3/-NdeCHpH1ow_BuIvlFhM" target="_blank" rel="noreferrer">
        <span>預約</span>
        <span className="stamp-label">RESERVE</span>
      </a>
    </header>
  );
}

function AppFooter() {
  return (
    <footer className="app-footer">
      <div className="container app-footer__inner">
        <div className="app-footer__brand">
          <BrandMark size={32} />
          <div>
            <div className="serif app-footer__name">喫茶 朱雫</div>
            <div className="stamp-label">SINCE 2023 · TAIPEI</div>
          </div>
        </div>
        <div className="app-footer__cols">
          <div>
            <div className="stamp-label">頁面</div>
            <a href="#/">今日班表</a>
            <a href="#/shifts">完整班表</a>
            <a href="#/agents">探員圖鑑</a>
            <a href="#/statistics">出勤統計</a>
          </div>
          <div>
            <div className="stamp-label">營業</div>
            <p className="app-footer__hours">早班 11:00 – 18:00</p>
            <p className="app-footer__hours">晚班 18:00 – 24:00</p>
            <p className="app-footer__hours mono">店休 · 不定休</p>
          </div>
          <div>
            <div className="stamp-label">資料</div>
            <p className="app-footer__hours mono">UPDATED · 自動同步 Google Sheet</p>
            <p className="app-footer__hours">每 5 分鐘重新整理</p>
          </div>
        </div>
      </div>
      <div className="app-footer__base container">
        <span className="stamp-label">© 朱雫查班工具 · 非官方</span>
        <span className="stamp-label mono">v 2.0 — paper edition</span>
      </div>
    </footer>
  );
}

// ---------- Empty state ----------
function EmptyState({ kanji = "空", title, subtitle, action }) {
  return (
    <div className="empty">
      <div className="empty__kanji serif">{kanji}</div>
      <div className="empty__title serif">{title}</div>
      {subtitle && <div className="empty__subtitle">{subtitle}</div>}
      {action && <div className="empty__action">{action}</div>}
    </div>
  );
}

// Export to global scope so other babel-transformed files can use them
Object.assign(window, {
  BrandMark, PageHeader, SectionRule, ShiftMark,
  AgentChip, AgentPortrait, DateTag, DailyCard, ShiftRow,
  ColorLegend, AppHeader, AppFooter, EmptyState,
  SunGlyph, MoonGlyph,
});
