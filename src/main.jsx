import React, { lazy, Suspense, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowUpRight,
  ArrowRight,
  AudioLines,
  Blocks,
  Check,
  CheckCheck,
  CircleDashed,
  Code2,
  Github,
  LayoutDashboard,
  Lightbulb,
  Pause,
  Play,
  Search,
  Sparkles,
  X,
  ShieldCheck,
  ChartNoAxesCombined,
  Palette,
  FolderKanban,
  Sun,
  Moon,
} from "lucide-react";
import "@fontsource/manrope/400.css";
import "@fontsource/manrope/500.css";
import "@fontsource/manrope/600.css";
import "@fontsource/manrope/700.css";
import "@fontsource/manrope/800.css";
import projects from "./projects.json";
import "./style.css";
const Orbit = lazy(() => import("./Orbit.jsx"));
const labels = {
  all: "Все проекты",
  active: "В работе",
  released: "Опубликованы",
  planned: "В планах",
};
const icons = {
  audio: AudioLines,
  finance: ChartNoAxesCombined,
  check: ShieldCheck,
  catalog: Blocks,
  brand: Palette,
};
const counts = Object.fromEntries(
  ["active", "released", "planned"].map((s) => [
    s,
    projects.filter((p) => p.status === s).length,
  ]),
);
function ProjectArt({ type }) {
  const Icon = icons[type];
  return (
    <div className={`project-art art-${type}`} aria-hidden="true">
      {type === "audio" ? (
        <>
          <div className="audio-badge">
            <AudioLines size={22} /> Plaud
          </div>
          <div className="wave">
            {Array.from({ length: 35 }, (_, i) => (
              <span
                key={i}
                style={{
                  height: `${18 + Math.abs(Math.sin(i * 1.73)) * 65}%`,
                  "--i": i,
                }}
              />
            ))}
          </div>
          <span className="art-caption">Разговор. Смысл. Действие.</span>
        </>
      ) : type === "finance" ? (
        <>
          <div className="finance-title">
            P&L<span>От данных к решениям</span>
          </div>
          <div className="bars">
            {[35, 58, 46, 75, 65, 90, 100].map((h, i) => (
              <span key={i} style={{ height: `${h}%` }} />
            ))}
          </div>
        </>
      ) : type === "check" ? (
        <>
          <ShieldCheck className="shield" strokeWidth={1} />
          <div className="verified">
            <CheckCheck size={17} /> Проверено по источникам
          </div>
        </>
      ) : type === "catalog" ? (
        <>
          <div className="mini-grid">
            {[1, 2, 3, 4].map((i) => (
              <span key={i}>
                <Blocks size={25} />
              </span>
            ))}
          </div>
          <span className="art-caption">Идеи обретают форму</span>
        </>
      ) : (
        <>
          <span className="brand-letter">Э</span>
          <div className="swatches">
            <i />
            <i />
            <i />
          </div>
          <span className="art-caption">Новая визуальная глава</span>
        </>
      )}
      <Icon className="art-corner" size={18} />
    </div>
  );
}
function Details({ project, close }) {
  const ref = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    ref.current.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      onCancel={close}
      onClick={(e) => {
        if (e.target === ref.current) close();
      }}
      aria-labelledby="detail-title"
    >
      <button className="close" aria-label="Закрыть карточку" onClick={close}>
        <X />
      </button>
      <ProjectArt type={project.visual} />
      <div className="detail-body">
        <span className={`status ${project.status}`}>
          {labels[project.status]}
        </span>
        <h2 id="detail-title">{project.title}</h2>
        <p>{project.details}</p>
        <h3>Следующий шаг</h3>
        <p>{project.next}</p>
        <div className="tags">
          {project.tags.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
        {project.url ? (
          <a
            className="primary-button"
            href={project.url}
            target="_blank"
            rel="noreferrer"
          >
            Открыть на GitHub <ArrowUpRight size={18} />
          </a>
        ) : (
          <p className="private-note">
            {project.status === "planned"
              ? "Публичная ссылка появится после запуска."
              : "Материалы проекта остаются закрытыми."}
          </p>
        )}
      </div>
    </dialog>
  );
}
function App() {
  const [theme, setTheme] = useState(
    () => document.documentElement.dataset.theme || "light",
  );
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]').content =
      theme === "dark" ? "#121b30" : "#2855ec";
    try {
      localStorage.setItem("ilya-theme", theme);
    } catch {}
  }, [theme]);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [motion, setMotion] = useState(
    () => !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [view, setView] = useState("dashboard");
  const filtered = projects.filter(
    (p) =>
      (filter === "all" || p.status === filter) &&
      `${p.title} ${p.description} ${p.tags.join(" ")}`
        .toLocaleLowerCase("ru")
        .includes(query.toLocaleLowerCase("ru")),
  );
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setMotion(!media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  const navigate = (next) => {
    setView(next);
    setQuery("");
    setFilter(next === "plans" ? "planned" : "all");
    document
      .getElementById(next === "dashboard" ? "top" : "catalog")
      ?.scrollIntoView({ behavior: motion ? "smooth" : "instant" });
  };
  return (
    <div className={`app ${motion ? "" : "motion-off"}`} id="top">
      <a className="skip-link" href="#catalog">
        Перейти к проектам
      </a>
      <aside className="sidebar">
        <a className="logo" href="#top" aria-label="Илья — главная">
          <span className="logo-mark">
            <Blocks size={25} />
          </span>
          <span>
            илья<span className="logo-dot">.</span>
          </span>
        </a>
        <div className="workspace-label">Личное пространство</div>
        <nav aria-label="Навигация">
          <button
            className={view === "dashboard" ? "nav-active" : ""}
            onClick={() => navigate("dashboard")}
          >
            <LayoutDashboard />
            Обзор<small>⌘</small>
          </button>
          <button
            className={view === "projects" ? "nav-active" : ""}
            onClick={() => navigate("projects")}
          >
            <FolderKanban />
            Проекты<span>{projects.length}</span>
          </button>
          <button
            className={view === "plans" ? "nav-active" : ""}
            onClick={() => navigate("plans")}
          >
            <Lightbulb />
            Планы<span>{counts.planned}</span>
          </button>
        </nav>
        <div className="sidebar-bottom">
          <div className="side-note">
            <Sparkles size={23} />
            <p>
              От идеи
              <br />к работающему
              <br />
              <strong>проекту.</strong>
            </p>
          </div>
          <a
            href="https://github.com/barsuk-box"
            target="_blank"
            rel="noreferrer"
          >
            <Github size={19} />
            Мой GitHub
            <ArrowUpRight size={16} />
          </a>
          <div className="mini-profile">
            <img src={`${import.meta.env.BASE_URL}avatar.jpg`} alt="" />
            <div>
              <strong>Илья</strong>
              <span>Автор проектов</span>
            </div>
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header>
          <div className="breadcrumb">
            Моё пространство <span>/</span> <strong>Обзор проектов</strong>
          </div>
          <button
            className="theme-toggle"
            onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
            aria-label={
              theme === "light"
                ? "Включить тёмную тему"
                : "Включить светлую тему"
            }
            aria-pressed={theme === "dark"}
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <a
            className="header-github"
            href="https://github.com/barsuk-box/projects"
            target="_blank"
            rel="noreferrer"
          >
            <Github size={18} />
            Исходный код
            <ArrowUpRight size={15} />
          </a>
          <img
            className="header-avatar"
            src={`${import.meta.env.BASE_URL}avatar.jpg`}
            alt="Фото Ильи"
          />
        </header>
        <main>
          <div className="page-heading">
            <div>
              <p className="hello">
                Привет, я Илья <span aria-hidden="true">✳</span>
              </p>
              <h1>Мои проекты</h1>
            </div>
            <span className="edition">
              Личная коллекция <span>2026</span>
            </span>
          </div>
          <section className="dashboard" aria-label="Обзор каталога">
            <div className="hero-panel">
              <div className="hero-copy">
                <span className="hero-label">
                  <span />
                  Создаю. Пробую. Развиваю.
                </span>
                <h2>
                  Идеи, которые
                  <br />
                  становятся
                  <br />
                  реальностью.
                </h2>
                <p>
                  Цифровые инструменты, эксперименты
                  <br className="desktop-break" /> с ИИ и решения для бизнеса.
                </p>
                <button
                  className="primary-button"
                  onClick={() => navigate("projects")}
                >
                  Смотреть проекты
                  <ArrowRight size={18} />
                </button>
              </div>
              <div className="scene-wrap">
                <Suspense
                  fallback={
                    <div className="scene-loading">Собираем орбиту идей…</div>
                  }
                >
                  <Orbit motion={motion} />
                </Suspense>
                <span className="scene-tag tag-one">
                  <Code2 size={16} />
                  Разработка
                </span>
                <span className="scene-tag tag-two">
                  <Sparkles size={16} />
                  Искусственный интеллект
                </span>
                <button
                  className="motion-toggle"
                  onClick={() => setMotion((v) => !v)}
                  aria-label={
                    motion ? "Приостановить анимацию" : "Включить анимацию"
                  }
                >
                  {motion ? <Pause size={15} /> : <Play size={15} />}
                </button>
              </div>
            </div>
            <div className="overview-panel">
              <div className="overview-top">
                <span>В моём пространстве</span>
                <Blocks size={20} />
              </div>
              <div className="total">
                <strong>{String(projects.length).padStart(2, "0")}</strong>
                <span>
                  проектов
                  <br />и новых идей
                </span>
              </div>
              <div className="status-track" aria-hidden="true">
                {["active", "released", "planned"].map((s) => (
                  <span key={s} className={s} style={{ flex: counts[s] }} />
                ))}
              </div>
              <div className="stat-list">
                {[
                  ["active", CircleDashed],
                  ["released", Check],
                  ["planned", Lightbulb],
                ].map(([s, Icon]) => (
                  <button
                    key={s}
                    onClick={() => {
                      setFilter(s);
                      setView(s === "planned" ? "plans" : "projects");
                      document
                        .getElementById("catalog")
                        .scrollIntoView({
                          behavior: motion ? "smooth" : "instant",
                        });
                    }}
                  >
                    <span className={`stat-icon ${s}`}>
                      <Icon size={16} />
                    </span>
                    <span>{labels[s]}</span>
                    <strong>{String(counts[s]).padStart(2, "0")}</strong>
                  </button>
                ))}
              </div>
              <div className="overview-foot">
                Каждый проект — следующий шаг.
              </div>
            </div>
          </section>
          <section id="catalog" className="catalog">
            <div className="section-heading">
              <h2>
                Коллекция проектов <span>{projects.length}</span>
              </h2>
              <span className="section-note">Всё, над чем я работаю</span>
            </div>
            <div className="catalog-toolbar">
              <div className="filters" aria-label="Статус проекта">
                {Object.entries(labels).map(([key, label]) => (
                  <button
                    key={key}
                    aria-pressed={filter === key}
                    className={filter === key ? "selected" : ""}
                    onClick={() => {
                      setFilter(key);
                      setView(key === "planned" ? "plans" : "projects");
                    }}
                  >
                    {label}
                    <span>{key === "all" ? projects.length : counts[key]}</span>
                  </button>
                ))}
              </div>
              <label className="search">
                <Search size={18} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Найти проект"
                  aria-label="Найти проект"
                />
                {query && (
                  <button
                    aria-label="Очистить поиск"
                    onClick={() => setQuery("")}
                  >
                    <X size={16} />
                  </button>
                )}
              </label>
            </div>
            <div className="project-grid" aria-live="polite">
              {filtered.map((p) => (
                <article
                  key={p.id}
                  className={`project-card ${p.status === "planned" ? "planned-card" : ""}`}
                >
                  <button
                    className="art-button"
                    tabIndex={-1}
                    aria-hidden="true"
                    onClick={() => setSelected(p)}
                  >
                    <ProjectArt type={p.visual} />
                  </button>
                  <div className="card-body">
                    <div className="card-meta">
                      <span>{p.category}</span>
                      <span className={`status ${p.status}`}>
                        {labels[p.status]}
                      </span>
                    </div>
                    <h3>
                      <button onClick={() => setSelected(p)}>
                        {p.title}
                        <ArrowUpRight size={22} />
                      </button>
                    </h3>
                    <p>{p.description}</p>
                    <div className="tags">
                      {p.tags.map((t) => (
                        <span key={t}>{t}</span>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
            {!filtered.length && (
              <div className="empty">
                <Search size={30} />
                <h3>Проект не найден</h3>
                <p>Попробуйте другое название или статус.</p>
                <button
                  onClick={() => {
                    setQuery("");
                    setFilter("all");
                  }}
                >
                  Сбросить фильтры
                </button>
              </div>
            )}
          </section>
          <footer>
            <span>
              Илья<span className="logo-dot">.</span>{" "}
              <span className="footer-note">Идеи в движении.</span>
            </span>
            <a
              href="https://github.com/barsuk-box"
              target="_blank"
              rel="noreferrer"
            >
              Создаю с любопытством <ArrowUpRight size={15} />
            </a>
          </footer>
        </main>
      </div>
      {selected && (
        <Details project={selected} close={() => setSelected(null)} />
      )}
    </div>
  );
}
createRoot(document.getElementById("root")).render(<App />);
