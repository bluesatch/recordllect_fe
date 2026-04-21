import { useState, useEffect, useCallback } from "react"
import { Link } from 'react-router-dom'
import { api } from '../services/api.js'

/**
 * Performers - Global performers catalog
 * 
 * Features: 
 * - Search by name
 * - Filter by type (artist/band)
 * - Pagination 
 * - Full details including formed year, members, instruments
 */

const Performers =()=> {

    // STATE
    const [performers, setPerformers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const [search, setSearch] = useState('')
    const [searchInput, setSearchInput] = useState('')
    const [selectedType, setSelectedType] = useState('')

    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [total, setTotal] = useState(0)
    const [sort, setSort] = useState('name_asc')

    const LIMIT = 20

    const fetchPerformers = useCallback(async ()=> {
        setLoading(true)
        setError(null)

        try {

            const params = new URLSearchParams({
                page,
                limit: LIMIT,
                sort, 
                ...(search && { search}),
                ...(selectedType && { type: selectedType})
            })

            const data = await api.get(`/performers?${params.toString()}`)
            setPerformers(data.performers || [])
            setTotal(data.total || 0)
            setTotalPages(data.totalPages || 1)

        } catch (err) { 
            setError('Failed to load performers. Please try again.')
        } finally {
            setLoading(false)
        }
    }, [page, search, selectedType, sort])

    useEffect(()=> {
        fetchPerformers()
    }, [fetchPerformers])

    useEffect(()=> {
        window.scrollTo({ top: 0, behavior: 'smooth'})
    }, [page])

    const handleSearch =(e)=> {
        e.preventDefault()
        setSearch(searchInput)
        setPage(1)
    }

    const handleTypeChange =(e)=> {
        setSelectedType(e.target.value)
        setPage(1)
    }

    const handleClearFilters =()=> {
        setSearch('')
        setSearchInput('')
        setSelectedType('')
        setPage(1)
    }

    // sort handler
    const handleSortChange =(e)=> {
        setSort(e.target.value)
        setPage(1)
    }

    const hasActiveFilters = search || selectedType

    /**
     * 
     * formatYears helper function => keeps the card body clean by hanlding all 
     * the different yeaer display scenarios in one place
     */
    const formatYears =(performer)=> {
        if (performer.performer_type === 'band') {
            if (performer.formed_year && performer.disbanded_year) {
                return `${performer.formed_year} - ${performer.disbanded_year}`
            }

            if (performer.formed_year) {
                return `Est. ${performer.formed_year}`
            }
        }

        if (performer.performer_type === 'artist') {
            if (performer.date_of_birth && performer.date_of_death) {
                return `${new Date(performer.date_of_birth).getUTCFullYear()} - ${new Date(performer.date_of_death).getUTCFullYear()}`
            }

            if (performer.date_of_birth) {
                return `b. ${new Date(performer.date_of_birth).getUTCFullYear()}`
            }
        }
        return null
    }

    return (
        <main className='main'>
            <div className='container mt-4'>
                <h2 className='mb-4'>Performers</h2>

                {/* Search and filter bar */}
                <div className='card mb-4 p-3'>
                    <form onSubmit={handleSearch}>
                        <div className='row g-3 align-items-end'>

                            {/* Search input */}
                            <div className='col-md-5'>
                                <label className='form-label' htmlFor='search'>
                                    Search
                                </label>
                                <input
                                    type='text'
                                    className='form-control'
                                    id='search'
                                    name='search'
                                    placeholder='Search by name...'
                                    value={searchInput}
                                    onChange={e => setSearchInput(e.target.value)}
                                    aria-label='Search performers by name'
                                />
                            </div>

                            {/* Type filter */}
                            <div className='col-md-2'>
                                <label className='form-label' htmlFor='type'>
                                    Type
                                </label>
                                <select
                                    className='form-select'
                                    id='type'
                                    name='type'
                                    value={selectedType}
                                    onChange={handleTypeChange}
                                    aria-label='Filter by performer type'
                                >
                                    <option value=''>All Types</option>
                                    <option value='artist'>Artist</option>
                                    <option value='band'>Band</option>
                                </select>
                            </div>

                            {/* Sort */}
                            <div className='col-md-2'>
                                <label className='form-label' htmlFor='sort'>
                                    Sort By
                                </label>
                                <select
                                    className='form-select'
                                    id='sort'
                                    name='sort'
                                    value={sort}
                                    onChange={handleSortChange}
                                    aria-label='Sort performers'
                                >
                                    <option value='name_asc'>Name A-Z</option>
                                    <option value='name_desc'>Name Z-A</option>
                                </select>
                            </div>

                            {/* Search button */}
                            <div className='col-md-3'>
                                <button
                                    type='submit'
                                    className='btn btn-primary w-100'
                                    aria-label='Search performers'
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
                                    className='btn btn-sm btn-outline-secondary'
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
                            Showing {performers.length} of {total} performers - Page {page} of {totalPages}
                        </small>
                    </p>
                )}

                 {/* Pagination  */}
                        {totalPages > 1 && (
                            <nav aria-label='Performers pagination top' className='mt-4 mb-5'>
                                <ul className='pagination justify-content-center'>
                                    <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                                        <button
                                            className='page-link'
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
                                            aria-label='Next page'
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

                {/* Performers list */}
                {loading ? (
                    <div className='text-center mt-5'>
                        <p>Loading performers...</p>
                    </div>
                ) : performers.length === 0 ? (
                    <div className='text-center mt-5'>
                        <p className='text-muted'>No performers found.</p>
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
                            {performers.map(performer => (
                                <div key={performer.performer_id} className='col-md-4 col-sm-6 mb-4'>
                                    <div className="card h-100">
                                        <div className='card-body'>
                                            <div className='d-flex justify-content-between align-items-start mb-2'>
                                                <h3 className='card-title h6 mb-0'>
                                                    {performer.performer_name}
                                                </h3>
                                                <span className={`badge ms-2 ${
                                                    performer.performer_type === 'band'
                                                    ? 'bg-primary'
                                                    : 'bg-secondary'
                                                }`}>
                                                    {performer.performer_type}
                                                </span>
                                            </div>

                                            {/* Years */}
                                            {formatYears(performer) && (
                                                <p className='text-muted mb-1'>
                                                    <small>{formatYears(performer)}</small>
                                                </p>
                                            )}

                                            {/* Country (bands only) */}
                                            {performer.performer_type === 'band' && performer.country && (
                                                <p className='text-muted mb-1'>
                                                    <small>Country: {performer.country}</small>
                                                </p>
                                            )}
                                        </div>
                                        <footer className='card-footer'>
                                            <Link
                                                to={`/performers/${performer.performer_id}`}
                                                className='btn btn-outline-primary btn-sm w-100'
                                            >
                                                View Profile
                                            </Link>
                                        </footer>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* Pagination  */}
                        {totalPages > 1 && (
                            <nav aria-label='Performers pagination bottom' className='mt-4 mb-5'>
                                <ul className='pagination justify-content-center'>
                                    <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                                        <button
                                            className='page-link'
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
                                            aria-label='Next page'
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
            </div>
        </main>
    )
}

export default Performers