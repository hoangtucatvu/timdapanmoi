import React, { useRef, useEffect, useState, useCallback } from 'react';

interface CameraCaptureProps {
  onCapture: (dataUrl: string) => void;
  onClose: () => void;
}

const LoadingSpinner: React.FC = () => (
    <div className="flex flex-col items-center justify-center p-8 text-white">
      <svg className="animate-spin h-10 w-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p className="mt-4 font-semibold">Đang bật camera...</p>
    </div>
  );


export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const startCamera = async () => {
        setIsLoading(true);
        setError(null);
        try {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                const stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { facingMode: 'environment' } 
                });
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.onloadedmetadata = () => {
                        setIsLoading(false);
                    };
                }
            } else {
                throw new Error("Trình duyệt không hỗ trợ truy cập camera.");
            }
        } catch (err) {
            console.error("Lỗi truy cập camera:", err);
            setError("Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập của trình duyệt.");
            setIsLoading(false);
        }
    };
    
    startCamera();

    return () => {
        // Cleanup: stop the stream when component unmounts
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
    };
  }, []);

  const handleCapture = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/jpeg');
        onCapture(dataUrl);
        onClose();
      }
    }
  }, [onCapture, onClose]);

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center animate-fade-in" onClick={onClose}>
        <div className="bg-slate-800 rounded-xl shadow-2xl p-4 w-full max-w-lg relative" onClick={(e) => e.stopPropagation()}>
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                {isLoading && <div className="absolute inset-0 flex items-center justify-center"><LoadingSpinner /></div>}
                {error && <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-red-400">{error}</div>}
                <video ref={videoRef} autoPlay playsInline className={`w-full h-full object-cover ${isLoading || error ? 'hidden' : 'block'}`}></video>
                <canvas ref={canvasRef} className="hidden"></canvas>
            </div>
            <div className="mt-4 flex justify-center items-center gap-4">
                 <button onClick={onClose} className="py-2 px-5 bg-slate-600 hover:bg-slate-500 rounded-full text-white font-semibold transition-colors">
                    Hủy
                </button>
                <button 
                    onClick={handleCapture} 
                    disabled={isLoading || !!error}
                    className="group relative w-16 h-16 rounded-full bg-white flex items-center justify-center transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Chụp ảnh"
                >
                    <div className="w-14 h-14 rounded-full bg-white border-4 border-slate-800 group-hover:border-slate-600 transition-colors"></div>
                </button>
                 <div className="w-[84px]"></div>
            </div>
        </div>
    </div>
  );
};
