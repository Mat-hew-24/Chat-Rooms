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
      <div className='flex flex-col'>
        <span className='text-xs text-gray-700 mb-1 ml-2 font-semibold'>
          {username}
        </span>
        <div className='bg-gray-300 text-black px-4 py-2 rounded-lg max-w-xs'>
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
    <div className='flex justify-end mb-4'>
      <div className='flex flex-col items-end'>
        <span className='text-xs text-gray-700 mb-1 mr-2 font-semibold'>
          {username}
        </span>
        <div className='bg-blue-500 text-white px-4 py-2 rounded-lg max-w-xs'>
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

//OKIEEE
