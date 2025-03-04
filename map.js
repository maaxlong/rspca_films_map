// MapTiler API Key
const key = "yTjHGySI1O0GBeIuFBYT";

// Initialize the map
const map = L.map("map").setView([54.00366, -2.547855], 6);

// Load MapTiler vector tiles
const mtLayer = L.maptiler.maptilerLayer({
    apiKey: key,
    style: "https://api.maptiler.com/maps/335a00a8-0f1b-475d-88a4-8cffc79b10ec/style.json"
}).addTo(map);

// Named locations
const caravanNamedLocations = ["Weymouth", "Leicester", "Poole", "Salisbury",
    "Southampton", "Petersfield", "Cheltenham", "Aylesbury", "Kettering"];
const cinemaNamedLocations = ["Swansea", "St Davids", "Haverfordwest",
    "Cardiff", "Newport", "Knighton", "Llanon"];

/**
 * Simple heuristic to pick label direction (top, bottom, left, right)
 * based on how the current point compares to the previous point.
 */
function getDirection(currentLatLng, previousLatLng) {
    if (!previousLatLng) return "right"; // default for first label
    const latDiff = currentLatLng.lat - previousLatLng.lat;
    const lngDiff = currentLatLng.lng - previousLatLng.lng;

    // If latitude difference is bigger, go top/bottom; otherwise left/right
    if (Math.abs(latDiff) > Math.abs(lngDiff)) {
        return latDiff > 0 ? "top" : "bottom";
    } else {
        return lngDiff > 0 ? "right" : "left";
    }
}

/**
 * Offsets in pixels for each direction
 */
function getOffset(direction) {
    // Adjust these to taste
    switch (direction) {
        case "top":    return [0, -10];
        case "bottom": return [0,  10];
        case "left":   return [-10, 0];
        default:       // right
            return [10, 0];
    }
}

/**
 * Loads a GeoJSON file and:
 *  1) Draws lines/polygons with a style
 *  2) Draws point features as:
 *     - Circle markers with numbered tooltips
 *     - Optionally, a separate label marker for certain names
 */
function loadGeoJSONWithLabels(url, layerOptions, isCinema) {
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load ${url}, HTTP status ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            let count = 1;
            let previousLatLng = null;

            // 1) Draw lines/polygons with the given style
            L.geoJSON(data, {
                filter: f => f.geometry.type !== "Point",
                style: layerOptions.style
            }).addTo(map);

            // 2) Draw point features
            L.geoJSON(data, {
                filter: f => f.geometry.type === "Point",
                pointToLayer: (feature, latlng) => {
                    // Create circle marker for numbering
                    const circle = L.circleMarker(latlng, {
                        radius: 8,
                        fillColor: isCinema ? "blue" : "red",
                        color: "#000",
                        weight: 1,
                        opacity: 1,
                        fillOpacity: 0.8
                    }).addTo(map);

                    // Bind a permanent tooltip for the number
                    circle.bindTooltip(`${count++}`, {
                        permanent: true,
                        direction: "center",
                        className: "custom-label"
                    }).openTooltip();

                    // If location name is in our list, place a label
                    if (feature.properties && feature.properties.name) {
                        const name = feature.properties.name;
                        const isLabelCinema = isCinema && cinemaNamedLocations.includes(name);
                        const isLabelCaravan = !isCinema && caravanNamedLocations.includes(name);

                        if (isLabelCinema || isLabelCaravan) {
                            // Choose direction based on previous point
                            const dir = getDirection(latlng, previousLatLng);
                            previousLatLng = latlng;

                            // Create invisible icon for the label marker
                            const invisibleIcon = L.divIcon({
                                className: "empty-icon",
                                html: ""
                            });

                            // Place the label marker right on the same point
                            const labelMarker = L.marker(latlng, {
                                icon: invisibleIcon,
                                interactive: false
                            }).addTo(map);

                            // Bind a permanent tooltip for the name, with an offset
                            labelMarker.bindTooltip(name, {
                                permanent: true,
                                direction: dir,
                                className: "custom-location-label",
                                offset: getOffset(dir)
                            }).openTooltip();
                        }
                    }
                    return circle;
                }
            }).addTo(map);

            console.log(`Loaded ${url} with numbering & custom label placement`);
        })
        .catch(error => console.error("Error loading " + url, error));
}

// Styles
const cinemaLineStyle = { style: { color: "blue", weight: 2 } };
const caravanLineStyle = { style: { color: "red", weight: 2 } };

// Load data
loadGeoJSONWithLabels(
    "https://raw.githubusercontent.com/maaxlong/rspca_films_map/refs/heads/main/data/cinema_1931.geojson",
    cinemaLineStyle,
    true
);
loadGeoJSONWithLabels(
    "https://raw.githubusercontent.com/maaxlong/rspca_films_map/refs/heads/main/data/cinema_route.geojson",
    cinemaLineStyle,
    true
);
loadGeoJSONWithLabels(
    "https://raw.githubusercontent.com/maaxlong/rspca_films_map/refs/heads/main/data/caravan_1931.geojson",
    caravanLineStyle,
    false
);
loadGeoJSONWithLabels(
    "https://raw.githubusercontent.com/maaxlong/rspca_films_map/refs/heads/main/data/caravan_route.geojson",
    caravanLineStyle,
    false
);
