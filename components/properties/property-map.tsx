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

export function PropertyMap({
  latitude,
  longitude,
  title = "Property Location",
  address,
  zoom = 15,
  height = "400px",
}: PropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const lat = Number(latitude);
    const lng = Number(longitude);
    
    if (!isFinite(lat) || !isFinite(lng)) {
      setError("Invalid coordinates provided");
      return;
    }

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
      // Clean up marker to prevent memory leaks
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
    };
  }, [latitude, longitude, zoom]); // Re-run when core location data changes

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

    const position = { lat: Number(latitude), lng: Number(longitude) };

    // 1. If map already exists, just update it (Prevents re-mounting nodes)
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setCenter(position);
      mapInstanceRef.current.setZoom(zoom);
      if (markerRef.current) {
        markerRef.current.setPosition(position);
      }
      return;
    }

    try {
      // 2. Create Map Instance
      const map = new window.google.maps.Map(mapRef.current, {
        zoom: zoom,
        center: position,
        disableDefaultUI: false,
        mapTypeControl: true,
      });
      mapInstanceRef.current = map;

      // 3. Create Marker
      const marker = new window.google.maps.Marker({
        position,
        map,
        title,
        animation: window.google.maps.Animation.DROP,
      });
      markerRef.current = marker;

      // 4. Add Info Window
      if (address || title) {
        const infoWindow = new window.google.maps.InfoWindow({
          content: `<div class="p-2"><strong>${title}</strong>${address ? `<p>${address}</p>` : ""}</div>`,
        });
        marker.addListener("click", () => infoWindow.open(map, marker));
        infoWindow.open(map, marker);
      }
    } catch (err) {
      setError("Failed to initialize map");
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
      {/* 
          IMPORTANT: The map container is always in the DOM. 
          The 'notranslate' class prevents Google Translate from breaking the DOM. 
      */}
      <div
        ref={mapRef}
        className="w-full h-full notranslate"
      />

      {/* Loader as an absolute overlay so it doesn't affect mapRef's children */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="text-center">
            <MapPin className="h-12 w-12 text-gray-400 mb-2 mx-auto animate-pulse" />
            <p className="text-sm text-gray-500">Loading map...</p>
          </div>
        </div>
      )}
    </Card>
  );
}

export function StaticPropertyMap({
  latitude,
  longitude,
  address,
  height = "400px",
}: Omit<PropertyMapProps, "zoom" | "title">) {
  return (
    <Card className="p-6 flex flex-col items-center justify-center text-center" style={{ height }}>
      <MapPin className="h-12 w-12 text-purple-600 mb-4" />
      <p className="text-sm font-medium">{address || "Location"}</p>
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-blue-600 hover:underline mt-2"
      >
        Open in Google Maps →
      </a>
    </Card>
  );
}
