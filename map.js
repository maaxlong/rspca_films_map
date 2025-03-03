// MapTiler API Key
const key = "yTjHGySI1O0GBeIuFBYT";

// Initialize the map centered on the United Kingdom
const map = L.map("map").setView([54.00366, -2.547855], 6);

// Load MapTiler vector tiles
const mtLayer = L.maptiler.maptilerLayer({
    apiKey: key,
    style: "https://api.maptiler.com/maps/335a00a8-0f1b-475d-88a4-8cffc79b10ec/style.json"
}).addTo(map);

// Function to load and display GeoJSON files with numbered markers
function loadGeoJSONWithNumbers(url, layerOptions, isCinema) {
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load ${url}, HTTP status ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            let count = 1; // Start numbering from 1
            L.geoJSON(data, {
                pointToLayer: function (feature, latlng) {
                    return L.circleMarker(latlng, {
                        radius: 8,
                        fillColor: isCinema ? "blue" : "red", // Blue for cinema, red for caravan
                        color: "#000",
                        weight: 1,
                        opacity: 1,
                        fillOpacity: 0.8
                    }).bindTooltip(count++, { // Increment counter for each point
                        permanent: true,
                        direction: "center",
                        className: "custom-label" // Custom CSS styling for numbering
                    });
                },
                style: layerOptions.style || {} // Apply styles if available
            }).addTo(map);
            console.log(`Loaded ${url} successfully with numbering`);
        })
        .catch(error => console.error("Error loading " + url, error));
}

// Line styles
const cinemaLineStyle = { style: { color: "blue", weight: 2 } };
const caravanLineStyle = { style: { color: "red", weight: 2 } };

// Load GeoJSON files with numbering
loadGeoJSONWithNumbers("data/cinema_march.geojson", cinemaLineStyle, true);
loadGeoJSONWithNumbers("data/cinema_april.geojson", cinemaLineStyle, true);
loadGeoJSONWithNumbers("data/cinema_route.geojson", cinemaLineStyle, true);

loadGeoJSONWithNumbers("data/caravan_march.geojson", caravanLineStyle, false);
loadGeoJSONWithNumbers("data/caravan_april.geojson", caravanLineStyle, false);
loadGeoJSONWithNumbers("data/caravan_route.geojson", caravanLineStyle, false);
