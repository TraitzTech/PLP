"use client";

import React, { useEffect, useRef, useState } from "react";
import { Camera, MapPin, Square, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type PaoGpsCapture = { latitude: number; longitude: number; accuracy: number; capturedAt: string };

export function PaoCaptureEvidence({
  photos,
  onPhotosChange,
  video,
  onVideoChange,
  duration,
  onDurationChange,
  gps,
  onGpsChange,
}: {
  photos: File[];
  onPhotosChange: (files: File[]) => void;
  video: File | null;
  onVideoChange: (file: File | null) => void;
  duration: number;
  onDurationChange: (seconds: number) => void;
  gps: PaoGpsCapture | null;
  onGpsChange: (location: PaoGpsCapture) => void;
}) {
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef(0);
  const stopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [recording, setRecording] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [photoError, setPhotoError] = useState("");

  useEffect(() => {
    if (!recording) return;
    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - startedAtRef.current) / 1000)), 250);
    return () => clearInterval(timer);
  }, [recording]);

  useEffect(() => () => {
    if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  const onPhotoSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    const combined = [...photos, ...files].slice(0, 5);
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const stale = combined.some((file) => file.lastModified < cutoff || file.lastModified > Date.now() + 5 * 60 * 1000);
    if (files.length + photos.length > 5) setPhotoError("Choose no more than five photos.");
    else if (stale) setPhotoError("Photos must be captured within the last 30 days.");
    else setPhotoError("");
    onPhotosChange(stale ? photos : combined);
    event.target.value = "";
  };

  const captureLocation = () => {
    if (!navigator.geolocation) return setPhotoError("This browser does not provide GPS location.");
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        onGpsChange({ latitude: coords.latitude, longitude: coords.longitude, accuracy: coords.accuracy, capturedAt: new Date().toISOString() });
        setGettingLocation(false);
      },
      (error) => {
        setPhotoError(error.message || "Allow location access to capture the property GPS position.");
        setGettingLocation(false);
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 }
    );
  };

  useEffect(() => {
    captureLocation();
    // Capture the property coordinates as soon as the form is opened.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
        throw new Error("Live camera recording is not supported in this browser.");
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
      streamRef.current = stream;
      const mimeType = ["video/webm;codecs=vp8,opus", "video/webm", "video/mp4"].find((type) => MediaRecorder.isTypeSupported(type));
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType, videoBitsPerSecond: 1_500_000 } : { videoBitsPerSecond: 1_500_000 });
      recorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (event) => { if (event.data.size) chunksRef.current.push(event.data); };
      recorder.onstop = () => {
        const seconds = Math.round((Date.now() - startedAtRef.current) / 1000);
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "video/webm" });
        const extension = blob.type.includes("mp4") ? "mp4" : "webm";
        onVideoChange(new File([blob], `pao-live-${Date.now()}.${extension}`, { type: blob.type, lastModified: Date.now() }));
        onDurationChange(seconds);
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        setRecording(false);
      };
      startedAtRef.current = Date.now();
      setElapsed(0);
      setRecording(true);
      recorder.start(500);
      stopTimerRef.current = setTimeout(() => recorder.stop(), 45_000);
    } catch (error: any) {
      setPhotoError(error?.message || "Could not start the camera. Allow camera access and try again.");
    }
  };

  const stopRecording = () => {
    if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
  };

  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Camera className="h-5 w-5" />On-site evidence</CardTitle></CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="pao-photos" className="text-sm font-medium">Property photos (3–5, captured within 30 days) *</label>
          <input id="pao-photos" type="file" accept="image/*" capture="environment" multiple onChange={onPhotoSelection} className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-purple-50 file:px-4 file:py-2 file:font-medium file:text-plp-purple" />
          <p className="text-xs text-gray-500">{photos.length} of 5 selected. Use your camera to capture current property photos.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" variant="outline" onClick={captureLocation} disabled={gettingLocation}>
            <MapPin className="mr-2 h-4 w-4" />{gettingLocation ? "Capturing GPS…" : gps ? "Refresh GPS position" : "Capture GPS position"}
          </Button>
          {gps && <span className="text-xs text-emerald-700">GPS captured · ±{Math.round(gps.accuracy)} m accuracy</span>}
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Live property video (10–45 seconds) *</p>
          <div className="flex flex-wrap items-center gap-3">
            {!recording ? (
              <Button type="button" variant="outline" onClick={startRecording}><Video className="mr-2 h-4 w-4" />Record with camera</Button>
            ) : (
              <Button type="button" variant="destructive" onClick={stopRecording}><Square className="mr-2 h-4 w-4" />Stop ({elapsed}s)</Button>
            )}
            {video && <span className={`text-xs ${duration >= 10 && duration <= 45 ? "text-emerald-700" : "text-red-700"}`}>{duration}s camera video {duration >= 10 && duration <= 45 ? "ready" : "must be between 10 and 45 seconds"}</span>}
          </div>
        </div>
        {photoError && <p role="alert" className="text-sm text-red-600">{photoError}</p>}
      </CardContent>
    </Card>
  );
}
