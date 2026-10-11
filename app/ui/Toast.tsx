import toast from 'react-hot-toast'

const base = {
  style: {
    background: '#ffffff',
    color: '#2b2723',
    border: '1px solid #e5ded2',
    borderRadius: '10px',
    padding: '12px 16px',
    fontSize: '14px',
    fontWeight: 500,
    boxShadow: '0 4px 16px rgba(43, 39, 35, 0.08)',
  },
}

export const showSuccessToast = (message: string) => {
  toast.success(message, {
    ...base,
    style: { ...base.style, borderLeft: '3px solid #3f9142' },
    duration: 3000,
  })
}

export const showErrorToast = (message: string) => {
  toast.error(message, {
    ...base,
    style: { ...base.style, borderLeft: '3px solid #c0392b' },
    duration: 5000,
  })
}

export const showUserJoinedToast = (username: string) => {
  toast(
    () => (
      <div>
        <p className='font-medium text-ink'>{username}</p>
        <p className='text-xs text-ink-soft'>joined the room</p>
      </div>
    ),
    {
      ...base,
      style: { ...base.style, borderLeft: '3px solid #3f9142' },
      duration: 4000,
    },
  )
}

export const showUserLeftToast = (username: string) => {
  toast(
    () => (
      <div>
        <p className='font-medium text-ink'>{username}</p>
        <p className='text-xs text-ink-soft'>left the room</p>
      </div>
    ),
    {
      ...base,
      style: { ...base.style, borderLeft: '3px solid #a39a8a' },
      duration: 4000,
    },
  )
}

export const showInfoToast = (message: string) => {
  toast(message, {
    ...base,
    style: { ...base.style, borderLeft: '3px solid #b36a1d' },
    duration: 3000,
  })
}
