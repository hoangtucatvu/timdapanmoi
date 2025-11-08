import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Question } from './types';
import { ExcelUploader } from './components/ExcelUploader';
import { QuizFromImage } from './components/QuizFromImage';

// pako is loaded from a script tag in index.html
declare const pako: any;

const App: React.FC = () => {
  const [questionBank, setQuestionBank] = useState<Question[]>([]);
  const [isBankLoaded, setIsBankLoaded] = useState<boolean>(false);
  const [isLoadingFromUrl, setIsLoadingFromUrl] = useState<boolean>(true);


  const handleBankLoad = useCallback((questions: Question[]) => {
    setQuestionBank(questions);
    setIsBankLoaded(true);
  }, []);
  
  const handleBankReset = useCallback(() => {
    setQuestionBank([]);
    setIsBankLoaded(false);
    // Clear the hash from the URL to allow reloading a new bank
    window.history.replaceState(null, '', ' ');
  }, []);

  useEffect(() => {
    try {
      if (window.location.hash.startsWith('#data=')) {
        const encodedData = window.location.hash.substring(6);
        const decodedData = atob(encodedData.replace(/-/g, '+').replace(/_/g, '/'));
        const compressedData = new Uint8Array(decodedData.split('').map(c => c.charCodeAt(0)));
        const decompressedData = pako.inflate(compressedData, { to: 'string' });
        const questions: Question[] = JSON.parse(decompressedData);
        if (questions && questions.length > 0) {
          handleBankLoad(questions);
        }
      }
    } catch (error) {
      console.error("Failed to load question bank from URL:", error);
      // If there's an error, just proceed with the normal flow
    } finally {
        setIsLoadingFromUrl(false);
    }
  }, [handleBankLoad]);

  if (isLoadingFromUrl) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
             <div className="flex flex-col items-center justify-center p-8">
                <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="mt-4 text-slate-300 font-semibold">Đang kiểm tra dữ liệu chia sẻ...</p>
            </div>
        </div>
      )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-gray-200 font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-6xl mx-auto">
        <Header />
        <main className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <ExcelUploader onBankLoad={handleBankLoad} onReset={handleBankReset} isBankLoaded={isBankLoaded} questionBank={questionBank} />
          <QuizFromImage questionBank={questionBank} isBankLoaded={isBankLoaded} />
        </main>
      </div>
    </div>
  );
};

export default App;