import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Question } from '../types';

// These are loaded from script tags in index.html
declare const XLSX: any;
declare const pako: any;


interface ExcelUploaderProps {
  onBankLoad: (questions: Question[]) => void;
  onReset: () => void;
  isBankLoaded: boolean;
  questionBank: Question[];
}

const UploadIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
);

const ShareIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
);


export const ExcelUploader: React.FC<ExcelUploaderProps> = ({ onBankLoad, onReset, isBankLoaded, questionBank }) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('Tải lên file Excel (.xlsx) chứa bộ đề của bạn.');
  const [fileName, setFileName] = useState('');
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // If the bank is loaded (e.g., from URL), update the status and message
    if (isBankLoaded && status !== 'success') {
      setStatus('success');
      setMessage(`Đã tải thành công ${questionBank.length} câu hỏi. Bạn có thể bắt đầu tìm kiếm.`);
    }
  }, [isBankLoaded, questionBank, status]);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setStatus('loading');
    setFileName(file.name);
    setMessage('Đang đọc và xử lý file...');

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      
      const allQuestions: Question[] = [];
      let questionIdCounter = 1;

      // Iterate over all sheets in the workbook
      workbook.SheetNames.forEach((sheetName: string) => {
        const worksheet = workbook.Sheets[sheetName];
        const json: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Skip header row if it exists
        const dataRows = json.slice(1);

        const questionsFromSheet: Question[] = dataRows.map((row) => {
          // A row is considered valid if it has a non-empty value in the question column (B).
          if (!Array.isArray(row) || !row[1] || String(row[1]).trim() === '') {
            return null;
          }

          const options = [
            String(row[2] || ''), // Column C
            String(row[3] || ''), // Column D
            String(row[4] || ''), // Column E
            String(row[5] || '')  // Column F
          ];
          const correctAnswerRaw = String(row[6] || '').trim(); // Column G
          let finalCorrectAnswer = correctAnswerRaw;
          
          // New logic: Handle numeric indices (1, 2, 3, 4), letter labels (A, B, C, D), or full text.
          const numericIndex = parseInt(correctAnswerRaw, 10);

          if (!isNaN(numericIndex) && numericIndex >= 1 && numericIndex <= 4) {
              // It's a number like 1, 2, 3, or 4. Convert to 0-based index.
              const optionIndex = numericIndex - 1;
              if (options[optionIndex] !== undefined && options[optionIndex] !== '') {
                  finalCorrectAnswer = options[optionIndex];
              }
          } else {
              // It's not a simple number, check for a letter label like "A" or "Đáp án A"
              const labelMatch = correctAnswerRaw.match(/\b([A-D])\s*$/i);
              if (labelMatch) {
                  const label = labelMatch[1].toUpperCase();
                  const labelIndex = 'ABCD'.indexOf(label);
                  if (labelIndex !== -1 && options[labelIndex] !== undefined && options[labelIndex] !== '') {
                      finalCorrectAnswer = options[labelIndex];
                  }
              }
          }

          const question: Question = {
            id: questionIdCounter,
            question: String(row[1] || ''), // Column B
            options: options,
            correctAnswer: finalCorrectAnswer, // The processed correct answer
            explanation: String(row[7] || ''),   // Column H
          };
          questionIdCounter++;
          return question;
        }).filter((q): q is Question => q !== null); // Filter out null (invalid) rows

        allQuestions.push(...questionsFromSheet);
      });

      if (allQuestions.length === 0) {
        throw new Error('Không tìm thấy câu hỏi hợp lệ nào. Vui lòng kiểm tra định dạng file (câu hỏi ở cột B).');
      }

      onBankLoad(allQuestions);
      setStatus('success');
      setMessage(`Tải thành công ${allQuestions.length} câu hỏi từ tất cả các sheet trong file ${file.name}.`);
    } catch (e) {
      setStatus('error');
      const errorMessage = e instanceof Error ? e.message : 'Định dạng file không hợp lệ.';
      setMessage(`Lỗi: ${errorMessage}`);
      onReset();
    }
  }, [onBankLoad, onReset]);
  
  const handleResetClick = () => {
    onReset();
    setStatus('idle');
    setMessage('Tải lên file Excel (.xlsx) chứa bộ đề của bạn.');
    setFileName('');
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  }
  
  const handleShare = () => {
    if (!questionBank || questionBank.length === 0) return;

    try {
        const jsonString = JSON.stringify(questionBank);
        const compressed = pako.deflate(jsonString);
        const base64String = btoa(String.fromCharCode.apply(null, compressed as any));
        const urlSafeBase64 = base64String.replace(/\+/g, '-').replace(/\//g, '_');
        
        const shareUrl = `${window.location.origin}${window.location.pathname}#data=${urlSafeBase64}`;
        
        navigator.clipboard.writeText(shareUrl).then(() => {
            setShareStatus('copied');
            setTimeout(() => setShareStatus('idle'), 2000);
        });
    } catch (error) {
        console.error("Failed to create share link", error);
        alert("Không thể tạo link chia sẻ. Kho đề có thể quá lớn.");
    }
  };

  return (
    <div className="bg-slate-800 p-6 rounded-xl shadow-2xl flex flex-col items-center h-full">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-4 self-start">
            Bước 1: Tải lên Kho đề
        </h2>
        
        {!isBankLoaded ? (
            <label htmlFor="excel-upload" className="w-full flex-grow border-2 border-dashed border-slate-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-cyan-500 transition-colors bg-slate-900/50 p-4 text-center">
                <UploadIcon className="w-12 h-12 text-slate-500 mb-3" />
                <p className="font-semibold text-slate-300">Nhấn để chọn hoặc kéo thả file Excel</p>
                <p className="text-sm text-slate-400 mt-1 max-w-xs">{message}</p>
                <input ref={fileInputRef} id="excel-upload" type="file" accept=".xlsx, .xls" className="hidden" onChange={handleFileChange} />
            </label>
        ) : (
             <div className="w-full flex-grow border-2 border-solid border-green-500 rounded-lg flex flex-col items-center justify-center bg-green-900/20 p-4 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-400 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                <p className="font-semibold text-green-300">Kho đề đã sẵn sàng!</p>
                <p className="text-sm text-slate-300 mt-1 max-w-xs">{message}</p>
             </div>
        )}

        <div className="w-full mt-4 text-xs text-slate-500 text-left p-3 bg-slate-900/50 rounded">
            <p className="font-bold mb-1">Yêu cầu định dạng file Excel:</p>
            <ul className="list-disc list-inside space-y-1">
                <li>Cột B: Nội dung câu hỏi</li>
                <li>Cột C, D, E, F: 4 lựa chọn đáp án</li>
                <li>Cột G: Đáp án đúng (VD: "3", "C", hoặc "Nội dung đáp án C")</li>
                <li>Cột H: Giải thích chi tiết (tùy chọn)</li>
                <li className="text-slate-400">Cột A có thể bỏ trống hoặc dùng cho STT. Hàng đầu tiên sẽ được bỏ qua (tiêu đề).</li>
            </ul>
        </div>
        {isBankLoaded && (
             <div className="w-full mt-4 flex flex-col sm:flex-row gap-2">
                 <button
                    onClick={handleShare}
                    className="flex-1 bg-teal-500 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 hover:bg-teal-600 flex items-center justify-center gap-2"
                >
                    <ShareIcon className="w-5 h-5" />
                    {shareStatus === 'idle' ? 'Chia sẻ Kho đề' : 'Đã sao chép link!'}
                </button>
                <button
                    onClick={handleResetClick}
                    className="flex-1 bg-slate-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 hover:bg-slate-500"
                >
                    Tải kho đề khác
                </button>
            </div>
        )}
    </div>
  );
};