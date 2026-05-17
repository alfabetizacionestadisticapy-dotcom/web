const SPREADSHEET_ID = "1CdHa2jmh1V16x9CIGzmMcvHFaW9cc88QzWcY-8qcAvU";
const DRIVE_FOLDER_ID = "186EdVMqjpiIKKcMEHltzHhUjwU98nwG0";
const PUBLIC_SHEETS = ["config", "indicadores", "noticias", "eventos", "recursos", "aliados", "galeria", "foro"];
const ADMIN_SHEETS = PUBLIC_SHEETS.concat(["registros", "admin_log"]);
const REGISTRATION_SHEET = "registros";
const ADMIN_LOG_SHEET = "admin_log";
const REGISTRATION_HEADERS = [
  "timestamp",
  "tipo",
  "nombre",
  "email",
  "organizacion",
  "rol",
  "interes",
  "mensaje",
  "origen",
  "estado"
];
const ADMIN_LOG_HEADERS = ["timestamp", "action", "sheet", "rowIndex", "detail", "actor"];

function doGet(event) {
  const params = event && event.parameter ? event.parameter : {};
  const route = params.route || "all";

  if (route === "health") {
    return output({ ok: true, project: "alfabetizacion-estadistica-py" }, params.callback);
  }

  if (route === "sheet") {
    const sheet = String(params.sheet || "");
    if (PUBLIC_SHEETS.indexOf(sheet) === -1) {
      return output({ ok: false, error: "SHEET_NOT_ALLOWED" }, params.callback);
    }
    return output({ ok: true, sheet, rows: getSheetRows(sheet) }, params.callback);
  }

  if (route === "adminData") {
    const auth = requireAdmin(params.adminKey);
    if (!auth.ok) return output(auth, params.callback);
    return output({
      ok: true,
      data: ADMIN_SHEETS.reduce((data, sheet) => {
        data[sheet] = getSheetRows(sheet);
        return data;
      }, {})
    }, params.callback);
  }

  return output({
    ok: true,
    data: PUBLIC_SHEETS.reduce((data, sheet) => {
      data[sheet] = getSheetRows(sheet);
      return data;
    }, {})
  }, params.callback);
}

function doPost(event) {
  const payload = event && event.parameter ? event.parameter : {};
  const action = payload.action || "register";

  if (action === "adminUpsert") {
    const auth = requireAdmin(payload.adminKey);
    if (!auth.ok) return output(auth);
    return output(adminUpsert(payload));
  }

  if (action === "adminUploadFile") {
    const auth = requireAdmin(payload.adminKey);
    if (!auth.ok) return output(auth);
    return output(adminUploadFile(payload));
  }

  return output(saveRegistration(payload));
}

function saveRegistration(payload) {
  const sheet = getOrCreateSheet(REGISTRATION_SHEET, REGISTRATION_HEADERS);
  const row = REGISTRATION_HEADERS.map((header) => {
    if (header === "timestamp") return new Date();
    if (header === "estado") return "recibido";
    return payload[header] || "";
  });

  sheet.appendRow(row);
  return { ok: true, saved: true };
}

function adminUpsert(payload) {
  const sheetName = String(payload.sheet || "");
  if (PUBLIC_SHEETS.indexOf(sheetName) === -1) {
    return { ok: false, error: "SHEET_NOT_ALLOWED" };
  }

  const values = safeJson(payload.values, {});
  const sheet = getSpreadsheet().getSheetByName(sheetName);
  if (!sheet) return { ok: false, error: "SHEET_NOT_FOUND" };

  const headers = ensureHeaders(sheet, Object.keys(values));
  const rowIndex = Number(payload.rowIndex || 0);
  const current = rowIndex > 1 ? sheet.getRange(rowIndex, 1, 1, headers.length).getValues()[0] : [];
  const next = headers.map((header, index) => {
    if (Object.prototype.hasOwnProperty.call(values, header)) return values[header];
    if (header === "published") return "TRUE";
    return current[index] || "";
  });

  const targetRow = rowIndex > 1 ? rowIndex : sheet.getLastRow() + 1;
  sheet.getRange(targetRow, 1, 1, headers.length).setValues([next]);
  logAdmin("adminUpsert", sheetName, targetRow, JSON.stringify(values), "admin");

  return { ok: true, sheet: sheetName, rowIndex: targetRow };
}

function adminUploadFile(payload) {
  const targetSheet = String(payload.targetSheet || "recursos");
  if (["recursos", "foro", "galeria"].indexOf(targetSheet) === -1) {
    return { ok: false, error: "TARGET_NOT_ALLOWED" };
  }

  const bytes = Utilities.base64Decode(payload.data || "");
  const blob = Utilities.newBlob(bytes, payload.mimeType || "application/octet-stream", payload.fileName || "archivo");
  const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
  const file = folder.createFile(blob);
  try {
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (error) {
    console.warn(error);
  }

  const url = file.getUrl();
  const title = payload.title || file.getName();
  const description = payload.description || "";

  if (targetSheet === "recursos") {
    adminUpsert({
      sheet: "recursos",
      values: JSON.stringify({
        title,
        audience: "Público general",
        type: file.getMimeType(),
        description,
        url,
        status: "Disponible",
        published: "TRUE"
      })
    });
  } else if (targetSheet === "foro") {
    adminUpsert({
      sheet: "foro",
      values: JSON.stringify({
        date: Utilities.formatDate(new Date(), "America/Asuncion", "yyyy-MM-dd"),
        category: "Archivo",
        title,
        body: description,
        author: "Administración",
        url,
        published: "TRUE"
      })
    });
  } else {
    adminUpsert({
      sheet: "galeria",
      values: JSON.stringify({
        title,
        imageUrl: url,
        alt: description,
        caption: description,
        published: "TRUE"
      })
    });
  }

  logAdmin("adminUploadFile", targetSheet, "", url, "admin");
  return { ok: true, fileUrl: url, fileId: file.getId() };
}

function requireAdmin(adminKey) {
  const configured = PropertiesService.getScriptProperties().getProperty("ADMIN_KEY");
  if (!configured) return { ok: false, error: "ADMIN_KEY_NOT_CONFIGURED" };
  if (String(adminKey || "") !== configured) return { ok: false, error: "INVALID_ADMIN_KEY" };
  return { ok: true };
}

function authorize() {
  getSpreadsheet().getId();
  DriveApp.getFolderById(DRIVE_FOLDER_ID).getName();
  return true;
}

function getSpreadsheet() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function getSheetRows(sheetName) {
  const sheet = getSpreadsheet().getSheetByName(sheetName);
  if (!sheet) return [];

  const values = sheet.getDataRange().getDisplayValues();
  if (values.length < 2) return [];

  const headers = values.shift().map((header) => String(header).trim());
  return values
    .filter((row) => row.some((value) => String(value).trim() !== ""))
    .map((row, index) => {
      const object = headers.reduce((item, header, columnIndex) => {
        item[header] = row[columnIndex] || "";
        return item;
      }, {});
      object.__rowIndex = index + 2;
      return object;
    });
}

function getOrCreateSheet(sheetName, headers) {
  const spreadsheet = getSpreadsheet();
  let sheet = spreadsheet.getSheetByName(sheetName);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
  }

  ensureHeaders(sheet, headers);
  return sheet;
}

function ensureHeaders(sheet, wantedHeaders) {
  const width = Math.max(sheet.getLastColumn(), wantedHeaders.length, 1);
  const firstRow = sheet.getRange(1, 1, 1, width).getDisplayValues()[0];
  const headers = firstRow.filter((header) => String(header).trim() !== "");

  wantedHeaders.forEach((header) => {
    if (headers.indexOf(header) === -1) headers.push(header);
  });

  if (!headers.length) return [];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.setFrozenRows(1);
  return headers;
}

function logAdmin(action, sheetName, rowIndex, detail, actor) {
  const sheet = getOrCreateSheet(ADMIN_LOG_SHEET, ADMIN_LOG_HEADERS);
  sheet.appendRow([new Date(), action, sheetName, rowIndex, detail, actor]);
}

function safeJson(value, fallback) {
  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
}

function output(payload, callback) {
  const body = callback ? `${callback}(${JSON.stringify(payload)});` : JSON.stringify(payload);
  return ContentService
    .createTextOutput(body)
    .setMimeType(callback ? ContentService.MimeType.JAVASCRIPT : ContentService.MimeType.JSON);
}
