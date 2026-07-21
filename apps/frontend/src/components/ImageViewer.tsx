import { useState } from 'react'
import { X } from 'lucide-react'

interface ImageViewerProps {
  src: string
  alt?: string
  className?: string
}

export function ImageViewer({ src, alt = '', className }: ImageViewerProps) {
  const [open, setOpen] = useState(false)

  if (!src.startsWith('http')) {
    return <span className={className}>{src}</span>
  }

  return (
    <>
      <img
        src={src}
        alt={alt}
        className={`cursor-zoom-in object-cover ${className}`}
        onClick={() => setOpen(true)}
      />
      {open && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 cursor-zoom-out'
          onClick={() => setOpen(false)}
        >
          <button
            className='absolute top-4 right-4 text-white/70 hover:text-white'
            onClick={() => setOpen(false)}
          >
            <X className='size-6' />
          </button>
          <img
            src={src}
            alt={alt}
            className='max-w-[90vw] max-h-[90vh] object-contain rounded-lg'
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}
