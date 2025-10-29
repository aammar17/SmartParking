// import React, { useState, useEffect, useRef } from 'react';
// import { GoogleMap, LoadScript, Marker, InfoWindow, Autocomplete } from '@react-google-maps/api';
// import api from '../../utils/api';

// const UserHome = () => {
//   const [parkingSpots, setParkingSpots] = useState([]);
//   const [selectedSpot, setSelectedSpot] = useState(null);
//   const [userLocation, setUserLocation] = useState({ lat: 55.6761, lng: 12.5683 }); // Copenhagen default
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [mapError, setMapError] = useState('');
//   const [filter, setFilter] = useState('all'); // 'all', 'free', 'paid', 'available', 'occupied'
//   const [searchQuery, setSearchQuery] = useState('');
//   const [map, setMap] = useState(null);
//   const [autocomplete, setAutocomplete] = useState(null);
  
//   const autocompleteRef = useRef(null);
//   const mapContainerStyle = {
//     width: '100%',
//     height: '600px'
//   };

//   const center = userLocation;

//   useEffect(() => {
//     // Get user location
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           setUserLocation({
//             lat: position.coords.latitude,
//             lng: position.coords.longitude
//           });
//           fetchNearbyParking(position.coords.latitude, position.coords.longitude);
//         },
//         (error) => {
//           console.error('Error getting location:', error);
//           fetchNearbyParking(55.6761, 12.5683); // Default to Copenhagen
//         }
//       );
//     } else {
//       fetchNearbyParking(55.6761, 12.5683); // Default to Copenhagen
//     }
//   }, []);

//   const fetchNearbyParking = async (lat, lng) => {
//     try {
//       setLoading(true);
//       setError('');
//       const response = await api.get(`/parking/nearby?lat=${lat}&lng=${lng}`);
//       setParkingSpots(response.data);
//     } catch (error) {
//       setError('Failed to fetch parking spots');
//       console.error('Error fetching parking spots:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleMarkerClick = (spot) => {
//     setSelectedSpot(spot);
//   };

//   const handleInfoWindowClose = () => {
//     setSelectedSpot(null);
//   };

//   const getMarkerIcon = (spot) => {
//     let iconColor = '#FF0000'; // Default red for occupied
//     let scale = 8;

//     if (spot.status === 'available') {
//       if (spot.type === 'public' || spot.price_per_hour === 0) {
//         iconColor = '#22C55E'; // Green for free parking
//       } else {
//         iconColor = '#3B82F6'; // Blue for paid parking
//       }
//     }

//     // Different icon for maintenance
//     if (spot.status === 'maintenance') {
//       iconColor = '#F59E0B'; // Yellow for maintenance
//       scale = 6;
//     }

//     return {
//       path: window.google.maps.SymbolPath.CIRCLE,
//       scale: scale,
//       fillColor: iconColor,
//       fillOpacity: 0.8,
//       strokeColor: '#FFFFFF',
//       strokeWeight: 2,
//     };
//   };

//   const filteredSpots = parkingSpots.filter(spot => {
//     if (filter === 'all') return true;
//     if (filter === 'free') return spot.type === 'public' || spot.price_per_hour === 0;
//     if (filter === 'paid') return spot.type === 'paid' && spot.price_per_hour > 0;
//     if (filter === 'available') return spot.status === 'available';
//     if (filter === 'occupied') return spot.status === 'occupied';
//     return true;
//   });

//   const onPlaceChanged = () => {
//     if (autocomplete !== null) {
//       const place = autocomplete.getPlace();
//       if (place.geometry) {
//         const lat = place.geometry.location.lat();
//         const lng = place.geometry.location.lng();
//         setUserLocation({ lat, lng });
//         fetchNearbyParking(lat, lng);
        
//         // Center the map on the selected location
//         if (map) {
//           map.panTo({ lat, lng });
//           map.setZoom(15);
//         }
//       }
//     }
//   };

//   const handleAutocompleteLoad = (autocompleteInstance) => {
//     setAutocomplete(autocompleteInstance);
//   };

//   const handleMapLoad = (mapInstance) => {
//     setMap(mapInstance);
//     setMapError(''); // Clear any previous map errors
//   };

//   const handleMapLoadError = (error) => {
//     console.error('Google Maps failed to load:', error);
//     setMapError('Failed to load Google Maps. Please check your API key.');
//   };

//   const handleCurrentLocation = () => {
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           const newLocation = {
//             lat: position.coords.latitude,
//             lng: position.coords.longitude
//           };
//           setUserLocation(newLocation);
//           fetchNearbyParking(newLocation.lat, newLocation.lng);
          
//           if (map) {
//             map.panTo(newLocation);
//             map.setZoom(15);
//           }
//         },
//         (error) => {
//           console.error('Error getting location:', error);
//           setError('Unable to get current location');
//         }
//       );
//     }
//   };

//   // Debug logs
//   useEffect(() => {
//     console.log('Filtered spots:', filteredSpots);
//     console.log('User location:', userLocation);
//     console.log('Loading state:', loading);
//   }, [filteredSpots, userLocation, loading]);

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <h1 className="text-3xl font-bold text-gray-900 mb-6">Find Parking Near You</h1>
      
//       {/* Search and Filter Controls */}
//       <div className="mb-4 p-4 bg-white rounded-lg shadow-md">
//         <div className="flex flex-col md:flex-row gap-4 items-center">
//           {/* Location Search */}
//           <div className="w-full md:w-1/2">
//             <div className="relative">
//               <LoadScript 
//                 googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
//                 libraries={['places']}
//                 onError={handleMapLoadError}
//               >
//                 <Autocomplete
//                   onLoad={handleAutocompleteLoad}
//                   onPlaceChanged={onPlaceChanged}
//                 >
//                   <input
//                     type="text"
//                     placeholder="Search for a location..."
//                     className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     value={searchQuery}
//                     onChange={(e) => setSearchQuery(e.target.value)}
//                   />
//                 </Autocomplete>
//               </LoadScript>
//             </div>
//           </div>
          
//           {/* Current Location Button */}
//           <button
//             onClick={handleCurrentLocation}
//             className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
//           >
//             Use Current Location
//           </button>
          
//           {/* Filter Controls */}
//           <div className="flex flex-wrap gap-2">
//             <button
//               onClick={() => setFilter('all')}
//               className={`px-3 py-1 rounded-md text-sm font-medium ${
//                 filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
//               }`}
//             >
//               All
//             </button>
//             <button
//               onClick={() => setFilter('free')}
//               className={`px-3 py-1 rounded-md text-sm font-medium ${
//                 filter === 'free' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
//               }`}
//             >
//               Free
//             </button>
//             <button
//               onClick={() => setFilter('paid')}
//               className={`px-3 py-1 rounded-md text-sm font-medium ${
//                 filter === 'paid' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
//               }`}
//             >
//               Paid
//             </button>
//             <button
//               onClick={() => setFilter('available')}
//               className={`px-3 py-1 rounded-md text-sm font-medium ${
//                 filter === 'available' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
//               }`}
//             >
//               Available
//             </button>
//           </div>
//         </div>
//       </div>

//       {error && (
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//           {error}
//         </div>
//       )}

//       {mapError && (
//         <div className="bg-red-100 border border-red-400 text-red-800 px-4 py-3 rounded mb-4">
//           {mapError}
//           <p className="mt-2 text-sm">Please check your Google Maps API key in Google Cloud Console</p>
//         </div>
//       )}

//       <div className="bg-white rounded-lg shadow-lg overflow-hidden">
//         <div className="h-96">
//           <LoadScript 
//             googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
//             libraries={['places']}
//             onError={handleMapLoadError}
//           >
//             <GoogleMap
//               mapContainerStyle={mapContainerStyle}
//               center={center}
//               zoom={13}
//               options={{
//                 streetViewControl: false,
//                 mapTypeControl: false,
//                 fullscreenControl: true,
//                 zoomControl: true,
//                 // Add these options to help with debugging
//                 backgroundColor: '#f0f0f0', // Light gray background if map doesn't load
//               }}
//               onLoad={handleMapLoad}
//               onUnmount={() => setMap(null)}
//             >
//               {filteredSpots.length > 0 ? (
//                 filteredSpots.map((spot) => (
//                   <Marker
//                     key={spot.id}
//                     position={{ lat: spot.lat, lng: spot.lng }}
//                     onClick={() => handleMarkerClick(spot)}
//                     icon={getMarkerIcon(spot)}
//                     title={`${spot.name} - ${spot.status === 'available' ? (spot.type === 'public' || spot.price_per_hour === 0 ? 'FREE' : `$${spot.price_per_hour}/hr`) : 'OCCUPIED'}`}
//                   />
//                 ))
//               ) : (
//                 <></> // No markers if no spots
//               )}
              
//               {selectedSpot && (
//                 <InfoWindow
//                   position={{ lat: selectedSpot.lat, lng: selectedSpot.lng }}
//                   onCloseClick={handleInfoWindowClose}
//                 >
//                   <div className="p-4 min-w-[250px]">
//                     <h3 className="font-bold text-lg text-gray-900">{selectedSpot.name}</h3>
//                     <p className="text-sm text-gray-600 mt-1">{selectedSpot.address}</p>
                    
//                     <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
//                       <div>
//                         <span className="font-medium">Status:</span>
//                         <span className={`ml-1 px-2 py-1 rounded text-xs ${
//                           selectedSpot.status === 'available' ? 'bg-green-100 text-green-800' :
//                           selectedSpot.status === 'occupied' ? 'bg-red-100 text-red-800' :
//                           'bg-yellow-100 text-yellow-800'
//                         }`}>
//                           {selectedSpot.status.toUpperCase()}
//                         </span>
//                       </div>
//                       <div>
//                         <span className="font-medium">Type:</span>
//                         <span className={`ml-1 px-2 py-1 rounded text-xs ${
//                           selectedSpot.type === 'public' || selectedSpot.price_per_hour === 0 ? 'bg-green-100 text-green-800' :
//                           'bg-blue-100 text-blue-800'
//                         }`}>
//                           {selectedSpot.type.toUpperCase()}
//                         </span>
//                       </div>
//                       <div>
//                         <span className="font-medium">Price:</span>
//                         <span className="ml-1">
//                           {selectedSpot.type === 'public' || selectedSpot.price_per_hour === 0 ? 'FREE' : `$${selectedSpot.price_per_hour}/hr`}
//                         </span>
//                       </div>
//                       <div>
//                         <span className="font-medium">Capacity:</span>
//                         <span className="ml-1">{selectedSpot.capacity - selectedSpot.occupied_slots}/{selectedSpot.capacity}</span>
//                       </div>
//                     </div>
                    
//                     <div className="mt-3 text-xs text-gray-500">
//                       Distance: {selectedSpot.distance.toFixed(2)} km
//                     </div>
//                   </div>
//                 </InfoWindow>
//               )}
//             </GoogleMap>
//           </LoadScript>
//         </div>
        
//         {/* Legend */}
//         <div className="p-4 bg-gray-50 border-t">
//           <h3 className="font-semibold text-gray-700 mb-2">Parking Legend:</h3>
//           <div className="flex flex-wrap gap-4 text-sm">
//             <div className="flex items-center">
//               <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
//               <span>Free Parking</span>
//             </div>
//             <div className="flex items-center">
//               <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
//               <span>Paid Parking</span>
//             </div>
//             <div className="flex items-center">
//               <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
//               <span>Occupied</span>
//             </div>
//             <div className="flex items-center">
//               <div className="w-4 h-4 rounded-full bg-yellow-500 mr-2"></div>
//               <span>Maintenance</span>
//             </div>
//           </div>
//         </div>
        
//         {/* Parking List */}
//         <div className="p-4">
//           <h2 className="text-xl font-semibold mb-4">
//             Available Parking Spots ({filteredSpots.length})
//             {filteredSpots.length === 0 && !loading && (
//               <span className="text-red-500 ml-2">No parking spots found in this area</span>
//             )}
//           </h2>
//           {filteredSpots.length > 0 ? (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//               {filteredSpots.slice(0, 12).map((spot) => (
//                 <div 
//                   key={spot.id} 
//                   className={`border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${
//                     spot.status === 'available' ? 'hover:border-blue-500' : 'opacity-60'
//                   }`}
//                   onClick={() => setSelectedSpot(spot)}
//                 >
//                   <div className="flex justify-between items-start">
//                     <h3 className="font-semibold text-lg text-gray-900">{spot.name}</h3>
//                     <span className={`px-2 py-1 rounded text-xs ${
//                       spot.status === 'available' ? 
//                         (spot.type === 'public' || spot.price_per_hour === 0 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800') :
//                         'bg-red-100 text-red-800'
//                     }`}>
//                       {spot.status.toUpperCase()}
//                     </span>
//                   </div>
//                   <p className="text-sm text-gray-600 mt-1">{spot.address}</p>
//                   <div className="mt-2 flex justify-between items-center">
//                     <span className="text-sm font-medium">
//                       {spot.type === 'public' || spot.price_per_hour === 0 ? 'FREE' : `$${spot.price_per_hour}/hr`}
//                     </span>
//                     <span className="text-sm text-gray-500">
//                       {spot.distance.toFixed(2)} km
//                     </span>
//                   </div>
//                   <div className="mt-2 text-xs text-gray-500">
//                     Capacity: {spot.capacity - spot.occupied_slots}/{spot.capacity}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <div className="text-center py-8 text-gray-500">
//               No parking spots found in this area. Try searching for a different location.
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default UserHome;

import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow, Autocomplete } from '@react-google-maps/api';
import api from '../../utils/api';

const UserHome = () => {
  const [parkingSpots, setParkingSpots] = useState([]);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [userLocation, setUserLocation] = useState({ lat: 55.6761, lng: 12.5683 }); // Copenhagen default
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'free', 'paid', 'available', 'occupied'
  const [searchQuery, setSearchQuery] = useState('');
  const [map, setMap] = useState(null);
  const [autocomplete, setAutocomplete] = useState(null);
  
  const autocompleteRef = useRef(null);
  const mapContainerStyle = {
    width: '100%',
    height: '500px'
  };

  const center = userLocation;

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          fetchNearbyParking(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
          fetchNearbyParking(55.6761, 12.5683); // Default to Copenhagen
        }
      );
    } else {
      fetchNearbyParking(55.6761, 12.5683); // Default to Copenhagen
    }
  }, []);

  const fetchNearbyParking = async (lat, lng) => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get(`/parking/nearby?lat=${lat}&lng=${lng}`);
      setParkingSpots(response.data);
    } catch (error) {
      setError('Failed to fetch parking spots');
      console.error('Error fetching parking spots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkerClick = (spot) => {
    setSelectedSpot(spot);
  };

  const handleInfoWindowClose = () => {
    setSelectedSpot(null);
  };

  const getMarkerIcon = (spot) => {
    let iconColor = '#FF0000'; // Default red for occupied
    let scale = 8;

    if (spot.status === 'available') {
      if (spot.type === 'public' || spot.price_per_hour === 0) {
        iconColor = '#22C55E'; // Green for free parking
      } else {
        iconColor = '#3B82F6'; // Blue for paid parking
      }
    }

    // Different icon for maintenance
    if (spot.status === 'maintenance') {
      iconColor = '#F59E0B'; // Yellow for maintenance
      scale = 6;
    }

    return {
      path: window.google.maps.SymbolPath.CIRCLE,
      scale: scale,
      fillColor: iconColor,
      fillOpacity: 0.8,
      strokeColor: '#FFFFFF',
      strokeWeight: 2,
    };
  };

  const filteredSpots = parkingSpots.filter(spot => {
    if (filter === 'all') return true;
    if (filter === 'free') return spot.type === 'public' || spot.price_per_hour === 0;
    if (filter === 'paid') return spot.type === 'paid' && spot.price_per_hour > 0;
    if (filter === 'available') return spot.status === 'available';
    if (filter === 'occupied') return spot.status === 'occupied';
    return true;
  });

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      if (place.geometry) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setUserLocation({ lat, lng });
        fetchNearbyParking(lat, lng);
        
        // Center the map on the selected location
        if (map) {
          map.panTo({ lat, lng });
          map.setZoom(15);
        }
      }
    }
  };

  const handleAutocompleteLoad = (autocompleteInstance) => {
    setAutocomplete(autocompleteInstance);
  };

  const handleMapLoad = (mapInstance) => {
    setMap(mapInstance);
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(newLocation);
          fetchNearbyParking(newLocation.lat, newLocation.lng);
          
          if (map) {
            map.panTo(newLocation);
            map.setZoom(15);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('Unable to get current location');
        }
      );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Find Parking Near You</h1>
      
      {/* Search and Filter Controls */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          {/* Location Search */}
          <div className="w-full md:w-1/2">
            <div className="relative">
              <LoadScript 
                googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
                libraries={['places']}
              >
                <Autocomplete
                  onLoad={handleAutocompleteLoad}
                  onPlaceChanged={onPlaceChanged}
                >
                  <input
                    type="text"
                    placeholder="Search for a location..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </Autocomplete>
              </LoadScript>
            </div>
          </div>
          
          {/* Current Location Button */}
          <button
            onClick={handleCurrentLocation}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Use Current Location
          </button>
          
          {/* Filter Controls */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('free')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                filter === 'free' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Free
            </button>
            <button
              onClick={() => setFilter('paid')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                filter === 'paid' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Paid
            </button>
            <button
              onClick={() => setFilter('available')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                filter === 'available' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Available
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Map Container */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
        <div className="h-96 md:h-[500px]">
          <LoadScript 
            googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
            libraries={['places']}
          >
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={center}
              zoom={13}
              options={{
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: true,
                zoomControl: true,
              }}
              onLoad={handleMapLoad}
            >
              {filteredSpots.length > 0 ? (
                filteredSpots.map((spot) => (
                  <Marker
                    key={spot.id}
                    position={{ lat: spot.lat, lng: spot.lng }}
                    onClick={() => handleMarkerClick(spot)}
                    icon={getMarkerIcon(spot)}
                    title={`${spot.name} - ${spot.status === 'available' ? (spot.type === 'public' || spot.price_per_hour === 0 ? 'FREE' : `$${spot.price_per_hour}/hr`) : 'OCCUPIED'}`}
                  />
                ))
              ) : (
                <></> // No markers if no spots
              )}
              
              {selectedSpot && (
                <InfoWindow
                  position={{ lat: selectedSpot.lat, lng: selectedSpot.lng }}
                  onCloseClick={handleInfoWindowClose}
                >
                  <div className="p-4 min-w-[250px]">
                    <h3 className="font-bold text-lg text-gray-900">{selectedSpot.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{selectedSpot.address}</p>
                    
                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium">Status:</span>
                        <span className={`ml-1 px-2 py-1 rounded text-xs ${
                          selectedSpot.status === 'available' ? 'bg-green-100 text-green-800' :
                          selectedSpot.status === 'occupied' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {selectedSpot.status.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Type:</span>
                        <span className={`ml-1 px-2 py-1 rounded text-xs ${
                          selectedSpot.type === 'public' || selectedSpot.price_per_hour === 0 ? 'bg-green-100 text-green-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {selectedSpot.type.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Price:</span>
                        <span className="ml-1">
                          {selectedSpot.type === 'public' || selectedSpot.price_per_hour === 0 ? 'FREE' : `$${selectedSpot.price_per_hour}/hr`}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Capacity:</span>
                        <span className="ml-1">{selectedSpot.capacity - selectedSpot.occupied_slots}/{selectedSpot.capacity}</span>
                      </div>
                    </div>
                    
                    <div className="mt-3 text-xs text-gray-500">
                      Distance: {selectedSpot.distance.toFixed(2)} km
                    </div>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          </LoadScript>
        </div>
      </div>

      {/* Legend */}
      <div className="p-4 bg-gray-50 border rounded-lg mb-6">
        <h3 className="font-semibold text-gray-700 mb-2">Parking Legend:</h3>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
            <span>Free Parking</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
            <span>Paid Parking</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
            <span>Occupied</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-yellow-500 mr-2"></div>
            <span>Maintenance</span>
          </div>
        </div>
      </div>

      {/* Parking List */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">
            Available Parking Spots ({filteredSpots.length})
            {filteredSpots.length === 0 && !loading && (
              <span className="text-red-500 ml-2">No parking spots found in this area</span>
            )}
          </h2>
        </div>
        {filteredSpots.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {filteredSpots.map((spot) => (
              <div 
                key={spot.id} 
                className={`border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${
                  spot.status === 'available' ? 'hover:border-blue-500' : 'opacity-60'
                }`}
                onClick={() => setSelectedSpot(spot)}
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-lg text-gray-900">{spot.name}</h3>
                  <span className={`px-2 py-1 rounded text-xs ${
                    spot.status === 'available' ? 
                      (spot.type === 'public' || spot.price_per_hour === 0 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800') :
                      'bg-red-100 text-red-800'
                  }`}>
                    {spot.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{spot.address}</p>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-sm font-medium">
                    {spot.type === 'public' || spot.price_per_hour === 0 ? 'FREE' : `$${spot.price_per_hour}/hr`}
                  </span>
                  <span className="text-sm text-gray-500">
                    {spot.distance.toFixed(2)} km
                  </span>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Capacity: {spot.capacity - spot.occupied_slots}/{spot.capacity}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            {loading ? 'Loading parking spots...' : 'No parking spots found in this area. Try searching for a different location.'}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserHome;