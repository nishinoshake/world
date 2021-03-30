!(function() {
  const DEFAULT_ZOOM = 4
  const DEFAULT_SCALE = 0.1
  const CENTER_LNG = 137.6
  const CENTER_LAT = 38

  function fetchTheaters() {
    return new Promise(resolve => {
      fetch('theaters.json')
        .then(res => res.json())
        .then(data => resolve(data))
    })
  }

  function buildGeoJson(theaters) {
    return {
      type: 'FeatureCollection',
      features: theaters.map(theater => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [theater.lng, theater.lat]
        },
        properties: {
          title: theater.name,
          link: `https://www.google.com/search?q=${encodeURIComponent(theater.name)}`
        }
      }))
    }
  }

  function updateMarkerScale(zoom) {
    const scale = DEFAULT_SCALE + (1 - DEFAULT_SCALE) * ((zoom - DEFAULT_ZOOM) / (12 - DEFAULT_ZOOM))
    const scaleInRange = Math.max(Math.min(1, scale), 0.1)

    document.documentElement.style.setProperty('--marker-scale', scaleInRange)
  }

  function draw(geoJson) {
    mapboxgl.accessToken = 'pk.eyJ1IjoibmlzaGlub3NoYWtlIiwiYSI6ImNrbXZvcTU4dTA3N2oyd205Znh1ZHhrYjMifQ.b1qdIgVsts7qj5j7oTDkMw'

    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/nishinoshake/ckmvotxkb0q7n17myvjjq6d9q',
      center: [CENTER_LNG, CENTER_LAT],
      zoom: DEFAULT_ZOOM,
      antialias: true
    })

    map.dragRotate.disable()
    map.touchZoomRotate.disableRotation()

    geoJson.features.map(feature => {
      const el = document.createElement('div')
      const inner = document.createElement('div')

      el.className = 'marker'
      inner.className = 'inner'

      el.appendChild(inner)

      new mapboxgl.Marker(el)
        .setLngLat(feature.geometry.coordinates)
        .setPopup(new mapboxgl.Popup({ offset: 25 })
        .setHTML(`<p><a href="${feature.properties.link}" target="_blank">${feature.properties.title}</a></p>`))
        .addTo(map);
    })

    updateMarkerScale(map.getZoom())

    map.on('zoom', () => {
      updateMarkerScale(map.getZoom())
    })
  }

  function main() {
    fetchTheaters()
      .then(theaters => {
        const geoJson = buildGeoJson(theaters)

        draw(geoJson)
      })
  }

  main()
})()
