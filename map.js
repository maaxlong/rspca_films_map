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

// Function to determine optimal label placement (avoiding interference)
function getOptimalLabelDirection(latlng, previousLatlng) {
    if (!previousLatlng) return "right"; // Default if first point
    return latlng.lng > previousLatlng.lng ? "right" : "left"; // Adjust dynamically
}

// Function to load GeoJSON with numbered markers & dynamically placed labels
function loadGeoJSONWithLabels(url, layerOptions, isCinema) {
    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error(`Failed to load ${url}, HTTP status ${response.status}`);
            return response.json();
        })
        .then(data => {
            let count = 1;
            let previousLatlng = null;

            // **Ensure lines are added to the map**
            L.geoJSON(data, {
                style: layerOptions.style // **Ensures correct color for lines**
            }).addTo(map);

            L.geoJSON(data, {
                pointToLayer: function (feature, latlng) {
                    // Create a circle marker (fixes issue of blue pin markers)
                    const marker = L.circleMarker(latlng, {
                        radius: 8,
                        fillColor: isCinema ? "blue" : "red", // Cinema = blue, Caravan = red
                        color: "#000",
                        weight: 1,
                        opacity: 1,
                        fillOpacity: 0.8
                    }).addTo(map);

                    // Add number inside the dot (ensures numbering is always present)
                    marker.bindTooltip(
                        `${count++}`,  
                        { 
                            permanent: true,
                            direction: "center",
                            className: "custom-label"
                        }
                    ).openTooltip(); // **Ensures numbering stays visible**

                    // Handle location labels (ensures numbering is not removed)
                    if (feature.properties && feature.properties.name) {
                        const locationName = feature.properties.name;
                        if (
                            (isCinema && cinemaNamedLocations.includes(locationName)) ||
                            (!isCinema && caravanNamedLocations.includes(locationName))
                        ) {
                            // Determine best label placement dynamically
                            const optimalDirection = getOptimalLabelDirection(latlng, previousLatlng);
                            previousLatlng = latlng; // Update previous point

                            L.tooltip({
                                permanent: true,
                                direction: optimalDirection, 
                                className: "custom-location-label",
                                offset: optimalDirection === "left" ? [-10, 0] :
                                        optimalDirection === "right" ? [10, 0] :
                                        optimalDirection === "top" ? [0, -10] :
                                        [0, 10] // Offset for top/bottom labels
                            }).setContent(locationName).addTo(map);
                        }
                    }

                    return marker;
                }
            }).addTo(map);
            console.log(`Loaded ${url} successfully with numbering and dynamic labels`);
        })
        .catch(error => console.error("Error loading " + url, error));
}

// Line styles (fixing caravan route color issue)
const cinemaLineStyle = { style: { color: "blue", weight: 2 } };
const caravanLineStyle = { style: { color: "red", weight: 2 } };

// Load GeoJSON files with numbering and labels
loadGeoJSONWithLabels("data/cinema_1931.geojson", cinemaLineStyle, true);
loadGeoJSONWithLabels("data/cinema_route.geojson", cinemaLineStyle, true);

loadGeoJSONWithLabels("data/caravan_1931.geojson", caravanLineStyle, false);
loadGeoJSONWithLabels("data/caravan_route.geojson", caravanLineStyle, false);
