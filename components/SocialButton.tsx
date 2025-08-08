'use client';

import { ReactNode } from 'react';

interface SocialButtonProps {
  icon: ReactNode;
  text: string;
  onClick?: () => void;
}

export default function SocialButton({
  icon,
  text,
  onClick,
}: SocialButtonProps) {
  return (
    <button
      className="w-full flex items-center justify-center border border-gray-400 py-2 rounded-md mb-2 hover:bg-gray-100 transition"
      onClick={onClick}
    >
      <span className="mr-2 text-xl">{icon}</span>
      <span className="text-sm font-medium text-black">{text}</span>
    </button>
  );
}
