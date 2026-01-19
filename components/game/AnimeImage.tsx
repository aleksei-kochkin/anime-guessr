'use client';

import Image from 'next/image';
import { useState } from 'react';

interface AnimeImageProps {
  src: string;
  alt: string;
}

export default function AnimeImage({ src, alt }: AnimeImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <div className="relative w-full aspect-[16/9] mx-auto overflow-hidden rounded-lg shadow-2xl bg-black dark:bg-gray-950">
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 animate-pulse" />
      )}
      
      {hasError ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="text-center p-4">
            <p className="text-gray-500 dark:text-gray-400">Image not available</p>
          </div>
        </div>
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          className={`object-contain transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          priority
          unoptimized // Для внешних изображений
        />
      )}
    </div>
  );
}
