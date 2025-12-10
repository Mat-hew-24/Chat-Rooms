import toast from 'react-hot-toast'

// Custom toast styles
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

// Custom success toast
export const showSuccessToast = (message: string) => {
  toast.success(message, {
    ...customToastStyle,
    icon: '✅',
    duration: 3000,
  })
}

// Custom error toast
export const showErrorToast = (message: string) => {
  toast.error(message, {
    ...customToastStyle,
    icon: '❌',
    duration: 3000,
  })
}

// Custom user joined toast
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

// Custom user left toast
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
    icon: 'ℹ️',
    duration: 3000,
  })
}
