import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext.js"

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
                                <li className="nav-item">
                                    <Link className="nav-link" to='/discover'>
                                        Discover
                                    </Link>
                                </li>
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