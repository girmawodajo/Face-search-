
import React, { useRef, useState, useEffect } from 'react';

interface CameraCaptureProps {
  onCapture: (base64: string) => void;
  onClose: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function setupCamera() {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user' }, 
          audio: false 
        });
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
      } catch (err) {
        setError("Could not access camera. Please check permissions.");
      }
    }
    setupCamera();

    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  const capture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        onCapture(dataUrl);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-4">
      <div className="relative w-full max-w-lg aspect-[3/4] rounded-2xl overflow-hidden bg-gray-900 border-2 border-indigo-500 shadow-2xl shadow-indigo-500/20">
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center text-center p-6">
            <p className="text-red-400">{error}</p>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        )}
        <canvas ref={canvasRef} className="hidden" />
        
        {/* UI Overlay */}
        <div className="absolute inset-x-0 bottom-8 flex justify-center items-center gap-6">
          <button
            onClick={onClose}
            className="p-4 bg-gray-800/80 hover:bg-gray-700 text-white rounded-full transition-all"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
          
          <button
            onClick={capture}
            disabled={!!error}
            className="w-20 h-20 bg-white border-8 border-gray-300 rounded-full hover:scale-105 active:scale-95 transition-all flex items-center justify-center shadow-xl disabled:opacity-50"
          >
            <div className="w-12 h-12 bg-indigo-600 rounded-full"></div>
          </button>

          <div className="w-14"></div> {/* Spacer to center center */}
        </div>
      </div>
      <p className="mt-6 text-gray-400 text-sm">Position your face within the frame</p>
    </div>
  );
};

export default CameraCapture;
