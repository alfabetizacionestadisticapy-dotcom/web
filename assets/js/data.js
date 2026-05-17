(function () {
  const DEFAULT_DATA = {
    config: [
      { key: "siteTitle", value: "Alfabetización Estadística Paraguay" },
      { key: "tagline", value: "Una red para leer datos, hacer mejores preguntas y decidir con evidencia." },
      { key: "appsScriptEndpoint", value: "https://script.google.com/macros/s/AKfycbxKsIbWdW4NRuPjPBcEXpVSU6w6Ouh3ogPA_oC_0zw5Ztq--hbpemeLcgP22ExzdHW4/exec" }
    ],
    indicadores: [
      { label: "Coordinadoras país", value: "2", note: "Paraguay figura en ISLP con Marlene Román y Teresita Báez Llamosas.", published: "TRUE" },
      { label: "Líneas de acción", value: "5", note: "Concursos, recursos, talleres, red de aliados y gestión institucional.", published: "TRUE" },
      { label: "Agenda 2026", value: "En marcha", note: "Cronograma, contenidos y reuniones periódicas en preparación.", published: "TRUE" }
    ],
    noticias: [
      { date: "2026-05-16", category: "ISLP", title: "Paraguay se suma a la red internacional de alfabetización estadística", summary: "El equipo nacional articula acciones educativas, concursos y alianzas para promover el uso ciudadano de datos.", url: "https://iase-web.org/islp", published: "TRUE" },
      { date: "2026-04-18", category: "Gestión", title: "FACEN impulsa una agenda de alfabetización estadística con aliados estratégicos", summary: "La iniciativa busca conectar a la academia, instituciones públicas, organismos internacionales y sector privado.", url: "", published: "TRUE" },
      { date: "2026-04-18", category: "Alianzas", title: "Primeras conversaciones con CONACYT y UNESCO", summary: "Se identifican oportunidades para financiamiento de eventos, concursos de póster y apoyo técnico.", url: "", published: "TRUE" }
    ],
    eventos: [
      { date: "2026-05-30", endDate: "", title: "Reunión de coordinación ISLP Paraguay", location: "Virtual", mode: "Coordinación", summary: "Revisión de cronograma, carpetas de contenidos y próximos contactos institucionales.", registerUrl: "", published: "TRUE" },
      { date: "2026-06-15", endDate: "", title: "Mesa de aliados para alfabetización estadística", location: "FACEN / híbrido", mode: "Alianzas", summary: "Espacio de presentación para instituciones, sponsors y organizaciones interesadas en sumarse.", registerUrl: "", published: "TRUE" },
      { date: "2026-08-01", endDate: "2026-10-31", title: "Convocatoria nacional de póster estadístico", location: "Paraguay", mode: "Concurso", summary: "Actividad inspirada en la competencia internacional de ISLP para estudiantes y docentes.", registerUrl: "https://iase-web.org/islp", published: "TRUE" }
    ],
    recursos: [
      { title: "Guía para docentes: datos en el aula", audience: "Docentes", type: "Material didáctico", description: "Plantilla inicial para organizar actividades de lectura de gráficos, encuestas y probabilidad.", url: "", status: "En preparación", published: "TRUE" },
      { title: "Taller ejecutivo: decisiones con datos", audience: "Directivos", type: "Taller", description: "Programa breve para instituciones y empresas que quieran fortalecer cultura de datos.", url: "", status: "Diseño inicial", published: "TRUE" },
      { title: "Repositorio ISLP internacional", audience: "Público general", type: "Repositorio", description: "Recursos internacionales sobre alfabetización estadística, actividades y noticias.", url: "https://iase-web.org/islp", status: "Disponible", published: "TRUE" }
    ],
    aliados: [
      { name: "FACEN", type: "Institución académica", contribution: "Articulación académica, coordinación y compromiso institucional.", url: "", status: "Impulsor", published: "TRUE" },
      { name: "CONACYT", type: "Institución pública", contribution: "Canal de conversación para posibles convocatorias de financiamiento de eventos científicos.", url: "", status: "En conversación", published: "TRUE" },
      { name: "UNESCO", type: "Organismo internacional", contribution: "Interés en apoyar concursos y articular con áreas de educación y ciencia.", url: "", status: "En conversación", published: "TRUE" },
      { name: "MEC", type: "Institución pública", contribution: "Actor estratégico para escala educativa nacional.", url: "", status: "Pendiente de reunión", published: "TRUE" },
      { name: "UIP", type: "Sector privado", contribution: "Posibles talleres por niveles y apoyo a la red de alfabetización estadística.", url: "", status: "Prospecto", published: "TRUE" }
    ],
    foro: [
      { date: "2026-05-17", category: "Comunidad", title: "Abrimos el foro de novedades de la red", body: "Este espacio reunirá avisos, llamados a colaboración, aprendizajes y oportunidades para docentes, estudiantes, instituciones y aliados.", author: "Equipo AEPY", url: "", published: "TRUE" },
      { date: "2026-05-17", category: "Convocatoria", title: "Buscamos materiales para la biblioteca de alfabetización estadística", body: "Los colaboradores pueden proponer guías, ejercicios, pósters, datasets, talleres y enlaces útiles para el repositorio público.", author: "Coordinación Paraguay", url: "", published: "TRUE" }
    ]
  };

  function csvUrl(sheetName) {
    const id = window.AEPY_CONFIG.spreadsheetId;
    return `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
  }

  function parseCsv(text) {
    const rows = [];
    let row = [];
    let cell = "";
    let inQuotes = false;

    for (let i = 0; i < text.length; i += 1) {
      const char = text[i];
      const next = text[i + 1];

      if (char === '"' && inQuotes && next === '"') {
        cell += '"';
        i += 1;
      } else if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        row.push(cell);
        cell = "";
      } else if ((char === "\n" || char === "\r") && !inQuotes) {
        if (char === "\r" && next === "\n") i += 1;
        row.push(cell);
        if (row.some((value) => value.trim() !== "")) rows.push(row);
        row = [];
        cell = "";
      } else {
        cell += char;
      }
    }

    row.push(cell);
    if (row.some((value) => value.trim() !== "")) rows.push(row);
    return rows;
  }

  function rowsToObjects(rows) {
    if (!rows || rows.length < 2) return [];
    const headers = rows[0].map((header) => header.trim());
    return rows.slice(1).map((row, rowIndex) => {
      const item = headers.reduce((object, header, index) => {
        object[header] = (row[index] || "").trim();
        return object;
      }, {});
      item.__rowIndex = rowIndex + 2;
      return item;
    });
  }

  async function fetchSheet(sheetName) {
    const response = await fetch(csvUrl(sheetName), { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`No se pudo leer ${sheetName}`);
    }
    return rowsToObjects(parseCsv(await response.text()));
  }

  function publishedOnly(rows) {
    return rows.filter((row) => String(row.published || "TRUE").toUpperCase() !== "FALSE");
  }

  function configObject(rows) {
    return rows.reduce((object, row) => {
      if (row.key) object[row.key] = row.value || "";
      return object;
    }, {});
  }

  async function loadSiteData() {
    const sheets = window.AEPY_CONFIG.sheets;
    const data = {};

    try {
      data.config = await fetchSheet(sheets.config);
      const sheetConfig = configObject(data.config);
      if (sheetConfig.appsScriptEndpoint) {
        window.AEPY_CONFIG.appsScriptEndpoint = sheetConfig.appsScriptEndpoint;
      }

      const names = ["indicadores", "noticias", "eventos", "recursos", "aliados", "galeria", "foro"];
      const loaded = await Promise.all(names.map((name) => fetchSheet(sheets[name])));
      names.forEach((name, index) => {
        data[name] = publishedOnly(loaded[index]);
      });
      data.configMap = sheetConfig;
      return data;
    } catch (error) {
      console.warn("Usando datos locales de respaldo:", error);
      return {
        ...DEFAULT_DATA,
        configMap: configObject(DEFAULT_DATA.config)
      };
    }
  }

  window.AEPY_DATA = {
    loadSiteData,
    fetchSheet,
    publishedOnly,
    configObject
  };
})();
