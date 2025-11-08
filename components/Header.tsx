
import React from 'react';

const BrainIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v1.2a1 1 0 0 0 1 1h.3a1.4 1.4 0 0 1 1.4 1.4v.1a2 2 0 0 1-1.7 2.1c-.2.1-.5.1-.7.2a2 2 0 0 0-1.6 2.1v.1a1.4 1.4 0 0 1-1.4 1.4h-.3a1 1 0 0 0-1 1v1.2A2.5 2.5 0 0 1 9.5 22" />
    <path d="M14.5 2a2.5 2.5 0 0 0-2.5 2.5v1.2a1 1 0 0 1-1 1h-.3a1.4 1.4 0 0 0-1.4 1.4v.1a2 2 0 0 0 1.7 2.1c.2.1.5.1.7.2a2 2 0 0 1 1.6 2.1v.1a1.4 1.4 0 0 0 1.4 1.4h.3a1 1 0 0 1 1 1v1.2a2.5 2.5 0 0 0 2.5 2.5" />
    <path d="M16 2.5a2.5 2.5 0 0 1 2.5 2.5" />
    <path d="M8 2.5A2.5 2.5 0 0 0 5.5 5" />
    <path d="M12 11v-1" />
    <path d="M12 14v-1" />
  </svg>
);


export const Header: React.FC = () => (
  <header className="text-center mb-8 flex items-center justify-center gap-4">
    <BrainIcon />
    <div>
      <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
        Trợ lý Trắc nghiệm AI
      </h1>
      <p className="text-slate-400 mt-2">Giải đáp mọi câu hỏi với sức mạnh của Gemini</p>
    </div>
  </header>
);
   