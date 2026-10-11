'use client'

interface UsernameModalProps {
  onSubmit: (username: string) => void
  enteredUsername: string
  setEnteredUsername: (enteredUsername: string) => void
}

export default function UsernameModal({
  onSubmit,
  enteredUsername,
  setEnteredUsername,
}: UsernameModalProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (enteredUsername.trim()) {
      onSubmit(enteredUsername.trim())
    }
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4'>
      <div className='w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-xl'>
        <h2 className='mb-1 text-lg font-semibold text-ink'>
          Welcome to Chat Rooms
        </h2>
        <p className='mb-5 text-sm text-ink-soft'>
          Pick a name to introduce yourself in conversations.
        </p>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <input
            type='text'
            value={enteredUsername}
            onChange={(e) => setEnteredUsername(e.target.value)}
            className='w-full rounded-lg border border-border bg-bg px-3 py-2.5 text-sm text-ink outline-none focus:border-accent'
            placeholder='Your name'
            required
            autoFocus
            maxLength={20}
          />

          <button
            type='submit'
            className='w-full rounded-lg bg-accent py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover cursor-pointer'
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  )
}
