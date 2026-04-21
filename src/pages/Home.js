import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.js'
import { api } from '../services/api.js'

/**
 * Home - Landing page
 *
 * Authenticated view:
 * - Dashboard stats (collection count, followers, following)
 * - User's personal album collection with pagination
 *
 * Unauthenticated view:
 * - Welcome message with login and register buttons
 * - Featured albums from the global catalog
 */

const Home = () => {

    const { user, isAuthenticated, loading } = useAuth()

    const [collection, setCollection] = useState([])
    const [featuredAlbums, setFeaturedAlbums] = useState([])
    const [dataLoading, setDataLoading] = useState(true)
    const [error, setError] = useState(null)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [total, setTotal] = useState(0)
    const [sort, setSort] = useState('added_desc')

    const LIMIT = 60

    useEffect(() => {
        const fetchData = async () => {
            setDataLoading(true)
            setError(null)

            try {
                if (isAuthenticated && user) {
                    // Fetch user's personal collection with pagination
                    const data = await api.get(
                        `/users/${user.users_id}/albums?page=${page}&limit=${LIMIT}&sort=${sort}`
                    )
                    setCollection(data.albums || [])
                    setTotalPages(data.totalPages || 1)
                    setTotal(data.total || 0)
                } else {
                    // Fetch featured albums from global catalog
                    const data = await api.get('/albums')
                    setFeaturedAlbums(data.albums?.slice(0, 8) || [])
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

    }, [isAuthenticated, user, loading, page, sort])

    // Scroll to top when page changes
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }, [page])

    // Show nothing while auth state is being determined
    if (loading) {
        return (
            <div className='container mt-5 text-center'>
                <p>Loading...</p>
            </div>
        )
    }

    // sort handler
    const handleSortChange =(e)=> {
        setSort(e.target.value)
        setPage(1)
    }

    /**
     * ===========================================================
     * AUTHENTICATED VIEW
     * ===========================================================
     */

    if (isAuthenticated && user) {
        return (
            <div className='container mt-4'>

                {/* Welcome heading */}
                <h2 className='mb-4'>
                    Welcome back, {user.first_name}!
                </h2>

                {/* Dashboard stats */}
                <div className='row mb-4'>
                    <div className='col-md-4 mb-3'>
                        <div className='card text-center p-3'>
                            <h3 className='display-6'>{total}</h3>
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

                {/* Collection header */}
                <div className='d-flex justify-content-between align-items-center mb-3'>
                    <h3>My Collection</h3>
                    <div className='d-flex align-items-center gap-2'>
                        <label className='form-label mb-0' htmlFor='sort'>Sort By</label>
                        <select 
                            className='form-select form-select-sm'
                            id='sort'
                            name='sort'
                            value={sort}
                            onChange={handleSortChange}
                            aria-label='Sort collection'
                            style={{ width: 'auto'}}
                        >
                            <option value='added_desc'>Recently Added</option>
                            <option value='added_asc'>Oldest Added</option>
                            <option value='title_asc'>Title A-Z</option>
                            <option value='title_desc'>Title Z-A</option>
                            <option value='year_desc'>Year - Newest</option>
                            <option value='year_asc'>Year - Oldest</option>
                        </select>
                    </div>
                    <Link to='/albums' className='btn btn-primary btn-sm'>
                        Browse Albums
                    </Link>
                </div>
                  {/* Pagination */}
                        {totalPages > 1 && (
                            <nav aria-label='Collection pagination top' className='mt-4 mb-5'>
                                <ul className='pagination justify-content-center'>

                                    {/* First page */}
                                    <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                                        <button
                                            className='page-link'
                                            onClick={() => setPage(1)}
                                            disabled={page === 1}
                                            aria-label='First page'
                                        >
                                            &laquo;
                                        </button>
                                    </li>

                                    {/* Previous page */}
                                    <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                                        <button
                                            className='page-link'
                                            onClick={() => setPage(p => p - 1)}
                                            disabled={page === 1}
                                            aria-label='Previous page'
                                        >
                                            Previous
                                        </button>
                                    </li>

                                    {/* Page info */}
                                    <li className='page-item disabled'>
                                        <span className='page-link'>
                                            Page {page} of {totalPages} &mdash; {total} albums
                                        </span>
                                    </li>

                                    {/* Next page */}
                                    <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                                        <button
                                            className='page-link'
                                            onClick={() => setPage(p => p + 1)}
                                            disabled={page === totalPages}
                                            aria-label='Next page'
                                        >
                                            Next
                                        </button>
                                    </li>

                                    {/* Last page */}
                                    <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                                        <button
                                            className='page-link'
                                            onClick={() => setPage(totalPages)}
                                            disabled={page === totalPages}
                                            aria-label='Last page'
                                        >
                                            &raquo;
                                        </button>
                                    </li>

                                </ul>
                            </nav>
                        )}

                {error && (
                    <div className='alert alert-danger' role='alert' aria-live='polite'>
                        {error}
                    </div>
                )}

                {dataLoading ? (
                    <div className='text-center mt-5'>
                        <p>Loading your collection...</p>
                    </div>
                ) : collection.length === 0 && page === 1 ? (
                    <div className='text-center mt-5'>
                        <p className='text-muted'>Your collection is empty.</p>
                        <Link to='/albums' className='btn btn-primary'>
                            Browse Albums to Get Started
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Album grid */}
                        <div className='row'>
                            {collection.map(album => (
                                <div key={album.album_id} className='col-md-3 col-sm-6 mb-4'>
                                    <div className='card h-100'>
                                        {album.album_image_url ? (
                                            <img
                                                src={album.album_image_url}
                                                alt={`${album.title} album cover`}
                                                className='card-img-top'
                                                style={{ objectFit: 'cover', height: '180px' }}
                                            />
                                        ) : (
                                            <div
                                                className='bg-secondary d-flex align-items-center justify-content-center'
                                                style={{ height: '180px' }}
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

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <nav aria-label='Collection pagination bottom' className='mt-4 mb-5'>
                                <ul className='pagination justify-content-center'>

                                    {/* First page */}
                                    <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                                        <button
                                            className='page-link'
                                            onClick={() => setPage(1)}
                                            disabled={page === 1}
                                            aria-label='First page'
                                        >
                                            &laquo;
                                        </button>
                                    </li>

                                    {/* Previous page */}
                                    <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                                        <button
                                            className='page-link'
                                            onClick={() => setPage(p => p - 1)}
                                            disabled={page === 1}
                                            aria-label='Previous page'
                                        >
                                            Previous
                                        </button>
                                    </li>

                                    {/* Page info */}
                                    <li className='page-item disabled'>
                                        <span className='page-link'>
                                            Page {page} of {totalPages} &mdash; {total} albums
                                        </span>
                                    </li>

                                    {/* Next page */}
                                    <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                                        <button
                                            className='page-link'
                                            onClick={() => setPage(p => p + 1)}
                                            disabled={page === totalPages}
                                            aria-label='Next page'
                                        >
                                            Next
                                        </button>
                                    </li>

                                    {/* Last page */}
                                    <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                                        <button
                                            className='page-link'
                                            onClick={() => setPage(totalPages)}
                                            disabled={page === totalPages}
                                            aria-label='Last page'
                                        >
                                            &raquo;
                                        </button>
                                    </li>

                                </ul>
                            </nav>
                        )}
                    </>
                )}

            </div>
        )
    }

    /**
     * ===========================================================
     * UNAUTHENTICATED VIEW
     * ===========================================================
     */

    return (
        <div className='container mt-4'>

            {/* Welcome message */}
            <div className='text-center py-5'>
                <h1>Welcome to Recordllect!</h1>
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
                        <div key={album.album_id} className='col-md-3 col-sm-6 mb-4'>
                            <div className='card h-100'>
                                {album.album_image_url ? (
                                    <img
                                        src={album.album_image_url}
                                        alt={`${album.title} album cover`}
                                        className='card-img-top'
                                        style={{ objectFit: 'cover', height: '180px' }}
                                    />
                                ) : (
                                    <div
                                        className='bg-secondary d-flex align-items-center justify-content-center'
                                        style={{ height: '180px' }}
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
    )
}

export default Home