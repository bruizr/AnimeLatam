# AnimeLatam

Addon comunitario para **Stremio** enfocado en anime con fuentes de reproducción identificadas como **audio español latino**.

AnimeLatam es una adaptación independiente basada en el proyecto original **AnimES Stremio addon**. Se mantienen la licencia MIT y los avisos de copyright correspondientes al proyecto base.

> **Importante:** AnimeLatam no está afiliado, patrocinado ni respaldado por Stremio, AnimeAV1, Henaojara, Latanime ni otros sitios externos. Los nombres y marcas pertenecen a sus respectivos propietarios. La disponibilidad y el funcionamiento de las fuentes dependen de servicios de terceros.

## Créditos y proyecto original

Este repositorio es un fork/adaptación del trabajo de:

- **Proyecto original:** [Pigamer37/animeflv-stremio-addon](https://github.com/Pigamer37/animeflv-stremio-addon)
- **Nombre original:** AnimES Stremio addon
- **Licencia original:** MIT

Este repositorio conserva la base del addon original, incluyendo la integración con Stremio, la estructura de catálogos, metadatos y streams. AnimeLatam añade modificaciones propias, entre ellas el enfoque en fuentes con audio español latino y la selección de proveedores activos.

## Proveedores y fuentes

Los proveedores de catálogo y metadatos actualmente habilitados son:

- **AnimeAV1**
- **Henaojara**
- **Latanime**

Las fuentes de reproducción se filtran para mostrar únicamente resultados identificados por el proveedor como doblaje latino (`dub: true` y `dubLang: "lat"`) cuando esos datos están disponibles.

La disponibilidad de audio latino puede variar según el título, episodio y proveedor. El filtro depende de la información que entregan los sitios de origen; por tanto, no constituye una verificación manual del contenido de cada video.

Los proveedores que no están activos en la configuración actual no se anuncian ni se utilizan en los catálogos principales.

## Funciones

- Búsqueda de anime desde Stremio.
- Catálogos por género.
- Catálogos de anime en emisión cuando el proveedor lo permite.
- Consulta de metadatos y listas de episodios.
- Fuentes de reproducción filtradas por identificación de audio español latino.
- Compatibilidad con identificadores externos admitidos por el addon y sus servicios de metadatos.

## Instalación en Stremio

Puedes instalar AnimeLatam desde el manifiesto:

**[https://anine-latam.vercel.app/manifest.json](https://anine-latam.vercel.app/manifest.json)**

Copia la dirección y pégala en la opción **Add addon / Añadir complemento** de Stremio.

Página del proyecto: [https://anine-latam.vercel.app/](https://anine-latam.vercel.app/)

## Ejecución local

Requisitos: Node.js y npm.

1. Clona este repositorio y entra en la carpeta del proyecto.
2. Instala las dependencias:

   ```bash
   npm install
   ```

3. Si vas a utilizar funciones que requieren credenciales de TMDB, crea un archivo `.env` en la raíz del proyecto y configura las variables necesarias:

   ```env
   TMDB_API_READ_TOKEN=tu_token_de_lectura
   TMDB_API_KEY=tu_api_key
   ```

4. Inicia el servidor:

   ```bash
   npm start
   ```

El servidor utiliza el puerto indicado por la variable `PORT` o, por defecto, el puerto `3000`. El manifiesto local estará disponible en:

```
http://localhost:3000/manifest.json
```

Para desarrollo con reinicio automático:

```bash
npm install --include=dev
npm run devStart
```

No publiques credenciales ni tokens en el repositorio. Mantén el archivo `.env` fuera del control de versiones.

## Estructura general

- `index.js`: aplicación Express y manifiesto de Stremio.
- `routes/`: rutas de catálogos, metadatos y streams.
- `lib/`: utilidades y lógica compartida, incluido el filtrado de fuentes.
- `views/`: páginas de configuración.
- `public/`: archivos estáticos.

## Desarrollo y contribuciones

Los reportes de errores y propuestas de mejora pueden compartirse mediante [Issues](https://github.com/bruizr/AnimeLatam/issues). Las contribuciones pueden enviarse mediante [Pull requests](https://github.com/bruizr/AnimeLatam/pulls).

Al contribuir, respeta la licencia del proyecto original y los avisos de copyright correspondientes.

## Licencia

Este proyecto se distribuye bajo la **Licencia MIT**. Se conserva el aviso de copyright incluido en la licencia del código base original. Consulta el archivo [LICENSE](LICENSE) para leer el texto completo de la licencia. Las modificaciones realizadas para AnimeLatam no eliminan ni sustituyen los avisos legales originales.
