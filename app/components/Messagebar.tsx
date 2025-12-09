import { io } from 'socket.io-client'

const inputstyle: string =
  'flex-1 bg-black text-yellow-100 placeholder-yellow-100 px-4 py-3 rounded-full border border-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-100 focus:border-transparent'

const btnstyle: string =
  'bg-yellow-100 hover:bg-yellow-500 text-black p-3 rounded-full transition-colors duration-200 flex items-center justify-center min-w-12 h-12 cursor-pointer'

const socket = io('http://localhost:5000')

const sendMessage = () => {
  socket.emit('send_msg', { message: 'Hello' })
}

export default function Messagebar() {
  return (
    <div className='fixed bottom-0 left-0 right-0 p-4'>
      <div className='max-w-4xl mx-auto flex gap-3 items-center'>
        <input placeholder='Type your message...' className={inputstyle} />
        <button className={btnstyle} onClick={sendMessage}>
          {/*svg let this be this one is generated okyy*/}
          <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
            <path d='M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z'></path>
          </svg>
        </button>
      </div>
    </div>
  )
}
