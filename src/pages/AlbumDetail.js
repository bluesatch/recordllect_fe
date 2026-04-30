import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.js'
import { api } from '../services/api.js'

import ReviewSection from '../components/ReviewSection.js'

/**
 * 
 * AlbumDetail - Single album view
 * 
 * Displays full album info including: 
 * - Album image, title, performer, label, format, release year, genres
 * - Full performer details inline
 * - Add to Collection / Remove from Collection buttons
 * - Edit album button (authenticated users only)
 */

const AlbumDetail =()=> {

    const { id } = useParams()
    const navigate = useNavigate()
    const { user, isAuthenticated } = useAuth()

    // STATE
    const [ album, setAlbum ] = useState(null)
    const [ performer, setPerformer ] = useState(null)
    const [ inCollection, setInCollection ] = useState(false)
    const [ loading, setLoading ] = useState(true)
    const [ actionLoading, setActionLoading ] = useState(false)
    const [ error, setError ] = useState(null)
    const [ successMessage, setSuccessMessage ] = useState(null)

    const [onWantlist, setOnWantlist] = useState(false)
    const [wantlistId, setWantlistId] = useState(null)
    const [wantlistNotes, setWantlistNotes] = useState('')
    const [wantlistPriority, setWantlistPriority] = useState('medium')
    const [showWantlistForm, setShowWantlistForm] = useState(false)

    const [showReportForm, setShowReportForm] = useState(false)
    const [reportReason, setReportReason] = useState('')
    const [reportSubmitting, setReportSubmitting] = useState(false)
    const [reportSubmitted, setReportSubmitted] = useState(false)

    // GET DATA
    // USE EFFECTS
    useEffect(()=> {

        const fetchAlbum = async ()=> {
            setLoading(true)
            setError(null)

            try {
                // Fetch album deets
                const albumData = await api.get(`/albums/${id}`)

                if (albumData.message) {
                    setError(albumData.message)
                    return 
                }

                setAlbum(albumData)

                // Fetch performer deets
                const performerData = await api.get(`/performers/${albumData.performer_id}`)
                setPerformer(performerData)

                // Check if album is in user's collection
                if (isAuthenticated && user) {

                    const collectionCheck = await api.get(`/users/${user.users_id}/albums/${albumData.album_id}`)
                    setInCollection(collectionCheck.inCollection || false)

                    const wantlistCheck = await api.get(`/users/${user.users_id}/wantlist/check/${id}`)
                    setOnWantlist(wantlistCheck.onWantlist)
                    setWantlistId(wantlistCheck.wantlist_id)
                    setWantlistNotes(wantlistCheck.notes || '')
                    setWantlistPriority(wantlistCheck.priority || 'medium')
                }

            } catch (err) {
                setError('Failed to load album. Please try again')
            } finally {
                setLoading(false)
            }
        }

        fetchAlbum()

    }, [id, isAuthenticated, user])


    // HANDLERS 
    const handleAddToCollection = async ()=> {
        if (!isAuthenticated) {
            navigate('/login')
            return 
        }

        setActionLoading(true)
        setError(null)
        setSuccessMessage(null)

        try {
            const data = await api.post(`/users/${user.users_id}/albums`, {
                album_id: album.album_id
            })

            if (data.message === 'Album added to collection') {
                setInCollection(true)
                setSuccessMessage('Album added to your collection!')
            } else {
                setError(data.message)
            }
        } catch (err) {
            setError('Failed to add album. Please try again.')
        } finally {
            setActionLoading(false)
        }
    }

    const handleRemoveFromCollection = async ()=> {
        setActionLoading(true)
        setError(null)
        setSuccessMessage(null)

        try {
            const data = await api.delete(`/users/${user.users_id}/albums/${album.album_id}`)

            if (data.message === 'Album removed from collection') {
                setInCollection(false)
                setSuccessMessage('Album removed from your collection.')
            } else {
                setError(data.message)
            }
        } catch (err) {
            setError('Failed to remove album. Please try again.')
        } finally {
            setActionLoading(false)
        }
    }

    const handleAddToWantlist = async () => {
        try {
            const data = await api.post(`/users/${user.users_id}/wantlist`, {
                album_id: album.album_id,
                notes: wantlistNotes || null,
                priority: wantlistPriority
            })
            setOnWantlist(true)
            setWantlistId(data.wantlist_id)
            setShowWantlistForm(false)
        } catch (err) {
            console.error('Failed to add to wantlist:', err)
        }
    }

    const handleRemoveFromWantlist = async () => {
        try {
            await api.delete(`/users/${user.users_id}/wantlist/${wantlistId}`)
            setOnWantlist(false)
            setWantlistId(null)
            setWantlistNotes('')
            setWantlistPriority('medium')
        } catch (err) {
            console.error('Failed to remove from wantlist:', err)
        }
    }

    const handleReport = async (e) => {
    e.preventDefault()
    if (!reportReason.trim()) return

    setReportSubmitting(true)

    try {
        await api.post(`/albums/${id}/report`, { reason: reportReason })
        setReportSubmitted(true)
        setShowReportForm(false)
        setReportReason('')
    } catch (err) {
        console.error('Failed to submit report:', err)
    } finally {
        setReportSubmitting(false)
    }
}

    if (loading) {
        return (
            <div className='container mt-5 text-center'>
                <p>Loading album...</p>
            </div>
        )
    }

    if (error && !album) {
        return (
            <div className='container mt-5'>
                <div className='alert alert-danger' role='alert'>
                    {error}
                </div>
                <Link to='/albums' className='btn btn-outline-secondary'>
                    Back to Albums
                </Link>
            </div>
        )
    }

    return(
        <div className='container mt-4'>

            <Link   
                to='/albums'
                className='btn btn-outline-secondary btn-sm mb-4'
                aria-label='Back to albums'
            >
                &larr; Back to albums
            </Link>

            {successMessage && (
                <div 
                    className='alert alert-success'
                    role='status'
                    aria-live='polite'
                >
                    {successMessage}
                </div>
            )}

            {error && (
                <div 
                    className='alert alert-danger'
                    role='alert'
                    aria-live='polite'
                >
                    {error}
                </div>
            )}

            <div className='row'>
                <div className='col-md-4 mb-4'>
                    {album.album_image_url ? (
                        <img 
                            src={album.album_image_url}
                            alt={`${album.title} album cover`}
                            className='img-fluid rounded'
                            style={{ width: '100%', objectFit: 'cover'}}
                        />
                    ) : (
                        <div
                            className='bg-secondary d-flex align-items-center justify-content-center rounded'
                            style={{ height: '300px' }}
                            aria-label='No album cover available'
                        >
                            <span className='text-white'>No Image</span>
                        </div>
                    )}

                    { isAuthenticated && (
                        <div className='d-grid gap-2 mt-3'>
                            {inCollection ? (
                                <button 
                                    className='btn btn-danger'
                                    onClick={handleRemoveFromCollection}
                                    disabled={actionLoading}
                                    aria-busy={actionLoading}
                                >
                                    {actionLoading ? 'Removing...' : 'Remove from Collection'}
                                </button>
                            ) : (
                                <button 
                                    className='btn btn-primary'
                                    onClick={handleAddToCollection}
                                    disabled={actionLoading}
                                    aria-busy={actionLoading}
                                >
                                    {actionLoading ? 'Adding...' : 'Add to Collection'}
                                </button>
                            )}
                            <Link
                                to={`/albums/${id}/edit`}
                                className='btn btn-outline-secondary'
                                aria-label={`Edit ${album.title}`}
                            >
                                Edit Album
                            </Link>
                        </div>
                    )}

                    {isAuthenticated && (
                        <div className='mt-3'>
                            {onWantlist ? (
                                <button
                                    className='btn btn-warning btn-sm'
                                    onClick={handleRemoveFromWantlist}
                                    aria-label='Remove from wantlist'
                                >
                                    ★ On Wantlist — Remove
                                </button>
                            ) : (
                                <>
                                    <button
                                        className='btn btn-outline-warning btn-sm'
                                        onClick={() => setShowWantlistForm(!showWantlistForm)}
                                        aria-label='Add to wantlist'
                                    >
                                        ☆ Add to Wantlist
                                    </button>

                                    {showWantlistForm && (
                                        <div className='card mt-2 p-3'>
                                            <div className='mb-2'>
                                                <label className='form-label' htmlFor='wantlist-priority'>
                                                    Priority
                                                </label>
                                                <select
                                                    className='form-select form-select-sm'
                                                    id='wantlist-priority'
                                                    value={wantlistPriority}
                                                    onChange={e => setWantlistPriority(e.target.value)}
                                                >
                                                    <option value='high'>High</option>
                                                    <option value='medium'>Medium</option>
                                                    <option value='low'>Low</option>
                                                </select>
                                            </div>
                                            <div className='mb-2'>
                                                <label className='form-label' htmlFor='wantlist-notes'>
                                                    Notes
                                                </label>
                                                <textarea
                                                    className='form-control form-control-sm'
                                                    id='wantlist-notes'
                                                    rows={2}
                                                    value={wantlistNotes}
                                                    onChange={e => setWantlistNotes(e.target.value)}
                                                    placeholder='e.g. Looking for original pressing only...'
                                                    maxLength={500}
                                                />
                                            </div>
                                            <div className='d-flex gap-2'>
                                                <button
                                                    className='btn btn-warning btn-sm'
                                                    onClick={handleAddToWantlist}
                                                >
                                                    Add to Wantlist
                                                </button>
                                                <button
                                                    className='btn btn-outline-secondary btn-sm'
                                                    onClick={() => setShowWantlistForm(false)}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Album Info */}
                <div className='col-md-8'>
                    <h2>{album.title}</h2>

                    <table className='table table-borderless mt-3'>
                        <tbody>
                            <tr>
                                <th scope='row' className='text-muted' style={{ width: '140px' }}>
                                    Format
                                </th>
                                <td>{album.format_name || '-'}</td>
                            </tr>
                            <tr>
                                <th scope='row' className='text-muted'>Release Year</th>
                                <td>{album.release_year || '-'}</td>
                            </tr>
                            <tr>
                                <th scope='row' className='text-muted'>Label</th>
                                <td>{album.label_name || '-'}</td>
                            </tr>
                            <tr>
                                <th scope='row' className='text-muted'>Catalog #</th>
                                <td>{album.serial_no || '-'}</td>
                            </tr>
                            {album.duration_seconds && (
                                <tr>
                                <th scope='row' className='text-muted'>Duration</th>
                                <td>
                                    {Math.floor(album.duration_seconds / 60)}m {album.duration_seconds % 60}s
                                </td>
                            </tr>
                            )}
                            {album.genres && album.genres.length > 0 && (
                                <tr>
                                    <th scope='row' className='text-muted'>Genres</th>
                                <td>
                                    {album.genres.map(g => (
                                        <span
                                            key={g.genre_id}
                                            className='badge bg-secondary me-1'
                                        >
                                            {g.genre_name}
                                        </span>
                                    ))}
                                </td>
                            </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Performer deets */}
                    {performer && (
                        <div className='card mt-3'>
                            <div className='card-header'>
                                <h3 className='h6 mb-0'>
                                    {performer.performer_type === 'band' ? 'Band' : 'Artist'}
                                </h3>
                            </div>
                            <div className='card-body'>
                                {performer.performer_type === 'artist' ? (
                                    <>
                                        <h4 className='h5'>
                                            {performer.alias || 
                                                `${performer.first_name} ${performer.last_name}`}
                                        </h4>
                                        {performer.date_of_birth && (
                                            <p className='text-muted mb-1'>
                                                <small>
                                                    Born: {new Date(performer.date_of_birth).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        timeZone: 'UTC'
                                                    })}
                                                </small>
                                            </p>
                                        )}
                                        {performer.date_of_death && (
                                            <p className='text-muted mb-1'>
                                                <small>
                                                    Died: {new Date(performer.date_of_death).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        timeZone: 'UTC'
                                                    })}
                                                </small>
                                            </p>
                                        )}
                                        {performer.instruments && performer.instruments.length > 0 && (
                                            <p className='text-muted mb-0'>
                                                <small>
                                                    Instruments: {performer.instruments.map(i => i.instrument_name).join(', ')}
                                                </small>
                                            </p>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <h4 className='h5'>{performer.band_name}</h4>
                                        {performer.formed_year && (
                                            <p className='text-muted mb-1'>
                                                <small>Formed: {performer.formed_year}</small>
                                            </p>
                                        )}
                                        {performer.disbanded_year && (
                                            <p className='text-muted mb-1'>
                                                <small>Disbanded: {performer.disbanded_year}</small>
                                            </p>
                                        )}
                                        {performer.country && (
                                            <p className='text-muted mb-1'>
                                                <small>Country: {performer.country}</small>
                                            </p>
                                        )}
                                        {performer.members && performer.members.length > 0 && (
                                            <>
                                                <p className='text-muted mb-1'>
                                                    <small>Members:</small>
                                                </p>
                                                <ul className='list-unstyled ms-2'>
                                                    {performer.members.map(m => (
                                                        <li 
                                                            key={m.artist_id}
                                                            className='text-muted'
                                                        >
                                                            <small>
                                                                {m.member_name}
                                                                {m.joined_year && `(${m.joined_year})`}
                                                                {m.joined_year && m.left_year && ` - ${m.left_year}`}
                                                                {m.joined_year && m.left_year === null && ' - present'}
                                                                {m.joined_year && ')'}
                                                            </small>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </>
                                        )}
                                    </>
                                )} 
                                <Link
                                    to={`/performers/${album.performer_id}`}
                                    className='btn btn-outline-primary btn-sm mt-2'
                                >
                                    View Full Profile
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {/* Report album */}
            {isAuthenticated && (
                <div className='mt-3 mb-4'>
                    {reportSubmitted ? (
                        <p className='text-muted' style={{ fontSize: '0.85rem' }}>
                            ✓ Report submitted. Thank you for helping keep the catalog clean.
                        </p>
                    ) : (
                        <>
                            <button
                                className='btn btn-link btn-sm p-0 text-muted text-decoration-none'
                                onClick={() => setShowReportForm(prev => !prev)}
                                style={{ fontSize: '0.85rem' }}
                            >
                                🚩 Report this album
                            </button>

                            {showReportForm && (
                                <div className='card mt-2 p-3'>
                                    <form onSubmit={handleReport}>
                                        <div className='mb-2'>
                                            <label className='form-label' htmlFor='report-reason'>
                                                Reason for reporting
                                            </label>
                                            <textarea
                                                className='form-control form-control-sm'
                                                id='report-reason'
                                                rows={3}
                                                value={reportReason}
                                                onChange={e => setReportReason(e.target.value)}
                                                placeholder='Describe the issue with this album...'
                                                maxLength={500}
                                                aria-label='Report reason'
                                            />
                                            <div className='form-text'>
                                                {reportReason.length}/500
                                            </div>
                                        </div>
                                        <div className='d-flex gap-2'>
                                            <button
                                                type='submit'
                                                className='btn btn-danger btn-sm'
                                                disabled={reportSubmitting || !reportReason.trim()}
                                                aria-busy={reportSubmitting}
                                            >
                                                {reportSubmitting ? 'Submitting...' : 'Submit Report'}
                                            </button>
                                            <button
                                                type='button'
                                                className='btn btn-outline-secondary btn-sm'
                                                onClick={() => {
                                                    setShowReportForm(false)
                                                    setReportReason('')
                                                }}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
            <ReviewSection albumId={id} />
        </div>
    )
}

export default AlbumDetail