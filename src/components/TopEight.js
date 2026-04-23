import { useState, useEffect } from "react"
import { Link } from 'react-router-dom'
import { api } from '../services/api.js'

/**
 * TopEight - Displays a user's Top Eight albums 
 * 
 * Props:
 * 
 * - userId: the user's id 
 * - isOwnProfile: boolean - shows edit controls if true 
 * - onAddToTopEight: callback to trigger album search from parent 
 */

const TopEight = ({ userId, isOwnProfile, pendingAlbum, onPendingHandled, onCountChange })=> {

    // STATE
    const [topEight, setTopEight] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [searchLoading, setSearchLoading] = useState(false)
    const [activeSlot, setActiveSlot] = useState(null)

    const SLOTS = [1, 2, 3, 4, 5, 6, 7, 8]

    // useEffects 
    useEffect(()=> {

        const fetchTopEight = async ()=> {
            setLoading(true)
            setError(null)

            try {
                const data = await api.get(`/users/${userId}/top-eight`)
                setTopEight(data.top_eight || [])
            } catch (err) {
                setError('Failed to load Top Eight.')
            } finally {
                setLoading(false)
            }
        }

        fetchTopEight()
    }, [userId])

    useEffect(()=> {
        if (!pendingAlbum) return 

        // Find first available slot 
        const takenPositions = topEight.map(t => t.position)
        let targetSlot = null 

        for (let i = 1; i <= 8; i++) {
            if (!takenPositions.includes(i)) {
                targetSlot = i
                break 
            }
        }

        if (targetSlot) {
            setActiveSlot(targetSlot)
            setSearchQuery(pendingAlbum.title)
        }
        onPendingHandled()
    }, [pendingAlbum])

    useEffect(()=> {
        if (onCountChange) {
            onCountChange(topEight.length)
        }
    }, [topEight.length, onCountChange])

    // HANDLERS 
    const handleSlotClick = (position)=> {
        if (!isOwnProfile) return 
        setActiveSlot(position)
        setSearchQuery('')
        setSearchResults([])
    }

    const handleSearch = async (e)=> {
        e.preventDefault()
        if (!searchQuery.trim()) return 

        setSearchLoading(true)

        try {
            const data = await api.get(`/albums?search=${encodeURIComponent(searchQuery)}&limit=100`)
            setSearchResults(data.albums || [])
        } catch (err) {
            console.error('Failed to search albums:', err)
        } finally {
            setSearchLoading(false)
        }
    }

    const handleAddAlbum = async (album)=> {

        try {
            await api.post(`/users/${userId}/top-eight`, {
                album_id: album.album_id,
                position: activeSlot
            })

            // Update local state 
            setTopEight(prev => {
                const updated = prev.filter(t => t.position !== activeSlot)
                return [...updated, {
                    position: activeSlot,
                    album_id: album.album_id,
                    title: album.title,
                    album_image_url: album.album_image_url,
                    performer_name: album.performer_name,
                    release_year: album.release_year,
                    format_name: album.format_name
                }].sort((a, b) => a.position - b.position)
            })

            setActiveSlot(null)
            setSearchQuery('')
            setSearchResults([])
        } catch (err) {
            console.error('Failed to add to Top Eight:', err)
        }
    }

    const handleRemove = async (position)=> {
        try {
            await api.delete(`/users/${userId}/top-eight/${position}`)
            setTopEight(prev => prev.filter(t => t.position !== position))
        } catch (err) {
            console.error('Failed to remove from Top Eight:', err)
        }
    }

    const handleCancelSearch =()=> {
        setActiveSlot(null)
        setSearchQuery('')
        setSearchResults([])
    }

    const isFull = topEight.length === 8 

    if (loading) {
        return (
            <div className='text-center py-3'>
                <p>Loading Top Eight...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="alert alert-danger" role='alert'>
                {error}
            </div>
        )
    }

    // slots 
    const slots = SLOTS.map(position => {
        const album = topEight.find(t => t.position === position)

        if (album) {
            return (
                <div key={position} className="col">
                    <div className="card h-100">
                        {album.album_image_url ? (
                            <img 
                                src={album.album_image_url}
                                alt={`${album.title} album cover`}
                                className="card-img-top"
                                style={{ objectFit: 'cover', height: '90px'}}
                            />
                        ) : (
                            <div 
                                className="bg-secondary d-flex align-items-center justify-content-center"
                                style={{ height: '120px'}}
                                aria-label='No album cover'
                            >
                                <span className="text-white">
                                    {position}
                                </span>
                            </div>
                        )}
                        <div className="card-body p-2">
                            <p className="card-title mb-0" style={{ fontSize: '0.75rem', fontWeight: 'bold'}}>
                                <Link to={`/albums/${album.album_id}`}>
                                    {album.title}
                                </Link>
                            </p>
                            <p className="text-muted mb-0" style={{ fontSize: '0.7rem'}}>
                                {album.performer_name}
                            </p>
                        </div>
                        {isOwnProfile && (
                            <footer className="card-footer p-1 text-center">
                                <button 
                                    className="btn btn-outline-danger btn-sm w-100"
                                    onClick={()=> handleRemove(position)}
                                    aria-label={`Remove ${album.title} from Top Eight`}
                                    style={{ fontSize: '0.75rem' }}
                                >
                                    Remove
                                </button>
                            </footer>
                        )}
                    </div>
                </div>
            )
        }

        // Empty slot 
        return (
            <div key={position} style={{minWidth: '110px', maxWidth: '110px'}}>
                <div 
                    className={`card h-100 d-flex align-items-center justify-content-center ${
                        isOwnProfile ? 'border-dashed' : ''
                    }`}
                    style={{ minHeight: '150px', cursor: isOwnProfile ? 'pointer' : 'default'}}
                    onClick={()=> isOwnProfile && handleSlotClick(position)}
                    role={isOwnProfile ? 'button' : undefined}
                    aria-label={isOwnProfile ? `Add album to slot ${position}` : `Empty slot ${position}`}
                    tabIndex={isOwnProfile ? 0 : undefined}
                    onKeyDown={isOwnProfile
                        ? e => e.key === 'Enter' && handleSlotClick(position)
                        : undefined
                    }
                >
                    <div className="text-center text-muted">
                        {isOwnProfile ? (
                            <>
                                <p className="mb-1" style={{ fontSize: '1.5rem'}}>+</p>
                                <p className="mb-0" style={{ fontSize: '0.75rem'}}>
                                    Add Album
                                </p>
                            </>
                        ) : (
                            <p className="mb-0" style={{ fontSize: '0.75rem'}}>
                                Empty
                            </p>
                        )}
                    </div>
                </div>
            </div>
        )
    })

    return (
        <section aria-label='Top Eight albums' className="mb-4">
            <h3 className="mb-3">
                Top Eight 
                <span className="text-muted fs-6 ms-2">
                    ({topEight.length}/8)
                </span>
            </h3>

            {/* Album search modal for empty slots */}
            {activeSlot && (
                <div className="card mb-3 p-3 border-primary">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <h4 className="h6 mb-0">
                            Adding to Slot {activeSlot}
                        </h4>
                        <button 
                            className="btn btn-sm btn-outline-secondary"
                            onClick={handleCancelSearch}
                            aria-label='Cancel search'
                        >
                            Cancel
                        </button>
                    </div>
                    <form onSubmit={handleSearch}>
                        <div className="row g-2 align-items-end">
                            <div className="col">
                                <input 
                                    type='text'
                                    className="form-control form-control-sm"
                                    placeholder="Search by title, performer, or label..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    aria-label='Search albums for Top Eight'
                                    autoFocus
                                />
                            </div>
                            <div className="col-auto">
                                <button 
                                    type='submit'
                                    className="btn btn-primary btn-sm"
                                    disabled={searchLoading}
                                    aria-busy={searchLoading}
                                >
                                    {searchLoading ? 'Searching...' : 'Search'}
                                </button>
                            </div>
                        </div>
                    </form>

                    {/* Search results */}
                    {searchResults.length > 0 && (
                        <div className="mt-2" style={{ maxHeight: '300px', overflowY: 'auto', borderRadius: '4px'}}>
                            {searchResults.map(album => (
                                <div 
                                    key={album.album_id}
                                    className="d-flex align-items-center justify-content-between py-2 border-bottom"
                                >
                                    <div className="d-flex align-items-center gap-2">
                                        {album.album_image_url ? (
                                            <img 
                                                src={album.album_image_url}
                                                alt={album.title}
                                                style={{ width: '36px', height: '26px', objectFit: 'cover'}}
                                            />
                                        ) : (
                                            <div className="bg-secondary" style={{ width: '36px', height: '36px'}} />
                                        )}
                                        <div>
                                            <p className="mb-0" style={{ fontSize: '0.85rem'}}>
                                                {album.title}
                                            </p>
                                            <p className="text-muted mb-0" style={{ fontSize: '0.75rem'}}>
                                                {album.performer_name}
                                            </p>
                                        </div>
                                    </div>
                                    <button 
                                        className="btn btn-primary btn-sm"
                                        onClick={()=> handleAddAlbum(album)}
                                        aria-label={`Add ${album.title} to slot ${activeSlot}`}
                                    >
                                        Add
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {searchQuery && searchResults.length === 0 && !searchLoading && (
                        <p className="text-muted mt-2 mb-0">
                            <small>No albums found for "{searchQuery}"</small>
                        </p>
                    )}
                </div>
            )}

            {/* Eight slots */}
            <div className="row row-cols-8 row-cols-md-8 g-2">
                {slots}
            </div>

            {/* Add to Top Eight button in AlbumGrid */}
            {isOwnProfile && !isFull && (
                <p className="text-muted mt-2 mb-0">
                    <small>
                        Click an empty slot or use the <strong>Add to Top Eight</strong> button on any album card.
                    </small>
                </p>
            )}
        </section>
    )
}

export default TopEight