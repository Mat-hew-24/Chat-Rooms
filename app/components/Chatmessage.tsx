type MessageProp = {
  who: string
  message: string
  username: string
}

function LeftMessage({
  message,
  username,
}: {
  message: string
  username: string
}) {
  return (
    <div className='flex items-end gap-2 mb-4 animate-[msgInLeft_0.25s_cubic-bezier(0.34,1.56,0.64,1)_both]'>
      <div className='w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 bg-amber-200 text-amber-900 border border-amber-300'>
        {username[0].toUpperCase()}
      </div>
      <div className='flex flex-col gap-1 max-w-xs'>
        <span className='text-[10px] font-semibold uppercase tracking-wider pl-1 text-amber-800/60'>
          {username}
        </span>
        <div className='px-4 py-2.5 rounded-2xl rounded-bl-sm text-sm leading-relaxed break-words bg-white/70 text-gray-900 border border-amber-200 shadow-sm'>
          {message}
        </div>
      </div>
    </div>
  )
}

function RightMessage({
  message,
  username,
}: {
  message: string
  username: string
}) {
  return (
    <div className='flex items-end gap-2 mb-4 flex-row-reverse animate-[msgInRight_0.25s_cubic-bezier(0.34,1.56,0.64,1)_both]'>
      <div className='w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 bg-gray-900 text-amber-100'>
        {username[0].toUpperCase()}
      </div>
      <div className='flex flex-col gap-1 max-w-xs items-end'>
        <span className='text-[10px] font-semibold uppercase tracking-wider pr-1 text-amber-800/60'>
          {username}
        </span>
        <div className='px-4 py-2.5 rounded-2xl rounded-br-sm text-sm leading-relaxed break-words bg-gray-900 text-amber-50 shadow-md'>
          {message}
        </div>
      </div>
    </div>
  )
}

export default function Chatmessage({ who, message, username }: MessageProp) {
  return (
    <>
      {who === 'user' ? (
        <RightMessage message={message} username={username} />
      ) : (
        <LeftMessage message={message} username={username} />
      )}
    </>
  )
}
