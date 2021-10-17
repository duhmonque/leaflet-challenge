//load the data when the page loads
window.addEventListener('load', (event) => {
    getJSONData();
});

function getJSONData(){
    //use fetch to get the data
    const pastDayAllEarthQuakesURL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson';

    //https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
    fetch(pastDayAllEarthQuakesURL)
    .then(response => response.json())
    .then(data => {
        //the actual information is kept inside data.features
        loadMap(data);
    });
}

function getRadiusByMagnitude(magnitude) {
    if (magnitude === 0){
        return 1;
    }

    return magnitude * 4;
}

function getColorByDepth(depth) {
    let color = '#e8f0ff';
    switch (true){ //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/switch
        case depth > 20:
            color = '#021942';
            break;
        case depth > 16:
            color = '#003ca6';
            break;
        case depth > 12:
            color = '#80adff';
            break;
        case depth > 8:
            color = '#abc9ff';
            break;
        case depth > 4:
            color = '#ccdeff';
            break;
    }

    return color;
}

function getBubbleStyle(item) {
    return {
        radius: getRadiusByMagnitude(item.properties.mag),
        fillColor: getColorByDepth(item.geometry.coordinates[2]),
        color: "#000000",
        weight: 0.5,
        opacity: 1,
        fillOpacity: 1,
    };
}

function onEachFeature(feature, layer) {
    var popupContent = feature.properties && feature.properties.title ? feature.properties.title : 'Earthquake data unknown';
    //let's add the coords to the popup
    popupContent += `<br> Latitude: ${feature.geometry.coordinates[0]}`;
    popupContent += `<br> Longitude: ${feature.geometry.coordinates[1]}`;
    popupContent += `<br> Depth: ${feature.geometry.coordinates[2]}`;
    layer.bindPopup(popupContent);
}

function loadMap(data) {
    //create the map
    var map = L.map('mapid').setView([39.74739, -105], 4);

    //add a map
    const mapURL = `https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=${API_KEY}`;
	L.tileLayer(mapURL, {
		maxZoom: 18,
		attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
			'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
		id: 'mapbox/light-v10',
		tileSize: 512,
		zoomOffset: -1
	}).addTo(map);

    //Using https://leafletjs.com/examples/geojson/
    L.geoJSON([data], {
		style: function (feature) {
			return feature.properties && feature.properties.style;
		},
		onEachFeature: onEachFeature,
		pointToLayer: function (feature, latlng) {
			return L.circleMarker(latlng, getBubbleStyle(feature));
		}
	}).addTo(map);

    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function(map){

        var div = L.DomUtil.create('div', 'info legend'),
            depths = [0, 4, 8, 12, 16, 20, 22],
            labels = [];

        let divHTML = '<ul>';

        // loop through our density intervals and generate a label with a colored square for each interval
        for (let i = 1; i < depths.length; i++){
            const singleDepth = depths[i];
            if (singleDepth === 0){
                continue;
            }

            if (singleDepth !== 22) {
                divHTML += `<li><i style="background-color: ${getColorByDepth(singleDepth)}"></i>Depth: ${depths[i-1]} - ${singleDepth}</li>`;
            }else {
                divHTML += `<li><i style="background-color: ${getColorByDepth(singleDepth)}"></i>Depth: 20+</li>`;
            }

        }
        divHTML += '</ul>';
        div.innerHTML = divHTML;

        return div;
    };

    legend.addTo(map);
}