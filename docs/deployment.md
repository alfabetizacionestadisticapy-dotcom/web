# Despliegue inicial

## Web

Repositorio:

https://github.com/alfabetizacionestadisticapy-dotcom/web.git

La web es estática y puede publicarse con GitHub Pages, Netlify, Vercel o cualquier hosting de archivos.

## Datos

Planilla CMS:

https://docs.google.com/spreadsheets/d/1CdHa2jmh1V16x9CIGzmMcvHFaW9cc88QzWcY-8qcAvU/edit

Carpeta de trabajo:

https://drive.google.com/drive/folders/186EdVMqjpiIKKcMEHltzHhUjwU98nwG0

## Apps Script

Script ID:

`1shKgVfAcXwxsjSC5EBLOtnwMRDeqhmq6c_PIi4OcGvYFrACVnD2TX9eZ`

Web App:

https://script.google.com/macros/s/AKfycbxKsIbWdW4NRuPjPBcEXpVSU6w6Ouh3ogPA_oC_0zw5Ztq--hbpemeLcgP22ExzdHW4/exec

Estado observado: el despliegue fue creado con `clasp`, pero Google respondió `403` en una prueba anónima. Para activar el formulario, abrir la URL desde la cuenta propietaria, confirmar permisos del despliegue y luego cargar esa URL como `appsScriptEndpoint` en la pestaña `config`.

## Activación del modo administración

1. Abrir el proyecto de Apps Script.
2. Configurar `ADMIN_KEY` en `Project Settings` -> `Script properties`.
3. Verificar que el Web App esté desplegado como `Execute as: Me` y `Who has access: Anyone`.
4. Entrar a `admin.html` desde la web pública.
