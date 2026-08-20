import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./ImageCropperModal.css";

const ASPECT_RATIOS = [
  { label: "16:9 (Landscape)", value: 16 / 9, width: 1200, height: 675 },
  { label: "4:3 (Standard)", value: 4 / 3, width: 1000, height: 750 },
  { label: "1:1 (Square)", value: 1, width: 800, height: 800 },
];

const ImageCropperModal = ({
  isOpen,
  imagesToCrop = [], // Array of File objects or { file, id }
  onComplete, // Callback receiving array of cropped File objects
  onCancel,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [croppedResults, setCroppedResults] = useState([]);
  const [selectedRatio, setSelectedRatio] = useState(ASPECT_RATIOS[0]); // default 16:9

  // Crop & Transform state
  const [imageSrc, setImageSrc] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [baseScale, setBaseScale] = useState(1);

  const containerRef = useRef(null);
  const imageRef = useRef(null);

  // Update baseScale when image, ratio, or rotation changes
  useEffect(() => {
    if (imageSrc && imageRef.current && containerRef.current) {
      const img = imageRef.current;
      const cropBox = containerRef.current.getBoundingClientRect();
      
      const updateScale = () => {
        if (rotation === 90 || rotation === 270) {
          setBaseScale(Math.max(cropBox.width / img.naturalHeight, cropBox.height / img.naturalWidth));
        } else {
          setBaseScale(Math.max(cropBox.width / img.naturalWidth, cropBox.height / img.naturalHeight));
        }
      };

      if (img.complete && img.naturalWidth) {
        updateScale();
      } else {
        img.onload = updateScale;
      }
    }
  }, [imageSrc, selectedRatio, rotation]);

  // Load current image from queue
  useEffect(() => {
    if (isOpen && imagesToCrop.length > 0 && currentIndex < imagesToCrop.length) {
      const rawItem = imagesToCrop[currentIndex];
      const file = rawItem instanceof File ? rawItem : rawItem.file;

      if (file) {
        const url = URL.createObjectURL(file);
        setImageSrc(url);
        setZoom(1);
        setRotation(0);
        setOffset({ x: 0, y: 0 });

        return () => {
          URL.revokeObjectURL(url);
        };
      }
    }
  }, [isOpen, imagesToCrop, currentIndex]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      setCroppedResults([]);
      setZoom(1);
      setRotation(0);
      setOffset({ x: 0, y: 0 });
    }
  }, [isOpen]);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - offset.x,
      y: e.clientY - offset.y,
    });
  };

  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging) return;
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    },
    [isDragging, dragStart]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 0.08 : -0.08;
    setZoom((prev) => Math.min(Math.max(1, prev + zoomFactor), 3.5));
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  if (!isOpen || imagesToCrop.length === 0) return null;

  const currentItem = imagesToCrop[currentIndex];
  const currentFile = currentItem instanceof File ? currentItem : currentItem.file;

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setOffset({ x: 0, y: 0 });
  };

  // Perform canvas cropping
  const generateCroppedBlob = async () => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = selectedRatio.width;
        canvas.height = selectedRatio.height;
        const ctx = canvas.getContext("2d");

        // Fill background white for safety
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const cropBox = containerRef.current?.getBoundingClientRect();
        if (!cropBox) {
          return reject(new Error("Crop container not found"));
        }

        const screenScale = canvas.width / cropBox.width;

        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.translate(offset.x * screenScale, offset.y * screenScale);
        ctx.rotate((rotation * Math.PI) / 180);

        const finalScale = baseScale * zoom * screenScale;
        const drawWidth = img.width * finalScale;
        const drawHeight = img.height * finalScale;

        ctx.drawImage(
          img,
          -drawWidth / 2,
          -drawHeight / 2,
          drawWidth,
          drawHeight
        );

        ctx.restore();

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return reject(new Error("Canvas blob generation failed"));
            }
            const fileName = currentFile?.name
              ? currentFile.name.replace(/\.[^/.]+$/, "") + ".jpg"
              : "cropped-service.jpg";
            const croppedFile = new File([blob], fileName, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            resolve(croppedFile);
          },
          "image/jpeg",
          0.92
        );
      };
      img.onerror = (err) => reject(err);
      img.src = imageSrc;
    });
  };

  const handleNextOrFinish = async () => {
    try {
      const fileToAdd = await generateCroppedBlob();

      const updated = [...croppedResults, fileToAdd];
      setCroppedResults(updated);

      if (currentIndex + 1 < imagesToCrop.length) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        onComplete(updated);
      }
    } catch (err) {
      console.error("Error during image crop:", err);
      // fallback to original file
      const updated = [...croppedResults, currentFile];
      setCroppedResults(updated);
      if (currentIndex + 1 < imagesToCrop.length) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        onComplete(updated);
      }
    }
  };

  return (
    <AnimatePresence>
      <div className="cropper-modal-backdrop">
        <motion.div
          className="cropper-modal-container"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
        >
          {/* Header */}
          <div className="cropper-modal-header">
            <div className="header-title-group">
              <h3>✂️ Crop & Adjust Image</h3>
              {imagesToCrop.length > 1 && (
                <span className="cropper-step-badge">
                  Image {currentIndex + 1} of {imagesToCrop.length}
                </span>
              )}
            </div>
            <button
              type="button"
              className="cropper-close-btn"
              onClick={onCancel}
              aria-label="Cancel cropping"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>

          <p className="cropper-hint">
            Drag to reposition, zoom, or rotate to fit the standard service card frame.
          </p>

          {/* Aspect Ratio Selector */}
          <div className="aspect-ratio-selector">
            <span className="ratio-label">Aspect Ratio:</span>
            {ASPECT_RATIOS.map((ratio) => (
              <button
                key={ratio.label}
                type="button"
                className={`ratio-btn ${
                  selectedRatio.label === ratio.label ? "active" : ""
                }`}
                onClick={() => setSelectedRatio(ratio)}
              >
                {ratio.label}
              </button>
            ))}
          </div>

          {/* Crop Viewport */}
          <div className="crop-viewport-outer">
            <div
              className="crop-viewport-box"
              ref={containerRef}
              style={{
                aspectRatio: selectedRatio.value,
              }}
              onMouseDown={handleMouseDown}
              onWheel={handleWheel}
            >
              {imageSrc && (
                <img
                  ref={imageRef}
                  src={imageSrc}
                  alt="Crop preview"
                  className="crop-preview-image"
                  draggable={false}
                  style={{
                    transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) rotate(${rotation}deg) scale(${baseScale * zoom})`,
                    cursor: isDragging ? "grabbing" : "grab",
                  }}
                />
              )}

              {/* Grid Guides */}
              <div className="crop-grid-overlay">
                <div className="grid-line grid-line-h1" />
                <div className="grid-line grid-line-h2" />
                <div className="grid-line grid-line-v1" />
                <div className="grid-line grid-line-v2" />
              </div>
            </div>
          </div>

          {/* Crop Controls */}
          <div className="cropper-controls-bar">
            <div className="zoom-control-group">
              <span className="control-icon"><i className="fa-solid fa-magnifying-glass"></i></span>
              <input
                type="range"
                min="1"
                max="3.5"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="zoom-slider"
                title="Zoom level"
              />
              <span className="zoom-value">{Math.round(zoom * 100)}%</span>
            </div>

            <div className="tool-buttons-group">
              <button
                type="button"
                className="tool-btn"
                onClick={handleRotate}
                title="Rotate 90°"
              >
                <i className="fa-solid fa-rotate"></i> Rotate
              </button>
              <button
                type="button"
                className="tool-btn"
                onClick={handleReset}
                title="Reset crop"
              >
                <i className="fa-solid fa-rotate-left"></i> Reset
              </button>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="cropper-modal-actions">
            <button
              type="button"
              className="btn-cropper-cancel"
              onClick={onCancel}
            >
              Cancel
            </button>

            <div className="action-right-group">
              <button
                type="button"
                className="btn-cropper-apply"
                onClick={() => handleNextOrFinish()}
              >
                {currentIndex + 1 < imagesToCrop.length
                  ? "Crop & Next ➔"
                  : "✓ Apply & Done"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ImageCropperModal;
