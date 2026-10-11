import { useState } from 'react'
import Createroom from './Createroom'
import RoomListItem from './RoomListItem'

interface Room {
  id: string
  roomName: string
  ownerName: string
  duration: number
  membersCount: number
  ownerId: string
  createdAt?: number
  expiresAt?: number
}

interface SidebarProps {
  rooms: Room[]
  currentRoomId: string
  inRoom: boolean
  username: string
  isConnected: boolean
  socketId?: string
  onJoinRoom: (roomId: string) => void
  onCreateRoom: (roomData: { roomName: string; duration: number }) => void
  onDeleteRoom: (roomId: string) => void
}

export default function Sidebar({
  rooms,
  currentRoomId,
  inRoom,
  username,
  isConnected,
  socketId,
  onJoinRoom,
  onCreateRoom,
  onDeleteRoom,
}: SidebarProps) {
  const [query, setQuery] = useState('')

  const filteredRooms = rooms.filter((room) =>
    room.roomName.toLowerCase().includes(query.trim().toLowerCase()),
  )

  return (
    <aside
      className={`${
        inRoom ? 'hidden md:flex' : 'flex'
      } w-full shrink-0 flex-col border-r border-border bg-surface md:w-[320px] lg:w-[360px]`}
    >
      <div className='flex h-16 shrink-0 items-center justify-between gap-2 border-b border-border px-4'>
        <div className='flex items-center gap-2 min-w-0'>
          <span className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink text-sm font-semibold text-surface'>
            C
          </span>
          <span className='truncate font-semibold text-ink'>Chat Rooms</span>
        </div>
        <div
          className='flex items-center gap-1.5 shrink-0'
          title={isConnected ? 'Connected' : 'Reconnecting…'}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              isConnected ? 'bg-online' : 'bg-ink-muted'
            }`}
          />
        </div>
      </div>

      <div className='border-b border-border px-3 py-3'>
        <div className='flex items-center gap-2 rounded-lg border border-border bg-bg px-3 py-2 focus-within:border-accent'>
          <svg
            className='h-4 w-4 shrink-0 text-ink-muted'
            fill='none'
            stroke='currentColor'
            strokeWidth={1.75}
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M21 21l-4.35-4.35m1.1-5.15a6.25 6.25 0 11-12.5 0 6.25 6.25 0 0112.5 0z'
            />
          </svg>
          <input
            type='text'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Search rooms'
            className='w-full min-w-0 bg-transparent text-sm text-ink placeholder-ink-muted outline-none'
          />
        </div>
      </div>

      <div className='scrollbar-thin flex-1 overflow-y-auto px-2 py-2'>
        {filteredRooms.length === 0 ? (
          <p className='px-3 py-6 text-center text-sm text-ink-muted'>
            {rooms.length === 0 ? 'No rooms yet — create one to start.' : 'No rooms match your search.'}
          </p>
        ) : (
          <div className='space-y-0.5'>
            {filteredRooms.map((room) => (
              <RoomListItem
                key={room.id}
                roomName={room.roomName}
                ownerName={room.ownerName}
                membersCount={room.membersCount}
                duration={room.duration}
                active={room.id === currentRoomId}
                onJoin={() => onJoinRoom(room.id)}
                isOwner={socketId === room.ownerId}
                onDelete={() => onDeleteRoom(room.id)}
              />
            ))}
          </div>
        )}
      </div>

      <div className='flex items-center justify-between gap-2 border-t border-border p-3'>
        <div className='flex min-w-0 items-center gap-2'>
          <span className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent-ink'>
            {username?.[0]?.toUpperCase() || '?'}
          </span>
          <span className='truncate text-sm text-ink-soft'>{username}</span>
        </div>
        <Createroom onCreateRoom={onCreateRoom} />
      </div>
    </aside>
  )
}
