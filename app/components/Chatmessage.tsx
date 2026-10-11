type MessageProp = {
  who: string
  message: string
  username: string
  time: number
  isGroupStart: boolean
}

function formatTime(time: number) {
  return new Date(time).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

function LeftMessage({
  message,
  username,
  time,
  isGroupStart,
}: {
  message: string
  username: string
  time: number
  isGroupStart: boolean
}) {
  return (
    <div
      className={`flex items-end gap-2 ${isGroupStart ? 'mt-3' : 'mt-0.5'} animate-[msgIn_0.18s_ease-out_both]`}
    >
      <div className='w-7 shrink-0'>
        {isGroupStart && (
          <span className='flex h-7 w-7 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent-ink'>
            {username[0]?.toUpperCase()}
          </span>
        )}
      </div>
      <div className='flex max-w-[75%] flex-col gap-1 md:max-w-md'>
        {isGroupStart && (
          <span className='pl-1 text-xs text-ink-muted'>
            {username} &middot; {formatTime(time)}
          </span>
        )}
        <div className='break-words rounded-2xl rounded-bl-md border border-border bg-surface px-3.5 py-2 text-sm leading-relaxed text-ink'>
          {message}
        </div>
      </div>
    </div>
  )
}

function RightMessage({
  message,
  time,
  isGroupStart,
}: {
  message: string
  time: number
  isGroupStart: boolean
}) {
  return (
    <div
      className={`flex flex-row-reverse items-end gap-2 ${isGroupStart ? 'mt-3' : 'mt-0.5'} animate-[msgIn_0.18s_ease-out_both]`}
    >
      <div className='w-7 shrink-0' />
      <div className='flex max-w-[75%] flex-col items-end gap-1 md:max-w-md'>
        {isGroupStart && (
          <span className='pr-1 text-xs text-ink-muted'>
            {formatTime(time)}
          </span>
        )}
        <div className='break-words rounded-2xl rounded-br-md bg-accent px-3.5 py-2 text-sm leading-relaxed text-white'>
          {message}
        </div>
      </div>
    </div>
  )
}

export default function Chatmessage({
  who,
  message,
  username,
  time,
  isGroupStart,
}: MessageProp) {
  return who === 'user' ? (
    <RightMessage message={message} time={time} isGroupStart={isGroupStart} />
  ) : (
    <LeftMessage
      message={message}
      username={username}
      time={time}
      isGroupStart={isGroupStart}
    />
  )
}
