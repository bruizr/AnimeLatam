# AnimeLatam

Addon comunitario para **Stremio** enfocado en anime con fuentes de reproducción identificadas como **audio español latino**.

AnimeLatam es una adaptación independiente basada en el proyecto original **AnimES Stremio addon**. Se mantienen la licencia MIT y los avisos de copyright correspondientes al proyecto base.

> **Importante:** AnimeLatam no está afiliado, patrocinado ni respaldado por Stremio, AnimeAV1, Henaojara, Latanime ni otros sitios externos. Los nombres y marcas pertenecen a sus respectivos propietarios. La disponibilidad y el funcionamiento de las fuentes dependen de servicios de terceros.

## Créditos y proyecto original

Este repositorio es un fork/adaptación del trabajo de:

- **Proyecto original:** [Pigamer37/animeflv-stremio-addon](https://github.com/Pigamer37/animeflv-stremio-addon)
- **Nombre original:** AnimES Stremio addon
- **Licencia original:** MIT

Este repositorio conserva la base del addon original, incluyendo la integración con Stremio, la estructura de catálogos, metadatos y streams. AnimeLatam añade modificaciones propias, entre ellas el enfoque en fuentes con audio español latino y la configuración de catálogos.

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
