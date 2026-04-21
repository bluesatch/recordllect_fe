import { useState, useEffect, useCallback } from "react"
import { Link } from "react-router-dom"
import { api } from "../services/api.js"
import { useAuth } from '../context/AuthContext.js'

/**
 * Album Grid - Reusable album grid component
 * 
 * Props: 
 * - endpoint: API endpoint to fetch albums from 
 * - defaultSort: default sort value 
 * - sortOptions: array of { value, label } sort optrions 
 * - showAddedSort: whether to show date added sort options 
 * - paginated: whether to show pagination
 * - albums: optional static array of albums (skips fetching)
 * - onRemove: optional callback when an album is removed from collection 
 * - emptyMessage: message to show when no albums found 
 * - title: optional section title 
 * - showBrowseButton: whether to show Browse Albums button 
 */

const AlbumGrid =({
    endpoint,
    defaultSort = 'title_asc',
    sortOptions,
    paginated = true,
    albums: staticAlbums,
    onRemove,
    emptyMessage = 'No albums found',
    title,
    showBrowseButton = false,
    limit = 20
}) => {

    // specifies if user is authenticated or not. If not, Home page displays on load
    const { user, isAuthenticated } = useAuth()

    // STATE
    const [ albums, setAlbums ] = useState(staticAlbums || [])
    const [ loading, setLoading ] = useState(!staticAlbums)
    const [ error, setError ] = useState(null)
    const [ sort, setSort ] = useState(defaultSort)
    const [ page, setPage ] = useState(1)
    const [ totalPages, setTotalPages ] = useState(1)
    const [ total, setTotal ] = useState(staticAlbums?.length || 0)
    const [ removingId, setRemovingId ] = useState(null)

    // default sort options 
    const defaultSortOptions = [
        { value: 'title_asc', label: 'Title A-Z' },
        { value: 'title_desc', label: 'Title Z-A' },
        { value: 'year_desc', label: 'Year - Newest' },
        { value: 'year_asc', label: 'Year - Oldest' }
    ]

    // added sort options 
    const addedSortOptions = [
        { value: 'added_desc', label: 'Recently Added' },
        { value: 'added_asc', label: 'Oldest Added' },
        ...defaultSortOptions
    ]   

    const resolvedSortOptions = sortOptions || defaultSortOptions

    // FETCH Albums
    const fetchAlbums = useCallback(async ()=> {
        if (staticAlbums || !endpoint) return 

        setLoading(true)
        setError(null)

        try {
            const params = new URLSearchParams({
                page, 
                limit, 
                sort
            })

            const data = await api.get(`${endpoint}?${params.toString()}`)

            setAlbums(data.albums || [])
            setTotal(data.total || 0)
            setTotalPages(data.totalPages || 1)
            
        } catch (err) {
            setError('Failed to load albums. Please try again.')
        } finally {
            setLoading(false)
        }
    }, [endpoint, page, sort, staticAlbums, limit])

    // useEffects

    useEffect(()=> {
        fetchAlbums()
    }, [fetchAlbums])

    useEffect(()=> {
        window.scrollTo({ top: 0, behavior: 'smooth'})
    }, [page])

    // handlers 
    const handleSortChange =(e)=> {
        setSort(e.target.value)
        setPage(1)
    }

    const handleRemove = async (albumId)=> {

        if (!onRemove) return 
        setRemovingId(albumId)

        try {
            
            await onRemove(albumId)
            setAlbums(prevAlbum => prevAlbum.filter(a => a.album_id !== albumId))
            setTotal(prevTotal => prevTotal - 1)
        } catch (err) {
            console.error('Failed to remvoe album:', err)
        } finally {
            setRemovingId(null)
        }
    }

    // Album cards
    const albumCards = albums.map(album => (
        <div key={album.album_id} className="col-md-3 col-sm-6 mb-4">
            <div className="card h-100">

                {album.album_image_url ? (
                    <img 
                        src={album.album_image_url}
                        alt={`${album.title} album cover`}
                        className="card-img-top"
                        style={{ objectFit: 'cover', height: '180px' }}
                    />
                ) : (
                    <div
                        className="bg-secondary d-flex align-items-center justify-content-center"
                        style={{ height: '180px' }}
                        aria-label='No album cover available'
                    >   
                        <span className='text-white'>No Image</span>
                    </div>
                )}

                <div className="card-body">
                    <h3 className="card-title h6">{album.title}</h3>
                    <p className="card-text text-muted mb-1">
                        {album.performer_name}
                    </p>
                    <p className="card-text text-muted mb-1">
                        <small>{album.release_year || '-'} | {album.format_name}</small>
                    </p>
                    {album.label_name && (
                        <p className="card-text text-muted mb-0">
                            <small>{album.label_name}</small>
                        </p>
                    )}
                </div>
                <footer className="card-footer d-flex gap-2">
                    <Link 
                        to={`/albums/${album.album_id}`}
                        className="btn btn-outline-primary btn-sm flex-grow-1"
                    >
                        View
                    </Link>
                    {onRemove && (
                        <button 
                            className="btn btn-outline-danger btn-sm"
                            onClick={()=> handleRemove(album.album_id)}
                            disabled={removingId === album.album_id}
                            aria-label={`Remove ${album.title} from collection`}
                        >
                            {removingId === album.album_id ? '...' : 'x'}
                        </button>
                    )}
                </footer>
            </div>
        </div>
    ))

    // JSX
    return (
        <section aria-label={title || 'Album grid'}>

            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="d-flex align-items-center gap-2">
                    {title && (
                        <h3 className="mb-0">
                            {title}
                            {total > 0 && (
                                <span className="text-muted fs-6 ms-2">
                                    ({ total} album{total !== 1 ? 's' : ''})
                                </span>
                            )}
                        </h3>
                    )}
                </div>
                <div className="d-flex align-items-center gap-2">
                    <label className="form-label mb-0" htmlFor={`sort-${endpoint}`}>Sort By</label>
                    <select 
                        className="form-select form-select-sm"
                        id={`sort-${endpoint}`}
                        value={sort}
                        onChange={handleSortChange}
                        aria-label="Sort albums"
                        style={{ width: 'auto'}}
                    >
                        {resolvedSortOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    {showBrowseButton && (
                        <Link to='/albums' className="btn btn-primary btn-sm">Browse Albums</Link>
                    )}
                </div>
            </div>

            {error && (
                <div className="alert alert-danger" role='alert' aria-live='polite'>{error}</div>
            )}

            {/* Album Grid */}
            {loading ? (
                <div className="text-center mt-4">
                    <p>Loading albums...</p>
                </div>
            ) : albums.length === 0 ? (
                <div className="text-center mt-4">
                    <p className="text-muted">{emptyMessage}</p>
                    {showBrowseButton && (
                        <Link to='/albums' className="btn btn-primary btn-sm">Browse Albums to Get Started</Link>
                    )}
                </div>
            ) : (
                <>
                    <div className="row">
                        {albumCards}
                    </div>

                    {/* Pagination */}
                    {paginated && totalPages > 1 && (
                        <nav aria-label='Album pagination' className="mt-4 mb-5">
                            <ul className="pagination justify-content-center">
                                <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                                    <button 
                                        className="page-link"
                                        onClick={()=> setPage(1)}
                                        disabled={page === 1}
                                        aria-label='First page'
                                    >
                                        &laquo;
                                    </button>
                                </li>
                                <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                                    <button 
                                        className="page-link"
                                        onClick={()=> setPage(p => p - 1)}
                                        disabled={page === 1}
                                        aria-label='Previous page'
                                    >
                                        Previous
                                    </button>
                                </li>
                                <li className="page-item disabled">
                                    <span className="page-link">
                                        Page {page} of {totalPages}
                                    </span>
                                </li>
                                <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                                    <button 
                                        className="page-link"
                                        onClick={()=> setPage(p => p + 1)}
                                        disabled={page === totalPages}
                                        aria-label="Next page"
                                    >
                                        Next
                                    </button>
                                </li>
                                <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                                    <button 
                                        className="page-link"
                                        onClick={()=> setPage(totalPages)}
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
        </section>
    )

}

export default AlbumGrid