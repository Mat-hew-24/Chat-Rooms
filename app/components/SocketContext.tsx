'use client'
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'
import { io, Socket } from 'socket.io-client'

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
  username: string
  setUsername: (name: string) => void
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  username: '',
  setUsername: () => {},
})

interface SocketProviderProps {
  children: ReactNode
}

export function SocketProvider({ children }: SocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [username, setUsernameState] = useState('')

  useEffect(() => {
    // Load username from localStorage on mount
    const savedUsername = localStorage.getItem('chatUsername')
    if (savedUsername) {
      setUsernameState(savedUsername)
    }
  }, [])

  const setUsername = (name: string) => {
    setUsernameState(name)
    localStorage.setItem('chatUsername', name)
  }

  useEffect(() => {
    const newSocket = io('http://localhost:5000')
    newSocket.on('connect', () => {
      setIsConnected(true)
      console.log('Socket connected:', newSocket.id)
    })
    newSocket.on('disconnect', () => {
      setIsConnected(false)
      console.log('Socket disconnected')
    })
    setSocket(newSocket)
    return () => {
      newSocket.close()
    }
  }, [])

  return (
    <SocketContext.Provider
      value={{ socket, isConnected, username, setUsername }}
    >
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = (): SocketContextType => {
  return useContext(SocketContext)
}

//basically making a custom useSocket hook
