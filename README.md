# Alfabetización Estadística Paraguay

Primera versión de la página web de la iniciativa paraguaya de alfabetización estadística vinculada al ISLP.

## Estructura

- `index.html`: sitio público.
- `assets/css/styles.css`: estilos responsivos.
- `assets/js/config.js`: IDs de Google Sheets, Drive y URL del Web App.
- `assets/js/data.js`: lectura de datos desde Google Sheets con respaldo local.
- `assets/js/main.js`: render de secciones y envío del formulario.
- `apps-script/`: backend Apps Script para guardar registros en la planilla.
- `docs/data-model.md`: modelo de datos de la planilla.

## Datos

La web consume contenido desde:

https://docs.google.com/spreadsheets/d/1CdHa2jmh1V16x9CIGzmMcvHFaW9cc88QzWcY-8qcAvU/edit

Los archivos y materiales del proyecto deben organizarse en:

https://drive.google.com/drive/folders/186EdVMqjpiIKKcMEHltzHhUjwU98nwG0

## Ejecutar localmente

```powershell
python -m http.server 8080
```

Abrir `http://localhost:8080`.

## Apps Script

El formulario escribe en la pestaña `registros` mediante un Web App de Apps Script. Ver `apps-script/README.md`.
