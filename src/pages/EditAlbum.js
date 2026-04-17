import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext.js"
import { api } from "../services/api.js"

/**
 * 
 * EditAlbum - Edit album page
 * 
 * Editable fields
 * - Title, serial number, release year, duration
 * - Label, format
 * - Album image URL
 * - Genres (tag style - click to add or remove)
 * 
 * Performer is fixed and not editable
 */

const EditAlbum =()=> {

    const { id } = useParams()
    const navigate = useNavigate()
    const { isAuthenticated } = useAuth()

    // STATE 
    const [album, setAlbum] = useState(null)
    const [formats, setFormats] = useState([])
    const [labels, setLabels] = useState([])
    const [allGenres, setAllGenres] = useState([])
    const [selectedGenreIds, setSelectedGenreIds] = useState([])

    const [formData, setFormData] = useState({
        title: '',
        serial_no: '',
        release_year: '',
        duration_seconds: '',
        label_id: '',
        format_id: '',
        album_image_url: ''
    })

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState(null)
    const [successMessage, setSuccessMessage] = useState(null)

    // Redirect if not authenticated
    useEffect(()=> {

        if(!isAuthenticated) {
            navigate('/login')
        }
    }, [isAuthenticated, navigate])

    // Fetch album, formats, labels and genres
    useEffect(()=> {
        const fetchData = async ()=> {
            setLoading(true)
            setError(null)

            try {
                const [albumData, formatData, genreData] = await Promise.all([
                    api.get(`/albums/${id}`),
                    api.get('/formats'),
                    api.get('/genres')
                ])

                if (albumData.message) {
                    setError(albumData.message)
                    return
                }

                setAlbum(albumData)
                setFormats(formatData.formats || [])
                setAllGenres(genreData.genres || [])

                // Pre-populate form with existing album data
                setFormData({
                    title: albumData.title || '',
                    serial_no: albumData.serial_no || '',
                    release_year: albumData.release_year || '',
                    duration_seconds: albumData.duration_seconds || '',
                    label_id: albumData.label_id || '',
                    format_id: albumData.format_id || '',
                    album_image_url: albumData.album_image_url || ''
                })

                // Pre-select existing genres 
                const existingGenreIds = albumData.genres?.map(g => g.genre_id) || []
                setSelectedGenreIds(existingGenreIds)

                // Fetch labels with higher limit for the dropdown
                const labelData = await api.get('/labels?limit=999')
                setLabels(labelData.labels || [])

            } catch (err) {
                console.error(err)
                setError('Failed to load album. Please try again.')
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [id])

    const handleChange =(e)=> {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleGenreToggle =(genreId)=> {
        setSelectedGenreIds(prev => prev.includes(genreId) ? prev.filter(id => id !== genreId) : [...prev, genreId])
    }

    const handleSubmit = async (e)=> {
        e.preventDefault()
        setSaving(true)
        setError(null)
        setSuccessMessage(null)

        try {

            const payload = {
                title: formData.title,
                serial_no: formData.serial_no || null,
                release_year: formData.release_year || null,
                duration_seconds: formData.duration_seconds ? parseInt(formData.duration_seconds) : null,
                label_id: formData.label_id || null,
                format_id: formData.format_id || null,
                album_image_url: formData.album_image_url || null,
                genre_ids: selectedGenreIds
            }

            const data = await api.put(`/albums/${id}`, payload)

            if (data.message === 'Album updated successfully') {
                setSuccessMessage('Album updated successfully!')
                // Navigate back to album detail after short delay
                setTimeout(()=> navigate(`/albums/${id}`), 1500)
            } else {
                setError(data.message)
            }
            
        } catch (err) {
            setError('Failed to update album. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    const genreTags = allGenres.map(g => {
        const isSelected = selectedGenreIds.includes(g.genre_id)

        return (
            <button 
                key={g.genre_id}
                type='button'
                className={`btn btn-sm ${
                    isSelected ? 'btn-primary' : 'btn-outline-secondary'
                }`}
                onClick={()=> handleGenreToggle(g.genre_id)}
                aria-pressed={isSelected}
                aria-label={`${isSelected ? 'Remove' : 'Add'} ${g.genre_name} genre`}
            >
                {g.genre_name}
            </button>
        )
    })

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
                <Link to='/albums' className='btn btn-outline-secondary'>Back to Albums</Link>
            </div>
        )
    }

    return (
        <main className='main'>
            <div className='container mt-4'>
            
                {/* Back button */}
                <Link 
                    to={`/albums/${id}`} 
                    className='btn btn-outline-secondary btn-sm mb-4' 
                    aria-label='Back to album'
                >
                    &larr; Back to Album
                </Link>

                <h2 className='mb-4'>Edit Album</h2>

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

                {/* Performer info - read only */}
                <div className='alert alert-info mb-4' role='note'>
                    <small>
                        <span className='fw-bold'>Performer:</span> {album.performer_name} - performer cannot be changed
                    </small>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                    <div className='row'>
                        {/* Left col */}
                        <div className='col-md-8'>
                            <section aria-label="Album details">

                                <div className='mb-3'>
                                    <label className='form-label' htmlFor='title'>Title</label>
                                    <input 
                                        type='text'
                                        className='form-control'
                                        id='title'
                                        name='title'
                                        value={formData.title}
                                        onChange={handleChange}
                                        required 
                                        aria-required='true'
                                    />
                                </div>

                                <div className='mb-3'>
                                    <label className='form-label' htmlFor="serial_no">
                                        Catalog #
                                    </label>
                                    <input 
                                        type='text'
                                        className='form-control'
                                        id='serial_no'
                                        name='serial_no'
                                        value={formData.serial_no}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className='row'>
                                    <div className='col-md-6 mb-3'>
                                        <label className='form-label' htmlFor="release_year">Release Year</label>
                                        <input 
                                            type='number'
                                            className='form-control'
                                            id='release_year'
                                            name='release_year'
                                            value={formData.release_year}
                                            onChange={handleChange}
                                            min='1900'
                                            max='2155'
                                        />
                                    </div>
                                    <div className='col-md-6 mb-3'>
                                        <label className='form-label' htmlFor="duration_seconds">Duration (seconds)</label>
                                        <input 
                                            type='number'
                                            className="form-control"
                                            id='duration_seconds'
                                            name='duration_seconds'
                                            value={formData.duration_seconds}
                                            onChange={handleChange}
                                            min='0'
                                        />
                                    </div>
                                </div>

                                <div className='mb-3'>
                                    <label className='form-label' htmlFor="format_id">
                                        Format
                                    </label>
                                    <select 
                                        className='form-select'
                                        id='format_id'
                                        name='format_id'
                                        value={formData.format_id}
                                        onChange={handleChange}
                                    >
                                        <option value=''>Select a format</option>
                                        {formats.map(f => (
                                            <option key={f.format_id} value={f.format_id}>
                                                {f.format_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className='mb-3'>
                                    <label className='form-label' htmlFor="label_id">Label</label>
                                    <select 
                                        className="form-select"
                                        id='label_id'
                                        name='label_id'
                                        value={formData.label_id}
                                        onChange={handleChange}
                                    >
                                        <option value=''>No label</option>
                                        {labels.map(l => (
                                            <option key={l.label_id} value={l.label_id}>
                                                {l.label_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className='mb-4'>
                                    <label className='form-label' htmlFor="album_image_url">Album Image URL</label>
                                    <input 
                                        type='url'
                                        className='form-control'
                                        id='album_image_url'
                                        name='album_image_url'
                                        value={formData.album_image_url}
                                        onChange={handleChange}
                                    />
                                    {formData.album_image_url && (
                                        <div className='mt-2'>
                                            <img 
                                                src={formData.album_image_url}
                                                alt='Album cover preview'
                                                style={{ height: '100px', objectFit: 'cover', borderRadius: '4px' }}
                                                onError={e => e.target.style.display = 'none'}
                                            />
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>

                        {/* Right col - genres */}
                        <div className='col-md-4'>
                            <section aria-label='Genre selection'>
                                <h3 className='h6 mb-3'>Genres</h3>
                                <p className='text-muted mb-3'>
                                    <small>Click a genre to add or remove it</small>
                                </p>
                                <div className='d-flex flex-wrap gap-2' role='group' aria-label='Genre tags'>
                                    { genreTags }
                                </div>

                                {selectedGenreIds.length > 0 && (
                                    <p className='text-muted mt-3 mb-0'>
                                        <small>
                                            {selectedGenreIds.length} genre{selectedGenreIds.length !== 1 ? 's' : ''} selected
                                        </small>
                                    </p>
                                )}
                            </section>
                        </div>
                    </div>

                    {/* Submit buttons */}
                    <div className='d-flex gap-2 mt-4 mb-5'>
                        <button 
                            type='submit'
                            className='btn btn-primary'
                            disabled={saving}
                            aria-busy={saving}
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <Link 
                            to={`/albums/${id}`}
                            className='btn btn-outline-secondary'
                        >
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </main>
    )
}

export default EditAlbum