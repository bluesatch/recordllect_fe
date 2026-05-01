import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext.js"
import { getSocket } from "../services/socket.js"
import { api } from "../services/api.js"



/**
 * Navbar - Global navigation component
 * 
 * Conditionally renders links based on auth state:
 * - Unauthenticated: shows Login and Register links
 * - Authenticated: shows nav links, user's name, profile link, and logout button
 * 
 * Uses useAuth() to access user data and logout function from AuthContext
 */

const Navbar =()=> {

    const { user, isAuthenticated, logout } = useAuth()
    const navigate = useNavigate()

    const [unreadCount, setUnreadCount] = useState(0)

    useEffect(()=> {
        const fetchUnread = async ()=> {
            if (!isAuthenticated) return 

            try {
                const data = await api.get(`/notifications?limit=1`)
                setUnreadCount(data.unread || 0)
            } catch (err) {
                console.error('Failed to fetch unread count:', err)
            }
        }

        fetchUnread()
    }, [isAuthenticated])

    useEffect(()=> {
        const socket = getSocket()
        if (!socket) return 

        const handleNotification = ()=> {
            setUnreadCount(prev => prev + 1)
        }

        socket.on('notification', handleNotification)

        return ()=> {
            socket.off('notification', handleNotification)
        }
    }, [isAuthenticated])

    const handleLogout = async ()=> {
        await logout()
        navigate('/login')
    }

    return (
        <nav 
            className='navbar navbar-expand-lg navbar-dark bg-dark' 
            role='navigation' 
            aria-label='Main navigation'>
            <div className='container'>
                {/* Brand Logo */}
                <Link className='navbar-brand' to='/'>
                    Recordllect
                </Link>

                <button
                    className='navbar-toggler'
                    type='button'
                    data-bs-toggle='collapse'
                    data-bs-target='#navbarContent'
                    aria-controls='navbarContent'
                    aria-expanded='false'
                    aria-label='Toggle navigation'
                >
                    <span className='navbar-toggler-icon'></span>
                </button>

                <div className='collapse navbar-collapse' id='navbarContent'>

                    <ul className='navbar-nav me-auto mb-2 mb-lg-0'>
                        {user?.is_admin === 1 && (
                            <li className='nav-item'>
                                <Link className='nav-link' to='/admin'>
                                    Admin
                                </Link>
                            </li>
                        )}
                        <li className='nav-item'>
                            <Link className='nav-link' to='/albums'>
                                Albums
                            </Link>
                        </li>
                        <li className='nav-item'>
                            <Link className='nav-link' to='/performers'>
                                Performers
                            </Link>
                        </li>
                        <li className='nav-item'>
                            <Link className='nav-link' to='/labels'>
                                Labels
                            </Link>
                        </li>

                    </ul>

                    <ul className='navbar-nav ms-auto mb-2 mb-lg-0'>
                        {isAuthenticated ? (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link" to='/feed'>
                                        Feed
                                    </Link>
                                </li>
                                {isAuthenticated && (
                                    <li className="nav-item">
                                        <Link className="nav-link" to='/discover'>
                                            Discover
                                        </Link>
                                    </li>
                                )}
                                <li className='nav-item'>
                                    <Link   
                                        className='nav-link'
                                        to={`/users/${user.users_id}`}
                                        aria-label={`View profile for ${user.username}`}
                                    >
                                        {user.username}
                                        {user.is_admin === 1 && (
                                            <span className='badge bg-warning text-dark ms-2'>
                                                Admin
                                            </span>
                                        )}
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link position-relative" to='/notifications'>
                                        Notifications 
                                        {unreadCount > 0 && (
                                            <span 
                                                className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                                                style={{ fontSize: '0.65rem' }}
                                            >
                                                {unreadCount > 99 ? '99+' : unreadCount}
                                            </span>

                                        )}
                                    </Link>
                                </li>
                                <li className='nav-item'>
                                    <button 
                                        className='btn btn-outline-light btn-sm ms-2'
                                        onClick={handleLogout}
                                        aria-label='Logout'
                                    >
                                        Logout
                                    </button>
                                </li>
                            </>
                        ) : (
                            <>
                                <li className='nav-item'>
                                    <Link className='nav-link' to='/login'>
                                        Login
                                    </Link>
                                </li>
                                <li className='nav-item'>
                                    <Link className='nav-link' to='/register'>
                                        Register
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    )

    // end component
}

export default Navbar