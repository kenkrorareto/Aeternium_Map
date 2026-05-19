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
                // Icono de ciudad: perfil de torres almenadas (SVG nítido y escalable)
                var cityIcon = L.divIcon({
                    className: 'city-marker',
                    html: '<svg xmlns="http://www.w3.org/2000/svg" width="34" height="32" viewBox="0 0 34 32">' +
                        '<path d="M2,29 L2,21 L4,21 L4,10 L6.5,10 L6.5,12 L8.5,12 L8.5,10 L11,10 L11,21 ' +
                        'L13,21 L13,4 L16,4 L16,6 L18,6 L18,4 L21,4 L21,21 L23,21 L23,13 L25.5,13 ' +
                        'L25.5,15 L27.5,15 L27.5,13 L30,13 L30,21 L32,21 L32,29 Z" ' +
                        'fill="#e8b54a" stroke="#2a0730" stroke-width="1.5" stroke-linejoin="round"/>' +
                        '<path d="M14.5,29 L14.5,25 Q17,21.5 19.5,25 L19.5,29 Z" fill="#2a0730"/>' +
                        '<rect x="6.6" y="15" width="2.2" height="2.6" fill="#2a0730"/>' +
                        '<rect x="15.9" y="10" width="2.2" height="2.6" fill="#2a0730"/>' +
                        '<rect x="25.3" y="17" width="2.2" height="2.6" fill="#2a0730"/></svg>',
                    iconSize: [34, 32],
                    iconAnchor: [17, 29],
                    tooltipAnchor: [0, -25]
                });

                data.points.forEach(function (marker) {
                    var latLng = [marker.loc[0], marker.loc[1]];
                    var leafletMarker = L.marker(latLng, { icon: cityIcon }).addTo(map);
                    currentMarkers.push(leafletMarker);

                    // Nombre de la ciudad: solo al pasar el ratón (no tapa el mapa)
                    if (marker.link) {
                        leafletMarker.bindTooltip(marker.link, {
                            permanent: false,
                            direction: 'top',
                            className: 'city-label',
                            offset: [0, 0]
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