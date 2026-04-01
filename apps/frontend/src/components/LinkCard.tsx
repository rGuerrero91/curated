interface LinkCardProps {
  title: string
  description?: string
  url: string
  className?: string
}

export function LinkCard({ title, description, url, className = '' }: LinkCardProps) {
  const displayUrl = url.replace(/^https?:\/\//, '')

  return (
    <div className={`bg-white border border-black flex flex-col p-3 gap-2 ${className}`}>
      <h3 className="font-bold text-sm text-center uppercase leading-tight tracking-wide">
        {title}
      </h3>
      {description && (
        <p className="text-xs leading-snug text-gray-800">{description}</p>
      )}
      <div className="border border-black px-2 py-1 mt-auto">
        <p className="text-xs truncate text-gray-700">{displayUrl}</p>
      </div>
    </div>
  )
}
