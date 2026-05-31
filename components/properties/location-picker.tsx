"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Search, X } from "lucide-react";

interface LocationPickerProps {
  latitude: number | null;
  longitude: number | null;
  address?: string;
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  height?: string;
}

let googleMapsPromise: Promise<void> | null = null;

function loadGoogleMapsScript(apiKey: string): Promise<void> {
  if (googleMapsPromise) return googleMapsPromise;
  if (typeof window !== "undefined" && window.google?.maps)
    return Promise.resolve();

  googleMapsPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector(
      'script[src*="maps.googleapis.com/maps/api/js"]',
    );

    if (existingScript) {
      const checkLoaded = setInterval(() => {
        if (window.google?.maps) {
          clearInterval(checkLoaded);
          resolve();
        }
      }, 100);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      googleMapsPromise = null;
      reject(new Error("Failed to load Google Maps"));
    };
    document.head.appendChild(script);
  });

  return googleMapsPromise;
}

export function LocationPicker({
  latitude,
  longitude,
  address,
  onLocationSelect,
  height = "500px",
}: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);

  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentAddress, setCurrentAddress] = useState(address || "");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let isMounted = true;

    const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!API_KEY) {
      setError("Google Maps API key not configured");
      return;
    }

    loadGoogleMapsScript(API_KEY)
      .then(() => {
        if (isMounted) {
          setIsLoaded(true);
          initializeMap();
        }
      })
      .catch((err) => {
        if (isMounted) setError("Failed to load Google Maps");
      });

    return () => {
      isMounted = false;
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
    };
  }, []);

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

    try {
      // Default to a center position (world view) or use provided coordinates
      const defaultCenter =
        latitude && longitude
          ? { lat: latitude, lng: longitude }
          : { lat: 20, lng: 0 }; // World center as default

      const map = new window.google.maps.Map(mapRef.current, {
        zoom: latitude && longitude ? 15 : 2,
        center: defaultCenter,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
      });

      mapInstanceRef.current = map;

      // Add marker if coordinates provided
      if (latitude && longitude) {
        addMarker(map, { lat: latitude, lng: longitude });
      }

      // Add click listener to map
      map.addListener("click", (event: any) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        handleLocationSelected(lat, lng);
      });

      // Initialize Places Autocomplete
      if (searchInputRef.current) {
        autocompleteRef.current = new window.google.maps.places.Autocomplete(
          searchInputRef.current,
          {
            types: ["geocode"],
            componentRestrictions: { country: [] }, // Allow all countries
          },
        );

        autocompleteRef.current.addListener("place_changed", () => {
          const place = autocompleteRef.current.getPlace();

          if (!place.geometry) {
            return;
          }

          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          const formattedAddress = place.formatted_address || "";

          map.setCenter({ lat, lng });
          map.setZoom(15);
          handleLocationSelected(lat, lng, formattedAddress);
        });
      }
    } catch (err) {
      setError("Failed to initialize map");
    }
  };

  const addMarker = (map: any, position: { lat: number; lng: number }) => {
    if (markerRef.current) {
      markerRef.current.setMap(null);
    }

    const marker = new window.google.maps.Marker({
      position,
      map,
      animation: window.google.maps.Animation.DROP,
      title: "Selected Location",
    });

    markerRef.current = marker;
  };

  const handleLocationSelected = (lat: number, lng: number, addr?: string) => {
    if (!mapInstanceRef.current) return;

    addMarker(mapInstanceRef.current, { lat, lng });

    // If address not provided, get it from reverse geocoding
    if (!addr && window.google?.maps) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode(
        { location: { lat, lng } },
        (results: any, status: any) => {
          if (status === "OK" && results[0]) {
            const address = results[0].formatted_address;
            setCurrentAddress(address);
            onLocationSelect(lat, lng, address);
          } else {
            setCurrentAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
            onLocationSelect(lat, lng, `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
          }
        },
      );
    } else {
      setCurrentAddress(addr || `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      onLocationSelect(
        lat,
        lng,
        addr || `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      );
    }
  };

  const handleClearLocation = () => {
    setCurrentAddress("");
    setSearchQuery("");
    if (searchInputRef.current) {
      searchInputRef.current.value = "";
    }
    if (markerRef.current) {
      markerRef.current.setMap(null);
    }
  };

  if (error) {
    return (
      <Card
        className="p-6 flex flex-col items-center justify-center text-center"
        style={{ height }}
      >
        <MapPin className="h-12 w-12 text-gray-400 mb-4" />
        <p className="text-sm text-gray-500">{error}</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden" style={{ height }}>
      <div className="h-full flex flex-col bg-white relative">
        {/* Search Box */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex gap-2 mb-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Search for a location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            {currentAddress && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearLocation}
                className="px-2"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
          {currentAddress && (
            <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded flex items-start gap-2">
              <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0 text-blue-600" />
              <span>{currentAddress}</span>
            </div>
          )}
        </div>

        {/* Map Container */}
        <div
          ref={mapRef}
          className="flex-1 w-full notranslate relative"
          style={{ minHeight: "0" }}
        />

        {/* Loading Overlay */}
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
            <div className="text-center">
              <MapPin className="h-12 w-12 text-gray-400 mb-2 mx-auto animate-pulse" />
              <p className="text-sm text-gray-500">Loading map...</p>
            </div>
          </div>
        )}

        {/* Instructions */}
        {isLoaded && !currentAddress && (
          <div className="absolute bottom-4 left-4 bg-white p-3 rounded shadow-lg text-xs text-gray-600 max-w-xs z-10">
            <p className="font-medium mb-1">
              ✓ Search above or click on the map to select a location
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
