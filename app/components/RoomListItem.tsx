interface RoomListItemProps {
  roomName: string
  ownerName: string
  membersCount: number
  duration: number
  active: boolean
  onJoin: () => void
  isOwner?: boolean
  onDelete?: () => void
}

function getExpiryTime(minutes: number) {
  const expiryTime = new Date(Date.now() + minutes * 60 * 1000)
  return expiryTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export default function RoomListItem({
  roomName,
  ownerName,
  membersCount,
  duration,
  active,
  onJoin,
  isOwner = false,
  onDelete,
}: RoomListItemProps) {
  return (
    <div
      className={`group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
        active ? 'bg-accent-soft' : 'hover:bg-surface-hover'
      }`}
    >
      {active && (
        <span className='absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-accent' />
      )}
      <button
        onClick={onJoin}
        className='flex min-w-0 flex-1 items-center gap-3 text-left cursor-pointer'
      >
        <span className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent-ink'>
          {roomName[0]?.toUpperCase()}
        </span>
        <span className='min-w-0 flex-1'>
          <span className='flex items-baseline justify-between gap-2'>
            <span className='truncate text-sm font-medium text-ink'>
              {roomName}
            </span>
            <span className='shrink-0 font-mono text-[11px] text-ink-muted'>
              {getExpiryTime(duration)}
            </span>
          </span>
          <span className='flex items-center gap-1.5 text-xs text-ink-soft'>
            <span className='truncate'>by {ownerName}</span>
            <span className='text-ink-muted'>&middot;</span>
            <span className='inline-flex items-center gap-1 shrink-0'>
              <span className='h-1.5 w-1.5 rounded-full bg-online' />
              {membersCount}
            </span>
          </span>
        </span>
      </button>
      {isOwner && onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          aria-label='Delete room'
          className='shrink-0 rounded-md p-1.5 text-ink-muted opacity-0 transition-colors group-hover:opacity-100 hover:bg-danger-soft hover:text-danger cursor-pointer'
        >
          <svg
            className='h-4 w-4'
            fill='none'
            stroke='currentColor'
            strokeWidth={1.75}
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M6 7h12M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m2 0l-1 13a1 1 0 01-1 1H8a1 1 0 01-1-1L6 7h12z'
            />
          </svg>
        </button>
      )}
    </div>
  )
}
