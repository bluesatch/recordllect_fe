import { useState } from 'react'
import { api } from '../services/api.js'

/**
 * DiscogsSearch - Search and import albums from Discogs
 *
 * Props:
 * - onImportSuccess: callback after successful import
 */

const DiscogsSearch = ({ onImportSuccess }) => {

    const [query, setQuery] = useState('')
    const [results, setResults] = useState([])
    const [searching, setSearching] = useState(false)
    const [importing, setImporting] = useState(null)
    const [error, setError] = useState(null)
    const [successMessage, setSuccessMessage] = useState(null)
    const [hasSearched, setHasSearched] = useState(false)

    const handleSearch = async (e) => {
        e.preventDefault()
        if (!query.trim()) return

        setSearching(true)
        setError(null)
        setResults([])
        setHasSearched(true)
        setSuccessMessage(null)

        try {
            const data = await api.get(
                `/discogs/search?q=${encodeURIComponent(query)}`
            )
            setResults(data.results || [])
        } catch (err) {
            setError('Failed to search Discogs. Please try again.')
        } finally {
            setSearching(false)
        }
    }

    const handleImport = async (result) => {
        setImporting(result.discogs_id)
        setError(null)
        setSuccessMessage(null)

        try {
            const data = await api.post('/discogs/import', {
                discogs_id: result.discogs_id
            })

            setSuccessMessage(
                data.imported
                    ? `✓ "${data.title}" by ${data.performer_name} imported and added to your collection!`
                    : `✓ "${data.title}" already exists — added to your collection!`
            )

            onImportSuccess?.()
        } catch (err) {
            if (err.message?.includes('409')) {
                setError('This album is already in your collection.')
            } else {
                setError('Failed to import album. Please try again.')
            }
        } finally {
            setImporting(null)
        }
    }

    const resultCards = results.map(result => (
        <div key={result.discogs_id} className='card mb-2'>
            <div className='card-body'>
                <div className='row align-items-center'>

                    {/* Cover image */}
                    <div className='col-auto'>
                        {result.cover_image &&
                            !result.cover_image.includes('spacer') ? (
                            <img
                                src={result.cover_image}
                                alt={result.title}
                                style={{
                                    width: '60px',
                                    height: '60px',
                                    objectFit: 'cover',
                                    borderRadius: '4px'
                                }}
                            />
                        ) : (
                            <div
                                className='bg-secondary rounded d-flex align-items-center justify-content-center'
                                style={{ width: '60px', height: '60px' }}
                                aria-hidden='true'
                            >
                                <span className='text-white' style={{ fontSize: '0.7rem' }}>
                                    No Image
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Release info */}
                    <div className='col'>
                        <p className='mb-0 fw-semibold' style={{ fontSize: '0.9rem' }}>
                            {result.title}
                        </p>
                        <p className='text-muted mb-0' style={{ fontSize: '0.8rem' }}>
                            {[result.year, result.label, result.format]
                                .filter(Boolean)
                                .join(' · ')}
                        </p>
                    </div>

                    {/* Import button */}
                    <div className='col-auto'>
                        <button
                            className='btn btn-primary btn-sm'
                            onClick={() => handleImport(result)}
                            disabled={importing === result.discogs_id}
                            aria-busy={importing === result.discogs_id}
                            aria-label={`Import ${result.title}`}
                        >
                            {importing === result.discogs_id
                                ? 'Importing...'
                                : '+ Import'
                            }
                        </button>
                    </div>

                </div>
            </div>
        </div>
    ))

    return (
        <div className='card mb-4'>
            <div className='card-body'>
                <h3 className='h6 mb-3'>
                    🔍 Search Discogs
                </h3>

                {successMessage && (
                    <div
                        className='alert alert-success alert-dismissible'
                        role='status'
                        aria-live='polite'
                    >
                        {successMessage}
                        <button
                            type='button'
                            className='btn-close'
                            onClick={() => setSuccessMessage(null)}
                            aria-label='Close'
                        />
                    </div>
                )}

                {error && (
                    <div
                        className='alert alert-danger alert-dismissible'
                        role='alert'
                        aria-live='polite'
                    >
                        {error}
                        <button
                            type='button'
                            className='btn-close'
                            onClick={() => setError(null)}
                            aria-label='Close'
                        />
                    </div>
                )}

                {/* Search form */}
                <form onSubmit={handleSearch} className='mb-3'>
                    <div className='d-flex gap-2'>
                        <input
                            type='text'
                            className='form-control'
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder='Search by album title, artist, or label...'
                            aria-label='Search Discogs'
                        />
                        <button
                            type='submit'
                            className='btn btn-primary text-nowrap'
                            disabled={searching || !query.trim()}
                            aria-busy={searching}
                        >
                            {searching ? 'Searching...' : 'Search'}
                        </button>
                    </div>
                </form>

                {/* Results */}
                {searching ? (
                    <div className='text-center py-3'>
                        <p className='text-muted mb-0'>
                            Searching Discogs...
                        </p>
                    </div>
                ) : hasSearched && results.length === 0 ? (
                    <div className='text-center py-3'>
                        <p className='text-muted mb-0'>
                            No results found for "{query}"
                        </p>
                    </div>
                ) : (
                    <div>
                        {resultCards}
                    </div>
                )}

                {results.length > 0 && (
                    <p className='text-muted mt-2 mb-0' style={{ fontSize: '0.8rem' }}>
                        Showing {results.length} results from Discogs.
                        Can't find what you're looking for?{' '}
                        <a
                            href={`https://www.discogs.com/search/?q=${encodeURIComponent(query)}`}
                            target='_blank'
                            rel='noreferrer'
                        >
                            Search on Discogs directly
                        </a>
                    </p>
                )}
            </div>
        </div>
    )
}

export default DiscogsSearch