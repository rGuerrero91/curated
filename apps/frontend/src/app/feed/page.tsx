import { Sidebar } from '@/components/Sidebar'
import { FeedItem } from '@/components/FeedItem'

// Placeholder data — replace with API calls once backend is ready
const MOCK_PINNED = [
  { id: '1', name: 'first collection' },
  { id: '2', name: 'second collection' },
  { id: '3', name: 'third collection' },
  { id: '4', name: 'forth collection' },
]

const MOCK_COLLECTIONS = [
  { id: '5', name: 'xyz collection' },
  { id: '6', name: 'tyz collection' },
  { id: '7', name: '123 collection' },
  { id: '8', name: 'zxc collection' },
]

const MOCK_RECENTLY_VIEWED = [
  { id: '9', name: "someone else's ..." },
  { id: '10', name: "someone else's ..." },
  { id: '11', name: "someone else's ..." },
  { id: '12', name: "someone else's ..." },
]

const MOCK_FEED = [
  {
    id: 'f1',
    type: 'curated' as const,
    user: { username: 'User123' },
    collection: {
      title: 'Russian Poster Research',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/El_Lissitzky_-_Beat_the_Whites_with_the_Red_Wedge_-_1919.jpg/800px-El_Lissitzky_-_Beat_the_Whites_with_the_Red_Wedge_-_1919.jpg',
    },
  },
  {
    id: 'f2',
    type: 'saved' as const,
    user: { username: 'User123' },
    collectionName: 'Russian Poster Research',
    link: {
      title: 'The Man Who Broke Into Jail',
      description:
        'In Nashville, Alexander Friedmann, a renowned criminal-justice activist, committed a baffling crime. Daron Hall, the county sheriff, had worked with Friedmann and still can\'t wrap his head around it. James Verini chronicles a singular case of a man breaking bad.',
      url: 'https://www.newyorker.com/magazine/the-man-who-broke-into-jail',
    },
  },
]

export default function FeedPage() {
  return (
    <main className="min-h-screen bg-[#d9d9d9] flex">
      <Sidebar
        pinned={MOCK_PINNED}
        collections={MOCK_COLLECTIONS}
        recentlyViewed={MOCK_RECENTLY_VIEWED}
      />

      <div className="flex-1 p-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-xl font-bold">Feed</h1>
          <a
            href="/user123"
            className="border border-black px-4 py-1 text-sm hover:bg-black hover:text-[#d9d9d9] transition-colors"
          >
            profile
          </a>
        </div>

        <div className="flex flex-col">
          {MOCK_FEED.map((item) => (
            <FeedItem key={item.id} {...item} />
          ))}
        </div>
      </div>
    </main>
  )
}
