# Modelo de datos

La planilla `registros_pagina_web` funciona como CMS simple para la web.

## Pestañas

- `config`: valores generales del sitio.
- `indicadores`: métricas destacadas del inicio.
- `noticias`: novedades y avances.
- `eventos`: agenda de actividades.
- `recursos`: materiales, talleres y enlaces.
- `aliados`: instituciones, sponsors y prospectos.
- `galeria`: imágenes o assets usados en el sitio.
- `foro`: novedades, avisos y publicaciones breves de la comunidad.
- `registros`: formularios recibidos desde la web.
- `admin_log`: auditoría de acciones ejecutadas desde el panel.

## Publicación

Para lectura pública desde el navegador, la planilla debe estar compartida o publicada de forma que el endpoint CSV de Google Sheets sea accesible. Si no está disponible, el sitio usa datos locales de respaldo incluidos en `assets/js/data.js`.

Para escritura, se usa el Web App de Apps Script incluido en `apps-script/`.

## Administración

El panel `admin.html` usa la clave `ADMIN_KEY` configurada en Apps Script. Las ediciones se escriben en la planilla y los archivos se suben a la carpeta Drive del proyecto.
