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

## Despliegue creado

- Script ID: `1shKgVfAcXwxsjSC5EBLOtnwMRDeqhmq6c_PIi4OcGvYFrACVnD2TX9eZ`
- Web App: `https://script.google.com/macros/s/AKfycbzP5Q5wV-_s-XWFcrfRD9cSazdfmH1ZppDiwkbNIT29Q2gzGnRejiuyO8NkUbu8Tigh/exec`

Si Google devuelve `403`, abrí la URL desde la cuenta propietaria y revisá en Apps Script que el despliegue esté como `Execute as: Me` y `Who has access: Anyone`.
