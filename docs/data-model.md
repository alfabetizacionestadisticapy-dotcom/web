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
- `registros`: formularios recibidos desde la web.

## Publicación

Para lectura pública desde el navegador, la planilla debe estar compartida o publicada de forma que el endpoint CSV de Google Sheets sea accesible. Si no está disponible, el sitio usa datos locales de respaldo incluidos en `assets/js/data.js`.

Para escritura, se usa el Web App de Apps Script incluido en `apps-script/`.
