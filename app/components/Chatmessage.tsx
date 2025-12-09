type MessageProp = {
  who: string
  message: string
}

function LeftMessage({ message }: { message: string }) {
  return (
    <div className='flex justify-start mb-4'>
      <div className='bg-gray-300 text-black px-4 py-2 rounded-lg max-w-xs'>
        {message}
      </div>
    </div>
  )
}

function RightMessage({ message }: { message: string }) {
  return (
    <div className='flex justify-end mb-4'>
      <div className='bg-blue-500 text-white px-4 py-2 rounded-lg max-w-xs'>
        {message}
      </div>
    </div>
  )
}

export default function Chatmessage({ who, message }: MessageProp) {
  return (
    <>
      {who === 'user' ? (
        <RightMessage message={message} />
      ) : (
        <LeftMessage message={message} />
      )}
    </>
  )
}
