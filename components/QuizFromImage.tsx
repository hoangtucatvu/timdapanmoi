import React, { useState, useCallback, useRef } from 'react';
import { extractQuestionFromImage } from '../services/geminiService';
import { Question } from '../types';
import { CameraCapture } from './CameraCapture';


// Helper function to convert a base64 data URL to a File object
const dataURLtoFile = (dataurl: string, filename: string): File => {
    const arr = dataurl.split(',');
    if (arr.length < 2) {
        throw new Error('Invalid data URL');
    }
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) {
        throw new Error('Could not parse MIME type from data URL');
    }
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type:mime});
}

interface QuizFromImageProps {
    questionBank: Question[];
    isBankLoaded: boolean;
}

// Function to normalize strings for better comparison
const normalizeString = (str: string): string => {
    if (typeof str !== 'string') return '';
    return str
      .toLowerCase()
      // Decompose combined graphemes into base characters and diacritical marks.
      .normalize('NFD')
      // Remove diacritical marks (Unicode range U+0300 to U+036F)
      .replace(/[\u0300-\u036f]/g, '')
      // Special case for 'đ'
      .replace(/đ/g, 'd')
      .trim()
      // Replace multiple whitespace chars (including newlines) with a single space
      .replace(/\s\s+/g, ' ')
      // Remove punctuation
      .replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, '');
};


const UploadPlaceholder: React.FC<{ onUploadClick: () => void; onCameraClick: () => void; }> = ({ onUploadClick, onCameraClick }) => (
  <div className="flex flex-col items-center justify-center h-full text-center p-4">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-500 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
    <h3 className="font-semibold text-slate-300">Tải lên hoặc Chụp ảnh câu hỏi</h3>
    <p className="text-sm text-slate-400 mt-1">AI sẽ trích xuất câu hỏi vào ô tìm kiếm.</p>
    <div className="mt-4 flex flex-col sm:flex-row gap-2">
        <button onClick={onUploadClick} className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2 justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Tải từ máy
        </button>
        <button onClick={onCameraClick} className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2 justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
            Chụp ảnh
        </button>
    </div>
  </div>
);

const LoadingSpinner: React.FC<{text: string}> = ({ text }) => (
  <div className="flex flex-col items-center justify-center p-8">
    <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <p className="mt-4 text-slate-300 font-semibold">{text}</p>
  </div>
);

const ResultDisplay: React.FC<{ question: Question; }> = ({ question }) => {
    // Find the index of the correct answer to determine its label (A, B, C, D)
    const correctOptionIndex = question.options.findIndex(
      option => normalizeString(option) === normalizeString(question.correctAnswer)
    );

    // Prepare the label, e.g., "A. "
    const correctOptionLabel = correctOptionIndex > -1
        ? `${String.fromCharCode(65 + correctOptionIndex)}. `
        : '';

    return (
        <div className="prose prose-invert prose-p:text-slate-300 space-y-3">
            <div>
                <strong className="text-slate-200 block mb-1">Câu hỏi khớp trong kho đề:</strong>
                <p>{question.question}</p>
            </div>
            <div>
                <strong className="text-green-400 block mb-1">Đáp án đúng:</strong>
                <p className="font-bold">{correctOptionLabel}{question.correctAnswer}</p>
            </div>
             <div>
                <strong className="text-cyan-400 block mb-1">Giải thích:</strong>
                <p>{question.explanation}</p>
            </div>
        </div>
    );
};

export const QuizFromImage: React.FC<QuizFromImageProps> = ({ questionBank, isBankLoaded }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [result, setResult] = useState<Question | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processImage = useCallback(async (file: File) => {
    if (!isBankLoaded || questionBank.length === 0) {
      setError("Vui lòng tải lên kho đề trước khi phân tích ảnh.");
      return;
    }

    setIsProcessingImage(true);
    setResult(null);
    setError(null);
    setSearchQuery('');

    const reader = new FileReader();
    reader.onloadend = async () => {
        const imageDataUrl = reader.result as string;
        setImagePreview(imageDataUrl);
        try {
            const base64String = imageDataUrl.split(',')[1];
            const extractedText = await extractQuestionFromImage(base64String, file.type);
            if (!extractedText) {
                throw new Error("Không thể đọc được câu hỏi từ hình ảnh.");
            }
            setSearchQuery(extractedText);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Đã có lỗi xảy ra khi phân tích ảnh.");
        } finally {
            setIsProcessingImage(false);
        }
    };
    reader.readAsDataURL(file);
  }, [questionBank, isBankLoaded]);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processImage(file);
    }
  };

  const handleCapture = useCallback((dataUrl: string) => {
    try {
        const file = dataURLtoFile(dataUrl, `capture-${Date.now()}.jpg`);
        processImage(file);
    } catch(e) {
        setError(e instanceof Error ? e.message : 'Không thể xử lý ảnh chụp.');
        setImagePreview(null);
    }
    setIsCameraOpen(false);
  }, [processImage]);

  const handleSearch = useCallback(async () => {
    if (!searchQuery) {
        setError("Ô tìm kiếm đang trống.");
        return;
    }
    setIsSearching(true);
    setResult(null);
    setError(null);

    await new Promise(res => setTimeout(res, 50));
    
    try {
        const normalizedSearchQuery = normalizeString(searchQuery);
        const searchWords = new Set(normalizedSearchQuery.split(' ').filter(w => w.length > 1));

        if (searchWords.size === 0) {
            throw new Error("Nội dung tìm kiếm không hợp lệ hoặc quá ngắn.");
        }

        let bestMatch: Question | null = null;
        let maxIntersection = 0;

        for (const q of questionBank) {
            const normalizedQuestion = normalizeString(q.question);
            if (!normalizedQuestion) continue;
            
            const questionWords = new Set(normalizedQuestion.split(' '));
            const intersection = new Set([...searchWords].filter(x => questionWords.has(x)));

            if (intersection.size > maxIntersection) {
                maxIntersection = intersection.size;
                bestMatch = q;
            }
        }
        
        if (bestMatch && maxIntersection >= 2) {
             setResult(bestMatch);
        } else {
             setResult(null);
             setError("Tôi không tìm thấy câu hỏi này trong kho đề đã được cung cấp.");
        }

    } catch (e) {
      setError(e instanceof Error ? e.message : "Đã có lỗi xảy ra khi tìm kiếm.");
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, questionBank]);
  
  const handleClear = () => {
    setImagePreview(null);
    setResult(null);
    setError(null);
    setSearchQuery('');
    if(fileInputRef.current) fileInputRef.current.value = '';
  };

  const isDisabled = !isBankLoaded;
  const isLoading = isProcessingImage || isSearching;

  return (
    <div className="relative">
         {isDisabled && <div className="absolute inset-0 bg-slate-800/80 backdrop-blur-sm z-10 rounded-xl flex items-center justify-center text-center p-4">
            <p className="font-semibold text-lg text-slate-300">Vui lòng tải lên kho đề ở Bước 1 trước.</p>
        </div>}
        <div className="bg-slate-800 p-6 rounded-xl shadow-2xl flex flex-col items-center h-full">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-4 self-start">
                Bước 2: Tìm đáp án từ ảnh
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full flex-grow">
                <div className='flex flex-col'>
                    <div className="w-full h-48 border-2 border-dashed border-slate-600 rounded-lg flex items-center justify-center transition-colors bg-slate-900/50 overflow-hidden">
                        {imagePreview ? (
                            <img src={imagePreview} alt="Xem trước" className="max-h-full max-w-full object-contain" />
                        ) : (
                            <UploadPlaceholder onUploadClick={() => fileInputRef.current?.click()} onCameraClick={() => setIsCameraOpen(true)} />
                        )}
                    </div>
                    <input ref={fileInputRef} id="file-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={isLoading}/>
                    
                     {imagePreview && (
                        <button
                            onClick={handleClear}
                            disabled={isLoading}
                            className="w-full mt-4 bg-slate-600 text-white font-bold py-2 px-3 rounded-lg transition-all duration-200 hover:bg-slate-500 disabled:opacity-50"
                        >
                            Chọn ảnh khác
                        </button>
                    )}
                </div>

                <div className="bg-slate-900/50 p-4 rounded-lg flex flex-col min-h-[14rem]">
                    <div className="flex-grow flex flex-col">
                         <label htmlFor="search-query" className="font-semibold text-slate-300 mb-2">
                            Câu hỏi nhận dạng được:
                        </label>
                        <textarea
                            id="search-query"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={isProcessingImage ? "Đang trích xuất nội dung..." : "Nội dung câu hỏi từ ảnh sẽ xuất hiện ở đây..."}
                            className="w-full bg-slate-800 border border-slate-600 rounded-md p-2 text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors flex-grow"
                            rows={4}
                            disabled={isProcessingImage}
                        />
                         <button
                            onClick={handleSearch}
                            disabled={isLoading || !searchQuery}
                            className="mt-2 w-full bg-cyan-500 text-white font-bold py-2 px-3 rounded-lg transition-all duration-200 hover:bg-cyan-600 disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                            Tìm kiếm trong kho đề
                        </button>
                    </div>

                    <div className="mt-4 border-t border-slate-700 pt-4">
                       {isSearching ? (
                        <LoadingSpinner text="Đang tìm kiếm..."/>
                        ) : error ? (
                        <div className="text-center text-red-400">
                            <h3 className="font-bold text-lg mb-2">Lỗi</h3>
                            <p>{error}</p>
                        </div>
                        ) : result ? (
                        <div className="text-left text-slate-300 space-y-2 max-h-48 overflow-y-auto">
                            <ResultDisplay question={result} />
                        </div>
                        ) : (
                        <div className="text-center text-slate-400">
                            <p>Kết quả tìm kiếm sẽ hiển thị ở đây.</p>
                        </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
        {isCameraOpen && <CameraCapture onCapture={handleCapture} onClose={() => setIsCameraOpen(false)} />}
    </div>
  );
};