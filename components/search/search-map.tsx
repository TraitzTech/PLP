"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, X, ExternalLink, Bed, Bath, Maximize } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminProperty } from "@/services/types";
import Link from "next/link";

interface SearchMapProps {
  properties: AdminProperty[];
  height?: string;
  onPropertySelect?: (property: AdminProperty) => void;
}

declare global {
  interface Window {
    google: any;
  }
}

let googleMapsPromise: Promise<void> | null = null;

function loadGoogleMapsScript(apiKey: string): Promise<void> {
  if (googleMapsPromise) return googleMapsPromise;
  if (typeof window !== 'undefined' && window.google?.maps) return Promise.resolve();

  googleMapsPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
    
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
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
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

// Format price for display
function formatPrice(price: number | string): string {
  const numPrice = Number(price);
  if (numPrice >= 1000000) {
    return `${(numPrice / 1000000).toFixed(1)}M XAF`;
  } else if (numPrice >= 1000) {
    return `${(numPrice / 1000).toFixed(0)}K XAF`;
  }
  return `${numPrice.toLocaleString()} XAF`;
}

// Get primary image URL
function getImageUrl(property: AdminProperty): string {
  const images = property.images as any[];
  if (images && images.length > 0) {
    const primaryImage = images.find((img: any) => img.is_primary) || images[0];
    if (primaryImage?.image_path) {
      return `${process.env.NEXT_PUBLIC_API_URL}/../storage/listing_images/${primaryImage.image_path}`;
    }
  }
  return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" font-size="16" text-anchor="middle" dy=".3em" fill="%23999"%3ENo image%3C/text%3E%3C/svg%3E';
}

export function SearchMap({
  properties,
  height = "600px",
  onPropertySelect,
}: SearchMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const infoWindowRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<AdminProperty | null>(null);

  // Filter properties with valid coordinates
  const propertiesWithCoords = properties.filter(
    (p) => p.latitude && p.longitude && isFinite(Number(p.latitude)) && isFinite(Number(p.longitude))
  );

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
        }
      })
      .catch((err) => {
        if (isMounted) setError("Failed to load Google Maps");
      });

    return () => {
      isMounted = false;
      // Clean up markers
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
    };
  }, []);

  // Initialize map after loaded
  useEffect(() => {
    if (!isLoaded || !mapRef.current || !window.google) return;

    // Default center (Cameroon)
    let center = { lat: 5.9631, lng: 10.1591 };
    let zoom = 6;

    // If we have properties with coordinates, center on them
    if (propertiesWithCoords.length > 0) {
      const lats = propertiesWithCoords.map(p => Number(p.latitude));
      const lngs = propertiesWithCoords.map(p => Number(p.longitude));
      center = {
        lat: (Math.min(...lats) + Math.max(...lats)) / 2,
        lng: (Math.min(...lngs) + Math.max(...lngs)) / 2,
      };
      
      // Calculate appropriate zoom based on spread
      const latSpread = Math.max(...lats) - Math.min(...lats);
      const lngSpread = Math.max(...lngs) - Math.min(...lngs);
      const maxSpread = Math.max(latSpread, lngSpread);
      
      if (maxSpread < 0.01) zoom = 15;
      else if (maxSpread < 0.1) zoom = 12;
      else if (maxSpread < 1) zoom = 10;
      else if (maxSpread < 5) zoom = 8;
      else zoom = 6;
    }

    // Create or update map
    if (!mapInstanceRef.current) {
      try {
        const map = new window.google.maps.Map(mapRef.current, {
          zoom,
          center,
          disableDefaultUI: false,
          mapTypeControl: true,
          fullscreenControl: true,
          streetViewControl: false,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }],
            },
          ],
        });
        mapInstanceRef.current = map;

        // Create single info window to reuse
        infoWindowRef.current = new window.google.maps.InfoWindow();
      } catch (err) {
        setError("Failed to initialize map");
        return;
      }
    } else {
      mapInstanceRef.current.setCenter(center);
      mapInstanceRef.current.setZoom(zoom);
    }

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add markers for each property
    propertiesWithCoords.forEach((property) => {
      const position = { 
        lat: Number(property.latitude), 
        lng: Number(property.longitude) 
      };

      // Custom marker with price label
      const marker = new window.google.maps.Marker({
        position,
        map: mapInstanceRef.current,
        title: property.title,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: property.for_rent ? "#8B5CF6" : "#EC4899",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
        label: {
          text: formatPrice(property.price),
          color: "#1f2937",
          fontSize: "10px",
          fontWeight: "bold",
          className: "map-marker-label",
        },
      });

      // Click handler for marker
      marker.addListener("click", () => {
        setSelectedProperty(property);
        onPropertySelect?.(property);

        // Show info window
        const content = `
          <div style="padding: 8px; max-width: 200px;">
            <strong style="font-size: 14px;">${property.title}</strong>
            <p style="color: #6b7280; font-size: 12px; margin: 4px 0;">${property.city || ''}, ${property.region || ''}</p>
            <p style="color: #8B5CF6; font-weight: bold; font-size: 14px;">${formatPrice(property.price)}</p>
          </div>
        `;
        infoWindowRef.current.setContent(content);
        infoWindowRef.current.open(mapInstanceRef.current, marker);
      });

      markersRef.current.push(marker);
    });

  }, [isLoaded, propertiesWithCoords.length, properties]);

  const handleClosePropertyCard = () => {
    setSelectedProperty(null);
    if (infoWindowRef.current) {
      infoWindowRef.current.close();
    }
  };

  if (error) {
    return (
      <Card className="p-6 flex flex-col items-center justify-center text-center" style={{ height }}>
        <MapPin className="h-12 w-12 text-gray-400 mb-4" />
        <p className="text-sm text-gray-500">{error}</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden relative" style={{ height }}>
      {/* Map Container */}
      <div ref={mapRef} className="w-full h-full notranslate" />

      {/* Loading Overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="text-center">
            <MapPin className="h-12 w-12 text-gray-400 mb-2 mx-auto animate-pulse" />
            <p className="text-sm text-gray-500">Loading map...</p>
          </div>
        </div>
      )}

      {/* No Properties Message */}
      {isLoaded && propertiesWithCoords.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
          <div className="text-center p-6">
            <MapPin className="h-12 w-12 text-gray-400 mb-2 mx-auto" />
            <p className="text-gray-600 font-medium">No properties with location data</p>
            <p className="text-sm text-gray-500">Properties without coordinates cannot be shown on the map</p>
          </div>
        </div>
      )}

      {/* Property Count Badge */}
      {isLoaded && propertiesWithCoords.length > 0 && (
        <div className="absolute top-4 left-4 z-20">
          <div className="bg-white rounded-full px-4 py-2 shadow-lg border">
            <span className="text-sm font-medium text-gray-700">
              {propertiesWithCoords.length} {propertiesWithCoords.length === 1 ? 'property' : 'properties'} on map
            </span>
          </div>
        </div>
      )}

      {/* Legend */}
      {isLoaded && propertiesWithCoords.length > 0 && (
        <div className="absolute top-4 right-4 z-20">
          <div className="bg-white rounded-lg px-3 py-2 shadow-lg border text-xs">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-3 h-3 rounded-full bg-purple-500"></span>
              <span>For Rent</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-pink-500"></span>
              <span>For Sale</span>
            </div>
          </div>
        </div>
      )}

      {/* Selected Property Card */}
      {selectedProperty && (
        <div className="absolute bottom-4 left-4 right-4 z-20 md:left-auto md:right-4 md:w-80">
          <Card className="p-0 overflow-hidden shadow-xl">
            <button
              onClick={handleClosePropertyCard}
              className="absolute top-2 right-2 z-10 bg-white/90 rounded-full p-1 hover:bg-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            
            {/* Property Image */}
            <div className="relative h-32">
              <img
                src={getImageUrl(selectedProperty)}
                alt={selectedProperty.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2">
                <span className={cn(
                  "px-2 py-1 text-xs font-medium rounded-full",
                  selectedProperty.for_rent 
                    ? "bg-purple-500 text-white" 
                    : "bg-pink-500 text-white"
                )}>
                  {selectedProperty.for_rent ? 'For Rent' : 'For Sale'}
                </span>
              </div>
            </div>

            {/* Property Info */}
            <div className="p-3">
              <h3 className="font-semibold text-gray-900 truncate">
                {selectedProperty.title}
              </h3>
              <p className="text-sm text-gray-500 flex items-center mt-1">
                <MapPin className="w-3 h-3 mr-1" />
                {selectedProperty.city}, {selectedProperty.region}
              </p>
              
              {/* Property Features */}
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-600">
                {selectedProperty.bedrooms && (
                  <span className="flex items-center gap-1">
                    <Bed className="w-3 h-3" /> {selectedProperty.bedrooms}
                  </span>
                )}
                {selectedProperty.bathrooms && (
                  <span className="flex items-center gap-1">
                    <Bath className="w-3 h-3" /> {selectedProperty.bathrooms}
                  </span>
                )}
                {selectedProperty.floor_area && (
                  <span className="flex items-center gap-1">
                    <Maximize className="w-3 h-3" /> {selectedProperty.floor_area} m²
                  </span>
                )}
              </div>

              {/* Price and Action */}
              <div className="flex items-center justify-between mt-3">
                <span className="text-lg font-bold text-plp-purple">
                  {formatPrice(selectedProperty.price)}
                </span>
                <Link href={`/property/${selectedProperty.id}`}>
                  <Button size="sm" className="btn-accent">
                    <ExternalLink className="w-3 h-3 mr-1" />
                    View
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      )}
    </Card>
  );
}
