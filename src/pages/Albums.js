import { useState, useEffect, useCallback } from "react"
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.js'
import { api } from "../services/api.js"

import Pagination from "../components/Pagination.js"
/**
 * Albums - Global album catalog
 * 
 * FEATURES:
 * - Search by title, performer, or label
 * - Filter by format and genre
 * - Pagination
 * - Add to collection from the list view
 */

const Albums =()=> {

    const { user, isAuthenticated } = useAuth()

    // STATE
    const [albums, setAlbums] = useState([])
    const [formats, setFormats] = useState([])
    const [genres, setGenres] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const [search, setSearch] = useState('')
    const [searchInput, setSearchInput] = useState('')
    const [selectedFormat, setSelectedFormat] = useState('')
    const [selectedGenre, setSelectedGenre] = useState('')

    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [total, setTotal] = useState(0)
    const [sort, setSort] = useState('title_asc')

    const LIMIT = 20

    // Fetch formats and genres for filter dropdowns
    useEffect(()=> {
        const fetchFilters = async ()=> {
            try {
                const [formatData, genreData] = await Promise.all([
                    api.get('/formats'),
                    api.get('/genres')
                ])
                setFormats(formatData.formats || [])
                setGenres(genreData.genres || [])
            } catch (err) {
                console.error('Failed to load filters:', err)
            }
        }
        fetchFilters()
    }, [])

    // Fetch albums when search, filters, or page changes
    /**
     * useCallback
     * 
     * memorized a function - it returns the same function reference between 
     * renders unless one of its dependencies changes
     * 
     * "Only give me a new version of fetchAlbums if page, search, selectedFormat, or 
     * selectedGenre has changed. Otherwise use the same function reference from last time"
     */
    const fetchAlbums = useCallback(async ()=> {
        setLoading(true)
        setError(null)

        try {
            const params = new URLSearchParams({
                page, 
                limit: LIMIT,
                sort,
                ...(search && { search }),
                ...(selectedFormat && { format: selectedFormat }),
                ...(selectedGenre && { genre: selectedGenre })
            })

            const data = await api.get(`/albums?${params.toString()}`)
            setAlbums(data.albums || [])
            setTotal(data.total || 0)
            setTotalPages(data.totalPages || 1)
        } catch (err) {
            setError('Failed to load albums. Please try again.')
        } finally {
            setLoading(false)
        }
    }, [page, search, selectedFormat, selectedGenre, sort])

    useEffect(()=> {
        fetchAlbums()
    }, [fetchAlbums])

    // Scroll to top on page change
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth'})
    }, [page])

    const handleSearch = (e)=> {
        e.preventDefault()
        setSearch(searchInput)
        setPage(1)
    }

    const handleFormatChange = (e)=> {
        setSelectedFormat(e.target.value)
        setPage(1)
    }

    const handleGenreChange = (e)=> {
        setSelectedGenre(e.target.value)
        setPage(1)
    }

    const handleClearFilters = ()=> {
        setSearch('')
        setSearchInput('')
        setSelectedFormat('')
        setSelectedGenre('')
        setPage(1)
    }

    const handleAddToCollection = async (albumId)=> {

        if (!isAuthenticated) return 

        try {
            await api.post(`/users/${user.users_id}/albums`, {
                album_id: albumId
            })
        } catch (err) {
            console.error('Failed to add album:', err)
        }
    }

    const handleSortChange =(e)=> {
        setSort(e.target.value)
        setPage(1)
    }

    const hasActiveFilters = search || selectedFormat || selectedGenre

    return(
        <div className='container mt-4'>
            <h2 className='mb-4'>Albums</h2>

            <div className='card mb-4 p-3'>
                <form onSubmit={handleSearch}>
                    <div className='row g-3 align-items-end'>

                        {/* Search input */}
                        <div className='col-md-3'>
                            <label 
                                className='form-label'
                                htmlFor='search'
                            >
                                Search
                            </label>
                            <input  
                                type='text'
                                className='form-control'
                                id='search'
                                name='search'
                                placeholder='Title, performer, or label...'
                                value={searchInput}
                                onChange={e => setSearchInput(e.target.value)}
                                aria-label='Search albums by title, performer, or label'
                            />
                        </div>

                        {/* Format filter */}
                        <div className='col-md-2'>
                            <label 
                                className='form-label'
                                htmlFor='format'
                            >
                                Format
                            </label>
                            <select 
                                className='form-select'
                                id='format'
                                name='format'
                                value={selectedFormat}
                                onChange={handleFormatChange}
                                aria-label='Filter by format'
                            >
                                <option value=''>All Formats</option>
                                {formats.map(f => (
                                    <option key={f.format_id} value={f.format_name}>
                                        {f.format_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Genre filter */}
                        <div className='col-md-2'>
                            <label
                                className='form-label'
                                htmlFor='genre'
                            >
                                Genre
                            </label>
                            <select
                                className='form-select'
                                id='genre'
                                name='genre'
                                value={selectedGenre}
                                onChange={handleGenreChange}
                                aria-label='Filter by genre'
                            >
                                <option value=''>All Genres</option>
                                {genres.map(g => (
                                    <option key={g.genre_id} value={g.genre_name}>
                                        {g.genre_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* SORT */}
                        <div className='col-md-2'>
                            <label className='form-label' htmlFor="sort">Sort By</label>
                            <select 
                                className='form-select'
                                id='sort'
                                name='sort'
                                value={sort}
                                onChange={handleSortChange}
                                aria-label='Sort albums'
                            >
                                <option value='title_asc'>Title A-Z</option>
                                <option value='title_desc'>Title Z-A</option>
                                <option value='year_desc'>Year - Newest</option>
                                <option value='year_asc'>Year - Oldest</option>
                            </select>
                        </div>

                        {/* Buttons */}
                        <div className='col-md-3 d-flex gap-2'>
                            <button
                                type='submit'
                                className='btn btn-primary w-100'
                                aria-label='Search albums'
                            >
                                Search
                            </button>
                        </div>
                    </div>
                    {/* Clear filters */}
                    {hasActiveFilters && (
                        <div className='mt-2'>
                            <button
                                type='button'
                                className="btn btn-sm btn-outline-secondary"
                                onClick={handleClearFilters}
                                aria-label='Clear all filters'
                            >
                                Clear Filters
                            </button>
                            <span className='text-muted ms-2' aria-live='polite'>
                                <small>
                                    {total} result{total !== 1 ? 's' : ''} found
                                </small>
                            </span>
                        </div>
                    )}
                </form>
            </div>

            {error && (
                <div className='alert alert-danger' role='alert' aria-live='polite'>
                    {error}
                </div>
            )}

            {/* Results count */}

            {!loading && (
                <p className='text-muted mb-3'>
                    <small>
                        Showing {albums.length} of {total} albums - Page {page} of {totalPages}
                    </small>
                </p>
            )}
            {totalPages > 1 && (
                <Pagination 
                    page={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                    label='Album pagination'
                />
            )}
            {/* Album grid */}
            {loading ? (
                <div className="text-center mt-5">
                    <p>Loading albums...</p>
                </div>
            ) : albums.length === 0 ? (
                <div className='text-center mt-5'>
                    <p className="text-muted">No albums found.</p>
                    {hasActiveFilters && (
                        <button 
                            className="btn btn-outline-secondary btn-sm"
                            onClick={handleClearFilters}
                        >
                            Clear Filters
                        </button>
                    )}
                </div>
            ) : (
                <>
                    <div className='row'>
                        {albums.map(album => (
                            <div key={album.album_id} className='col-md-3 col-sm-6 mb-4'>
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
                                            <small>
                                                {album.release_year} | {album.format_name}
                                            </small>
                                        </p>
                                        {album.label_name && (
                                            <p className='card-text text-muted mb-0'>
                                                <small>{album.label_name}</small>
                                            </p>
                                        )}
                                    </div>
                                    <div className='card-footer d-flex gap-2'>
                                        <Link
                                            to={`/albums/${album.album_id}`}
                                            className='btn btn-outline-primary btn-sm flex-grow-1'
                                        >
                                            View
                                        </Link>
                                        {isAuthenticated && (
                                            <button
                                                className='btn btn-outline-success btn-sm'
                                                onClick={() => handleAddToCollection(album.album_id)}
                                                aria-label={`Add ${album.title} to collection`}
                                                title='Add to Collection'
                                            >
                                                +
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <Pagination 
                            page={page}
                            totalPages={totalPages}
                            onPageChange={setPage}
                            label='Album pagination'
                        />
                    )}
                </>
            )}
        </div>
    )
}

export default Albums