mapboxgl.accessToken = mapToken;
///turns JSON String into JS object so we can use properties

const map = new mapboxgl.Map({
container: 'showMap', // container ID
style: 'mapbox://styles/mapbox/streets-v11', // style URL
center: campgrounds.geometry.coordinates, // starting position [lng, lat]
zoom: 10, // starting zoom
projection: 'globe' // display the map as a 3D globe
});
map.addControl(new mapboxgl.NavigationControl());

map.on('style.load', () => {
map.setFog({}); // Set the default atmosphere style
});
console.log(campgrounds.geometry.coordinates)
new mapboxgl.Marker()
    .setLngLat(campgrounds.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({offset:25})
            .setHTML(
                `<h2>${campgrounds.title}</h2><p>${campgrounds.location}</p>`
            )
    )
    .addTo(map)