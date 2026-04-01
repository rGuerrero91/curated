'use client'

import { useState } from 'react'
import { ProfileHeader } from '@/components/ProfileHeader'
import { CollectionCard } from '@/components/CollectionCard'
import { LinkCard } from '@/components/LinkCard'

// Placeholder data — replace with GET /api/v1/users/:username
const MOCK_ITEMS = [
  {
    id: '1',
    type: 'collection' as const,
    title: 'Russian Poster Research',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/El_Lissitzky_-_Beat_the_Whites_with_the_Red_Wedge_-_1919.jpg/800px-El_Lissitzky_-_Beat_the_Whites_with_the_Red_Wedge_-_1919.jpg',
    date: 'March 2, 2026',
  },
  {
    id: '2',
    type: 'link' as const,
    title: 'The Man Who Broke Into Jail',
    description:
      'In Nashville, Alexander Friedmann, a renowned criminal-justice activist, committed a baffling crime. Daron Hall, the county sheriff, had worked with Friedmann and still can\'t wrap his head around it. James Verini chronicles a singular case of a man breaking bad.',
    url: 'https://www.newyorker.com/magazine/the-man-who-broke-into-jail',
    date: 'March 2, 2026',
  },
  {
    id: '3',
    type: 'link' as const,
    title: 'The Man Who Broke Into Jail',
    description:
      'In Nashville, Alexander Friedmann, a renowned criminal-justice activist, committed a baffling crime. Daron Hall, the county sheriff, had worked with Friedmann and still can\'t wrap his head around it.',
    url: 'https://www.newyorker.com/magazine/the-man-who-broke-into-jail',
    date: 'March 2, 2026',
  },
  {
    id: '4',
    type: 'link' as const,
    title: 'The Man Who Broke Into Jail',
    description:
      'A baffling crime. Daron Hall, the county sheriff, had worked with Friedmann and still can\'t wrap his head around it. James Verini chronicles a singular case of a man breaking bad.',
    url: 'https://www.newyorker.com/magazine/the-man-who-broke-into-jail',
    date: 'March 2, 2026',
  },
  {
    id: '5',
    type: 'collection' as const,
    title: 'Russian Poster Research',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/El_Lissitzky_-_Beat_the_Whites_with_the_Red_Wedge_-_1919.jpg/800px-El_Lissitzky_-_Beat_the_Whites_with_the_Red_Wedge_-_1919.jpg',
    date: 'March 2, 2026',
  },
  {
    id: '6',
    type: 'link' as const,
    title: 'The Man Who Broke Into Jail',
    description: 'James Verini chronicles a singular case of a man breaking bad.',
    url: 'https://www.newyorker.com/magazine/the-man-who-broke-into-jail',
    date: 'March 2, 2026',
  },
]

function FolderIcon() {
  return (
    <svg width="18" height="16" viewBox="0 0 18 16" fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M1 3h6l2 2h8v9H1V3z" />
    </svg>
  )
}

function LinkIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M7 11l4-4M5 13a3 3 0 01-.707-4.293l2-2a3 3 0 014.243 4.243M13 5a3 3 0 01.707 4.293l-2 2A3 3 0 017.464 7.05" />
    </svg>
  )
}

interface ProfilePageProps {
  params: Promise<{ username: string }>
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [isFollowing, setIsFollowing] = useState(false)

  // In real use, unwrap params with React.use(params) or useParams()
  const username = 'user123'

  return (
    <main className="min-h-screen bg-[#d9d9d9] p-8">
      <ProfileHeader
        username={username}
        isFollowing={isFollowing}
        onFollowToggle={() => setIsFollowing((f) => !f)}
        view={view}
        onViewToggle={() => setView((v) => (v === 'grid' ? 'list' : 'grid'))}
      />

      {view === 'grid' ? (
        <div className="grid grid-cols-3 gap-6 mt-10">
          {MOCK_ITEMS.map((item) =>
            item.type === 'collection' ? (
              <CollectionCard
                key={item.id}
                title={item.title}
                imageUrl={item.imageUrl}
              />
            ) : (
              <LinkCard
                key={item.id}
                title={item.title}
                description={item.description}
                url={item.url}
              />
            )
          )}
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-2 gap-x-12 border-b border-black pb-2 mb-1">
            <span className="text-sm font-bold">Name</span>
            <span className="text-sm font-bold">Date</span>
          </div>
          {MOCK_ITEMS.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-2 gap-x-12 py-2 border-b border-black border-opacity-20 hover:bg-black hover:bg-opacity-5 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="text-gray-600 flex-shrink-0">
                  {item.type === 'collection' ? <FolderIcon /> : <LinkIcon />}
                </span>
                <span className="text-sm truncate">{item.title}</span>
              </div>
              <span className="text-sm">{item.date}</span>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
