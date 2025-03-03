// Initialize the map
var map = L.map('map').setView([51.505, -0.09], 10); // Adjust coordinates and zoom as needed

// Load MapTiler vector tiles
var vectorTiles = L.maptilerVectorTileLayer({
    apiKey: "yTjHGySI1O0GBeIuFBYT",
    style: "https://api.maptiler.com/maps/335a00a8-0f1b-475d-88a4-8cffc79b10ec/style.json"
}).addTo(map);

// Function to load and display GeoJSON files
function loadGeoJSON(url, layerOptions) {
    fetch(url)
        .then(response => response.json())
        .then(data => {
            L.geoJSON(data, layerOptions).addTo(map);
        })
        .catch(error => console.error("Error loading " + url, error));
}

// Define styles for cinema (blue) and caravan (red)

// Cinema - Blue
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

// Caravan - Red
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