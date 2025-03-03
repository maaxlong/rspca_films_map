// Initialize the map
var map = L.map('map').setView([54.00366, -2.547855], 6);

// Integrate MapTiler vector tiles using MapLibre GL
L.maplibreGL({
    style: 'https://api.maptiler.com/maps/335a00a8-0f1b-475d-88a4-8cffc79b10ec/style.json?key=yTjHGySI1O0GBeIuFBYT'
}).addTo(map);

// Function to load and display GeoJSON files
function loadGeoJSON(url, layerOptions) {
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load ${url}, HTTP status ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            L.geoJSON(data, layerOptions).addTo(map);
            console.log(`Loaded ${url} successfully`);
        })
        .catch(error => console.error("Error loading " + url, error));
}

// Define styles for cinema (blue) and caravan (red)
var cinemaPointStyle = {
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, {
            radius: 5,
            fillColor: "blue",
            color: "#0000FF",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        });
    }
};

var cinemaLineStyle = {
    style: function (feature) {
        return { color: "blue", weight: 2 };
    }
};

var caravanPointStyle = {
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, {
            radius: 5,
            fillColor: "red",
            color: "#FF0000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        });
    }
};

var caravanLineStyle = {
    style: function (feature) {
        return { color: "red", weight: 2 };
    }
};

// Load GeoJSON files with appropriate styles
loadGeoJSON('data/cinema_march.geojson', cinemaPointStyle);
loadGeoJSON('data/cinema_april.geojson', cinemaPointStyle);
loadGeoJSON('data/cinema_route.geojson', cinemaLineStyle);
loadGeoJSON('data/caravan_march.geojson', caravanPointStyle);
loadGeoJSON('data/caravan_april.geojson', caravanPointStyle);
loadGeoJSON('data/caravan_route.geojson', caravanLineStyle);
