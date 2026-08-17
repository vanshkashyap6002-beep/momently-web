interface HeartLoaderProps {
  text?: string;
}

export default function HeartLoader({ text = "Loading your memories..." }: HeartLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-6" role="status" aria-live="polite">
      <svg
        className="w-10 h-10 animate-heart-draw"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          stroke="#F43F5E"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="stroke-rose-500 fill-rose-500/20"
        />
      </svg>
      <span className="text-xs tracking-wider text-gray-400 font-medium">{text}</span>
    </div>
  );
}