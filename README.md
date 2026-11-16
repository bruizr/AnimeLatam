# AnimeLatam

Addon comunitario para **Stremio** enfocado en anime. Reúne catálogos, búsquedas, metadatos y fuentes disponibles a través de los proveedores compatibles.

> **Aviso:** AnimeLatam es un proyecto independiente y no está afiliado, patrocinado ni respaldado por AnimeAV1, Henaojara, TioAnime o Latanime. La disponibilidad de los sitios y sus contenidos puede cambiar.

## Proveedores

- AnimeAV1
- Henaojara
- TioAnime
- Latanime

La disponibilidad de catálogos, metadatos y streams depende del funcionamiento de cada proveedor.

## Funciones

- Búsqueda de anime desde Stremio.
- Catálogos por género.
- Catálogos de anime en emisión cuando el servidor y el proveedor lo permiten.
- Consulta de metadatos y episodios.
- Integración de fuentes de reproducción compatibles.

## Instalación

Cuando el servicio esté publicado, abre la dirección del manifiesto en Stremio:

```
https://TU-DOMINIO/manifest.json
```

También puedes pegar esa dirección en la opción **Add addon** de Stremio. Sustituye `TU-DOMINIO` por el dominio real donde esté alojado el addon.

## Ejecución local

Requisitos: Node.js y npm.

```bash
npm install
npm start
```

El servidor se inicia en el puerto definido por la variable `PORT` o, por defecto, en el puerto `3000`. El manifiesto estará disponible en:

```
http://localhost:3000/manifest.json
```

Para desarrollo con reinicio automático:

```bash
npm install --include=dev
npm run devStart
```

## Estructura general

- `index.js`: aplicación Express y manifiesto de Stremio.
- `routes/`: rutas de catálogo, metadatos y streams.
- `lib/`: utilidades y lógica compartida.
- `views/`: páginas de configuración.
- `public/`: archivos estáticos.

## Desarrollo y contribuciones

Los cambios y reportes pueden gestionarse desde [Issues](https://github.com/bruizr/AnimeLatam/issues) y [Pull requests](https://github.com/bruizr/AnimeLatam/pulls).

## Licencia

Este proyecto conserva la licencia MIT indicada por el código base. Revisa las licencias y condiciones de los proveedores externos antes de redistribuir o utilizar sus servicios.
