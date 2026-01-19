'use client';

import Image from 'next/image';
import { useState } from 'react';

interface AnimeImageProps {
  src: string;
  alt: string;
}

export default function AnimeImage({ src, alt }: AnimeImageProps) {
  const [loadedSrc, setLoadedSrc] = useState<string>('');
  const [errorSrc, setErrorSrc] = useState<string>('');

  const isLoaded = loadedSrc === src;
  const hasError = errorSrc === src;
  const isLoading = !isLoaded && !hasError;

  return (
    <div className="relative w-full aspect-video mx-auto overflow-hidden rounded-lg shadow-2xl bg-black dark:bg-gray-950">
      {hasError ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="text-center p-4">
            <p className="text-gray-500 dark:text-gray-400">Image not available</p>
          </div>
        </div>
      ) : (
        <>
          {isLoading && (
            <div className="absolute inset-0 animate-pulse bg-gray-800 dark:bg-gray-900" />
          )}
          <Image
            src={src}
            alt={alt}
            fill
            className={`object-contain transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            onError={() => setErrorSrc(src)}
            onLoad={() => setLoadedSrc(src)}
            priority
            unoptimized
          />
        </>
      )}
    </div>
  );
}
