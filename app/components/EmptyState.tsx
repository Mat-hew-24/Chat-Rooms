export default function EmptyState() {
  return (
    <div className='hidden flex-1 flex-col items-center justify-center gap-3 bg-bg px-6 text-center md:flex'>
      <div className='flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent-ink'>
        <svg
          className='h-7 w-7'
          fill='none'
          stroke='currentColor'
          strokeWidth={1.5}
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            d='M8 10h8M8 14h5M21 12a9 9 0 11-4.26-7.65L21 3l-1.07 4.74A9 9 0 0121 12z'
          />
        </svg>
      </div>
      <h3 className='text-base font-medium text-ink'>
        Select a room to start chatting
      </h3>
      <p className='max-w-sm text-sm text-ink-muted'>
        Choose a conversation from the sidebar, or create a new room to get
        things going.
      </p>
    </div>
  )
}
