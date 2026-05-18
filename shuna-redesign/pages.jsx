// ============================================================
// Shuna redesign — page components
// ============================================================

// ---------- /  Today ----------
function HomePage() {
  const { SCHEDULES, AGENTS } = window.SHUNA_DATA;
  const today = SCHEDULES.find((s) => s.isToday) || SCHEDULES[3];
  const upcoming = SCHEDULES.filter((s) => !s.isToday && new Date(s.date.iso) > new Date(today.date.iso)).slice(0, 4);

  const hour = new Date().getHours();
  const greet = hour < 11 ? "おはよう" : hour < 18 ? "こんにちは" : "こんばんは";
  const greetSub = hour < 11 ? "早安" : hour < 18 ? "午安" : "晚安";

  return (
    <main className="page-home">
      <div className="container">
        {/* Hero band — greeting + today snapshot */}
        <section className="home-hero">
          <div className="home-hero__greeting">
            <span className="stamp-label">{new Date().toLocaleDateString("zh-TW", { weekday: "long" })} · {today.date.datetime}</span>
            <h1 className="serif home-hero__hello">
              {greet}、
              <span className="home-hero__hello-shu">朱雫</span>
            </h1>
            <p className="home-hero__sub">{greetSub}，今日當班的探員如下。</p>
          </div>
          <div className="home-hero__date-card">
            <DateTag schedule={today} large />
          </div>
        </section>

        {/* Today shifts: two columns side-by-side above the fold */}
        <section className="home-today">
          <div className="home-today__line">
            <span className="kanji-mark serif">今</span>
            <span className="stamp-label">TODAY · 本日のシフト</span>
            <span className="home-today__rule" />
            <span className="stamp-label mono">EARLY {String(today.day.length).padStart(2,"0")} ／ LATE {String(today.night.length).padStart(2,"0")}</span>
          </div>

          {today.isClosed ? (
            <EmptyState
              kanji="休"
              title="本日店休"
              subtitle="今日沒有排班，明日再見。"
              action={<a className="btn ghost" href="#/shifts">查看完整班表 →</a>}
            />
          ) : (
            <div className="home-today__grid">
              <ShiftColumn type="day" agents={today.day} />
              <ShiftColumn type="night" agents={today.night} />
            </div>
          )}
        </section>

        {/* Upcoming preview */}
        <section className="home-upcoming">
          <div className="rule-with-ornament">
            <span className="serif" style={{ fontSize: 18 }}>近日</span>
            <span className="stamp-label">UPCOMING · 近日のシフト</span>
          </div>
          <div className="home-upcoming__grid">
            {upcoming.map((s) => (
              <a key={s.date.iso} className="upcoming-card" href={`#/shifts?date=${s.date.iso}`}>
                <div className="upcoming-card__date">
                  <span className="mono tnum upcoming-card__md">{s.date.datetime}</span>
                  <span className="serif upcoming-card__dow">星期{s.date.dow}</span>
                </div>
                {s.isClosed ? (
                  <div className="upcoming-card__closed serif">休</div>
                ) : (
                  <div className="upcoming-card__shifts">
                    <div className="upcoming-card__row">
                      <span className="upcoming-card__pill upcoming-card__pill--day"><SunGlyph /></span>
                      <span className="mono tnum upcoming-card__num">{String(s.day.length).padStart(2,"0")}</span>
                      <span className="upcoming-card__names">{s.day.slice(0, 2).map(a => a.name).join("、")}{s.day.length > 2 ? "…" : ""}</span>
                    </div>
                    <div className="upcoming-card__row">
                      <span className="upcoming-card__pill upcoming-card__pill--night"><MoonGlyph /></span>
                      <span className="mono tnum upcoming-card__num">{String(s.night.length).padStart(2,"0")}</span>
                      <span className="upcoming-card__names">{s.night.slice(0, 2).map(a => a.name).join("、")}{s.night.length > 2 ? "…" : ""}</span>
                    </div>
                  </div>
                )}
                {s.date.description && (
                  <span className="upcoming-card__note stamp-label">※ {s.date.description}</span>
                )}
              </a>
            ))}
          </div>
          <div className="home-upcoming__cta">
            <a className="btn ghost" href="#/shifts">查看未來 10 天班表 →</a>
            <a className="btn shu" href="https://inline.app/booking/-NdeCHclNdQ-Yuxen_np:inline-live-3/-NdeCHpH1ow_BuIvlFhM" target="_blank" rel="noreferrer">預約座位 →</a>
          </div>
        </section>
      </div>
    </main>
  );
}

function ShiftColumn({ type, agents }) {
  const empty = agents.length === 0;
  return (
    <div className={`shift-col shift-col--${type}`}>
      <header className="shift-col__head">
        <ShiftMark type={type} count={agents.length} />
      </header>
      {empty ? (
        <div className="shift-col__empty">
          <span className="serif">休</span>
          <span className="stamp-label">無排班</span>
        </div>
      ) : (
        <div className="shift-col__grid">
          {agents.map((a) => (
            <AgentPortrait key={a.name} agent={a} size={88} showIG={false} />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- /shifts ----------
function ShiftsPage() {
  const { SCHEDULES, AGENTS } = window.SHUNA_DATA;
  const [filter, setFilter] = useState(new Set()); // Set of agent names

  const futureSchedules = SCHEDULES; // for preview, show all

  const visibleSchedules = useMemo(() => {
    if (filter.size === 0) return futureSchedules;
    return futureSchedules.filter((s) =>
      s.day.some((a) => filter.has(a.name)) || s.night.some((a) => filter.has(a.name))
    );
  }, [filter, futureSchedules]);

  function toggle(name) {
    setFilter((f) => {
      const next = new Set(f);
      if (next.has(name)) next.delete(name); else next.add(name);
      return next;
    });
  }
  function clear() { setFilter(new Set()); }

  function scrollTo(iso) {
    const el = document.getElementById(`day-${iso}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <main className="page-shifts">
      <div className="container">
        <PageHeader
          kanji="表"
          label="SHIFT TIMETABLE · 班表"
          title="完整班表"
          subtitle={`${SCHEDULES.length} 日 · ${SCHEDULES[0].date.datetime} – ${SCHEDULES[SCHEDULES.length - 1].date.datetime}`}
          meta={`${visibleSchedules.length} / ${SCHEDULES.length} 日`}
        />

        {/* Filter bar */}
        <section className="filter-bar">
          <div className="filter-bar__head">
            <span className="stamp-label">FILTER · 篩選探員</span>
            {filter.size > 0 && (
              <button className="filter-bar__clear stamp-label" onClick={clear}>
                清除 ({filter.size}) ✕
              </button>
            )}
          </div>
          <div className="filter-bar__chips">
            {AGENTS.map((a) => {
              const active = filter.has(a.name);
              return (
                <button
                  key={a.id}
                  className={`filter-chip${active ? " is-active" : ""}`}
                  onClick={() => toggle(a.name)}
                  style={{ "--agent-color": a.color }}
                >
                  <span className="filter-chip__dot" />
                  <span>{a.name}</span>
                </button>
              );
            })}
          </div>
          <div className="filter-bar__jump">
            <span className="stamp-label">JUMP TO · 跳轉</span>
            <div className="filter-bar__jump-list">
              {visibleSchedules.map((s) => (
                <button
                  key={s.date.iso}
                  className={`jump-pill${s.isToday ? " is-today" : ""}`}
                  onClick={() => scrollTo(s.date.iso)}
                >
                  <span className="mono tnum">{s.date.datetime}</span>
                  <span className="jump-pill__dow">{s.date.dow}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="timeline">
          {visibleSchedules.length === 0 ? (
            <EmptyState
              kanji="無"
              title="找不到班表"
              subtitle={`已選的探員在這段期間沒有排班。`}
              action={<button className="btn ghost" onClick={clear}>清除篩選 →</button>}
            />
          ) : (
            visibleSchedules.map((s) => (
              <div key={s.date.iso} id={`day-${s.date.iso}`}>
                <DailyCard schedule={s} highlightedNames={filter.size > 0 ? filter : undefined} />
              </div>
            ))
          )}
        </section>
      </div>
    </main>
  );
}

// ---------- /agents ----------
function AgentsPage() {
  const { AGENTS } = window.SHUNA_DATA;
  const fullTime = AGENTS.filter((a) => a.fullTime);
  const partTime = AGENTS.filter((a) => !a.fullTime);

  return (
    <main className="page-agents">
      <div className="container">
        <PageHeader
          kanji="員"
          label="AGENTS · 探員圖鑑"
          title="探員圖鑑"
          subtitle="認識朱雫每一位探員，點擊查看排班、IG 與相簿。"
          meta={`正職 ${fullTime.length} · 現役 ${partTime.length}`}
        />

        <AgentSection
          kanji="正"
          label="FULL-TIME · 正職探員"
          desc="店內招牌．長期駐店"
          agents={fullTime}
        />
        <AgentSection
          kanji="現"
          label="ACTIVE · 現役探員"
          desc="輪班駐店探員"
          agents={partTime}
        />
      </div>
    </main>
  );
}

function AgentSection({ kanji, label, desc, agents }) {
  return (
    <section className="agents-section">
      <header className="agents-section__head">
        <span className="kanji-mark serif">{kanji}</span>
        <div>
          <div className="stamp-label">{label}</div>
          <div className="serif agents-section__title">{desc}</div>
        </div>
        <span className="agents-section__rule" />
        <span className="mono tnum agents-section__count">{String(agents.length).padStart(2, "0")}</span>
      </header>
      <div className="agents-grid">
        {agents.map((a) => (
          <a key={a.id} href={`#/agents/${a.id}`} className="agent-card" style={{ "--agent-color": a.color }}>
            <div className="agent-card__photo">
              <img src={a.picture} alt={a.name} loading="lazy" />
              {a.emoji && <span className="agent-card__emoji">{a.emoji}</span>}
            </div>
            <div className="agent-card__body">
              <div className="agent-card__name-row">
                <span className="serif agent-card__name">{a.name}</span>
                {a.fullTime && <span className="agent-card__fulltime stamp-label">FULL</span>}
              </div>
              <div className="agent-card__color">
                <span className="agent-card__swatch" />
                <span className="mono agent-card__hex">{a.color.toUpperCase()}</span>
              </div>
              {a.bio && <p className="agent-card__bio">{a.bio}</p>}
              <div className="agent-card__foot">
                {a.instagram && (
                  <span className="stamp-label">@{a.instagram.split("/").filter(Boolean).pop()}</span>
                )}
                <span className="agent-card__arrow">→</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

// ---------- /agents/[id] ----------
function AgentDetailPage({ id }) {
  const { AGENTS, SCHEDULES, STATISTICS } = window.SHUNA_DATA;
  const agent = AGENTS.find((a) => a.id === id);
  if (!agent) {
    return (
      <main className="page-agent-detail">
        <div className="container">
          <EmptyState kanji="無" title="找不到這位探員" subtitle={`id: ${id}`} action={<a className="btn ghost" href="#/agents">回探員圖鑑 →</a>} />
        </div>
      </main>
    );
  }

  const upcoming = SCHEDULES.filter((s) => {
    if (s.isClosed) return false;
    return s.day.some((a) => a.name === agent.name) || s.night.some((a) => a.name === agent.name);
  });
  const stat = STATISTICS.find((s) => s.agentId === id) || { dayCount: 0, nightCount: 0, total: 0 };

  return (
    <main className="page-agent-detail">
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <a href="#/agents">← 探員圖鑑</a>
          <span className="stamp-label">{agent.fullTime ? "FULL-TIME 正職" : "ACTIVE 現役"}</span>
        </div>

        {/* Profile band */}
        <section className="profile" style={{ "--agent-color": agent.color }}>
          <div className="profile__photo">
            <img src={agent.picture} alt={agent.name} />
          </div>
          <div className="profile__meta">
            <div className="stamp-label">AGENT FILE · No. {String(AGENTS.indexOf(agent) + 1).padStart(3, "0")}</div>
            <h1 className="serif profile__name">
              {agent.name}
              {agent.emoji && <span className="profile__emoji" aria-hidden> {agent.emoji}</span>}
            </h1>
            {agent.bio && <p className="profile__bio">{agent.bio}</p>}
            <div className="profile__row">
              <div className="profile__chip">
                <span className="profile__swatch" />
                <span className="mono">{agent.color.toUpperCase()}</span>
                <span className="stamp-label">代表色</span>
              </div>
              {agent.instagram && (
                <a className="profile__chip" href={agent.instagram} target="_blank" rel="noreferrer">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none"/></svg>
                  <span>Instagram</span>
                  <span className="stamp-label">@{agent.instagram.split("/").filter(Boolean).pop()}</span>
                </a>
              )}
            </div>
            <div className="profile__stats">
              <div className="stat">
                <span className="stamp-label">近 3 個月 · 早班</span>
                <span className="mono tnum stat__num">{String(stat.dayCount).padStart(2, "0")}</span>
              </div>
              <div className="stat">
                <span className="stamp-label">近 3 個月 · 晚班</span>
                <span className="mono tnum stat__num">{String(stat.nightCount).padStart(2, "0")}</span>
              </div>
              <div className="stat">
                <span className="stamp-label">總計</span>
                <span className="mono tnum stat__num">{String(stat.total).padStart(2, "0")}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Schedule */}
        <section className="agent-schedule">
          <header className="rule-with-ornament">
            <span className="serif" style={{ fontSize: 18 }}>近期排班</span>
            <span className="stamp-label">UPCOMING · {agent.name}</span>
          </header>
          {upcoming.length === 0 ? (
            <EmptyState kanji="空" title="近期無排班" subtitle="這段期間沒有安排到班次。" />
          ) : (
            <ul className="schedule-list">
              {upcoming.map((s) => {
                const inDay = s.day.some((a) => a.name === agent.name);
                const inNight = s.night.some((a) => a.name === agent.name);
                return (
                  <li key={s.date.iso} className={`schedule-row${s.isToday ? " is-today" : ""}`}>
                    <div className="schedule-row__date">
                      <span className="mono tnum">{s.date.datetime}</span>
                      <span className="serif">星期{s.date.dow}</span>
                      {s.isToday && <span className="stamp-label">TODAY</span>}
                    </div>
                    <div className="schedule-row__shifts">
                      {inDay && <span className="schedule-row__badge schedule-row__badge--day"><SunGlyph /> 早班</span>}
                      {inNight && <span className="schedule-row__badge schedule-row__badge--night"><MoonGlyph /> 晚班</span>}
                    </div>
                    <a className="schedule-row__link" href={`#/shifts?date=${s.date.iso}`}>當日全體 →</a>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

// ---------- /statistics ----------
function StatisticsPage() {
  const { STATISTICS } = window.SHUNA_DATA;
  const totalDay = STATISTICS.reduce((s, a) => s + a.dayCount, 0);
  const totalNight = STATISTICS.reduce((s, a) => s + a.nightCount, 0);
  const top = STATISTICS[0];
  const maxTotal = Math.max(...STATISTICS.map((s) => s.total));

  return (
    <main className="page-stats">
      <div className="container">
        <PageHeader
          kanji="計"
          label="STATISTICS · 出勤統計"
          title="出勤統計"
          subtitle="近三個月每位探員的日 / 夜班次數。"
          meta="2026/02 – 2026/05"
        />

        {/* Summary tiles */}
        <section className="summary-tiles">
          <SummaryTile kanji="日" label="DAY SHIFTS" desc="早班總次數" value={totalDay} accent="day" />
          <SummaryTile kanji="夜" label="NIGHT SHIFTS" desc="晚班總次數" value={totalNight} accent="night" />
          <SummaryTile kanji="總" label="TOTAL" desc="班次總合" value={totalDay + totalNight} accent="shu" />
          <SummaryTile kanji="冠" label="MOST · MVP" desc={top.name} value={top.total} accent="ink" subValue={`${top.dayCount} 日 / ${top.nightCount} 夜`} />
        </section>

        {/* Bar chart table */}
        <section className="stat-table">
          <div className="stat-table__head">
            <div className="serif stat-table__title">探員出勤排行</div>
            <div className="stat-table__legend">
              <span className="stat-table__legend-item"><span className="stat-table__bar-dot stat-table__bar-dot--day" /> 早班</span>
              <span className="stat-table__legend-item"><span className="stat-table__bar-dot stat-table__bar-dot--night" /> 晚班</span>
            </div>
          </div>
          <table className="stat-table__table">
            <thead>
              <tr>
                <th className="stamp-label">#</th>
                <th className="stamp-label">探員</th>
                <th className="stamp-label">分佈 · DISTRIBUTION</th>
                <th className="stamp-label tnum mono">日</th>
                <th className="stamp-label tnum mono">夜</th>
                <th className="stamp-label tnum mono">總</th>
              </tr>
            </thead>
            <tbody>
              {STATISTICS.map((s, i) => (
                <tr key={s.agentId}>
                  <td className="mono tnum stat-table__rank">{String(i + 1).padStart(2, "0")}</td>
                  <td>
                    <a href={`#/agents/${s.agentId}`} className="stat-table__agent" style={{ "--agent-color": s.color }}>
                      <span className="stat-table__dot" />
                      <span className="serif">{s.name}</span>
                      {s.fullTime && <span className="stat-table__full stamp-label">FULL</span>}
                    </a>
                  </td>
                  <td>
                    <div className="stat-bar" style={{ "--ratio": (s.total / maxTotal) }}>
                      <span
                        className="stat-bar__day"
                        style={{ width: `${(s.dayCount / maxTotal) * 100}%` }}
                      />
                      <span
                        className="stat-bar__night"
                        style={{ width: `${(s.nightCount / maxTotal) * 100}%` }}
                      />
                    </div>
                  </td>
                  <td className="mono tnum stat-table__num">{String(s.dayCount).padStart(2, "0")}</td>
                  <td className="mono tnum stat-table__num">{String(s.nightCount).padStart(2, "0")}</td>
                  <td className="mono tnum stat-table__num stat-table__num--total">{String(s.total).padStart(2, "0")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
}

function SummaryTile({ kanji, label, desc, value, accent, subValue }) {
  return (
    <div className={`summary-tile summary-tile--${accent}`}>
      <span className="summary-tile__kanji serif">{kanji}</span>
      <div className="summary-tile__body">
        <div className="stamp-label">{label}</div>
        <div className="summary-tile__desc">{desc}</div>
        <div className="summary-tile__value mono tnum">{String(value).padStart(2, "0")}</div>
        {subValue && <div className="summary-tile__sub stamp-label mono">{subValue}</div>}
      </div>
    </div>
  );
}

// Export
Object.assign(window, {
  HomePage, ShiftsPage, AgentsPage, AgentDetailPage, StatisticsPage,
});
