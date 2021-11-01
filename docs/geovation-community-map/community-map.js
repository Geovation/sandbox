import { addMapFeatures } from "./community-map-functions.js";
// add OS Map style
var apiKey = "";

var serviceUrl = "https://api.os.uk/maps/raster/v1/zxy";

//Create a map style object using the OS Maps API ZXY service.
var style = {
  version: 8,
  sources: {
    "raster-tiles": {
      type: "raster",
      tiles: [serviceUrl + "/Light_3857/{z}/{x}/{y}.png?key=" + apiKey],
      tileSize: 256,
      maxzoom: 15,
    },
  },
  glyphs: "assets/fonts/{fontstack}/{range}.pbf",
  layers: [
    {
      id: "os-maps-zxy",
      type: "raster",
      source: "raster-tiles",
    },
  ],
};

// Initialize the map object.
var map = new maplibregl.Map({
  container: "map",
  minZoom: 6,
  maxZoom: 15,
  style: style,
  maxBounds: [
    [-10.76418, 49.528423],
    [1.9134116, 61.331151],
  ],
  center: [-3.3557395, 54.8353492],
  zoom: 6,
});

let popup = new maplibregl.Popup({ className: "popup", offset: 25 });

addMapFeatures(map, popup);
