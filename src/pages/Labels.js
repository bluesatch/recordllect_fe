import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api.js'

/**
 * Labels - Global labels catalog
 *
 * Features:
 * - Search by name
 * - Pagination
 * - Shows label details including country, founded year, status
 */

const Labels = () => {

    const [labels, setLabels] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const [search, setSearch] = useState('')
    const [searchInput, setSearchInput] = useState('')

    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [total, setTotal] = useState(0)
    const [sort, setSort] = useState('name_asc')

    const LIMIT = 20

    const fetchLabels = useCallback(async () => {
        setLoading(true)
        setError(null)

        try {
            const params = new URLSearchParams({
                page,
                limit: LIMIT,
                sort,
                ...(search && { search })
            })

            const data = await api.get(`/labels?${params.toString()}`)
            setLabels(data.labels || [])
            setTotal(data.total || 0)
            setTotalPages(data.totalPages || 1)
        } catch (err) {
            setError('Failed to load labels. Please try again.')
        } finally {
            setLoading(false)
        }
    }, [page, search, sort])

    useEffect(() => {
        fetchLabels()
    }, [fetchLabels])

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }, [page])

    const handleSearch = (e) => {
        e.preventDefault()
        setSearch(searchInput)
        setPage(1)
    }

    const handleClearSearch = () => {
        setSearch('')
        setSearchInput('')
        setPage(1)
    }

    // handle sort 
    const handleSortChange =(e)=> {
        setSort(e.target.value)
        setPage(1)
    }

    return (
        <main>
            <div className='container mt-4'>

                <h2 className='mb-4'>Labels</h2>

                {/* Search bar */}
                <div className='card mb-4 p-3'>
                    <form onSubmit={handleSearch}>
                        <div className='row g-3 align-items-end'>

                            <div className='col-md-6'>
                                <label className='form-label' htmlFor='search'>
                                    Search
                                </label>
                                <input
                                    type='text'
                                    className='form-control'
                                    id='search'
                                    name='search'
                                    placeholder='Search by label name...'
                                    value={searchInput}
                                    onChange={e => setSearchInput(e.target.value)}
                                    aria-label='Search labels by name'
                                />
                            </div>

                            {/* Sort */}
                            <div className='col-md-3'>
                                <label className='form-label' htmlFor='sort'>
                                    Sort By
                                </label>
                                <select
                                    className='form-select'
                                    id='sort'
                                    name='sort'
                                    value={sort}
                                    onChange={handleSortChange}
                                    aria-label='Sort labels'
                                >
                                    <option value='name_asc'>Name A-Z</option>
                                    <option value='name_desc'>Name Z-A</option>
                                    <option value='year_desc'>Founded — Newest</option>
                                    <option value='year_asc'>Founded — Oldest</option>
                                </select>
                            </div>

                            <div className='col-md-3'>
                                <button
                                    type='submit'
                                    className='btn btn-primary w-100'
                                    aria-label='Search labels'
                                >
                                    Search
                                </button>
                            </div>

                        </div>

                        {search && (
                            <div className='mt-2'>
                                <button
                                    type='button'
                                    className='btn btn-sm btn-outline-secondary'
                                    onClick={handleClearSearch}
                                    aria-label='Clear search'
                                >
                                    Clear Search
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
                            Showing {labels.length} of {total} labels
                            — Page {page} of {totalPages}
                        </small>
                    </p>
                )}

                {/* Labels list */}
                {loading ? (
                    <div className='text-center mt-5'>
                        <p>Loading labels...</p>
                    </div>
                ) : labels.length === 0 ? (
                    <div className='text-center mt-5'>
                        <p className='text-muted'>No labels found.</p>
                        {search && (
                            <button
                                className='btn btn-outline-secondary btn-sm'
                                onClick={handleClearSearch}
                            >
                                Clear Search
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className='row'>
                            {labels.map(label => (
                                <div key={label.label_id} className='col-md-4 col-sm-6 mb-4'>
                                    <div className='card h-100'>
                                        <div className='card-body'>

                                            <div className='d-flex justify-content-between align-items-start mb-2'>
                                                <h3 className='card-title h6 mb-0'>
                                                    {label.label_name}
                                                </h3>
                                                <span className={`badge ms-2 ${
                                                    label.status === 'active'
                                                        ? 'bg-success'
                                                        : 'bg-secondary'
                                                }`}>
                                                    {label.status}
                                                </span>
                                            </div>

                                            {label.country && (
                                                <p className='text-muted mb-1'>
                                                    <small>Country: {label.country}</small>
                                                </p>
                                            )}

                                            {label.founded_year && (
                                                <p className='text-muted mb-1'>
                                                    <small>Founded: {label.founded_year}</small>
                                                </p>
                                            )}

                                            {label.website_url && (
                                                <p className='text-muted mb-0'>
                                                    <small>
                                                        <a
                                                            href={label.website_url}
                                                            target='_blank'
                                                            rel='noreferrer'
                                                            aria-label={`Visit ${label.label_name} website`}
                                                        >
                                                            Website
                                                        </a>
                                                    </small>
                                                </p>
                                            )}

                                        </div>
                                        <footer className='card-footer'>
                                            <Link
                                                to={`/labels/${label.label_id}`}
                                                className='btn btn-outline-primary btn-sm w-100'
                                            >
                                                View Label
                                            </Link>
                                        </footer>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <nav aria-label='Labels pagination' className='mt-4 mb-5'>
                                <ul className='pagination justify-content-center'>
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
                                    <li className='page-item disabled'>
                                        <span className='page-link'>
                                            Page {page} of {totalPages}
                                        </span>
                                    </li>
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
        </main>
    )
}

export default Labels