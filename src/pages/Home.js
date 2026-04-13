import { useState, useEffect } from "react"
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.js'
import { api } from "../services/api.js"

/**
 * Home - Landing page
 * 
 * Authenticated view:
 * - Dashboard stats (collection count, followers, following)
 * - User's personal album collection
 * 
 * Unauth view:
 * - Welcome message with login and register buttons
 * - Featured albums from the global catalog
 * 
 */

const Home =()=> {

    const { user, isAuthenticated, loading } = useAuth()

    const [ collection, setCollection ] = useState([])
    const [ featuredAlbums, setFeaturedAlbums ] = useState([])
    const [ dataLoading, setDataLoading ] = useState(true)
    const [ error, setError ] = useState(null)

    useEffect(()=> {
        const fetchData = async ()=> {
            setDataLoading(true)

            try {
                if (isAuthenticated && user) {
                    // Fetch user's personal collection
                    const data = await api.get(`/users/${user.users_id}/albums`)
                    setCollection(data.albums || [])
                } else {
                    // Fetch featured albums from global catalog
                    const data = await api.get('/albums')
                    setFeaturedAlbums(data.albums?.slice(0, 6) || [])
                } 
            } catch (err) {
                setError('Failed to load albums. Please try again.')
            } finally {
                setDataLoading(false)
            }
        }

        // Wait for auth check to complete before fetching
        if (!loading) {
            fetchData()
        }

    }, [isAuthenticated, user, loading])

    // Show nothing while auth state is being determined
    if (loading) {
        return (
            <div className='container mt-5 text-center'>
                <p>Loading...</p>
            </div>
        )
    }

    /**
     * ======================================================================================
     * AUTHENTICATED VIEW
     * ======================================================================================
     */

    if (isAuthenticated && user) {
        return(
            <div className='container mt-4'>
                <h2 className='mb-4'>
                    Welcome back, {user.first_name}!
                </h2>

                {/* Dashboard stats */}
                <div className='row mb-4'>
                    <div className='col-md-4 mb-3'>
                        <div className='card text-center p-3'>
                            <h3 className='display-6'>{collection.length}</h3>
                            <p className='text-muted mb-0'>Albums in Collection</p>
                        </div>
                    </div>
                    <div className='col-md-4 mb-3'>
                        <div className='card text-center p-3'>
                            <h3 className='display-6'>{user.followers_count || 0}</h3>
                            <p className='text-muted mb-0'>Followers</p>
                        </div>
                    </div>
                    <div className='col-md-4 mb-3'>
                        <div className='card text-center p-3'>
                            <h3 className='display-6'>{user.following_count || 0}</h3>
                            <p className='text-muted mb-0'>Following</p>
                        </div>
                    </div>
                </div>
                {/* Album collection */}
                <div className='d-flex justify-content-between align-items-center mb-3'>
                    <h3>My Collection!</h3>
                    <Link to='/albums' className='btn btn-primary btn-sm'>
                        Browse Albums
                    </Link>
                </div>

                {error && (
                    <div className='alert alert-danger' role='alert' aria-live='polite'>
                        {error}
                    </div>
                )}

                { dataLoading ? (
                    <p>Loading your collection...</p>
                ) : collection.length === 0 ? (
                    <div className='text-center mt-5'>
                        <p className='text-muted'>Your collection is empty.</p>
                        <Link to='/albums' className='btn btn-primary'>
                            Browse Albums to Get Started
                        </Link>
                    </div>
                ) : (
                    <div className='row'>
                        {collection.map(album => (
                            <div key={album.album_id} className='col-md-4 col-sm-6 mb-4'>
                                <div className='card h-100'>
                                    {album.album_image_url ? (
                                        <img
                                            src={album.album_image_url}
                                            alt={`${album.title} album cover`}
                                            className='card-img-top'
                                            style={{ objectFit: 'cover', height: '200px'}}
                                        />
                                    ) : (
                                        <div 
                                            className="bg-secondary d-flex align-items-center justify-content-center"
                                            style={{ height: '200px'}}
                                            aria-label='No album cover available'
                                        >
                                            <span className='text-white'>No Image</span>
                                        </div>
                                    )}
                                    <div className='card-body'>
                                        <h4 className='card-title h6'>{album.title}</h4>
                                        <p className='card-text text-muted mb-1'>
                                            {album.performer_name}
                                        </p>
                                        <p className='card-text text-muted mb-1'>
                                            <small>{album.release_year} | {album.format_name}</small>
                                        </p>
                                        {album.label_name && (
                                            <p className='card-text text-muted mb-0'>
                                                <small>{album.label_name}</small>
                                            </p>
                                        )}
                                    </div>
                                    <div className='card-footer d-flex justify-content-between'>
                                        <Link
                                            to={`/albums/${album.album_id}`}
                                            className='btn btn-outline-primary btn-sm'
                                        >
                                            View
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )
    }

    /**
     * ===================================================================================
     * UNAUTH VIEW 
     * ===================================================================================
     */

    return (
        <>
            <div className='container mt-4'>
                {/* Welcome message */}
                <div className='text-center py-5'>
                    <h1>Welcome to Album App</h1>
                    <p className='lead text-muted'>
                        Discover, collect, and share your favorite albums.
                    </p>
                    <div className='d-flex justify-content-center gap-3 mt-4'>
                        <Link to='/register' className='btn btn-primary btn-lg'>
                            Get Started
                        </Link>
                        <Link to='/login' className='btn btn-outline-secondary btn-lg'>
                            Login
                        </Link>
                    </div>
                </div>

                {/* Featured albums */}
                <h2 className='mb-4'>Featured Albums</h2>

                {error && (
                    <div className='alert alert-danger' role='alert' aria-live='polite'>
                        {error}
                    </div>
                )}

                {dataLoading ? (
                    <p>Loading featured albums...</p>
                ) : featuredAlbums.length === 0 ? (
                    <p className='text-muted'>No albums available yet.</p>
                ) : (
                    <div className='row'>
                        {featuredAlbums.map(album => (
                            <div key={album.album_id} className='col-md-4 col-sm-6 mb-4'>
                                <div className='card h-100'>
                                    {album.album_image_url ? (
                                        <img    
                                            src={album.album_image_url}
                                            alt={`${album.title} album cover`}
                                            className='card-img-top'
                                            style={{ objectFit: 'cover', height: '200px'}}
                                        />
                                    ) : (
                                        <div 
                                            className='bg-secondary d-flex align-items-center justify-content-center'
                                            style={{height: '200px'}}
                                            aria-label='No album cover available'
                                        >
                                            <span className='text-white'>No Image</span>
                                        </div>
                                    )}
                                    <div className='card-body'>
                                        <h3 className='card-title h6'>{album.title}</h3>
                                        <p className='card-text text-muted mb-1'>
                                            {album.performer_name}
                                        </p>
                                        <p className='card-text text-muted mb-1'>
                                            <small>{album.release_year} | {album.format_name}</small>
                                        </p>
                                        {album.label_name && (
                                            <p className='card-text text-muted mb-0'>
                                                <small>{album.label_name}</small>
                                            </p>
                                        )}
                                    </div>
                                    <div className='card-footer'>
                                        <Link 
                                            to={`/albums/${album.album_id}`}
                                            className='btn btn-outline-primary btn-sm w-100'
                                        >
                                            View Album
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    )
}

export default Home