import type { StyleSpecification } from "maplibre-gl";

/**
 * Детальная подложка улиц через растровые тайлы OpenStreetMap.
 * Для продакшена лучше свой тайл-сервер или коммерческий провайдер по политике нагрузки OSM.
 */
export const osmStreetStyle: StyleSpecification = {
  version: 8,
  name: "OSM Raster",
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>'
    }
  },
  layers: [
    {
      id: "osm",
      type: "raster",
      source: "osm",
      minzoom: 0,
      maxzoom: 19
    }
  ]
};
