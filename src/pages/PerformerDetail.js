import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { api } from "../services/api.js"
import { useAuth } from "../context/AuthContext.js"

import AlbumGrid from "../components/AlbumGrid.js"


/**
 * 
 * PerformerDetail - Full performer profile page
 * 
 * Displays:
 * - Performer info (name, type, dates, country)
 * - Instruments (artists only)
 * - Band members (bands only)
 * - All albums by the performer with pagination
 */

const PerformerDetail =()=> {

    const { user } = useAuth()
    const { id } = useParams()
    const navigate = useNavigate()

    // STATE
    const [performer, setPerformer] = useState(null)
    const [albums, setAlbums] = useState([])
    const [loading, setLoading] = useState(true)
    const [albumsLoading, setAlbumsLoading] = useState(true)
    const [error, setError] = useState(null)

    
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [total, setTotal] = useState(0)
    const [sort, setSort] = useState('year_asc')

    const LIMIT = 20

    // Fetch performer details
    useEffect(()=> {
        const fetchPerformer = async ()=> {
            setLoading(true)
            setError(null)

            try {
                const data = await api.get(`/performers/${id}`)

                if (data.message) {
                    setError(data.message)
                    return 
                }

                setPerformer(data)
            } catch (err) {
                setError('Failed to load performer. Please try again.')
            } finally {
                setLoading(false)
            }
        }

        fetchPerformer()
    }, [id])


    // Fetch performer's albums
    useEffect(()=> {
        const fetchAlbums = async ()=> {
            setAlbumsLoading(true)

            try {
                const data = await api.get(`/performers/${id}/albums?page=${page}&limit=${LIMIT}&sort=${sort}`)

                setAlbums(data.albums || [])
                setTotal(data.total || 0)
                setTotalPages(data.totalPages || 1)
            } catch (err) {
                console.error('Failed to load albums:', err)
            } finally {
                setAlbumsLoading(false)
            }
        }

        fetchAlbums()
    }, [id, page, sort])

    useEffect(()=> {
        window.scrollTo({ top: 0, behavior: 'smooth'})
    }, [page])

    const formatYears =()=> {
        if (!performer) return null 

        if (performer.performer_type === 'band') {
            if (performer.formed_year && performer.disbanded_year) {
                return `${performer.formed_year} - ${performer.disbanded_year}`
            }

            if (performer.formed_year) return `Est. ${performer.formed_year}`
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

    const albumGrid = albums.map(album => (
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
                        className="bg-secondary d-flex align-items-center justify-content-center"
                        style={{ height: '180px'}}
                        aria-label='No album cover available'
                    >
                        <span className='text-white'>No Image</span>
                    </div>
                )}
                <div className="card-body">
                    <h3 className='card-title h6'>{album.title}</h3>
                    <p className='card-text text-muted mb-1'>
                        <small>{album.release_year || '-'} | {album.format_name}</small>
                    </p>
                    {album.label_name && (
                        <p className='card-text text-muted mb-0'>
                            <small>{album.label_name}</small>
                        </p>
                    )}
                </div>
                <footer className='card-footer'>
                    <Link 
                        to={`/albums/${album.album_id}`}
                        className='btn btn-outline-primary btn-sm w-100'
                    >
                        View Album
                    </Link>
                </footer>
            </div>
        </div>
    ))

    const performerName = () => {
        if (performer.alias) return performer.alias
        if (performer.band_name) return performer.band_name
        if (performer.first_name || performer.last_name) {
            return `${performer.first_name || ''} ${performer.last_name || ''}`.trim()
        }
        return 'Unknown Performer'
    }

    const handleSortChange =(e)=> {
        setSort(e.target.value)
        setPage(1)
    }

    if (loading) {
        return (
            <div className='container mt-5 text-center'>
                <p>Loading performer...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="container mt-5">
                <div className='alert alert-danger' role='alert'>
                    {error}
                </div>
                <button 
                    className='btn btn-outline-secondary'
                    onClick={()=> navigate(-1)}
                >
                    Go Back
                </button>
            </div>
        )
    }

    return (
        <main className="main">
            <div className='container mt-4'>

                {/* Back button */}
                <Link 
                    to='/performers'
                    className='btn btn-outline-secondary btn-sm mb-4'
                    aria-label='Back to performers'
                >
                    &larr; Back to Performers
                </Link>

                {/* Performer header */}
                <section aria-label='Performer information'>
                    <div className='card mb-4'>
                        <div className="card-body">
                            {/* Avatar and name row */}
                            <div className='d-flex align-items-center gap-3 mb-3'>
                                {/* Avatar */}
                                {performer.profile_image_url ? (
                                    <img 
                                        src={performer.profile_image_url}
                                        alt={`${performerName()} profile`}
                                        className="rounded-circle flex-shrink-0"
                                        style={{ width: '80px', height: '80px', objectFit: 'cover'}}
                                    />
                                ) : (
                                    <div 
                                        className="rounded-circle bg-secondary d-flex align-items-center justify-content-center flex-shrink-0"
                                        style={{ width: '80px', height: '80px'}}
                                        aria-hidden='true'
                                    >
                                        <span className="text-white fs-4">
                                            {performerName()?.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                )}
                                <div className='d-flex flex-column justify-content-between align-items-start w-100'>
                                    <h2 className='mb-0'>
                                        {performerName()}
                                    </h2>
                                    <div className="d-flex align-items-center gap-2">
                                        <span className={`badge ms-2 ${ 
                                            performer.performer_type === 'band'
                                            ? 'bg-primary'
                                            : 'bg-secondary'
                                        }`}>
                                            {performer.performer_type}
                                        </span>
                                        {user?.is_admin && (
                                            <Link 
                                                to={`/performers/${id}/edit`}
                                                className='btn btn-outline-danger btn-sm'
                                            >
                                                Edit Performer
                                            </Link>
                                        )} 
                                    </div>
                                </div>
                            </div>
                            {/* Bio */}
                            {performer.bio && (
                                <p className="text-muted mb-3 w-75">{performer.bio}</p>
                            )}
                            <table className='table table-borderless mb-0'>
                                <tbody>
                                    {formatYears() && (
                                        <tr>
                                            <th scope='row' className="text-muted" style={{ width: '140px'}}>
                                                {performer.performer_type === 'band' ? 'Years Active' : 'Born'}
                                            </th>
                                            <td>{formatYears()}</td>
                                        </tr>
                                    )}
                                    {performer.performer_type === 'band' && performer.country && (
                                        <tr>
                                            <th scope='row' className='text-muted'>Country</th>
                                            <td>{performer.country}</td>
                                        </tr>
                                    )}
                                    <tr>
                                        <th scope='row' className='text-muted'>Albums</th>
                                        <td>{total}</td>
                                    </tr>
                                </tbody>
                            </table>
                            
                            {/* Instruments - artist only */}
                            {performer.performer_type === 'artist' && performer.instruments && performer.instruments.length > 0 && (
                                <div className='mt-3'>
                                    <h3 className="h6 text-muted">Instruments</h3>
                                    <div className="d-flex flex-wrap gap-2">
                                        {performer.instruments.map(i => (
                                            <span key={i.instrument_id} className="badge bg-secondary">
                                                {i.instrument_name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Members - bands only */}
                            {performer.performer_type === 'band' &&
                                performer.members &&
                                performer.members.length > 0 && (
                                    <div className="mt-3">
                                        <h3 className="h6 text-muted">Members</h3>
                                        <ul className='list-unstyled mb-0'>
                                            {performer.members.map(m => (
                                                <li key={m.artist_id} className='text-muted'>
                                                    <small>
                                                        {m.member_name}
                                                        {m.joined_year && m.left_year && ` - ${m.left_year}`}
                                                        {m.joined_year && !m.left_year && ' - present'}
                                                        {m.joined_year && ')'}
                                                    </small>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                        </div>
                    </div>
                </section>

                {/* Albums section */}
                <AlbumGrid
                    endpoint={`/performers/${id}/albums`}
                    defaultSort='year_asc'
                    sortOptions={[
                        { value: 'year_asc', label: 'Year — Oldest' },
                        { value: 'year_desc', label: 'Year — Newest' },
                        { value: 'title_asc', label: 'Title A-Z' },
                        { value: 'title_desc', label: 'Title Z-A' }
                    ]}
                    limit={20}
                    paginated={true}
                    title='Discography'
                    emptyMessage='No albums found for this performer.'
                />
            </div>
        </main>
    )
}

export default PerformerDetail