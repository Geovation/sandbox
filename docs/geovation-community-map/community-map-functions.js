export { fetchData, createMarkers, addMapFeatures };

async function fetchData(data) {
  let fetchedData = await fetch(data);
  let json = await fetchedData.json();
  let features = json.features;
  return features;
}

function createHubMarkers(fetchedData, map, id) {
  if (!map.getLayer(id)) {
    map.addLayer({
      id: id,
      type: "circle",
      source: {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: fetchedData,
        },
      },
      paint: {
        "circle-color": [
          "match",
          ["get", "Company Name"],
          "Engine Shed",
          "#FBB00A",
          "Innovation Birmingham",
          "#682A72",
          "Geovation Scotland",
          "#F7A70A",
          "#E48400", // default
        ],
        "circle-radius": 20,
      },
    });
  }
}

function createCoreMarkers(fetchedData, map, id) {
  var geomationImgHeight = 50;
  var geomationImgWidth = geomationImgHeight;
  const geovationImg = new Image(geomationImgWidth, geomationImgHeight);
  const geovationImageName = "geovation-marker";
  geovationImg.onerror = console.error;
  geovationImg.src = "assets/images/geovation_logo.svg";
  geovationImg.onload = () =>
    map.addImage(geovationImageName, geovationImg, {
      pixelRatio: window.devicePixelRatio,
    });

  var osImgHeight = 25;
  var osImgWidth = (50 / 14) * osImgHeight;
  const osImg = new Image(osImgWidth, osImgHeight);
  const osImageName = "os-marker";
  osImg.onerror = console.error;
  osImg.src = "assets/images/ordnance_survey_logo.svg";
  osImg.onload = () =>
    map.addImage(osImageName, osImg, { pixelRatio: window.devicePixelRatio });

  var hmlrImgHeight = 25;
  var hmlrImgWidth = (50 / 17) * hmlrImgHeight;
  const hmlrImg = new Image(hmlrImgWidth, hmlrImgHeight);
  const hmlrImageName = "hmlr-marker";
  hmlrImg.onerror = console.error;
  hmlrImg.src = "assets/images/HMLR_logo.svg";
  hmlrImg.onload = () =>
    map.addImage(hmlrImageName, hmlrImg, {
      pixelRatio: window.devicePixelRatio,
    });

  // Creates Geovation + OS + HMLR markers
  if (!map.getLayer(id)) {
    map.addLayer({
      id: id,
      type: "symbol",
      source: {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: fetchedData,
        },
      },
      layout: {
        "icon-image": [
          "match",
          ["get", "Company Name"],
          "Geovation Hub",
          geovationImageName,
          "Ordnance Survey",
          osImageName,
          "HM Land Registry",
          hmlrImageName,
          geovationImageName,
        ],
        "icon-size": 1,
        "icon-allow-overlap": true,
      },
    });
  }
}

//Creates Partner Hub Markers, loading them on the map
function createMarkers(fetchedData, map, imageName, id, file) {
  const img = new Image(50, 50);
  img.onerror = console.error;
  img.src = file;
  img.onload = () =>
    map.addImage(imageName, img, { pixelRatio: window.devicePixelRatio });

  if (!map.getLayer(id)) {
    map.addLayer({
      id: id,
      type: "symbol",
      source: {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: fetchedData,
        },
      },
      layout: {
        "icon-image": imageName,
        "icon-size": 1,
        "icon-allow-overlap": true,
      },
    });
  }
}

// adds popup when mouse hovers over marker
function addPopup(map, marker, popup) {
  map.on("click", marker, function (e) {
    popup
      .setLngLat(e.features[0].geometry.coordinates)
      .setHTML(e.features[0].properties["Company Name"])
      .addTo(map);
    // Change the cursor to a pointer when the mouse is over the marker layer.
    map.on("mouseenter", marker, function () {
      map.getCanvas().style.cursor = "pointer";
    });

    // Change it back to a pointer when it leaves.
    map.on("mouseleave", marker, function () {
      map.getCanvas().style.cursor = "";
    });
  });
}

//toggle the checkbox to show/hide markers
function toggleInput(id, map) {
  document.getElementById(id).addEventListener("change", function (e) {
    map.setLayoutProperty(
      id,
      "visibility",
      e.target.checked ? "visible" : "none"
    );
  });
}

function countUniqueCounties(data, value) {
  let object = {};

  for (let i = 0; i < data.length; i++) {
    object[data[i]["County"]] = data[i][value];
  }
  return object;
}

// add cluster layer
function addCluster(
  map,
  sourceDataID,
  clusterLayerID,
  clusterData,
  clusterCountID,
  unclusteredPointID,
  circleColor,
  step1Color,
  step2Color,
  step3Color,
  step4Color,
  step5Color,
  step6Color,
  step7Color
) {
  map.addSource(sourceDataID, {
    type: "geojson",
    // Coordinates in longitude, latitude
    data: clusterData,
    cluster: true,
    clusterMaxZoom: 14, // Max zoom to cluster points on
    clusterRadius: 50, // Radius of each cluster when clustering points (defaults to 50)
  });

  map.addLayer({
    id: clusterLayerID,
    type: "circle",
    source: sourceDataID,
    filter: ["has", "point_count"],
    paint: {
      // Use step expressions (https://maplibre.org/maplibre-gl-js-docs/style-spec/#expressions-step)
      // with three steps to implement three types of circles:
      //   * step1Color, 20px circles when point count is less than 5
      //   * step2Color, 25px circles when point count is between 5 and 10
      //   * step3Color, 30px circles when point count is between 10 and 20
      //   * step7Color, 50px circles when point count is greater than or equal to 750
      "circle-color": [
        "step",
        ["get", "point_count"],
        step1Color,
        5,
        step2Color,
        10,
        step3Color,
        20,
        step4Color,
        50,
        step5Color,
        100,
        step6Color,
        750,
        step7Color,
      ],
      "circle-radius": [
        "step",
        ["get", "point_count"],
        20,
        5,
        25,
        10,
        30,
        20,
        35,
        50,
        40,
        100,
        45,
        750,
        50,
      ], // radius, step, radius, step...
    },
  });

  map.addLayer({
    id: clusterCountID,
    type: "symbol",
    source: sourceDataID,
    filter: ["has", "point_count"],
    layout: {
      "text-field": "{point_count_abbreviated}",
      "text-font": ["Noto Sans Regular"],
      "text-size": 12,
    },
  });

  map.addLayer({
    id: unclusteredPointID,
    type: "circle",
    source: sourceDataID,
    filter: ["!", ["has", "point_count"]],
    paint: {
      "circle-color": circleColor,
      "circle-radius": 4,
      "circle-stroke-width": 1,
      "circle-stroke-color": "#fff",
    },
  });

  // inspect a cluster on click
  map.on("click", clusterLayerID, function (e) {
    var features = map.queryRenderedFeatures(e.point, {
      layers: [clusterLayerID],
    });
    var clusterId = features[0].properties.cluster_id;
    map
      .getSource(sourceDataID)
      .getClusterExpansionZoom(clusterId, function (err, zoom) {
        if (err) return;

        map.easeTo({
          center: features[0].geometry.coordinates,
          zoom: zoom,
        });
      });
  });

  map.on("mouseenter", clusterLayerID, function () {
    map.getCanvas().style.cursor = "pointer";
  });
  map.on("mouseleave", clusterLayerID, function () {
    map.getCanvas().style.cursor = "";
  });
}

function findCountyCoordinates(countyName, countiesCentre) {
  var countyCoordinate = [];

  for (var i = 0; i < countiesCentre.length; i++) {
    if (countiesCentre[i].properties.name === countyName) {
      countyCoordinate.push(countiesCentre[i].geometry.coordinates[0]);
      countyCoordinate.push(countiesCentre[i].geometry.coordinates[1]);
    }
  }

  return countyCoordinate;
}

// create location points for cluster map
function convertToClusterPoints(startupsSupportedCount, countiesCentre) {
  var clusterData = {
    type: "FeatureCollection",
    crs: {
      type: "name",
      properties: { name: "urn:ogc:def:crs:OGC:1.3:CRS84" },
    },
    features: [],
  };

  var startupsSupportedCountKeys = Object.keys(startupsSupportedCount);
  var startupsSupportedCountValues = Object.values(startupsSupportedCount);

  for (var i = 0; i < startupsSupportedCountKeys.length; i++) {
    if (startupsSupportedCountValues[i] > 0) {
      var clusterPoint = {
        type: "Feature",
        properties: {
          name: startupsSupportedCountKeys[i].toString(),
        },
        geometry: {
          type: "Point",
          coordinates: findCountyCoordinates(
            startupsSupportedCountKeys[i],
            countiesCentre
          ),
        },
      };
      for (var k = 1; k <= startupsSupportedCountValues[i]; k++) {
        clusterData.features.push(clusterPoint);
      }
    }
  }

  return clusterData;
}

// show base map functionality
function hideLayer(
  map,
  hideLayer,
  inactiveLayer1,
  inactiveLayer2,
  inactiveLayer3,
  inactiveLayer4,
  inactiveLayer5,
  inactiveLayer6,
  inactiveLayer7,
  inactiveLayer8,
  inactiveLayer9
) {
  const LAYERS = [
    inactiveLayer1,
    inactiveLayer2,
    inactiveLayer3,
    inactiveLayer4,
    inactiveLayer5,
    inactiveLayer6,
    inactiveLayer7,
    inactiveLayer8,
    inactiveLayer9,
  ];
  document.getElementById(hideLayer).addEventListener("click", function () {
    LAYERS.map((layer) => map.setLayoutProperty(layer, "visibility", "none"));
  });
}

function toggleLegend(currentLegend, inactiveLegend1, inactiveLegend2) {
  document.getElementById(currentLegend).style.display = "block";
  document.getElementById(inactiveLegend1).style.display = "none";
  document.getElementById(inactiveLegend2).style.display = "none";
}

function toggleLayers(
  map,
  currentLayer_0,
  currentLayer_1,
  currentLayer_2,
  currentLayerLegend,
  inactiveLayer1_0,
  inactiveLayer1_1,
  inactiveLayer1_2,
  inactiveLayer2_0,
  inactiveLayer2_1,
  inactiveLayer2_2
) {
  const INACTIVE_LAYERS = [
    inactiveLayer1_0,
    inactiveLayer1_1,
    inactiveLayer1_2,
    inactiveLayer2_0,
    inactiveLayer2_1,
    inactiveLayer2_2,
  ];
  const ACTIVE_LAYERS = [currentLayer_0, currentLayer_1, currentLayer_2];
  document
    .getElementById(currentLayerLegend)
    .addEventListener("click", function () {
      INACTIVE_LAYERS.map((layer) =>
        map.setLayoutProperty(layer, "visibility", "none")
      );
      ACTIVE_LAYERS.map((layer) =>
        map.setLayoutProperty(layer, "visibility", "visible")
      );
    });
}

function hideAllLayers(map, layers) {
  layers.map((layer) => map.setLayoutProperty(layer, "visibility", "none"));
}

// add the initial features on top of the map
function addMapFeatures(map, popup) {
  map.dragRotate.disable(); // Disable map rotation using right click + drag.
  map.touchZoomRotate.disableRotation(); // Disable map rotation using touch rotation gesture.

  map.addControl(
    new maplibregl.NavigationControl({
      showCompass: false,
    })
  );

  map.on("load", async function () {
    let partnerHubs = await fetchData("assets/data_source/partner_hubs.json");
    let sponsors = await fetchData("assets/data_source/sponsors.json");
    //let stakeholders = await fetchData("assets/data_source/stakeholders.json");
    let corePartners = await fetchData("assets/data_source/core_partners.json");
    let countiesCentre = await fetchData(
      "assets/data_source/counties_centre.json"
    );

    let startupsSupported = await fetchData(
      "assets/data_source/startups_supported_counties.json"
    );
    let hubMembers = await fetchData(
      "assets/data_source/members_counties.json"
    );
    let networkConnections = await fetchData(
      "assets/data_source/network_connections_counties.json"
    );

    let startupsSupportedCount = countUniqueCounties(
      startupsSupported,
      "Startups"
    );

    let startups_supported_cluster_data = convertToClusterPoints(
      startupsSupportedCount,
      countiesCentre
    );

    addCluster(
      map,
      "startups-supported",
      "startups_supported_cluster",
      startups_supported_cluster_data,
      "startups_supported_cluster_count",
      "startups_supported_unclustered_point",
      "#7CB9E8", // Aero
      "#7CB9E8", // Aero
      "#C0E8D5", // Aero Blue
      "#EFDECD", // Almond
      "#F19CBB", // Amaranth Pink
      "#3DDC84", // Android Green
      "#FBCEB1", // Apricot
      "#7FFFD4" // Aquamarine
    );

    let hubMembersCount = countUniqueCounties(hubMembers, "Members");

    let hub_members_cluster_data = convertToClusterPoints(
      hubMembersCount,
      countiesCentre
    );

    addCluster(
      map,
      "hub_members",
      "hub_members_cluster",
      hub_members_cluster_data,
      "hub_members_cluster_count",
      "hub_members_unclustered_point",
      "#E4D00A", // Citrine
      "#E4D00A", // Citrine
      "#E9D66B", // Arylide yellow
      "#FF9966", // Atomic tangerine
      "#A1CAF1", // Baby blue eyes
      "#FF91AF", // Baker-Miller pink
      "#FAE7B5", // Banana Mania
      "#F5F5DC" // Beige
    );

    let networkConnectionsCount = countUniqueCounties(
      networkConnections,
      "Connections"
    );

    let network_connections_cluster_data = convertToClusterPoints(
      networkConnectionsCount,
      countiesCentre
    );

    addCluster(
      map,
      "network_connections",
      "network_connections_cluster",
      network_connections_cluster_data,
      "network_connections_cluster_count",
      "network_connections_unclustered_point",
      "#FFE4C4", // Bisque
      "#FFE4C4", // Bisque
      "#FE6F5E", // Bittersweet
      "#BFAFB2", // Black shadows
      "#DE5D83", // Blush
      "#D891EF", // Bright lilac
      "#5F9EA0", // Cadet Blue
      "#ACE1AF" // Celadon
    );

    createHubMarkers(partnerHubs, map, "partner-hub-markers");

    createMarkers(
      sponsors,
      map,
      "sponsor-markers",
      "sponsor-markers",
      "assets/images/sponsors_marker.svg"
    );

    createCoreMarkers(corePartners, map, "core-partner-markers");

    hideAllLayers(map, [
      "startups_supported_cluster",
      "startups_supported_cluster_count",
      "startups_supported_unclustered_point",
      "hub_members_cluster",
      "hub_members_cluster_count",
      "hub_members_unclustered_point",
      "network_connections_cluster",
      "network_connections_cluster_count",
      "network_connections_unclustered_point",
      "partner-hub-markers",
      "sponsor-markers",
      "core-partner-markers",
    ]);
  });

  toggleInput("partner-hub-markers", map);
  toggleInput("sponsor-markers", map);
  toggleInput("core-partner-markers", map);

  toggleLayers(
    map,
    "startups_supported_cluster",
    "startups_supported_cluster_count",
    "startups_supported_unclustered_point",
    "startups-supported",
    "hub_members_cluster",
    "hub_members_cluster_count",
    "hub_members_unclustered_point",
    "network_connections_cluster",
    "network_connections_cluster_count",
    "network_connections_unclustered_point"
  );

  toggleLayers(
    map,
    "hub_members_cluster",
    "hub_members_cluster_count",
    "hub_members_unclustered_point",
    "hub-members",
    "startups_supported_cluster",
    "startups_supported_cluster_count",
    "startups_supported_unclustered_point",
    "network_connections_cluster",
    "network_connections_cluster_count",
    "network_connections_unclustered_point"
  );

  toggleLayers(
    map,
    "network_connections_cluster",
    "network_connections_cluster_count",
    "network_connections_unclustered_point",
    "network-connections",
    "startups_supported_cluster",
    "startups_supported_cluster_count",
    "startups_supported_unclustered_point",
    "hub_members_cluster",
    "hub_members_cluster_count",
    "hub_members_unclustered_point"
  );

  hideLayer(
    map,
    "show_basemap",
    "startups_supported_cluster",
    "startups_supported_cluster_count",
    "startups_supported_unclustered_point",
    "hub_members_cluster",
    "hub_members_cluster_count",
    "hub_members_unclustered_point",
    "network_connections_cluster",
    "network_connections_cluster_count",
    "network_connections_unclustered_point"
  );

  addPopup(map, "partner-hub-markers", popup);
  addPopup(map, "sponsor-markers", popup);
  addPopup(map, "core-partner-markers", popup);
}
