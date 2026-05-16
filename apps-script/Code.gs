const SPREADSHEET_ID = "1CdHa2jmh1V16x9CIGzmMcvHFaW9cc88QzWcY-8qcAvU";
const PUBLIC_SHEETS = ["config", "indicadores", "noticias", "eventos", "recursos", "aliados", "galeria"];
const REGISTRATION_SHEET = "registros";
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

function doGet(event) {
  const params = event && event.parameter ? event.parameter : {};
  const route = params.route || "all";

  if (route === "health") {
    return jsonResponse({ ok: true, project: "alfabetizacion-estadistica-py" });
  }

  if (route === "sheet") {
    const sheet = String(params.sheet || "");
    if (PUBLIC_SHEETS.indexOf(sheet) === -1) {
      return jsonResponse({ ok: false, error: "SHEET_NOT_ALLOWED" });
    }
    return jsonResponse({ ok: true, sheet, rows: getSheetRows(sheet) });
  }

  return jsonResponse({
    ok: true,
    data: PUBLIC_SHEETS.reduce((data, sheet) => {
      data[sheet] = getSheetRows(sheet);
      return data;
    }, {})
  });
}

function doPost(event) {
  const payload = event && event.parameter ? event.parameter : {};
  const sheet = getOrCreateSheet(REGISTRATION_SHEET, REGISTRATION_HEADERS);
  const row = REGISTRATION_HEADERS.map((header) => {
    if (header === "timestamp") return new Date();
    if (header === "estado") return "recibido";
    return payload[header] || "";
  });

  sheet.appendRow(row);

  return jsonResponse({
    ok: true,
    saved: true
  });
}

function authorize() {
  getSpreadsheet().getId();
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
    .map((row) => headers.reduce((object, header, index) => {
      object[header] = row[index] || "";
      return object;
    }, {}));
}

function getOrCreateSheet(sheetName, headers) {
  const spreadsheet = getSpreadsheet();
  let sheet = spreadsheet.getSheetByName(sheetName);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
  }

  const firstRow = sheet.getRange(1, 1, 1, headers.length).getDisplayValues()[0];
  const hasHeaders = headers.every((header, index) => firstRow[index] === header);

  if (!hasHeaders) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
