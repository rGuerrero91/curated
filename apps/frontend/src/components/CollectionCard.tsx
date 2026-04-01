interface CollectionCardProps {
  title: string
  imageUrl?: string
  onShare?: () => void
  className?: string
}

function ShareIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M9 12V3M9 3L6 6M9 3L12 6" />
      <path d="M3 12v3h12v-3" />
    </svg>
  )
}

export function CollectionCard({ title, imageUrl, onShare, className = '' }: CollectionCardProps) {
  return (
    <div className={`flex flex-col ${className}`}>
      <div className="relative">
        {/* folder tab */}
        <div className="absolute -top-[10px] left-0 w-10 h-[10px] border border-b-0 border-black bg-[#d9d9d9]" />
        <div className="border border-black overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-44 object-cover block"
            />
          ) : (
            <div className="w-full h-44 bg-[#d9d9d9]" />
          )}
        </div>
      </div>
      <div className="flex items-start justify-between mt-2 gap-2">
        <p className="text-sm text-center flex-1 leading-snug">{title}</p>
        <button
          onClick={onShare}
          className="flex-shrink-0 p-0.5 hover:opacity-60 transition-opacity"
          aria-label="Share"
        >
          <ShareIcon />
        </button>
      </div>
    </div>
  )
}
