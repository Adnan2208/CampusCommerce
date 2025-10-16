import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, useLoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { Navigation, MapPin, User, Package } from 'lucide-react';

const LocationTracker = ({ 
  orderId, 
  authToken, 
  userRole, // 'buyer' or 'seller'
  orderStatus,
  pickupCoordinates,
  onClose 
}) => {
  // Load Google Maps script
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  });

  const [map, setMap] = useState(null);
  const [trackingData, setTrackingData] = useState({
    trackingEnabled: false,
    pickupCoordinates: pickupCoordinates || null,
    buyerLocation: null,
    sellerLocation: null
  });
  const [currentLocation, setCurrentLocation] = useState(null);
  const [watchId, setWatchId] = useState(null);
  const [error, setError] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [isSharing, setIsSharing] = useState(false);

  // Default center (will be updated with actual locations)
  const [center, setCenter] = useState({ lat: 20.5937, lng: 78.9629 }); // India center

  const mapContainerStyle = {
    width: '100%',
    height: '500px',
    borderRadius: '1rem'
  };

  const mapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: true,
  };

  // Fetch tracking data
  const fetchTrackingData = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/tracking`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      if (result.success) {
        setTrackingData(result.data);
        
        // Update map center to show relevant locations
        if (result.data.pickupCoordinates?.lat && result.data.pickupCoordinates?.lng) {
          setCenter({
            lat: result.data.pickupCoordinates.lat,
            lng: result.data.pickupCoordinates.lng
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch tracking data:', error);
      setError('Failed to load tracking data');
    }
  }, [orderId, authToken]);

  // Update user's location to server
  const updateLocationToServer = useCallback(async (lat, lng) => {
    try {
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/update-location`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ lat, lng })
      });

      const result = await response.json();
      if (result.success) {
        setTrackingData(prev => ({
          ...prev,
          buyerLocation: result.data.buyerLocation,
          sellerLocation: result.data.sellerLocation
        }));
      }
    } catch (error) {
      console.error('Failed to update location:', error);
    }
  }, [orderId, authToken]);

  // Start location sharing
  const startLocationSharing = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setIsSharing(true);
    setError(null);

    // Get initial position
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ lat: latitude, lng: longitude });
        updateLocationToServer(latitude, longitude);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setError('Unable to get your location. Please enable location services.');
        setIsSharing(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );

    // Watch position for continuous updates
    const id = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ lat: latitude, lng: longitude });
        updateLocationToServer(latitude, longitude);
      },
      (error) => {
        console.error('Watch position error:', error);
        setError('Location tracking error. Please check your settings.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000 // Update every 30 seconds
      }
    );

    setWatchId(id);
  }, [updateLocationToServer]);

  // Stop location sharing
  const stopLocationSharing = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setIsSharing(false);
  }, [watchId]);

  // Fetch tracking data on mount and set up polling
  useEffect(() => {
    if (orderStatus === 'accepted') {
      fetchTrackingData();
      
      // Poll for updates every 10 seconds
      const interval = setInterval(fetchTrackingData, 10000);
      
      return () => clearInterval(interval);
    }
  }, [fetchTrackingData, orderStatus]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopLocationSharing();
    };
  }, [stopLocationSharing]);

  const onMapLoad = useCallback((map) => {
    setMap(map);
  }, []);

  // Fit bounds to show all markers
  useEffect(() => {
    if (map && trackingData.trackingEnabled) {
      const bounds = new window.google.maps.LatLngBounds();
      
      if (trackingData.pickupCoordinates?.lat && trackingData.pickupCoordinates?.lng) {
        bounds.extend({
          lat: trackingData.pickupCoordinates.lat,
          lng: trackingData.pickupCoordinates.lng
        });
      }
      
      if (trackingData.buyerLocation?.lat && trackingData.buyerLocation?.lng) {
        bounds.extend({
          lat: trackingData.buyerLocation.lat,
          lng: trackingData.buyerLocation.lng
        });
      }
      
      if (trackingData.sellerLocation?.lat && trackingData.sellerLocation?.lng) {
        bounds.extend({
          lat: trackingData.sellerLocation.lat,
          lng: trackingData.sellerLocation.lng
        });
      }

      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, { padding: 50 });
      }
    }
  }, [map, trackingData]);

  // Check if API key is configured
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
    return (
      <div className="space-y-4">
        <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 px-4 py-6 rounded-lg">
          <h3 className="font-bold text-lg mb-2">⚠️ Google Maps API Key Missing</h3>
          <p className="mb-2">Please add your Google Maps API key to enable live location tracking.</p>
          <ol className="list-decimal list-inside text-sm space-y-1">
            <li>Get an API key from <a href="https://console.cloud.google.com/google/maps-apis" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a></li>
            <li>Add it to <code className="bg-yellow-200 px-1 rounded">frontend/.env</code> file</li>
            <li>Restart the development server</li>
          </ol>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Live Location Tracking</h3>
          <p className="text-sm text-gray-600">
            {orderStatus === 'accepted' 
              ? 'Track the meetup location in real-time' 
              : 'Live tracking will be available once order is accepted'}
          </p>
        </div>
        {orderStatus === 'accepted' && (
          <button
            onClick={isSharing ? stopLocationSharing : startLocationSharing}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
              isSharing 
                ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <Navigation size={18} className={isSharing ? 'animate-pulse' : ''} />
            {isSharing ? 'Stop Sharing' : 'Share Location'}
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Location Sharing Status */}
      {isSharing && (
        <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="font-medium">Your location is being shared</span>
        </div>
      )}

      {/* Map Loading/Error States */}
      {loadError && (
        <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
          Error loading Google Maps. Please check your API key and try again.
        </div>
      )}

      {!isLoaded && !loadError && (
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 mt-4">Loading map...</p>
        </div>
      )}

      {/* Map */}
      {isLoaded && !loadError && (
        <div className="relative rounded-2xl overflow-hidden shadow-lg border-2 border-gray-200">
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={13}
            options={mapOptions}
            onLoad={onMapLoad}
          >
            {/* Pickup Location Marker */}
            {trackingData.pickupCoordinates?.lat && trackingData.pickupCoordinates?.lng && (
              <>
                <Marker
                  position={{
                    lat: trackingData.pickupCoordinates.lat,
                    lng: trackingData.pickupCoordinates.lng
                  }}
                  icon={{
                    path: window.google.maps.SymbolPath.CIRCLE,
                    scale: 15,
                    fillColor: '#3B82F6',
                    fillOpacity: 1,
                    strokeColor: '#ffffff',
                    strokeWeight: 3,
                  }}
                  onClick={() => setSelectedMarker('pickup')}
                />
                {selectedMarker === 'pickup' && (
                  <InfoWindow
                    position={{
                      lat: trackingData.pickupCoordinates.lat,
                      lng: trackingData.pickupCoordinates.lng
                    }}
                    onCloseClick={() => setSelectedMarker(null)}
                  >
                    <div className="p-2">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin size={16} className="text-blue-600" />
                        <h4 className="font-bold text-gray-800">Pickup Location</h4>
                      </div>
                      <p className="text-sm text-gray-600">Predefined meetup point</p>
                    </div>
                  </InfoWindow>
                )}
              </>
            )}

            {/* Buyer Location Marker */}
            {trackingData.buyerLocation?.lat && trackingData.buyerLocation?.lng && (
              <>
                <Marker
                  position={{
                    lat: trackingData.buyerLocation.lat,
                    lng: trackingData.buyerLocation.lng
                  }}
                  icon={{
                    path: window.google.maps.SymbolPath.CIRCLE,
                    scale: 12,
                    fillColor: '#10B981',
                    fillOpacity: 1,
                    strokeColor: '#ffffff',
                    strokeWeight: 3,
                  }}
                  onClick={() => setSelectedMarker('buyer')}
                />
                {selectedMarker === 'buyer' && (
                  <InfoWindow
                    position={{
                      lat: trackingData.buyerLocation.lat,
                      lng: trackingData.buyerLocation.lng
                    }}
                    onCloseClick={() => setSelectedMarker(null)}
                  >
                    <div className="p-2">
                      <div className="flex items-center gap-2 mb-1">
                        <Package size={16} className="text-green-600" />
                        <h4 className="font-bold text-gray-800">Buyer {userRole === 'buyer' ? '(You)' : ''}</h4>
                      </div>
                      <p className="text-xs text-gray-500">
                        Last updated: {new Date(trackingData.buyerLocation.lastUpdated).toLocaleTimeString()}
                      </p>
                    </div>
                  </InfoWindow>
                )}
              </>
            )}

            {/* Seller Location Marker */}
            {trackingData.sellerLocation?.lat && trackingData.sellerLocation?.lng && (
              <>
                <Marker
                  position={{
                    lat: trackingData.sellerLocation.lat,
                    lng: trackingData.sellerLocation.lng
                  }}
                  icon={{
                    path: window.google.maps.SymbolPath.CIRCLE,
                    scale: 12,
                    fillColor: '#F59E0B',
                    fillOpacity: 1,
                    strokeColor: '#ffffff',
                    strokeWeight: 3,
                  }}
                  onClick={() => setSelectedMarker('seller')}
                />
                {selectedMarker === 'seller' && (
                  <InfoWindow
                    position={{
                      lat: trackingData.sellerLocation.lat,
                      lng: trackingData.sellerLocation.lng
                    }}
                    onCloseClick={() => setSelectedMarker(null)}
                  >
                    <div className="p-2">
                      <div className="flex items-center gap-2 mb-1">
                        <User size={16} className="text-orange-600" />
                        <h4 className="font-bold text-gray-800">Seller {userRole === 'seller' ? '(You)' : ''}</h4>
                      </div>
                      <p className="text-xs text-gray-500">
                        Last updated: {new Date(trackingData.sellerLocation.lastUpdated).toLocaleTimeString()}
                      </p>
                    </div>
                  </InfoWindow>
                )}
              </>
            )}
          </GoogleMap>
        </div>
      )}

      {/* Legend */}
      <div className="grid grid-cols-3 gap-4">
        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
          <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
          <span className="text-sm font-medium text-gray-700">Pickup Point</span>
        </div>
        <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
          <div className="w-4 h-4 bg-green-600 rounded-full"></div>
          <span className="text-sm font-medium text-gray-700">Buyer</span>
        </div>
        <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
          <div className="w-4 h-4 bg-orange-600 rounded-full"></div>
          <span className="text-sm font-medium text-gray-700">Seller</span>
        </div>
      </div>

      {/* Instructions */}
      {orderStatus === 'accepted' && !trackingData.trackingEnabled && (
        <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 px-4 py-3 rounded-lg">
          <p className="font-medium mb-1">⚠️ Live tracking not enabled</p>
          <p className="text-sm">The seller needs to enable live tracking after accepting your order.</p>
        </div>
      )}
    </div>
  );
};

export default LocationTracker;
