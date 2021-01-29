mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
container: 'map',
style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location
center: action.geometry.coordinates, // starting position [lng, lat]
zoom: 10 // starting zoom
});

map.addControl(new mapboxgl.NavigationControl());




new mapboxgl.Marker()
.setLngLat(action.geometry.coordinates)
.setPopup(
    new mapboxgl.Popup({offset:25,closeButton: false,closeOnClick: false})
    
    .setHTML(
        `<h6>Action:${action.title}</h6><h6>Location:${action.place}</h6>`
    )

)
.addTo(map)
