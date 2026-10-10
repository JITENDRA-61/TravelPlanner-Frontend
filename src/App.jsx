import { useState, useEffect } from 'react'
import './App.css'

const getApiBase = () => {
  const envUrl = import.meta.env.VITE_API_URL
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, '')
  }
  if (typeof window !== 'undefined') {
    const host = window.location.hostname
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:8080'
    }
  }
  return ''
}

const API = getApiBase()


function CreateTrip({ back }) {
  const [tripName, setTripName] = useState('')
  const [startingLocation, setStartingLocation] = useState('')
  const [destination, setDestination] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [description, setDescription] = useState('')
  const [message, setMessage] = useState('')

  const createTrip = async () => {
    try {
      const response = await fetch(`${API}/api/trips`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripName,
          startingLocation,
          destination,
          startDate,
          endDate,
          description
        })
      })

      if (response.ok) {
        setMessage('Trip created successfully!')
        setTripName('')
        setStartingLocation('')
        setDestination('')
        setStartDate('')
        setEndDate('')
        setDescription('')
      } else {
        setMessage('Failed to create trip')
      }
    } catch {
      setMessage('Backend connection failed')
    }
  }

  return (
    <Page title="Create New Trip" icon="✈️" back={back}>
      <div className="form-grid">
        <div className="full">
          <label>Trip Name</label>
          <input
            placeholder="e.g. Goa Adventure"
            value={tripName}
            onChange={e => setTripName(e.target.value)}
          />
        </div>

        <div>
          <label>Starting Location</label>
          <input
            placeholder="e.g. Hyderabad"
            value={startingLocation}
            onChange={e => setStartingLocation(e.target.value)}
          />
        </div>

        <div>
          <label>Destination</label>
          <input
            placeholder="e.g. Goa"
            value={destination}
            onChange={e => setDestination(e.target.value)}
          />
        </div>

        <div>
          <label>Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
          />
        </div>

        <div>
          <label>End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
          />
        </div>

        <div className="full">
          <label>Trip Description</label>
          <textarea
            placeholder="Tell us about your adventure..."
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>
      </div>

      <button className="primary-btn" onClick={createTrip}>
        Create Trip →
      </button>

      <p className="message">{message}</p>
    </Page>
  )
}

function Trips({ back }) {
  const [trips, setTrips] = useState([])
  const [tripDestinations, setTripDestinations] = useState({})
  const [openDestinationsTripId, setOpenDestinationsTripId] = useState(null)
  const [message, setMessage] = useState('')

  const loadTrips = async () => {
    try {
      const response = await fetch(`${API}/api/trips`)
      const data = await response.json()
      setTrips(data)
    } catch {
      setMessage('Backend connection failed')
    }
  }

  const deleteTrip = async id => {
    try {
      await fetch(`${API}/api/trips/${id}`, {
        method: 'DELETE'
      })
      loadTrips()
    } catch {
      setMessage('Failed to delete trip')
    }
  }

  const toggleTripDestinations = async tripId => {
    if (openDestinationsTripId === tripId) {
      setOpenDestinationsTripId(null)
      return
    }
    setOpenDestinationsTripId(tripId)
    loadTripDestinations(tripId)
  }

  const loadTripDestinations = async tripId => {
    try {
      const response = await fetch(`${API}/api/trips/${tripId}/destinations`)
      if (response.ok) {
        const data = await response.json()
        setTripDestinations(prev => ({ ...prev, [tripId]: data }))
      }
    } catch (err) {
      console.error(err)
    }
  }

  const removeDestinationFromTrip = async (tripId, destinationId) => {
    try {
      const response = await fetch(`${API}/api/trips/${tripId}/destinations/${destinationId}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        loadTripDestinations(tripId)
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadTrips()
  }, [])

  return (
    <Page title="My Trips" icon="🧳" back={back}>
      <div className="trip-list">
        {trips.length === 0 ? (
          <div className="empty-state">
            <div>🌍</div>
            <h3>No trips created yet</h3>
            <p>Create your first trip and start planning your adventure.</p>
          </div>
        ) : (
          trips.map(trip => (
            <div className="trip-card" key={trip.id}>
              <div className="trip-card-icon">
                ✈️
              </div>

              <div className="trip-card-content">
                <h2>{trip.tripName}</h2>

                <p>
                  📍 {trip.startingLocation} → {trip.destination}
                </p>

                <p>
                  📅 {trip.startDate} → {trip.endDate}
                </p>

                <p className="trip-description">
                  {trip.description}
                </p>

                <div className="trip-dest-section">
                  <button
                    className="trip-dest-toggle-btn"
                    onClick={() => toggleTripDestinations(trip.id)}
                  >
                    📍 {openDestinationsTripId === trip.id ? 'Hide Planned Destinations' : 'View Planned Destinations'}
                  </button>

                  {openDestinationsTripId === trip.id && (
                    <div className="trip-dest-list">
                      {(!tripDestinations[trip.id] || tripDestinations[trip.id].length === 0) ? (
                        <p style={{ fontSize: '12px', color: '#718078', margin: '6px 0' }}>
                          No destinations added to this trip yet. Search and add places from Explore Destinations!
                        </p>
                      ) : (
                        tripDestinations[trip.id].map(td => (
                          <div className="trip-dest-item" key={td.id}>
                            <div className="trip-dest-item-info">
                              <strong>{td.destination?.name || 'Destination'}</strong>
                              <small>
                                {td.destination?.category ? `${td.destination.category} · ` : ''}
                                {td.destination?.city ? `${td.destination.city} · ` : ''}
                                {td.visitDate ? `Date: ${td.visitDate} ` : ''}
                                {td.notes ? `(${td.notes})` : ''}
                              </small>
                            </div>
                            <button
                              className="trip-dest-del-btn"
                              title="Remove destination from this trip"
                              onClick={() => removeDestinationFromTrip(trip.id, td.destinationId)}
                            >
                              Remove
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              <button
                className="delete-btn"
                onClick={() => deleteTrip(trip.id)}
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>

      <p className="message">{message}</p>
    </Page>
  )
}

function Members({ back }) {
  const [members, setMembers] = useState([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState('')
  const [message, setMessage] = useState('')

  const loadMembers = async () => {
    try {
      const response = await fetch(`${API}/api/members`)
      const data = await response.json()
      setMembers(data)
    } catch {
      setMessage('Backend connection failed')
    }
  }

  const addMember = async () => {
    try {
      const response = await fetch(`${API}/api/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, role })
      })

      if (response.ok) {
        setMessage('Member added successfully!')
        setName('')
        setEmail('')
        setPhone('')
        setRole('')
        loadMembers()
      }
    } catch {
      setMessage('Backend connection failed')
    }
  }

  const deleteMember = async id => {
    await fetch(`${API}/api/members/${id}`, {
      method: 'DELETE'
    })
    loadMembers()
  }

  return (
    <Page title="Group Members" icon="👥" back={back}>
      <div className="form-grid">
        <div>
          <label>Name</label>
          <input
            placeholder="John Doe"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>

        <div>
          <label>Email</label>
          <input
            placeholder="john@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label>Phone</label>
          <input
            placeholder="+91 9876543210"
            value={phone}
            onChange={e => setPhone(e.target.value)}
          />
        </div>

        <div>
          <label>Role</label>
          <input
            placeholder="Member / Leader"
            value={role}
            onChange={e => setRole(e.target.value)}
          />
        </div>
      </div>

      <button className="primary-btn" onClick={addMember}>
        Add Member →
      </button>

      <button className="secondary-btn" onClick={loadMembers}>
        View Members
      </button>

      <p className="message">{message}</p>

      <div className="modern-list">
        {members.map(member => (
          <div className="modern-list-item" key={member.id}>
            <div className="avatar">
              {member.name?.charAt(0).toUpperCase()}
            </div>

            <div className="item-info">
              <strong>{member.name}</strong>
              <span>{member.email}</span>
              <small>{member.phone} · {member.role}</small>
            </div>

            <button
              className="delete-btn"
              onClick={() => deleteMember(member.id)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </Page>
  )
}

const CATEGORY_LIST = [
  { id: 'all', label: 'All', icon: '✨' },
  { id: 'attraction', label: 'Attractions', icon: '🏛' },
  { id: 'museum', label: 'Museums', icon: '🎨' },
  { id: 'park', label: 'Parks', icon: '🌳' },
  { id: 'beach', label: 'Beaches', icon: '🏖' },
  { id: 'restaurant', label: 'Restaurants', icon: '🍴' },
  { id: 'hotel', label: 'Hotels', icon: '🏨' }
]

function getPlaceIcon(category, type) {
  const c = (category || type || '').toLowerCase()
  if (c.includes('historic') || c.includes('monument') || c.includes('fort') || c.includes('castle') || c.includes('ruins')) return '🏛'
  if (c.includes('museum') || c.includes('art')) return '🎨'
  if (c.includes('park') || c.includes('garden') || c.includes('nature')) return '🌳'
  if (c.includes('beach') || c.includes('coast')) return '🏖'
  if (c.includes('restaurant') || c.includes('cafe') || c.includes('food')) return '🍴'
  if (c.includes('hotel') || c.includes('hostel') || c.includes('guest_house')) return '🏨'
  if (c.includes('religio') || c.includes('worship') || c.includes('temple') || c.includes('church') || c.includes('mosque')) return '🛕'
  if (c.includes('shop') || c.includes('mall') || c.includes('market')) return '🛍'
  if (c.includes('entertainment') || c.includes('theatre') || c.includes('cinema') || c.includes('zoo')) return '🎭'
  return '📍'
}

function Destinations({ back }) {
  const [query, setQuery] = useState('')
  const [places, setPlaces] = useState([])
  const [nearbyPlaces, setNearbyPlaces] = useState([])
  const [selectedPlaceForNearby, setSelectedPlaceForNearby] = useState(null)
  const [loading, setLoading] = useState(false)
  const [nearbyLoading, setNearbyLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [hasSearched, setHasSearched] = useState(false)

  // Add to Trip Modal State
  const [modalPlace, setModalPlace] = useState(null)
  const [trips, setTrips] = useState([])
  const [selectedTripId, setSelectedTripId] = useState('')
  const [visitDate, setVisitDate] = useState('')
  const [notes, setNotes] = useState('')
  const [modalMessage, setModalMessage] = useState('')
  const [modalMessageType, setModalMessageType] = useState('')
  const [modalLoading, setModalLoading] = useState(false)

  // Load user trips for modal
  const loadUserTrips = async () => {
    try {
      const response = await fetch(`${API}/api/trips`)
      if (response.ok) {
        const data = await response.json()
        setTrips(data)
        if (data.length > 0 && !selectedTripId) {
          setSelectedTripId(data[0].id)
        }
      }
    } catch (err) {
      console.error('Failed to load trips for modal', err)
    }
  }

  const searchPlaces = async (searchQuery, category = selectedCategory) => {
    if (!searchQuery.trim()) {
      setError('Please enter a city or destination name to search.')
      setPlaces([])
      return
    }

    setLoading(true)
    setError('')
    setHasSearched(true)
    setNearbyPlaces([])
    setSelectedPlaceForNearby(null)

    try {
      const categoryParam = category !== 'all' ? `&category=${encodeURIComponent(category)}` : ''
      const response = await fetch(
        `${API}/api/places/search?query=${encodeURIComponent(searchQuery.trim())}${categoryParam}`
      )

      if (!response.ok) {
        throw new Error('Overpass server error')
      }

      const data = await response.json()
      setPlaces(data || [])
      if (!data || data.length === 0) {
        setError('No places found for this search. Try another city or category.')
      }
    } catch {
      setError('Destination service is temporarily unavailable. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const loadNearbyPlaces = async (place, category = 'all') => {
    if (!place || place.latitude == null || place.longitude == null) {
      return
    }

    setNearbyLoading(true)
    setSelectedPlaceForNearby(place)

    try {
      const categoryParam = category !== 'all' ? `&category=${encodeURIComponent(category)}` : ''
      const response = await fetch(
        `${API}/api/places/nearby?latitude=${place.latitude}&longitude=${place.longitude}${categoryParam}&radius=10000`
      )

      if (!response.ok) {
        throw new Error('Nearby request error')
      }

      const data = await response.json()
      setNearbyPlaces(data || [])
    } catch {
      setNearbyPlaces([])
    } finally {
      setNearbyLoading(false)
    }
  }

  const handleSearchSubmit = e => {
    e.preventDefault()
    searchPlaces(query, selectedCategory)
  }

  const changeCategory = newCategory => {
    setSelectedCategory(newCategory)
    if (query.trim()) {
      searchPlaces(query, newCategory)
    }
  }

  const openAddToTripModal = place => {
    setModalPlace(place)
    setModalMessage('')
    setModalMessageType('')
    setVisitDate('')
    setNotes('')
    loadUserTrips()
  }

  const closeAddToTripModal = () => {
    setModalPlace(null)
    setModalMessage('')
    setModalMessageType('')
  }

  const submitAddToTrip = async () => {
    if (!selectedTripId) {
      setModalMessage('Please create or select a trip first.')
      setModalMessageType('warning')
      return
    }

    setModalLoading(true)
    setModalMessage('')

    try {
      const payload = {
        name: modalPlace.name,
        city: modalPlace.address,
        category: modalPlace.category,
        latitude: modalPlace.latitude,
        longitude: modalPlace.longitude,
        osmType: modalPlace.osmType,
        osmId: modalPlace.osmId,
        description: modalPlace.description,
        visitDate,
        notes
      }

      const response = await fetch(`${API}/api/trips/${selectedTripId}/destinations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (response.status === 201 || (response.ok && data.success)) {
        setModalMessage('Destination added to your trip.')
        setModalMessageType('success')
        setTimeout(() => {
          closeAddToTripModal()
        }, 1500)
      } else if (response.status === 409 || data.alreadyExists) {
        setModalMessage('This destination is already in this trip.')
        setModalMessageType('warning')
      } else {
        setModalMessage(data.message || 'Failed to add destination to trip.')
        setModalMessageType('error')
      }
    } catch {
      setModalMessage('Backend connection failed. Please ensure the server is running.')
      setModalMessageType('error')
    } finally {
      setModalLoading(false)
    }
  }

  return (
    <Page title="Explore Destinations" icon="🌍" back={back}>
      <div className="destination-page">

        <div className="destination-header">
          <div>
            <span className="destination-eyebrow">
              REAL-WORLD OPENSTREETMAP DISCOVERY
            </span>

            <h1>Explore Destinations</h1>

            <p>
              Discover real places for your next journey.
            </p>
          </div>
        </div>

        <form className="destination-search" onSubmit={handleSearchSubmit}>
          <span className="search-icon">⌕</span>

          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search cities, landmarks and places..."
          />

          <button type="submit" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        <div className="destination-categories">
          {CATEGORY_LIST.map(cat => (
            <button
              key={cat.id}
              className={selectedCategory === cat.id ? 'category-btn active' : 'category-btn'}
              onClick={() => changeCategory(cat.id)}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="destination-error">
            {error}
          </div>
        )}

        {loading && (
          <div className="destination-loading">
            <div className="loading-spinner"></div>
            <p>Discovering real-world OpenStreetMap places for you...</p>
          </div>
        )}

        {!loading && places.length > 0 && (
          <section className="destination-section">
            <div className="section-heading">
              <div>
                <span>OPENSTREETMAP RESULTS</span>
                <h2>Places worth discovering</h2>
              </div>
              <small>{places.length} places found</small>
            </div>

            <div className="destination-grid">
              {places.map(place => {
                const icon = getPlaceIcon(place.category, place.type)
                return (
                  <div className="destination-card" key={place.id}>
                    <div className="destination-card-image">
                      <div className="destination-image-placeholder">
                        {icon}
                      </div>
                    </div>

                    <div className="destination-card-body">
                      <span className="destination-type">
                        {icon} {(place.category || place.type || 'DESTINATION').toUpperCase()}
                      </span>

                      <h3>{place.name}</h3>

                      <p className="destination-address">
                        📍 {place.address || 'Location on map'}
                      </p>

                      {place.latitude != null && place.longitude != null && (
                        <span className="destination-coords">
                          {place.latitude.toFixed(4)}, {place.longitude.toFixed(4)}
                        </span>
                      )}

                      {place.description && (
                        <p className="destination-desc">
                          {place.description}
                        </p>
                      )}

                      <div className="destination-actions">
                        <button
                          className="nearby-btn"
                          onClick={() => loadNearbyPlaces(place, 'all')}
                        >
                          📍 Nearby
                        </button>

                        <button
                          className="add-destination-btn"
                          onClick={() => openAddToTripModal(place)}
                        >
                          + Add to Trip
                        </button>
                      </div>

                      <div className="osm-attribution">
                        <span>© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap contributors</a></span>
                        <small>{place.osmType}/{place.osmId}</small>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {!loading && hasSearched && places.length === 0 && !error && (
          <div className="destination-empty">
            <div className="empty-globe">🔍</div>
            <h2>No places found for this search.</h2>
            <p>Try searching for a major city such as Hyderabad, Goa, Manali, Bangalore, Delhi, Paris, or London.</p>
          </div>
        )}

        {!loading && !hasSearched && (
          <div className="destination-empty">
            <div className="empty-globe">🌍</div>
            <h2>Where will your journey take you?</h2>
            <p>Search cities, landmarks and places (e.g. Hyderabad, Goa, Manali, Paris, London) to discover real OpenStreetMap destinations.</p>
          </div>
        )}

        {nearbyLoading && (
          <div className="nearby-loading">
            <div className="loading-spinner"></div>
            Finding real places nearby {selectedPlaceForNearby?.name || 'destination'}...
          </div>
        )}

        {!nearbyLoading && nearbyPlaces.length > 0 && selectedPlaceForNearby && (
          <section className="nearby-section">
            <div className="section-heading">
              <div>
                <span>NEARBY DISCOVERIES</span>
                <h2>Places near {selectedPlaceForNearby.name}</h2>
              </div>
              <small>Within 10 km radius</small>
            </div>

            <div className="nearby-grid">
              {nearbyPlaces.map(place => {
                const icon = getPlaceIcon(place.category, place.type)
                return (
                  <div className="nearby-card" key={place.id}>
                    <div className="nearby-icon">
                      {icon}
                    </div>

                    <div className="nearby-content">
                      <span className="destination-type" style={{ fontSize: '9px' }}>
                        {(place.category || place.type || 'NEARBY').toUpperCase()}
                      </span>
                      <h3>{place.name}</h3>
                      <p>{place.address || 'Address on map'}</p>
                      {place.latitude != null && place.longitude != null && (
                        <span className="destination-coords" style={{ fontSize: '10px', padding: '2px 5px' }}>
                          {place.latitude.toFixed(4)}, {place.longitude.toFixed(4)}
                        </span>
                      )}
                    </div>

                    <button
                      className="nearby-add-btn"
                      title="Add to Trip"
                      onClick={() => openAddToTripModal(place)}
                    >
                      +
                    </button>
                  </div>
                )
              })}
            </div>

            <div className="osm-attribution" style={{ marginTop: '20px' }}>
              <span>Nearby POI data provided by © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap contributors</a> via Overpass API</span>
            </div>
          </section>
        )}

      </div>

      {/* ADD TO TRIP MODAL */}
      {modalPlace && (
        <div className="modal-backdrop" onClick={closeAddToTripModal}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Add destination to trip</h3>
                <p>Associate this real-world place with your planned trip</p>
              </div>
              <button className="modal-close-btn" onClick={closeAddToTripModal}>×</button>
            </div>

            <div className="modal-place-preview">
              <div className="modal-place-icon">
                {getPlaceIcon(modalPlace.category, modalPlace.type)}
              </div>
              <div className="modal-place-info">
                <strong>{modalPlace.name}</strong>
                <span>{modalPlace.address || 'OpenStreetMap Location'}</span>
              </div>
            </div>

            <div className="modal-form-group">
              <label>Select your trip:</label>
              {trips.length === 0 ? (
                <p style={{ fontSize: '13px', color: '#9c2e2e', margin: '4px 0' }}>
                  No trips found. Please create a trip first in the "Create Trip" page!
                </p>
              ) : (
                <select
                  value={selectedTripId}
                  onChange={e => setSelectedTripId(e.target.value)}
                >
                  {trips.map(trip => (
                    <option key={trip.id} value={trip.id}>
                      {trip.tripName} ({trip.startingLocation} → {trip.destination})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="modal-form-group">
              <label>Planned Visit Date (optional):</label>
              <input
                type="date"
                value={visitDate}
                onChange={e => setVisitDate(e.target.value)}
              />
            </div>

            <div className="modal-form-group">
              <label>Notes / Plans (optional):</label>
              <input
                type="text"
                placeholder="e.g. Visit morning 10 AM, entry ticket, camera allowed"
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>

            {modalMessage && (
              <div className={`modal-message ${modalMessageType}`}>
                {modalMessage}
              </div>
            )}

            <div className="modal-actions">
              <button
                type="button"
                className="modal-cancel-btn"
                onClick={closeAddToTripModal}
              >
                Cancel
              </button>

              <button
                type="button"
                className="modal-submit-btn"
                onClick={submitAddToTrip}
                disabled={modalLoading || trips.length === 0}
              >
                {modalLoading ? 'Adding...' : 'Add Destination'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Page>
  )
}
function Itinerary({ back }) {
  const [items, setItems] = useState([])
  const [day, setDay] = useState('')
  const [activity, setActivity] = useState('')
  const [location, setLocation] = useState('')
  const [time, setTime] = useState('')
  const [message, setMessage] = useState('')

  const loadItems = async () => {
    try {
      const response = await fetch(`${API}/api/itinerary`)
      const data = await response.json()
      setItems(data)
    } catch {
      setMessage('Backend connection failed')
    }
  }

  const addItem = async () => {
    try {
      const response = await fetch(`${API}/api/itinerary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          day,
          activity,
          location,
          time
        })
      })

      if (response.ok) {
        setMessage('Activity added successfully!')
        setDay('')
        setActivity('')
        setLocation('')
        setTime('')
        loadItems()
      }
    } catch {
      setMessage('Backend connection failed')
    }
  }

  const deleteItem = async id => {
    await fetch(`${API}/api/itinerary/${id}`, {
      method: 'DELETE'
    })
    loadItems()
  }

  return (
    <Page title="Trip Itinerary" icon="📅" back={back}>
      <div className="form-grid">
        <div>
          <label>Day</label>
          <input
            placeholder="Day 1"
            value={day}
            onChange={e => setDay(e.target.value)}
          />
        </div>

        <div>
          <label>Activity</label>
          <input
            placeholder="Sightseeing"
            value={activity}
            onChange={e => setActivity(e.target.value)}
          />
        </div>

        <div>
          <label>Location</label>
          <input
            placeholder="Beach"
            value={location}
            onChange={e => setLocation(e.target.value)}
          />
        </div>

        <div>
          <label>Time</label>
          <input
            placeholder="09:00 AM"
            value={time}
            onChange={e => setTime(e.target.value)}
          />
        </div>
      </div>

      <button className="primary-btn" onClick={addItem}>
        Add Activity →
      </button>

      <button className="secondary-btn" onClick={loadItems}>
        View Itinerary
      </button>

      <p className="message">{message}</p>

      <div className="timeline">
        {items.map(item => (
          <div className="timeline-item" key={item.id}>
            <div className="timeline-dot">
              ✓
            </div>

            <div className="timeline-content">
              <span>{item.day}</span>
              <h3>{item.activity}</h3>
              <p>📍 {item.location} · 🕐 {item.time}</p>
            </div>

            <button
              className="delete-btn"
              onClick={() => deleteItem(item.id)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </Page>
  )
}

function Expenses({ back }) {
  const [expenses, setExpenses] = useState([])
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [paidBy, setPaidBy] = useState('')
  const [splitBetween, setSplitBetween] = useState('')
  const [message, setMessage] = useState('')

  const loadExpenses = async () => {
    try {
      const response = await fetch(`${API}/api/expenses`)
      const data = await response.json()
      setExpenses(data)
    } catch {
      setMessage('Backend connection failed')
    }
  }

  const addExpense = async () => {
    try {
      const response = await fetch(`${API}/api/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          amount: Number(amount),
          paidBy,
          splitBetween
        })
      })

      if (response.ok) {
        setMessage('Expense added successfully!')
        setTitle('')
        setAmount('')
        setPaidBy('')
        setSplitBetween('')
        loadExpenses()
      }
    } catch {
      setMessage('Backend connection failed')
    }
  }

  const deleteExpense = async id => {
    await fetch(`${API}/api/expenses/${id}`, {
      method: 'DELETE'
    })
    loadExpenses()
  }

  return (
    <Page title="Group Expenses" icon="💰" back={back}>
      <div className="form-grid">
        <div>
          <label>Expense</label>
          <input
            placeholder="Hotel Booking"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label>Amount</label>
          <input
            type="number"
            placeholder="2500"
            value={amount}
            onChange={e => setAmount(e.target.value)}
          />
        </div>

        <div>
          <label>Paid By</label>
          <input
            placeholder="Jitendra"
            value={paidBy}
            onChange={e => setPaidBy(e.target.value)}
          />
        </div>

        <div>
          <label>Split Between</label>
          <input
            placeholder="4 members"
            value={splitBetween}
            onChange={e => setSplitBetween(e.target.value)}
          />
        </div>
      </div>

      <button className="primary-btn" onClick={addExpense}>
        Add Expense →
      </button>

      <button className="secondary-btn" onClick={loadExpenses}>
        View Expenses
      </button>

      <p className="message">{message}</p>

      <div className="expense-list">
        {expenses.map(expense => (
          <div className="expense-card" key={expense.id}>
            <div className="expense-icon">
              ₹
            </div>

            <div className="expense-info">
              <h3>{expense.title}</h3>
              <p>Paid by {expense.paidBy}</p>
              <small>Split: {expense.splitBetween}</small>
            </div>

            <strong>₹{expense.amount}</strong>

            <button
              className="delete-btn"
              onClick={() => deleteExpense(expense.id)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </Page>
  )
}

function Page({ title, icon, back, children }) {
  return (
    <div className="dashboard">
      <Sidebar />

      <main className="main-area">
        <div className="page-top">
          <button className="back-btn" onClick={back}>
            ←
          </button>

          <div>
            <h1>{icon} {title}</h1>
            <p>Plan your next adventure with your group.</p>
          </div>
        </div>

        <div className="form-page">
          {children}
        </div>
      </main>
    </div>
  )
}

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">✈</div>

        <div>
          <strong>TravelMate</strong>
          <small>Plan. Travel. Enjoy.</small>
        </div>
      </div>

      <div className="side-decoration">
        🌿
      </div>
    </aside>
  )
}

const VALID_PAGES = ['createTrip', 'trips', 'members', 'destinations', 'itinerary', 'expenses']

function Dashboard({ logout }) {
  const getInitialPage = () => {
    const hash = window.location.hash.replace(/^#\/?/, '')
    if (VALID_PAGES.includes(hash)) {
      return hash
    }
    const saved = localStorage.getItem('travelmate_page')
    if (saved && VALID_PAGES.includes(saved)) {
      return saved
    }
    return 'dashboard'
  }

  const [page, setPage] = useState(getInitialPage)

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace(/^#\/?/, '')
      if (VALID_PAGES.includes(hash)) {
        setPage(hash)
        localStorage.setItem('travelmate_page', hash)
      } else {
        setPage('dashboard')
        localStorage.setItem('travelmate_page', 'dashboard')
      }
    }

    window.addEventListener('hashchange', handleHash)
    window.addEventListener('popstate', handleHash)

    return () => {
      window.removeEventListener('hashchange', handleHash)
      window.removeEventListener('popstate', handleHash)
    }
  }, [])

  const openPage = newPage => {
    window.location.hash = `#/${newPage}`
    localStorage.setItem('travelmate_page', newPage)
    setPage(newPage)
  }

  const goBack = () => {
    window.location.hash = '#/dashboard'
    localStorage.setItem('travelmate_page', 'dashboard')
    setPage('dashboard')
  }

  if (page === 'createTrip') {
    return <CreateTrip back={goBack} />
  }

  if (page === 'trips') {
    return <Trips back={goBack} />
  }

  if (page === 'members') {
    return <Members back={goBack} />
  }

  if (page === 'destinations') {
    return <Destinations back={goBack} />
  }

  if (page === 'itinerary') {
    return <Itinerary back={goBack} />
  }

  if (page === 'expenses') {
    return <Expenses back={goBack} />
  }

  return (
    <div className="dashboard">
      <Sidebar />

      <main className="main-area">
        <header className="topbar">
          <div>
            <span className="welcome-small">WELCOME BACK</span>
            <h2>Hi, Traveler 👋</h2>
          </div>

          <button className="logout-btn" onClick={logout}>
            Logout
          </button>
        </header>

        <section className="hero">
          <div className="hero-content">
            <span>✦ YOUR NEXT ADVENTURE</span>

            <h1>
              <span className="gold-title">
                Discover the world.
              </span>

              <br />

              <span className="cream-title">
                Create unforgettable journeys.
              </span>
            </h1>

            <p>
              Plan trips, explore destinations and make memories
              together with your favorite people.
            </p>

            <button
              className="hero-btn"
              onClick={() => openPage('createTrip')}
            >
              Create Your Trip →
            </button>
          </div>
        </section>

        <section className="quick-section">
          <div className="section-heading">
            <div>
              <span>PLAN WITH EASE</span>
              <h2>Everything for your journey</h2>
            </div>
          </div>

          <div className="feature-grid">
            <Feature
              icon="✈️"
              title="Create Trip"
              text="Build your next adventure."
              onClick={() => openPage('createTrip')}
            />

            <Feature
              icon="🧳"
              title="My Trips"
              text="View your created trips."
              onClick={() => openPage('trips')}
            />

            <Feature
              icon="👥"
              title="Group Members"
              text="Manage everyone traveling."
              onClick={() => openPage('members')}
            />

            <Feature
              icon="📍"
              title="Destinations"
              text="Save places to explore."
              onClick={() => openPage('destinations')}
            />

            <Feature
              icon="📅"
              title="Itinerary"
              text="Organize every day."
              onClick={() => openPage('itinerary')}
            />

            <Feature
              icon="💰"
              title="Expenses"
              text="Split expenses easily."
              onClick={() => openPage('expenses')}
            />
          </div>
        </section>
      </main>
    </div>
  )
}

function Feature({ icon, title, text, onClick }) {
  return (
    <div className="feature-card">
      <div className="feature-icon">
        {icon}
      </div>

      <h3>{title}</h3>

      <p>{text}</p>

      <button onClick={onClick}>
        Open →
      </button>
    </div>
  )
}

function App() {
  const [login, setLogin] = useState(true)
  const [loggedIn, setLoggedIn] = useState(() => {
    return localStorage.getItem('travelmate_logged_in') === 'true'
  })
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const submit = async () => {
    setMessage('Connecting...')

    const url = login
      ? `${API}/api/auth/login`
      : `${API}/api/auth/register`

    const data = login
      ? { email, password }
      : { name, email, password }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      const result = await response.text()

      if (login && result === 'Login successful') {
        localStorage.setItem('travelmate_logged_in', 'true')
        localStorage.setItem('travelmate_user_email', email)
        setLoggedIn(true)
      } else {
        setMessage(result)
      }
    } catch {
      setMessage('Backend connection failed')
    }
  }

  const logout = () => {
    localStorage.removeItem('travelmate_logged_in')
    localStorage.removeItem('travelmate_user_email')
    localStorage.removeItem('travelmate_page')
    setLoggedIn(false)
    setEmail('')
    setPassword('')
    setMessage('')
    window.location.hash = ''
  }

  if (loggedIn) {
    return <Dashboard logout={logout} />
  }

  return (
    <div className="auth-page">
      <div className="auth-overlay"></div>

      <div className="auth-brand">
        <div className="mountain-logo">⌁</div>

        <div>
          <h1>TravelMate</h1>
          <p>Plan. Travel. Enjoy.</p>
        </div>
      </div>

      <div className="auth-text">
        <span>✦ YOUR JOURNEY STARTS HERE</span>

        <h2>
          Travel far.
          <br />
          Live fully.
        </h2>

        <p>
          Plan unforgettable group adventures,
          discover beautiful places and create
          memories together.
        </p>
      </div>

      <div className="auth-card">
        <div className="leaf">🌿</div>

        <span className="card-label">
          {login ? 'WELCOME BACK' : 'START YOUR JOURNEY'}
        </span>

        <h2>
          {login ? 'Welcome Back!' : 'Create Account'}
        </h2>

        <p className="auth-subtitle">
          {login
            ? 'Sign in to continue your journey'
            : 'Join TravelMate and start your adventure'}
        </p>

        {!login && (
          <div className="input-group">
            <label>Full Name</label>

            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
        )}

        <div className="input-group">
          <label>Email</label>

          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label>Password</label>

          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>

        <button className="auth-btn" onClick={submit}>
          {login ? 'Login' : 'Register'} <span>→</span>
        </button>

        <p className="message">{message}</p>

        <div className="auth-switch">
          {login
            ? "Don't have an account?"
            : 'Already have an account?'}

          <button
            onClick={() => {
              setLogin(!login)
              setMessage('')
            }}
          >
            {login ? 'Register' : 'Login'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default App