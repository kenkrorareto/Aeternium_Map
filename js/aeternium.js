// Variables globales
var map;
var currentImageOverlay;
var currentMarkers = [];
var currentPolylines = [];

// Configuración de mapas
var mapConfigs = {
    aeternium: {
        image: 'images/Aeternium.jpg',
        bounds: [[0, 0], [4500, 6000]],
        center: [2250, 3000],
        data: 'Aeternium.json'
    },
    caenanis: {
        image: 'images/Caenanis.jpg',
        bounds: [[0, 0], [4500, 6000]], // Ajusta estos valores según las dimensiones reales de tu imagen
        center: [2250, 3000], // Ajusta según el centro de tu imagen
        data: 'Caenanis.json'
    }
};

// Inicializar el mapa
function initMap() {
    map = L.map('map', {
        crs: L.CRS.Simple,
        minZoom: -3,
        maxZoom: 1,
        zoomDelta: 0.5,
        zoomSnap: 0.5
    });

    // Cargar el mapa inicial
    loadMap('aeternium');

    // Configurar eventos de los botones
    document.getElementById('aeternium-btn').addEventListener('click', function () {
        loadMap('aeternium');
        updateButtonState('aeternium');
    });

    document.getElementById('caenanis-btn').addEventListener('click', function () {
        loadMap('caenanis');
        updateButtonState('caenanis');
    });
}

// Cargar un mapa específico
function loadMap(mapName) {
    var config = mapConfigs[mapName];

    // Limpiar marcadores y polilíneas existentes
    clearMarkers();
    clearPolylines();

    // Remover imagen actual si existe
    if (currentImageOverlay) {
        map.removeLayer(currentImageOverlay);
    }

    // Añadir nueva imagen
    currentImageOverlay = L.imageOverlay(config.image, config.bounds).addTo(map);

    // Ajustar vista
    map.setView(config.center);
    map.fitBounds(config.bounds);
    map.setMaxBounds(config.bounds);

    // Cargar datos del mapa
    fetch(config.data)
        .then(response => response.json())
        .then(data => {
            if (Array.isArray(data.points)) {
                data.points.forEach(function (marker) {
                    var latLng = [marker.loc[0], marker.loc[1]];
                    var ciudadIcon = L.icon({
                        iconUrl: 'images/CiudadGrande.png',
                        iconSize: [50, 50]
                    });
                    var leafletMarker = L.marker(latLng, { icon: ciudadIcon }).addTo(map);
                    currentMarkers.push(leafletMarker);

                    // Set the tooltip to show the content of the `link` field
                    if (marker.tooltip === "hover") {
                        leafletMarker.bindTooltip(marker.link, {
                            permanent: false,
                            direction: 'auto'
                        });
                    }
                });
            } else {
                console.error('Data is not an array:', data);
            }

            if (Array.isArray(data.lines)) {
                data.lines.forEach(function (line) {
                    var linePoints = [line.start, line.end];
                    var polyline = L.polyline(linePoints, {
                        color: line.color || 'black',
                        weight: line.weight || 3,
                        opacity: line.opacity || 1.0,
                        dashArray: '5, 10'
                    }).addTo(map);
                    currentPolylines.push(polyline);
                });
            } else {
                console.error('Lines data is not an array:', data.lines);
            }
        })
        .catch(error => console.error('Error loading marker data:', error));
}

// Limpiar marcadores
function clearMarkers() {
    currentMarkers.forEach(function (marker) {
        map.removeLayer(marker);
    });
    currentMarkers = [];
}

// Limpiar polilíneas
function clearPolylines() {
    currentPolylines.forEach(function (polyline) {
        map.removeLayer(polyline);
    });
    currentPolylines = [];
}

// Actualizar estado de los botones
function updateButtonState(activeMap) {
    document.getElementById('aeternium-btn').classList.toggle('active', activeMap === 'aeternium');
    document.getElementById('caenanis-btn').classList.toggle('active', activeMap === 'caenanis');
}

// Inicializar el mapa cuando se carga la página
document.addEventListener('DOMContentLoaded', initMap);