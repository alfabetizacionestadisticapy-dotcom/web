# Alfabetización Estadística Paraguay

Primera versión de la página web de la iniciativa paraguaya de alfabetización estadística vinculada al ISLP.

## Estructura

- `index.html`: sitio público.
- `assets/css/styles.css`: estilos responsivos.
- `assets/js/config.js`: IDs de Google Sheets, Drive y URL del Web App.
- `assets/js/data.js`: lectura de datos desde Google Sheets con respaldo local.
- `assets/js/main.js`: render de secciones y envío del formulario.
- `admin.html`: panel de administración para editar contenidos y subir archivos.
- `assets/js/admin.js`: lógica del modo administración.
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

El formulario y el panel de administración escriben mediante un Web App de Apps Script. Ver `apps-script/README.md`.

Para activar el panel:

1. En Apps Script, configurar la propiedad de script `ADMIN_KEY`.
2. Confirmar que el despliegue Web App esté como `Execute as: Me` y `Who has access: Anyone`.
3. Entrar a `admin.html` desde el botón `Administrar`.
