"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Camera, RefreshCw, Check, X, AlertCircle } from "lucide-react";

interface CameraCaptureProps {
  onCapture: (dataUrl: string) => void;
  onCancel: () => void;
}

// Opens the device webcam, shows a live preview, and captures a square frame.
export function CameraCapture({ onCapture, onCancel }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [captured, setCaptured] = useState<string | null>(null);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 640 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setReady(true);
      } catch (e: any) {
        setError(
          e?.name === "NotAllowedError"
            ? "Camera permission denied. Please allow camera access or use Upload instead."
            : e?.name === "NotFoundError"
            ? "No camera found on this device. Use Upload instead."
            : `Camera error: ${e?.message ?? "unknown"}`
        );
      }
    }
    start();
    return () => { cancelled = true; stopStream(); };
  }, [stopStream]);

  function capture() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    // Capture a square (centre-crop) at 480×480.
    const size = Math.min(video.videoWidth, video.videoHeight);
    const sx = (video.videoWidth - size) / 2;
    const sy = (video.videoHeight - size) / 2;
    const canvas = document.createElement("canvas");
    canvas.width = 480;
    canvas.height = 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // Mirror horizontally for a natural selfie preview result.
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, sx, sy, size, size, 0, 0, canvas.width, canvas.height);
    const url = canvas.toDataURL("image/jpeg", 0.88);
    setCaptured(url);
    stopStream();
  }

  function retake() {
    setCaptured(null);
    setReady(false);
    // restart stream
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 640 } },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setReady(true);
      } catch (e) {
        setError("Failed to restart camera.");
      }
    })();
  }

  function confirmCapture() {
    if (captured) onCapture(captured);
  }

  if (error) {
    return (
      <div className="space-y-3 text-center">
        <div className="flex items-center justify-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />{error}
        </div>
        <Button variant="outline" size="sm" onClick={onCancel}>Close</Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-neutral-900">
        {captured ? (
          <img src={captured} alt="Captured" className="h-full w-full object-cover" />
        ) : (
          <>
            <video
              ref={videoRef}
              playsInline
              muted
              className="h-full w-full object-cover"
              style={{ transform: "scaleX(-1)" }}
            />
            {!ready && (
              <div className="absolute inset-0 grid place-items-center text-white/70">
                <div className="flex flex-col items-center gap-2">
                  <Camera className="h-8 w-8 animate-pulse" />
                  <span className="text-xs">Starting camera…</span>
                </div>
              </div>
            )}
            {/* centre square guide */}
            {ready && (
              <div className="pointer-events-none absolute inset-0 grid place-items-center">
                <div className="h-[80%] w-[80%] rounded border-2 border-white/50" />
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        {captured ? (
          <>
            <Button variant="outline" size="sm" onClick={retake}><RefreshCw className="mr-1.5 h-3.5 w-3.5" />Retake</Button>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={onCancel}><X className="mr-1 h-3.5 w-3.5" />Cancel</Button>
              <Button size="sm" onClick={confirmCapture}><Check className="mr-1.5 h-3.5 w-3.5" />Use photo</Button>
            </div>
          </>
        ) : (
          <>
            <span className="text-xs text-muted-foreground">{ready ? "Centre the face, then capture" : "Waiting for camera…"}</span>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
              <Button size="sm" onClick={capture} disabled={!ready}><Camera className="mr-1.5 h-3.5 w-3.5" />Capture</Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
