(function () {
  const dateFormatter = new Intl.DateTimeFormat("es-PY", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });

  const escapeHtml = (value) => String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  function formatDate(value) {
    if (!value) return "Fecha a confirmar";
    const date = new Date(`${value}T12:00:00`);
    if (Number.isNaN(date.getTime())) return value;
    return dateFormatter.format(date);
  }

  function linkOrSpan(url, label, className = "card-link") {
    if (!url) return "";
    return `<a class="${className}" href="${escapeHtml(url)}" target="_blank" rel="noreferrer">${escapeHtml(label)}</a>`;
  }

  function slugify(value) {
    return String(value || "actividad")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "actividad";
  }

  function calendarLink(event) {
    if (!event.date) return "";
    const start = event.date.replaceAll("-", "");
    const end = (event.endDate || event.date).replaceAll("-", "");
    const title = encodeURIComponent(event.title || "Actividad AEPY");
    const description = encodeURIComponent(event.summary || "");
    const location = encodeURIComponent(event.location || "Paraguay");
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//AEPY//Agenda//ES",
      "BEGIN:VEVENT",
      `UID:${slugify(event.title)}-${start}@aepy`,
      `DTSTAMP:${start}T120000Z`,
      `DTSTART;VALUE=DATE:${start}`,
      `DTEND;VALUE=DATE:${end}`,
      `SUMMARY:${event.title || "Actividad AEPY"}`,
      `DESCRIPTION:${event.summary || ""}`,
      `LOCATION:${event.location || "Paraguay"}`,
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");
    return `<a class="text-link" download="${slugify(event.title)}.ics" href="data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}">Agendar</a>`;
  }

  function renderIndicators(rows) {
    const container = document.querySelector("[data-indicators]");
    if (!container || !rows.length) return;
    container.innerHTML = rows.map((item) => `
      <article class="stat-card">
        <strong>${escapeHtml(item.value)}</strong>
        <span>${escapeHtml(item.label)}</span>
        <p>${escapeHtml(item.note)}</p>
      </article>
    `).join("");
  }

  function renderEvents(rows) {
    const container = document.querySelector("[data-events]");
    if (!container) return;
    if (!rows.length) {
      container.innerHTML = '<p class="loading-text">La agenda se publicará próximamente.</p>';
      return;
    }

    container.innerHTML = rows.map((event) => `
      <article class="event-item">
        <div class="event-date">
          <div>
            ${escapeHtml(formatDate(event.date))}
            ${event.endDate ? `<span>hasta ${escapeHtml(formatDate(event.endDate))}</span>` : ""}
          </div>
        </div>
        <div>
          <span class="pill">${escapeHtml(event.mode || event.location || "Actividad")}</span>
          <h3>${escapeHtml(event.title)}</h3>
          <p>${escapeHtml(event.summary)}</p>
          <p><strong>${escapeHtml(event.location)}</strong></p>
        </div>
        <div class="event-actions">
          ${calendarLink(event)}
          ${linkOrSpan(event.registerUrl, "Ver enlace", "text-link")}
        </div>
      </article>
    `).join("");
  }

  function renderResources(rows) {
    const container = document.querySelector("[data-resources]");
    if (!container) return;
    if (!rows.length) {
      container.innerHTML = '<p class="loading-text">Los recursos se publicarán próximamente.</p>';
      return;
    }

    container.innerHTML = rows.map((resource) => `
      <article class="resource-card">
        <span class="card-meta">${escapeHtml(resource.type || resource.status)}</span>
        <h3>${escapeHtml(resource.title)}</h3>
        <p>${escapeHtml(resource.description)}</p>
        <span class="pill">${escapeHtml(resource.audience || "Público general")}</span>
        ${linkOrSpan(resource.url, resource.status === "Disponible" ? "Abrir recurso" : "Ver recurso")}
      </article>
    `).join("");
  }

  function renderNews(rows) {
    const container = document.querySelector("[data-news]");
    if (!container) return;
    if (!rows.length) {
      container.innerHTML = '<p class="loading-text">Las novedades se publicarán próximamente.</p>';
      return;
    }

    container.innerHTML = rows.map((item) => `
      <article class="news-card">
        <span class="card-meta">${escapeHtml(item.category || formatDate(item.date))}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.summary)}</p>
        <small>${escapeHtml(formatDate(item.date))}</small>
        ${linkOrSpan(item.url, "Leer más")}
      </article>
    `).join("");
  }

  function renderAllies(rows) {
    const container = document.querySelector("[data-allies]");
    if (!container) return;
    if (!rows.length) {
      container.innerHTML = '<p class="loading-text">La red de aliados se actualizará próximamente.</p>';
      return;
    }

    container.innerHTML = rows.map((ally) => `
      <article class="ally-card">
        <span class="card-meta">${escapeHtml(ally.status || ally.type)}</span>
        <h3>${escapeHtml(ally.name)}</h3>
        <p>${escapeHtml(ally.contribution)}</p>
        <span class="pill">${escapeHtml(ally.type)}</span>
        ${linkOrSpan(ally.url, "Ver sitio")}
      </article>
    `).join("");
  }

  function renderForum(rows) {
    const container = document.querySelector("[data-forum]");
    if (!container) return;
    if (!rows.length) {
      container.innerHTML = '<p class="loading-text">El foro se publicará próximamente.</p>';
      return;
    }

    container.innerHTML = rows.map((item) => `
      <article class="forum-card">
        <span class="card-meta">${escapeHtml(item.category || formatDate(item.date))}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.body)}</p>
        <div class="forum-card-foot">
          <small>${escapeHtml(item.author || "Equipo AEPY")} · ${escapeHtml(formatDate(item.date))}</small>
          ${linkOrSpan(item.url, "Abrir")}
        </div>
      </article>
    `).join("");
  }

  function setupSearch(data) {
    const input = document.querySelector("[data-site-search]");
    const results = document.querySelector("[data-search-results]");
    if (!input || !results) return;

    const collections = [
      ["Agenda", data.eventos || [], (item) => item.title, (item) => item.summary, "#agenda"],
      ["Recursos", data.recursos || [], (item) => item.title, (item) => item.description, "#recursos"],
      ["Noticias", data.noticias || [], (item) => item.title, (item) => item.summary, "#noticias"],
      ["Aliados", data.aliados || [], (item) => item.name, (item) => item.contribution, "#aliados"],
      ["Foro", data.foro || [], (item) => item.title, (item) => item.body, "#foro"]
    ];

    const index = collections.flatMap(([type, rows, title, body, href]) => rows.map((item) => ({
      type,
      title: title(item) || "",
      body: body(item) || "",
      href,
      text: `${type} ${title(item) || ""} ${body(item) || ""} ${Object.values(item).join(" ")}`.toLowerCase()
    })));

    input.addEventListener("input", () => {
      const query = input.value.trim().toLowerCase();
      if (query.length < 2) {
        results.innerHTML = "<p>Escribí al menos dos letras para buscar.</p>";
        return;
      }

      const matches = index
        .filter((item) => item.text.includes(query))
        .slice(0, 6);

      if (!matches.length) {
        results.innerHTML = "<p>No encontramos coincidencias. Probá con otra palabra.</p>";
        return;
      }

      results.innerHTML = matches.map((item) => `
        <a class="search-result" href="${escapeHtml(item.href)}">
          <span>${escapeHtml(item.type)}</span>
          <strong>${escapeHtml(item.title)}</strong>
          <small>${escapeHtml(item.body)}</small>
        </a>
      `).join("");
    });
  }

  function applyConfig(configMap) {
    document.querySelectorAll("[data-config]").forEach((node) => {
      const key = node.dataset.config;
      if (configMap[key]) node.textContent = configMap[key];
    });
  }

  function setupNav() {
    const header = document.querySelector("[data-header]");
    const toggle = document.querySelector("[data-nav-toggle]");
    const nav = document.querySelector("[data-nav]");

    const updateHeader = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 12);
    };

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });

    toggle.addEventListener("click", () => {
      const open = !nav.classList.contains("is-open");
      nav.classList.toggle("is-open", open);
      header.classList.toggle("is-open", open);
      document.body.classList.toggle("nav-open", open);
      toggle.setAttribute("aria-expanded", String(open));
    });

    nav.addEventListener("click", (event) => {
      if (event.target.closest("a")) {
        nav.classList.remove("is-open");
        header.classList.remove("is-open");
        document.body.classList.remove("nav-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  function setupForm() {
    const form = document.querySelector("[data-join-form]");
    const status = document.querySelector("[data-form-status]");
    if (!form || !status) return;

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const endpoint = window.AEPY_CONFIG.appsScriptEndpoint;
      const payload = new URLSearchParams(new FormData(form));
      payload.set("tipo", "registro_web");
      payload.set("origen", window.location.href);

      if (!endpoint) {
        status.textContent = "Registro preparado. Falta configurar la URL del Web App en la planilla.";
        status.style.color = "#ffd166";
        return;
      }

      status.textContent = "Enviando registro...";
      status.style.color = "#ffffff";

      try {
        await fetch(endpoint, {
          method: "POST",
          mode: "no-cors",
          body: payload
        });
        form.reset();
        status.textContent = "Registro enviado. Gracias por sumarte.";
        status.style.color = "#b7f3d1";
      } catch (error) {
        console.error(error);
        status.textContent = "No se pudo enviar el registro. Intentá nuevamente más tarde.";
        status.style.color = "#ffd166";
      }
    });
  }

  async function boot() {
    setupNav();
    setupForm();

    const data = await window.AEPY_DATA.loadSiteData();
    applyConfig(data.configMap || {});
    renderIndicators(data.indicadores || []);
    renderEvents(data.eventos || []);
    renderResources(data.recursos || []);
    renderNews(data.noticias || []);
    renderAllies(data.aliados || []);
    renderForum(data.foro || []);
    setupSearch(data);
  }

  document.addEventListener("DOMContentLoaded", boot);
})();
