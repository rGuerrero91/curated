'use client'

interface ProfileHeaderProps {
  username: string
  avatarUrl?: string
  isFollowing?: boolean
  onFollowToggle?: () => void
  view: 'grid' | 'list'
  onViewToggle: () => void
}

export function ProfileHeader({
  username,
  avatarUrl,
  isFollowing = false,
  onFollowToggle,
  view,
  onViewToggle,
}: ProfileHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 border border-black overflow-hidden flex-shrink-0">
          {avatarUrl ? (
            <img src={avatarUrl} alt={username} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gray-400 flex items-center justify-center text-white text-xl font-bold">
              {username[0].toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-bold">Profile - {username}</h1>
          <button
            onClick={onFollowToggle}
            className="border border-black px-4 py-1 text-sm hover:bg-black hover:text-[#d9d9d9] transition-colors w-fit"
          >
            {isFollowing ? 'unfollow' : 'follow'}
          </button>
        </div>
      </div>

      <button
        onClick={onViewToggle}
        className="text-sm underline underline-offset-4 hover:opacity-60 transition-opacity"
      >
        {view === 'grid' ? 'list view' : 'icon view'}
      </button>
    </div>
  )
}
