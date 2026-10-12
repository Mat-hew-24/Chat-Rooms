import toast from 'react-hot-toast'

// Custom toast styles (better use normal css so you can use ...)
const customToastStyle = {
  style: {
    background: '#1a1a1a',
    color: '#fff',
    border: '2px solid #fbbf24',
    borderRadius: '12px',
    padding: '16px 24px',
    fontSize: '16px',
    fontWeight: '600',
  },
}

export const showSuccessToast = (message: string) => {
  toast.success(message, {
    ...customToastStyle,
    icon: '✅',
    duration: 3000,
  })
}

export const showErrorToast = (message: string) => {
  toast.error(message, {
    ...customToastStyle,
    style: {
      ...customToastStyle.style,
      border: '2px solid #ef4444',
    },
    duration: 5000,
  })
}

// entry toast
export const showUserJoinedToast = (username: string) => {
  toast(
    (t) => (
      <div className='flex items-center gap-3'>
        <div>
          <p className='font-bold text-yellow-400'>{username}</p>
          <p className='text-sm text-gray-300'>joined the room</p>
        </div>
      </div>
    ),
    {
      style: {
        background: '#1a1a1a',
        color: '#fff',
        border: '2px solid #10b981',
        borderRadius: '12px',
        padding: '16px 20px',
      },
      duration: 4000,
    }
  )
}

// exit toast
export const showUserLeftToast = (username: string) => {
  toast(
    (t) => (
      <div className='flex items-center gap-3'>
        <div>
          <p className='font-bold text-yellow-400'>{username}</p>
          <p className='text-sm text-gray-300'>left the room</p>
        </div>
      </div>
    ),
    {
      style: {
        background: '#1a1a1a',
        color: '#fff',
        border: '2px solid #ef4444',
        borderRadius: '12px',
        padding: '16px 20px',
      },
      duration: 4000,
    }
  )
}

// Custom info toast
export const showInfoToast = (message: string) => {
  toast(message, {
    ...customToastStyle,
    duration: 3000,
  })
}
