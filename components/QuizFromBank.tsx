
import React, { useState, useCallback } from 'react';
import { QUESTION_BANK } from '../constants';

export const QuizFromBank: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const currentQuestion = QUESTION_BANK[currentQuestionIndex];

  const handleAnswerSelect = useCallback((answerIndex: number) => {
    if (showAnswer) return;
    setSelectedAnswer(answerIndex);
    setShowAnswer(true);
    // FIX: Check selected option string against correct answer string instead of using a non-existent index property.
    if (currentQuestion.options[answerIndex] === currentQuestion.correctAnswer) {
      setScore(prev => prev + 1);
    }
  }, [showAnswer, currentQuestion]);

  const handleNextQuestion = useCallback(() => {
    if (currentQuestionIndex < QUESTION_BANK.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowAnswer(false);
    } else {
      setIsFinished(true);
    }
  }, [currentQuestionIndex]);

  const handleRestart = useCallback(() => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowAnswer(false);
    setScore(0);
    setIsFinished(false);
  }, []);

  const getOptionClasses = (optionIndex: number) => {
    let classes = 'w-full text-left p-4 rounded-lg border-2 transition-all duration-300 ease-in-out cursor-pointer flex items-center gap-4';
    if (!showAnswer) {
      return `${classes} bg-slate-700 border-slate-600 hover:bg-slate-600 hover:border-cyan-500`;
    }
    // FIX: Check option string against correct answer string to identify the correct option.
    if (currentQuestion.options[optionIndex] === currentQuestion.correctAnswer) {
      return `${classes} bg-green-500/20 border-green-500 text-white`;
    }
    if (optionIndex === selectedAnswer) {
      return `${classes} bg-red-500/20 border-red-500 text-white`;
    }
    return `${classes} bg-slate-800 border-slate-700 text-slate-400`;
  };

  if (isFinished) {
    return (
      <div className="bg-slate-800 p-8 rounded-xl shadow-2xl text-center animate-fade-in">
        <h2 className="text-3xl font-bold text-cyan-400 mb-4">Hoàn thành!</h2>
        <p className="text-xl text-slate-300 mb-6">
          Bạn đã trả lời đúng <span className="font-bold text-green-400">{score}</span> trên <span className="font-bold">{QUESTION_BANK.length}</span> câu hỏi.
        </p>
        <button
          onClick={handleRestart}
          className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg transition-transform duration-200 hover:scale-105"
        >
          Làm lại từ đầu
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 p-6 sm:p-8 rounded-xl shadow-2xl animate-fade-in w-full">
      <div className="flex justify-between items-center mb-6">
        <div className="text-lg font-semibold text-cyan-400">
          Câu hỏi {currentQuestionIndex + 1}/{QUESTION_BANK.length}
        </div>
        <div className="text-lg font-semibold text-slate-300">
          Điểm: <span className="text-green-400">{score}</span>
        </div>
      </div>
      <h2 className="text-2xl font-bold mb-6 text-slate-100">{currentQuestion.question}</h2>
      <div className="space-y-4">
        {currentQuestion.options.map((option, index) => (
          <button key={index} onClick={() => handleAnswerSelect(index)} disabled={showAnswer} className={getOptionClasses(index)}>
            <span className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center font-bold text-sm ${showAnswer && selectedAnswer === index ? 'border-transparent' : 'border-slate-500'}`}>
              {String.fromCharCode(65 + index)}
            </span>
            <span>{option}</span>
          </button>
        ))}
      </div>
      {showAnswer && (
        <div className="mt-6 p-4 bg-slate-900/50 rounded-lg animate-fade-in">
          <p className="text-lg font-semibold text-cyan-400 mb-2">Giải thích:</p>
          <p className="text-slate-300">{currentQuestion.explanation}</p>
          <button
            onClick={handleNextQuestion}
            className="mt-6 w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg transition-transform duration-200 hover:scale-105"
          >
            {currentQuestionIndex < QUESTION_BANK.length - 1 ? 'Câu tiếp theo' : 'Xem kết quả'}
          </button>
        </div>
      )}
    </div>
  );
};
