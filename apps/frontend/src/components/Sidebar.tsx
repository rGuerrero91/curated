interface SidebarSection {
  label: string
  items: { id: string; name: string }[]
}

interface SidebarProps {
  pinned: SidebarSection['items']
  collections: SidebarSection['items']
  recentlyViewed: SidebarSection['items']
}

export function Sidebar({ pinned, collections, recentlyViewed }: SidebarProps) {
  return (
    <aside className="w-52 flex-shrink-0 border-r border-black pr-6 pt-6 flex flex-col gap-6">
      <div>
        <h2 className="font-bold text-base mb-2">Pinned</h2>
        <ul className="flex flex-col gap-1">
          {pinned.map((item) => (
            <li key={item.id}>
              <a
                href="#"
                className="text-sm pl-3 hover:underline truncate block"
              >
                {item.name}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="font-bold text-base mb-2">Collections</h2>
        <ul className="flex flex-col gap-1">
          {collections.map((item) => (
            <li key={item.id}>
              <a
                href="#"
                className="text-sm pl-3 hover:underline truncate block"
              >
                {item.name}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="font-bold text-base mb-2">Recently Viewed</h2>
        <ul className="flex flex-col gap-1">
          {recentlyViewed.map((item) => (
            <li key={item.id}>
              <a
                href="#"
                className="text-sm pl-3 hover:underline truncate block"
              >
                {item.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}
