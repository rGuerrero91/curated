import { CollectionCard } from './CollectionCard'
import { LinkCard } from './LinkCard'

interface FeedItemCurated {
  type: 'curated'
  user: { username: string; avatarUrl?: string }
  collection: { title: string; imageUrl?: string }
}

interface FeedItemSaved {
  type: 'saved'
  user: { username: string; avatarUrl?: string }
  collectionName: string
  link: { title: string; description?: string; url: string }
}

type FeedItemProps = FeedItemCurated | FeedItemSaved

function UserAvatar({ username, avatarUrl }: { username: string; avatarUrl?: string }) {
  return (
    <div className="w-9 h-9 border border-black overflow-hidden flex-shrink-0">
      {avatarUrl ? (
        <img src={avatarUrl} alt={username} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-gray-400 flex items-center justify-center text-white text-sm font-bold">
          {username[0].toUpperCase()}
        </div>
      )}
    </div>
  )
}

export function FeedItem(props: FeedItemProps) {
  if (props.type === 'curated') {
    return (
      <div className="flex flex-col gap-3 mb-8">
        <div className="flex items-center gap-3">
          <UserAvatar {...props.user} />
          <p className="text-sm">
            <span className="font-bold">{props.user.username}</span> curated
          </p>
        </div>
        <CollectionCard
          title={props.collection.title}
          imageUrl={props.collection.imageUrl}
          className="max-w-xs"
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 mb-8">
      <div className="flex items-center gap-3">
        <UserAvatar {...props.user} />
        <p className="text-sm">
          <span className="font-bold">{props.user.username}</span> saved to{' '}
          <span className="font-bold">{props.collectionName}</span>
        </p>
      </div>
      <LinkCard
        title={props.link.title}
        description={props.link.description}
        url={props.link.url}
        className="max-w-xs"
      />
    </div>
  )
}
