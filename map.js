// MapTiler API Key
const key = "yTjHGySI1O0GBeIuFBYT";

// Initialize the map centered on the United Kingdom
const map = L.map("map").setView([54.00366, -2.547855], 6);

// Load MapTiler vector tiles
const mtLayer = L.maptiler.maptilerLayer({
    apiKey: key,
    style: "https://api.maptiler.com/maps/335a00a8-0f1b-475d-88a4-8cffc79b10ec/style.json"
}).addTo(map);

// Lists of locations where names should be displayed
const caravanNamedLocations = ["Weymouth", "Leicester", "Poole", "Salisbury", "Southampton", "Petersfield", "Cheltenham", "Aylesbury", "Kettering"];
const cinemaNamedLocations = ["St Davids", "Haverfordwest", "Cardiff", "Newport", "Knighton", "Llanon", "Swansea"];

// Function to load GeoJSON with numbered markers & labels
function loadGeoJSONWithLabels(url, layerOptions, isCinema) {
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load ${url}, HTTP status ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            let count = 1; // Start numbering from 1

            // **Ensure lines are added to the map**
            L.geoJSON(data, layerOptions).addTo(map);

            L.geoJSON(data, {
                pointToLayer: function (feature, latlng) {
                    const marker = L.circleMarker(latlng, {
                        radius: 8,
                        fillColor: isCinema ? "blue" : "red", // Blue for cinema, red for caravan
                        color: "#000",
                        weight: 1,
                        opacity: 1,
                        fillOpacity: 0.8
                    }).addTo(map);

                    // Add number inside the dot
                    marker.bindTooltip(
                        `${count++}`, // ✅ Keep number inside the dot
                        { 
                            permanent: true,
                            direction: "center",
                            className: "custom-label"
                        }
                    );

                    // Check if the feature has a name and if it's in the list to be displayed
                    if (feature.properties && feature.properties.name) {
                        const locationName = feature.properties.name;
                        if (
                            (isCinema && cinemaNamedLocations.includes(locationName)) ||
                            (!isCinema && caravanNamedLocations.includes(locationName))
                        ) {
                            // Create a separate div icon for the label, positioned beside the marker
                            const label = L.divIcon({
                                className: "custom-location-label",
                                html: locationName,
                                iconSize: [80, 20], // Width x Height of the label box
                                iconAnchor: [-10, 10] // Position to the left of the marker
                            });

                            // Place the label at an offset from the point
                            L.marker([latlng.lat, latlng.lng], { icon: label }).addTo(map);
                        }
                    }

                    return marker;
                }
            }).addTo(map);
            console.log(`Loaded ${url} successfully with numbering and labels`);
        })
        .catch(error => console.error("Error loading " + url, error));
}

// Line styles
const cinemaLineStyle = { style: { color: "blue", weight: 2 } };
const caravanLineStyle = { style: { color: "red", weight: 2 } };

// Load GeoJSON files with numbering and labels
loadGeoJSONWithLabels("data/cinema_1931.geojson", cinemaLineStyle, true);
loadGeoJSONWithLabels("data/cinema_route.geojson", cinemaLineStyle, true);

loadGeoJSONWithLabels("data/caravan_1931.geojson", caravanLineStyle, false);
loadGeoJSONWithLabels("data/caravan_route.geojson", caravanLineStyle, false);
