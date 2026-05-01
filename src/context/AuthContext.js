import { createContext, useState, useEffect, useContext } from "react"
import { api } from "../services/api.js"
import { connectSocket, disconnectSocket } from "../services/socket.js"

/**
 * AuthContext => Global authentication state manager
 * 
 * Solves prop drilling by providing auth state
 * to any component in the app without passing props manually
 * through every level of the component tree.
 * 
 * Provides:
 * 
 * - user: the current logged in user object (or null)
 * - isAuthenticated: boolean flag for auth status
 * - loading: true while checking existing session on app load
 * - login: function to authenticate a user
 * - logout: function to end a user's session
 *
 */

// 1 Create a context object
// The "broadcast system" other components will tune into
const AuthContext = createContext(null)

// 2 Create the Provider component
// Wraps the app and makes auth state available everywhere
export const AuthProvider = ({ children })=> {

    const [ user, setUser ] = useState(null)
    const [ isAuthenticated, setIsAuthenticated ] = useState(false)
    const [ loading, setLoading ] = useState(true)
    const [ socket, setSocket ] = useState(null)
    const [unreadCount, setUnreadCount] = useState(0)

    /**
     * checkAuth - Runs once when the app first loads
     * Checks if the user has a valid existing session (httpOnly cookie)
     * by fetching their profile from the API.
     * 
     * This prevents the app from showing a login page to a user who 
     * is already logged in from a previous session.
     */

    const connectUserSocket = async () => {
        try {
            const data = await api.get('/users/socket-token')
            if (data.token) {
                const connectedSocket = connectSocket(data.token)
                setSocket(connectedSocket)
            }
        } catch (err) {
            console.error('Failed to get socket token:', err)
        }
    }

    const fetchUnreadCount = async ()=> {
        try {
            const data = await api.get(`/notifications?limit=1`)
            setUnreadCount(data.unread || 0)
        } catch (err) {
            console.error('Failed to fetch unread count:', err)
        }
    }

    useEffect(()=> {
        const checkAuth = async ()=> {
            try {
                const data = await api.get('/users/me')

                if (data && data.users_id) {
                    setUser(data)
                    setIsAuthenticated(true)
                    await fetchUnreadCount()
                    // Connect socket with cookie token 
                    await connectUserSocket()
                }
            } catch (err) {
                setUser(null)
                setIsAuthenticated(false)
            } finally {
                setLoading(false)
            }
        }

        checkAuth()
    }, [])

    useEffect(()=> {
        if (!socket) return 

        const handleNotification =()=> {
            setUnreadCount(prev => prev + 1)
        }

        socket.on('notification', handleNotification)

        return ()=> {
            socket.off('notification', handleNotification)
        }
    }, [socket])

    /**
     * login - Authenticates the user
     * Calls the login API, stores the returned user data in state
     * and updates the isAuthenticated flag
     */

    const login = async (credentials) => {
        const data = await api.post('/users/login', credentials)

        if (data.message === 'Login successful') {

            const userData = await api.get('/users/me')
            setUser(userData)
            setIsAuthenticated(true)
            await fetchUnreadCount()
            // Connect socket after login 
            await connectUserSocket()
            
        }

        return data
    }

    /**
     * logout - Ends the user's session
     * Calls the logout API to clear the httpOnly cookie,
     * then wipes the user from local state
     */
    const logout = async ()=> {
        await api.post('/users/logout', {})
        setUser(null)
        setIsAuthenticated(false)
        setSocket(null)
        disconnectSocket()
        setUnreadCount(0)
    }

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, loading, login, logout, socket, unreadCount, setUnreadCount }}>
            {children}
        </AuthContext.Provider>
    )

    // end component


}

/**
 * useAuth - Custom hook for consuming AuthContext
 * Instead of importing AuthContext and useContext in every component,
 * components just call useAuth() to get auth state and functions
 */

export const useAuth =()=> useContext(AuthContext)