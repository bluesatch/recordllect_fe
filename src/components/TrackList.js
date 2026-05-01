import { useState, useEffect } from 'react'
import { api } from '../services/api.js'
import { useAuth } from '../context/AuthContext.js'

/**
 * TrackList - Displays album tracklist
 * 
 * Props: 
 * - albumId: the album's ID
 * - discogsId: the album's Discogs ID 
 * -isAdmin: boolean shows import/delete controls
 */

const TrackList = ({ albumId, discogsId, isAdmin })=> {

    // STATE 
    const [tracks, setTracks] = useState([])
    const [loading, setLoading] = useState(true)
    const [importing, setImporting] = useState(false)
    const [error, setError] = useState(null)
    const [successMessage, setSuccessMessage] = useState(null)

    // UseEffect 
    useEffect(()=> {
        const fetchTracks = async ()=> {
            setLoading(true)
            setError(null)

            try {
                const data = await api.get(`/albums/${albumId}/tracks`)
                setTracks(data.tracks || [])
            } catch (err) {
                setError('Failed to load tracks')
            } finally {
                setLoading(false)
            }
        }

        fetchTracks()
    }, [albumId])

    // Handlers 
    const handleImportTracks = async ()=> {
        setImporting(true)
        setError(null)
        setSuccessMessage(null)

        try {
            const data = await api.post(`/albums/${albumId}/import-tracks`)
            setSuccessMessage(data.message)

            // Refresh tracks 
            const tracksData = await api.get(`/albums/${albumId}/tracks`)
            setTracks(tracksData.tracks || [])
        } catch (err) {
            setError('Failed to import tracks from Discogs.')
        } finally {
            setImporting(false)
        }
    }

    const handleDeleteTrack = async (trackId)=> {
        try {
            await api.delete(`/admin/tracks/${trackId}`)
            setTracks(prev => prev.filter(t => t.track_id !== trackId))
        } catch (err) {
            console.error('Failed to delete track:', err)
        }
    }

    // Group tracks by side (A, B, C, D, etc)
    const groupedTracks = tracks.reduce((groups, track) => {
        const side = track.position
            ? track.position.replace(/[0-9]/g, '').toUpperCase() || 'Tracks'
            : 'Tracks'
        if (!groups[side]) groups[side] = []
        groups[side].push(track)
        return groups
    }, {})

    const formatDuration = (duration) => {
        if (!duration) return null 
        return duration
    }

    const totalDuration = ()=> {
        const durations = tracks.filter(t => t.duration).map(t => {
            const parts = t.duration.split(':')
            return parseInt(parts[0]) * 60 + parseInt(parts[1] || 0)
        })

        if (durations.length === 0) return null 

        const total = durations.reduce((sum, d) => sum + d, 0)
        const mins = Math.floor(total / 60)
        const secs = total % 60 
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    if (loading) {
        return (
            <div className='text-center py-3'>
                <p className='text-muted'>Loading tracks...</p>
            </div>
        )
    }

    return (
        <section aria-label='Tracklist' className='mt-4'>
            <div className='d-flex justify-content-between align-items-center mb-3'>

                <h3 className='mb-0'>
                    Tracklist 
                    {tracks.length > 0 && (
                        <span className='text-muted fs-6 ms-2'>
                            ({tracks.length} tracks {totalDuration() && `- ${totalDuration()}`})
                        </span>
                    )}
                </h3>
                {/* Admin import button */}
                {isAdmin && discogsId && tracks.length === 0 && (
                    <button 
                        className='btn btn-outline-primary btn-sm'
                        onClick={handleImportTracks}
                        disabled={importing}
                        aria-busy={importing}
                    >
                        {importing ? 'Importing...' : '↓ Import from Discogs'}
                    </button>
                )}
                {/* End Admin impor button */}
            </div>

            {successMessage && (
                <div className='alert alert-success' role='status' aria-live='polite'>
                    {successMessage}
                </div>
            )}

            {error && (
                <div className='alert alert-danger' role='alert' aria-live='polite'>
                    {error}
                </div>
            )}

            {tracks.length === 0 ? (
                <div className='text-center py-3'>
                    <p className='text-muted mb-0'>
                        No tracks available. 
                        {!discogsId && (
                            <span className='ms-1'>
                                This album has no Discogs ID.
                            </span>
                        )}
                    </p>
                </div>
            ) : (
                <div className='card'>
                    <div className='card-body p-0'>
                        {Object.entries(groupedTracks).map(([side, sideTracks]) => (
                            <div key={side}>
                                {Object.keys(groupedTracks).length > 1 && (
                                    <div className='px-3 py-2 bg-light border-bottom'>
                                        <small className='text-muted fw-semibold'>
                                            Side {side}
                                        </small>
                                    </div>
                                )}

                                {/* Tracks */}
                                <table className='table table-hover mb-0'>
                                    <tbody>
                                        {sideTracks.map((track, index) => (
                                            <tr key={track.track_id}>
                                                <td 
                                                    className='text-muted'
                                                    style={{
                                                        width: '40px',
                                                        fontSize: '0.85rem'
                                                    }}
                                                >
                                                    {track.position || index + 1}
                                                </td>
                                                <td style={{ fontSize: '0.9rem'}}>
                                                    {track.title}
                                                </td>
                                                <td 
                                                    className='text-muted text-end'
                                                    style={{
                                                        width: '60px',
                                                        fontSize: '0.85rem'
                                                    }}
                                                >
                                                    {formatDuration(track.duration)}
                                                </td>
                                                {isAdmin && (
                                                    <td style={{ width: '40px'}}>
                                                        <button 
                                                            className='btn btn-link btn-sm p-0 text-danger'
                                                            onClick={()=> handleDeleteTrack(track.track_id)}
                                                            aria-label={`Delete track ${track.title}`}
                                                        >
                                                            x
                                                        </button>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ))}
                    </div>

                    {/* End Card */}
                </div>
            )}
        </section>
    )
}

export default TrackList