(function () {
  const ENDPOINT_WARNING = "El endpoint de Apps Script no está configurado. Revisá config.appsScriptEndpoint.";
  const SHEETS = {
    dashboard: { label: "Tablero" },
    noticias: {
      label: "Noticias",
      title: "Noticias y avances",
      fields: [
        ["date", "Fecha", "date"],
        ["category", "Categoría", "text"],
        ["title", "Título", "text", true],
        ["summary", "Resumen", "textarea", true],
        ["url", "Enlace", "url"],
        ["published", "Publicado", "select"]
      ]
    },
    eventos: {
      label: "Agenda",
      title: "Actividades y eventos",
      fields: [
        ["date", "Fecha inicio", "date"],
        ["endDate", "Fecha fin", "date"],
        ["title", "Título", "text", true],
        ["location", "Lugar", "text"],
        ["mode", "Modo / tipo", "text"],
        ["summary", "Resumen", "textarea", true],
        ["registerUrl", "Enlace de registro", "url"],
        ["published", "Publicado", "select"]
      ]
    },
    recursos: {
      label: "Recursos",
      title: "Biblioteca de recursos",
      fields: [
        ["title", "Título", "text", true],
        ["audience", "Audiencia", "text"],
        ["type", "Tipo", "text"],
        ["description", "Descripción", "textarea", true],
        ["url", "Enlace o archivo", "url"],
        ["status", "Estado", "text"],
        ["published", "Publicado", "select"]
      ]
    },
    aliados: {
      label: "Aliados",
      title: "Aliados y sponsors",
      fields: [
        ["name", "Nombre", "text", true],
        ["type", "Tipo", "text"],
        ["contribution", "Aporte / conversación", "textarea", true],
        ["url", "Sitio web", "url"],
        ["status", "Estado", "text"],
        ["published", "Publicado", "select"]
      ]
    },
    foro: {
      label: "Foro",
      title: "Foro de novedades",
      fields: [
        ["date", "Fecha", "date"],
        ["category", "Categoría", "text"],
        ["title", "Título", "text", true],
        ["body", "Contenido", "textarea", true],
        ["author", "Autor", "text"],
        ["url", "Enlace", "url"],
        ["published", "Publicado", "select"]
      ]
    },
    indicadores: {
      label: "Indicadores",
      title: "Indicadores del inicio",
      fields: [
        ["label", "Etiqueta", "text"],
        ["value", "Valor", "text"],
        ["note", "Nota", "textarea", true],
        ["published", "Publicado", "select"]
      ]
    },
    config: {
      label: "Config",
      title: "Configuración del sitio",
      fields: [
        ["key", "Clave", "text"],
        ["value", "Valor", "textarea", true],
        ["notes", "Notas", "textarea", true]
      ]
    },
    archivos: { label: "Archivos" },
    registros: { label: "Registros" },
    admin_log: { label: "Auditoría" }
  };

  const state = {
    adminKey: sessionStorage.getItem("aepyAdminKey") || "",
    active: "dashboard",
    rows: {},
    selectedRow: null
  };

  const escapeHtml = (value) => String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const statusNode = () => document.querySelector("[data-admin-status]");

  function setStatus(message, tone = "neutral") {
    const node = statusNode();
    if (!node) return;
    node.textContent = message || "";
    node.style.color = tone === "ok" ? "#2f7d57" : tone === "warn" ? "#b51f33" : "";
  }

  function endpoint() {
    return window.AEPY_CONFIG.appsScriptEndpoint || "";
  }

  async function loadSheet(name) {
    try {
      state.rows[name] = await window.AEPY_DATA.fetchSheet(name);
    } catch (error) {
      console.warn(error);
      state.rows[name] = [];
    }
  }

  async function loadAll() {
    if (state.adminKey && endpoint()) {
      try {
        const payload = await jsonpAdminData();
        if (!payload.ok) return payload;
        state.rows = payload.data || {};
        return { ok: true, source: "apps-script" };
      } catch (error) {
        console.warn(error);
      }
    }

    const names = Object.keys(SHEETS).filter((name) => name !== "dashboard" && name !== "archivos");
    await Promise.all(names.map(loadSheet));
    return { ok: true, source: "public-csv", warning: "No se pudo validar Apps Script; se cargaron datos públicos." };
  }

  function jsonpAdminData() {
    return new Promise((resolve, reject) => {
      const callback = `aepyAdmin${Date.now()}${Math.round(Math.random() * 1000)}`;
      const script = document.createElement("script");
      const timeout = window.setTimeout(() => {
        cleanup();
        reject(new Error("Tiempo de espera agotado al validar Apps Script."));
      }, 12000);

      function cleanup() {
        window.clearTimeout(timeout);
        delete window[callback];
        script.remove();
      }

      window[callback] = (payload) => {
        cleanup();
        resolve(payload);
      };

      const url = new URL(endpoint());
      url.searchParams.set("route", "adminData");
      url.searchParams.set("adminKey", state.adminKey);
      url.searchParams.set("callback", callback);
      script.onerror = () => {
        cleanup();
        reject(new Error("No se pudo conectar con Apps Script."));
      };
      script.src = url.toString();
      document.body.appendChild(script);
    });
  }

  function postAdmin(action, extra) {
    if (!endpoint()) {
      setStatus(ENDPOINT_WARNING, "warn");
      return Promise.resolve(false);
    }

    const payload = new URLSearchParams();
    payload.set("action", action);
    payload.set("adminKey", state.adminKey);
    Object.entries(extra || {}).forEach(([key, value]) => payload.set(key, value == null ? "" : value));

    return fetch(endpoint(), {
      method: "POST",
      mode: "no-cors",
      body: payload
    }).then(() => true);
  }

  function tabs() {
    const nav = document.querySelector("[data-admin-tabs]");
    nav.innerHTML = Object.entries(SHEETS).map(([key, sheet]) => `
      <button class="admin-tab ${state.active === key ? "is-active" : ""}" type="button" data-admin-tab="${key}">
        ${escapeHtml(sheet.label)}
      </button>
    `).join("");

    nav.onclick = async (event) => {
      const button = event.target.closest("[data-admin-tab]");
      if (!button) return;
      state.active = button.dataset.adminTab;
      state.selectedRow = null;
      await render();
    };
  }

  function dashboard() {
    const publicSheets = ["noticias", "eventos", "recursos", "aliados", "foro", "registros"];
    const cards = publicSheets.map((name) => {
      const rows = state.rows[name] || [];
      return `
        <article class="admin-kpi">
          <strong>${rows.length}</strong>
          <span>${escapeHtml(SHEETS[name].label)}</span>
        </article>
      `;
    }).join("");

    return `
      <div class="admin-kpis">${cards}</div>
      <div class="admin-grid">
        <article class="admin-card">
          <h2>Estado del sistema</h2>
          <p class="admin-help">La web pública lee Google Sheets como CMS. El panel envía cambios a Apps Script y Apps Script escribe en la planilla o sube archivos al Drive.</p>
          <p><strong>Endpoint:</strong> ${endpoint() ? `<a class="text-link" href="${escapeHtml(endpoint())}" target="_blank" rel="noreferrer">Web App configurado</a>` : "No configurado"}</p>
          <p><strong>Drive:</strong> <a class="text-link" href="${escapeHtml(window.AEPY_CONFIG.driveFolderUrl)}" target="_blank" rel="noreferrer">Abrir carpeta de trabajo</a></p>
          <p><strong>Planilla:</strong> <a class="text-link" href="${escapeHtml(window.AEPY_CONFIG.spreadsheetUrl)}" target="_blank" rel="noreferrer">Abrir CMS</a></p>
        </article>
        <article class="admin-card">
          <h2>Utilidades rápidas</h2>
          <div class="admin-form-actions">
            <button class="button button-ghost" type="button" data-admin-refresh>Recargar datos</button>
            <button class="button button-ghost" type="button" data-copy-diagnostic>Copiar diagnóstico</button>
            <a class="button button-ghost" href="index.html" target="_blank" rel="noreferrer">Vista pública</a>
          </div>
          <p class="admin-help">Consejo: usá published = FALSE para preparar contenido sin mostrarlo todavía.</p>
        </article>
      </div>
    `;
  }

  function rowTitle(sheet, row) {
    if (!row) return "Nuevo registro";
    return row.title || row.name || row.label || row.key || row.email || `Fila ${row.__rowIndex || ""}`;
  }

  function listMarkup(sheetName) {
    const rows = state.rows[sheetName] || [];
    if (!rows.length) return '<p class="admin-help">Sin registros todavía.</p>';
    return rows.map((row) => `
      <button class="admin-list-item ${state.selectedRow && state.selectedRow.__rowIndex === row.__rowIndex ? "is-active" : ""}" type="button" data-row-index="${row.__rowIndex}">
        <span>${escapeHtml(row.published === "FALSE" ? "Oculto" : row.category || row.status || row.type || SHEETS[sheetName].label)}</span>
        <strong>${escapeHtml(rowTitle(sheetName, row))}</strong>
      </button>
    `).join("");
  }

  function inputFor(field, row) {
    const [name, label, type, wide] = field;
    const value = row ? row[name] || "" : (name === "published" ? "TRUE" : "");

    if (type === "textarea") {
      return `
        <label data-wide="${wide ? "true" : "false"}">
          ${escapeHtml(label)}
          <textarea name="${escapeHtml(name)}" rows="4">${escapeHtml(value)}</textarea>
        </label>
      `;
    }

    if (type === "select") {
      return `
        <label>
          ${escapeHtml(label)}
          <select name="${escapeHtml(name)}">
            <option ${value !== "FALSE" ? "selected" : ""}>TRUE</option>
            <option ${value === "FALSE" ? "selected" : ""}>FALSE</option>
          </select>
        </label>
      `;
    }

    return `
      <label data-wide="${wide ? "true" : "false"}">
        ${escapeHtml(label)}
        <input name="${escapeHtml(name)}" type="${escapeHtml(type)}" value="${escapeHtml(value)}">
      </label>
    `;
  }

  function editor(sheetName) {
    const sheet = SHEETS[sheetName];
    const row = state.selectedRow;
    return `
      <div class="admin-toolbar">
        <div>
          <p class="eyebrow">${escapeHtml(sheet.label)}</p>
          <h2>${escapeHtml(sheet.title)}</h2>
        </div>
        <button class="button button-ghost" type="button" data-admin-new>Nuevo</button>
        <button class="button button-ghost" type="button" data-admin-refresh>Recargar</button>
      </div>
      <div class="admin-grid">
        <div class="admin-list" data-admin-list>${listMarkup(sheetName)}</div>
        <form class="admin-card admin-form-grid" data-admin-editor-form>
          <input type="hidden" name="rowIndex" value="${row ? row.__rowIndex || "" : ""}">
          ${sheet.fields.map((field) => inputFor(field, row)).join("")}
          <div class="admin-form-actions">
            <button class="button button-primary" type="submit">Guardar cambios</button>
            <button class="button button-ghost" type="button" data-admin-unpublish>Ocultar</button>
          </div>
        </form>
      </div>
    `;
  }

  function uploadView() {
    return `
      <div class="admin-toolbar">
        <div>
          <p class="eyebrow">Archivos</p>
          <h2>Subir contenido al Drive y publicarlo</h2>
        </div>
      </div>
      <form class="admin-card admin-upload-grid" data-admin-upload-form>
        <label>
          Publicar como
          <select name="targetSheet">
            <option value="recursos">Recurso</option>
            <option value="foro">Foro</option>
            <option value="galeria">Galería</option>
          </select>
        </label>
        <label>
          Archivo
          <input name="file" type="file" required>
        </label>
        <label data-wide="true">
          Título
          <input name="title" required>
        </label>
        <label data-wide="true">
          Descripción
          <textarea name="description" rows="4"></textarea>
        </label>
        <button class="button button-primary" type="submit">Subir y registrar</button>
      </form>
    `;
  }

  function tableView(sheetName) {
    const rows = state.rows[sheetName] || [];
    const headers = rows.length ? Object.keys(rows[0]).filter((key) => key !== "__rowIndex") : [];
    return `
      <div class="admin-toolbar">
        <div>
          <p class="eyebrow">${escapeHtml(SHEETS[sheetName].label)}</p>
          <h2>${sheetName === "registros" ? "Registros recibidos" : "Auditoría administrativa"}</h2>
        </div>
        <button class="button button-ghost" type="button" data-admin-refresh>Recargar</button>
      </div>
      <div class="admin-card admin-list">
        ${rows.map((row) => `
          <article class="admin-list-item">
            <span>${escapeHtml(row.timestamp || row.date || `Fila ${row.__rowIndex}`)}</span>
            <strong>${escapeHtml(row.nombre || row.action || row.email || rowTitle(sheetName, row))}</strong>
            <small>${escapeHtml(headers.map((key) => `${key}: ${row[key] || ""}`).join(" | "))}</small>
          </article>
        `).join("") || '<p class="admin-help">Sin datos todavía.</p>'}
      </div>
    `;
  }

  async function render() {
    tabs();
    const view = document.querySelector("[data-admin-view]");
    if (state.active === "dashboard") view.innerHTML = dashboard();
    else if (state.active === "archivos") view.innerHTML = uploadView();
    else if (state.active === "registros" || state.active === "admin_log") view.innerHTML = tableView(state.active);
    else view.innerHTML = editor(state.active);
    bindWorkspace();
  }

  function bindWorkspace() {
    document.querySelectorAll("[data-admin-refresh]").forEach((button) => {
      button.addEventListener("click", async () => {
        setStatus("Recargando datos...");
        await loadAll();
        await render();
        setStatus("Datos recargados.", "ok");
      });
    });

    const list = document.querySelector("[data-admin-list]");
    if (list) {
      list.addEventListener("click", (event) => {
        const item = event.target.closest("[data-row-index]");
        if (!item) return;
        const rows = state.rows[state.active] || [];
        state.selectedRow = rows.find((row) => String(row.__rowIndex) === String(item.dataset.rowIndex));
        render();
      });
    }

    const newButton = document.querySelector("[data-admin-new]");
    if (newButton) {
      newButton.addEventListener("click", () => {
        state.selectedRow = null;
        render();
      });
    }

    const form = document.querySelector("[data-admin-editor-form]");
    if (form) {
      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        const values = {};
        SHEETS[state.active].fields.forEach(([name]) => {
          values[name] = formData.get(name) || "";
        });
        setStatus("Enviando cambios al CMS...");
        await postAdmin("adminUpsert", {
          sheet: state.active,
          rowIndex: formData.get("rowIndex") || "",
          values: JSON.stringify(values)
        });
        setStatus("Cambios enviados. La planilla puede tardar unos segundos en reflejarlos.", "ok");
      });
    }

    const unpublish = document.querySelector("[data-admin-unpublish]");
    if (unpublish) {
      unpublish.addEventListener("click", async () => {
        if (!state.selectedRow) {
          setStatus("Seleccioná una fila para ocultarla.", "warn");
          return;
        }
        const values = { ...state.selectedRow, published: "FALSE" };
        delete values.__rowIndex;
        await postAdmin("adminUpsert", {
          sheet: state.active,
          rowIndex: state.selectedRow.__rowIndex,
          values: JSON.stringify(values)
        });
        setStatus("Orden de ocultar enviada.", "ok");
      });
    }

    const upload = document.querySelector("[data-admin-upload-form]");
    if (upload) {
      upload.addEventListener("submit", async (event) => {
        event.preventDefault();
        const formData = new FormData(upload);
        const file = formData.get("file");
        if (!file || !file.name) return;
        setStatus("Leyendo archivo...");
        const reader = new FileReader();
        reader.onload = async () => {
          const base64 = String(reader.result).split(",")[1] || "";
          setStatus("Subiendo archivo al Drive...");
          await postAdmin("adminUploadFile", {
            targetSheet: formData.get("targetSheet"),
            title: formData.get("title"),
            description: formData.get("description"),
            fileName: file.name,
            mimeType: file.type || "application/octet-stream",
            data: base64
          });
          upload.reset();
          setStatus("Archivo enviado al Drive y registrado para publicación.", "ok");
        };
        reader.readAsDataURL(file);
      });
    }

    const diagnostic = document.querySelector("[data-copy-diagnostic]");
    if (diagnostic) {
      diagnostic.addEventListener("click", async () => {
        const summary = {
          endpoint: endpoint(),
          sheets: Object.fromEntries(Object.keys(state.rows).map((key) => [key, state.rows[key].length])),
          updatedAt: new Date().toISOString()
        };
        await navigator.clipboard.writeText(JSON.stringify(summary, null, 2));
        setStatus("Diagnóstico copiado.", "ok");
      });
    }
  }

  function setupLogin() {
    const form = document.querySelector("[data-admin-login]");
    const loginStatus = document.querySelector("[data-admin-login-status]");
    const panel = document.querySelector("[data-admin-panel]");

    async function enter(key) {
      state.adminKey = key;
      sessionStorage.setItem("aepyAdminKey", key);
      loginStatus.textContent = "Validando acceso y cargando panel...";
      const result = await loadAll();
      if (result && result.ok === false) {
        loginStatus.textContent = result.error === "INVALID_ADMIN_KEY"
          ? "Clave incorrecta."
          : `No se pudo habilitar administración: ${result.error}`;
        return;
      }
      panel.classList.add("is-active");
      form.style.display = "none";
      await render();
      if (result && result.warning) {
        setStatus(result.warning, "warn");
      } else {
        setStatus(endpoint() ? "Panel listo." : ENDPOINT_WARNING, endpoint() ? "ok" : "warn");
      }
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const key = new FormData(form).get("adminKey");
      if (!key) return;
      await enter(key);
    });

    if (state.adminKey) {
      form.adminKey.value = state.adminKey;
    }
  }

  document.addEventListener("DOMContentLoaded", setupLogin);
})();
