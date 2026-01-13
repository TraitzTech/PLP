"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { MapPin } from "lucide-react";

interface PropertyMapProps {
  latitude: number;
  longitude: number;
  title?: string;
  address?: string;
  zoom?: number;
  height?: string;
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

export function PropertyMap({
  latitude,
  longitude,
  title = "Property Location",
  address,
  zoom = 15,
  height = "400px",
}: PropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!GOOGLE_MAPS_API_KEY) {
      setError("Google Maps API key not configured");
      console.error("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not set");
      return;
    }

    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      initializeMap();
      return;
    }

    // Load Google Maps script
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initMap`;
    script.async = true;
    script.defer = true;

    window.initMap = () => {
      setIsLoaded(true);
      initializeMap();
    };

    script.onerror = () => {
      setError("Failed to load Google Maps");
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      delete window.initMap;
    };
  }, []);

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

    try {
      const position = { lat: latitude, lng: longitude };

      const map = new window.google.maps.Map(mapRef.current, {
        zoom: zoom,
        center: position,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
      });

      // Add marker
      const marker = new window.google.maps.Marker({
        position: position,
        map: map,
        title: title,
        animation: window.google.maps.Animation.DROP,
      });

      // Add info window
      if (address || title) {
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 8px;">
              <h3 style="margin: 0 0 4px 0; font-weight: 600;">${title}</h3>
              ${address ? `<p style="margin: 0; color: #666;">${address}</p>` : ""}
            </div>
          `,
        });

        marker.addListener("click", () => {
          infoWindow.open(map, marker);
        });
      }

      setIsLoaded(true);
    } catch (err) {
      console.error("Error initializing map:", err);
      setError("Failed to initialize map");
    }
  };

  if (error) {
    return (
      <Card className="p-6" style={{ height }}>
        <div className="flex flex-col items-center justify-center h-full text-center">
          <MapPin className="h-12 w-12 text-gray-400 mb-4" />
          <p className="text-sm text-gray-500">{error}</p>
          {address && (
            <p className="text-sm text-gray-600 mt-2">{address}</p>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div
        ref={mapRef}
        style={{ height, width: "100%" }}
        className="relative"
      >
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <MapPin className="h-12 w-12 text-gray-400 mb-2 mx-auto animate-pulse" />
              <p className="text-sm text-gray-500">Loading map...</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

// Simple static map fallback component
export function StaticPropertyMap({
  latitude,
  longitude,
  address,
  height = "400px",
}: Omit<PropertyMapProps, "zoom" | "title">) {
  return (
    <Card className="p-6" style={{ height }}>
      <div className="flex flex-col items-center justify-center h-full text-center">
        <MapPin className="h-12 w-12 text-plp-purple mb-4" />
        <div className="space-y-2">
          <p className="text-sm font-medium">Location</p>
          {address && <p className="text-sm text-gray-600">{address}</p>}
          <p className="text-xs text-gray-500">
            Coordinates: {latitude.toFixed(6)}, {longitude.toFixed(6)}
          </p>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-plp-purple hover:underline inline-block mt-2"
          >
            Open in Google Maps →
          </a>
        </div>
      </div>
    </Card>
  );
}
