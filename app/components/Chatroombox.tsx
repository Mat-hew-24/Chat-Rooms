interface ChatroomboxProps {
  roomName: string
  ownerName: string
  membersCount: number
  duration: number
  onJoin: () => void
  isOwner?: boolean
  onDelete?: () => void
}

export default function Chatroombox({
  roomName,
  ownerName,
  membersCount,
  duration,
  onJoin,
  isOwner = false,
  onDelete,
}: ChatroomboxProps) {
  const getExpiryTime = (minutes: number) => {
    const now = new Date()
    const expiryTime = new Date(now.getTime() + minutes * 60 * 1000)
    return expiryTime.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  return (
    <div className='w-full max-w-2xl mx-auto rounded-2xl bg-black p-6 shadow-[0_8px_32px_rgba(0,0,0,0.25)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.35)] transition-all duration-300 border border-white/10'>
      <div className='space-y-5'>
        {/* Header */}
        <div className='space-y-1.5'>
          <h3 className='text-xl font-bold text-amber-50 truncate tracking-tight'>
            {roomName}
          </h3>
          <p className='text-amber-100/50 text-sm'>by {ownerName}</p>
        </div>

        {/* Members badge */}
        <div className='flex items-center gap-2 w-fit bg-white/5 border border-white/10 rounded-full px-3 py-1.5'>
          <span className='w-2 h-2 bg-green-400 rounded-full animate-pulse' />
          <span className='text-green-400 text-xs font-semibold'>
            {membersCount} members joined
          </span>
        </div>

        {/* Expiry */}
        <div className='flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3'>
          <span className='text-amber-100/40 text-xs font-semibold uppercase tracking-widest'>
            Expires at
          </span>
          <span className='text-amber-100 text-sm font-bold'>
            {getExpiryTime(duration)}
          </span>
        </div>

        {/* Buttons */}
        <div className='flex gap-3 pt-1'>
          {/* JOIN — black bg, cream text → cream sweep, black text */}
          <button
            onClick={onJoin}
            className='relative flex-1 overflow-hidden bg-black text-[#FEF3C6] font-bold py-3 px-6 rounded-xl active:scale-95 transition-all duration-400 text-sm tracking-wide border border-[#FEF3C6]/90 group cursor-pointer'
          >
            <span className='absolute inset-y-0 left-0 w-[110%] bg-[#FEF3C6] -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-in-out rounded-r-full' />
            <span className='relative z-10 text-[#FEF3C6] group-hover:text-black transition-colors duration-150'>
              JOIN ROOM
            </span>
          </button>

          {/* DELETE — black bg, red text → red sweep, white text */}
          {isOwner && onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              className='relative overflow-hidden bg-black text-red-400 font-bold py-3 px-5 rounded-xl active:scale-95 transition-all duration-200 text-sm border border-red-500 group cursor-pointer'
            >
              <span className='absolute inset-y-0 left-0 w-[110%] bg-red-500 -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-in-out rounded-r-full' />
              <span className='relative z-10 text-red-400 group-hover:text-white transition-colors duration-150'>
                DELETE
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
