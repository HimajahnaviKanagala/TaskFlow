import { useState } from "react";
import AIChat from "./AIChat";

export default function AIButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <AIChat isOpen={isOpen} onClose={() => setIsOpen(false)} />

      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`fixed bottom-4 right-4 md:right-6 z-50 w-12 h-12 flex items-center justify-center rounded-full shadow-lg transition-all duration-200
          ${
            isOpen
              ? "bg-slate-700 dark:bg-slate-600 rotate-90"
              : "bg-blue-600 hover:bg-blue-700 hover:scale-110"
          } text-white`}
        title="AI Assistant"
      >
        {isOpen ? (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2z" />
            <path d="M8 14s1.5 2 4 2 4-2 4-2" />
            <line x1="9" y1="9" x2="9.01" y2="9" />
            <line x1="15" y1="9" x2="15.01" y2="9" />
          </svg>
        )}
      </button>
    </>
  );
}
