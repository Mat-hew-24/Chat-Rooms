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
    <div className='flex justify-start mb-4'>
      <div className='bg-gray-300 text-black px-4 py-2 rounded-lg max-w-xs wrap-break-word'>
        {/*wrap-break-word */}
        <span className='text-xs text-gray-700 mb-1 font-semibold block'>
          {username}
        </span>
        <span className='wrap-break-word'>{message}</span>
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
    <div className='flex justify-end mb-4'>
      <div className='bg-blue-500 text-white px-4 py-2 rounded-lg max-w-xs wrap-break-word'>
        <span className='text-xs text-blue-100 mb-1 font-semibold block'>
          {username}
        </span>
        <span className='wrap-break-word'>{message}</span>
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

//OKIEEE
