# AnimeLatam

Addon comunitario para **Stremio** enfocado en encontrar enlaces de anime identificados como **audio español latino**.

AnimeLatam consulta automáticamente sus fuentes compatibles cuando Stremio solicita streams. No incluye catálogos propios de búsqueda, géneros ni listados de anime en emisión: su función principal es proporcionar enlaces de reproducción para títulos compatibles.

## Instalar en Stremio

- **Página de configuración:** [https://anine-latam.vercel.app/configure](https://anine-latam.vercel.app/configure)
- **Manifest:** [https://anine-latam.vercel.app/manifest.json](https://anine-latam.vercel.app/manifest.json)

En la página de configuración encontrarás:

1. **Agregar a Stremio:** abre el enlace de instalación del addon en Stremio.
2. **Copiar manifest:** copia la dirección del manifiesto para instalarlo manualmente o pegarla en Stremio.
3. La dirección del manifest, para que puedas consultarla y copiarla cuando lo necesites.

## Fuentes de reproducción

AnimeLatam consulta automáticamente estas plataformas:

- [AnimeAV1](https://animeav1.com)
- [Henaojara](https://ww1.henaojara.net)
- [Latanime](https://latanime.org)

No es necesario seleccionar proveedores: el addon realiza las consultas a las fuentes habilitadas.

## Audio español latino

Los resultados se filtran para priorizar exclusivamente fuentes que el proveedor identifica como doblaje latino. Cuando están disponibles, se utilizan indicadores como `dub: true` y `dubLang: "lat"`.

La disponibilidad puede variar según el anime, el episodio y cada plataforma. El filtro depende de los datos proporcionados por los sitios de origen y no representa una verificación manual de cada reproducción.

## Recursos del addon

El manifiesto de AnimeLatam expone los recursos de **streams** y **metadatos** para los tipos de contenido compatibles. No publica catálogos propios (`catalogs: []`).

## Créditos y proyecto original

AnimeLatam es una adaptación independiente basada en el proyecto original:

- **[AnimES Stremio addon](https://github.com/Pigamer37/animeflv-stremio-addon)**

Se conserva la licencia MIT y los avisos de copyright correspondientes al proyecto base. Esta adaptación incorpora modificaciones propias, entre ellas el enfoque en fuentes de reproducción identificadas como audio español latino y una página de configuración simplificada.

## Aviso legal

AnimeLatam es un proyecto comunitario e independiente. No está afiliado, patrocinado ni respaldado por Stremio, AnimeAV1, Henaojara, Latanime ni otros sitios externos. Los nombres y marcas pertenecen a sus respectivos propietarios. La disponibilidad y el funcionamiento de las fuentes dependen de servicios de terceros.
