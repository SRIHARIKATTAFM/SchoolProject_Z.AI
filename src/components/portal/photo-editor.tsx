"use client";

import { useState, useCallback, useRef } from "react";
import Cropper from "react-easy-crop";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Upload, RotateCw, Check, X, Image as ImageIcon, ZoomIn } from "lucide-react";

export interface PhotoCrop {
  dataUrl: string; // cropped JPEG data URL
  zoom: number;
  positionX: number;
  positionY: number;
}

interface PhotoEditorProps {
  initialPhoto?: string | null;
  initialZoom?: number;
  onConfirm: (photo: PhotoCrop) => void;
  onCancel?: () => void;
}

// Crop an image to a 3:4 portrait aspect (standard ID photo) and return a JPEG data URL.
async function cropImage(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  rotation = 0
): Promise<string> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return imageSrc;

  const maxSize = 480; // output width — plenty for a card photo
  canvas.width = maxSize;
  canvas.height = Math.round(maxSize * (4 / 3));

  // Translate to center, apply rotation, draw the cropped region scaled to the output.
  ctx.translate(canvas.width / 2, canvas.height / 2);
  if (rotation) ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-canvas.width / 2, -canvas.height / 2);

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    canvas.width,
    canvas.height
  );

  return canvas.toDataURL("image/jpeg", 0.88);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export function PhotoEditor({ initialPhoto, initialZoom, onConfirm, onCancel }: PhotoEditorProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(initialPhoto ?? null);
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(initialZoom ?? 1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [preview, setPreview] = useState<string | null>(initialPhoto ?? null);
  const fileRef = useRef<HTMLInputElement>(null);

  const onCropComplete = useCallback((_area: any, areaPixels: any) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 8 * 1024 * 1024) {
      alert("Image is larger than 8 MB. Please choose a smaller image.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setPreview(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
    };
    reader.readAsDataURL(f);
  }

  async function handleConfirm() {
    if (!imageSrc || !croppedAreaPixels) return;
    const out = await cropImage(imageSrc, croppedAreaPixels, rotation);
    setPreview(out);
    onConfirm({
      dataUrl: out,
      zoom,
      positionX: crop.x < 0 ? 1 - Math.min(1, Math.abs(crop.x) / 100) : 0.5,
      positionY: crop.y < 0 ? 1 - Math.min(1, Math.abs(crop.y) / 100) : 0.5,
    });
  }

  function reset() {
    setImageSrc(null);
    setPreview(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="space-y-4">
      {!imageSrc ? (
        <div
          onClick={() => fileRef.current?.click()}
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/30 p-8 text-center transition-colors hover:border-primary/50 hover:bg-muted/50"
        >
          <span className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
            <Upload className="h-5 w-5" />
          </span>
          <p className="text-sm font-medium">{preview ? "Replace photo" : "Upload student photo"}</p>
          <p className="text-xs text-muted-foreground">JPG / PNG · max 8 MB · 3:4 portrait</p>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={onFileChange} className="hidden" />
        </div>
      ) : (
        <div className="space-y-3">
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-neutral-900">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={3 / 4}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              restrictPosition={false}
              cropShape="rect"
              showGrid
            />
          </div>

          <div className="space-y-3 rounded-lg border border-border bg-card p-3">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs"><ZoomIn className="h-3 w-3" />Zoom</Label>
              <Slider value={[zoom]} min={1} max={3} step={0.05} onValueChange={(v) => setZoom(v[0])} />
            </div>
            <div className="flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={() => setRotation((r) => (r + 90) % 360)}>
                <RotateCw className="mr-1.5 h-3.5 w-3.5" />Rotate 90°
              </Button>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={reset}><X className="mr-1 h-3.5 w-3.5" />Reset</Button>
                <Button size="sm" onClick={handleConfirm}><Check className="mr-1 h-3.5 w-3.5" />Confirm crop</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {preview && (
        <div className="flex items-center gap-3 rounded-lg border border-green-300/50 bg-green-50 p-3 dark:border-green-500/30 dark:bg-green-950/30">
          <img src={preview} alt="Cropped preview" className="h-24 w-18 rounded-md border border-border object-cover" style={{ aspectRatio: "3/4" }} />
          <div className="flex-1">
            <Badge variant="secondary" className="gap-1"><ImageIcon className="h-3 w-3" />Photo ready</Badge>
            <p className="mt-1 text-xs text-muted-foreground">Cropped to 3:4 portrait. You can re-upload to adjust.</p>
            <Button variant="link" size="sm" className="h-auto p-0" onClick={() => fileRef.current?.click()}>Replace</Button>
          </div>
        </div>
      )}
    </div>
  );
}
