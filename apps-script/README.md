# Apps Script API

Este directorio contiene el Web App que recibe registros del formulario y puede exponer los datos públicos de la planilla.

## Despliegue con clasp

```powershell
clasp create --type standalone --title "Alfabetizacion Estadistica Paraguay API" --rootDir apps-script
clasp push
clasp deploy -d "API inicial para alfabetizacionestadisticapy.com"
```

Después del despliegue, copiá la URL del Web App en:

- `assets/js/config.js`, clave `appsScriptEndpoint`
- pestaña `config` de la planilla, fila `appsScriptEndpoint`

El sitio lee listas desde la planilla y envía nuevos registros a la pestaña `registros`.

## Clave administrativa

El panel `admin.html` requiere que el proyecto de Apps Script tenga una propiedad de script:

- Nombre: `ADMIN_KEY`
- Valor: una clave fuerte compartida solo con administradores

En Apps Script: `Project Settings` -> `Script properties` -> `Add script property`.

Con esa clave, el Web App puede:

- editar filas publicables de `noticias`, `eventos`, `recursos`, `aliados`, `foro`, `indicadores` y `config`
- subir archivos al Drive del proyecto
- registrar acciones en `admin_log`

## Despliegue creado

- Script ID: `1shKgVfAcXwxsjSC5EBLOtnwMRDeqhmq6c_PIi4OcGvYFrACVnD2TX9eZ`
- Web App: `https://script.google.com/macros/s/AKfycbxKsIbWdW4NRuPjPBcEXpVSU6w6Ouh3ogPA_oC_0zw5Ztq--hbpemeLcgP22ExzdHW4/exec`

Si Google devuelve `403`, abrí la URL desde la cuenta propietaria y revisá en Apps Script que el despliegue esté como `Execute as: Me` y `Who has access: Anyone`.
