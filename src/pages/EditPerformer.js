import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.js'
import { api } from '../services/api.js'

/**
 * EditPerformer - Admin only performer edit page
 *
 * Handles both artist and band fields conditionally
 * based on performer_type
 *
 * Artist fields: alias, first name, last name, date of birth, date of death
 * Band fields: band name, formed year, disbanded year, country
 *
 * Redirects non-admin users back to performer profile
 */

const EditPerformer = () => {

    const { id } = useParams()
    const navigate = useNavigate()
    const { user, isAuthenticated, loading: authLoading } = useAuth()

    const [performer, setPerformer] = useState(null)
    const [formData, setFormData] = useState({
        performer_type: '',
        first_name: '',
        last_name: '',
        alias: '',
        date_of_birth: '',
        date_of_death: '',
        band_name: '',
        formed_year: '',
        disbanded_year: '',
        country: ''
    })

    const [formLoading, setFormLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState(null)
    const [successMessage, setSuccessMessage] = useState(null)

    // Redirect if not authenticated or not admin
    useEffect(() => {
        if (authLoading) return

        if (!isAuthenticated) {
            navigate('/login')
            return
        }

        if (user && user.is_admin !== 1) {
            navigate(`/performers/${id}`)
        }
    }, [isAuthenticated, user, authLoading, id, navigate])

    // Fetch performer data and pre-populate form
    useEffect(() => {
        const fetchPerformer = async () => {
            setFormLoading(true)
            setError(null)

            try {
                const data = await api.get(`/performers/${id}`)

                if (data.message) {
                    setError(data.message)
                    return
                }

                setPerformer(data)

                // Pre-populate based on performer type
                if (data.performer_type === 'artist') {
                    setFormData({
                        performer_type: data.performer_type,
                        first_name: data.first_name || '',
                        last_name: data.last_name || '',
                        alias: data.alias || '',
                        date_of_birth: data.date_of_birth
                            ? new Date(data.date_of_birth).toISOString().split('T')[0]
                            : '',
                        date_of_death: data.date_of_death
                            ? new Date(data.date_of_death).toISOString().split('T')[0]
                            : '',
                        band_name: '',
                        formed_year: '',
                        disbanded_year: '',
                        country: ''
                    })
                } else {
                    setFormData({
                        performer_type: data.performer_type,
                        first_name: '',
                        last_name: '',
                        alias: '',
                        date_of_birth: '',
                        date_of_death: '',
                        band_name: data.band_name || '',
                        formed_year: data.formed_year || '',
                        disbanded_year: data.disbanded_year || '',
                        country: data.country || ''
                    })
                }
            } catch (err) {
                setError('Failed to load performer. Please try again.')
            } finally {
                setFormLoading(false)
            }
        }

        if (isAuthenticated) {
            fetchPerformer()
        }
    }, [id, isAuthenticated])

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)
        setError(null)
        setSuccessMessage(null)

        try {
            const data = await api.put(`/performers/${id}`, formData)

            if (data.message === 'Performer updated successfully') {
                setSuccessMessage('Performer updated successfully!')
                setTimeout(() => navigate(`/performers/${id}`), 1500)
            } else {
                setError(data.message)
            }
        } catch (err) {
            setError('Failed to update performer. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    if (authLoading || formLoading) {
        return (
            <div className='container mt-5 text-center'>
                <p>Loading...</p>
            </div>
        )
    }

    if (error && !performer) {
        return (
            <div className='container mt-5'>
                <div className='alert alert-danger' role='alert'>
                    {error}
                </div>
                <button
                    className='btn btn-outline-secondary'
                    onClick={() => navigate(-1)}
                >
                    Go Back
                </button>
            </div>
        )
    }

    return (
        <main>
            <div className='container mt-4'>

                {/* Back button */}
                <Link
                    to={`/performers/${id}`}
                    className='btn btn-outline-secondary btn-sm mb-4'
                    aria-label='Back to performer'
                >
                    &larr; Back to Performer
                </Link>

                <div className='d-flex align-items-center gap-3 mb-4'>
                    <h2 className='mb-0'>Edit Performer</h2>
                    <span className='badge bg-warning text-dark'>Admin</span>
                </div>

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

                {/* Performer type — read only */}
                <div className='alert alert-info mb-4' role='note'>
                    <small>
                        <strong>Type:</strong> {formData.performer_type} — performer type cannot be changed
                    </small>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                    <div className='row'>
                        <div className='col-md-8'>
                        {/* Performer type selector - admin only */}
                            <section aria-label='Performer type' className='mb-4'>
                                <h3 className='h6 text-muted mb-3'>Performer Type</h3>
                                <div className='alert alert-warning mb-3'>
                                    <small>
                                        <strong>Warning:</strong> Changing the performer type will
                                        migrate their data between the artists and bands tables.
                                        Make sure the other fields are filled in correctly before saving.
                                    </small>
                                </div>
                                <div className='d-flex gap-3'>
                                    <div className='form-check'>
                                        <input
                                            type='radio'
                                            className='form-check-input'
                                            id='type_artist'
                                            name='performer_type'
                                            value='artist'
                                            checked={formData.performer_type === 'artist'}
                                            onChange={handleChange}
                                        />
                                        <label className='form-check-label' htmlFor='type_artist'>
                                            Artist
                                        </label>
                                    </div>
                                    <div className='form-check'>
                                        <input
                                            type='radio'
                                            className='form-check-input'
                                            id='type_band'
                                            name='performer_type'
                                            value='band'
                                            checked={formData.performer_type === 'band'}
                                            onChange={handleChange}
                                        />
                                        <label className='form-check-label' htmlFor='type_band'>
                                            Band
                                        </label>
                                    </div>
                                </div>
                            </section>

                            {/* Artist fields */}
                            {formData.performer_type === 'artist' && (
                                <section aria-label='Artist information'>
                                    <h3 className='h6 text-muted mb-3'>Artist Information</h3>

                                    <div className='mb-3'>
                                        <label className='form-label' htmlFor='alias'>
                                            Alias / Stage Name
                                        </label>
                                        <input
                                            type='text'
                                            className='form-control'
                                            id='alias'
                                            name='alias'
                                            value={formData.alias}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className='row'>
                                        <div className='col-md-6 mb-3'>
                                            <label className='form-label' htmlFor='first_name'>
                                                First Name
                                            </label>
                                            <input
                                                type='text'
                                                className='form-control'
                                                id='first_name'
                                                name='first_name'
                                                value={formData.first_name}
                                                onChange={handleChange}
                                                autoComplete='given-name'
                                            />
                                        </div>
                                        <div className='col-md-6 mb-3'>
                                            <label className='form-label' htmlFor='last_name'>
                                                Last Name
                                            </label>
                                            <input
                                                type='text'
                                                className='form-control'
                                                id='last_name'
                                                name='last_name'
                                                value={formData.last_name}
                                                onChange={handleChange}
                                                autoComplete='family-name'
                                            />
                                        </div>
                                    </div>

                                    <div className='row'>
                                        <div className='col-md-6 mb-3'>
                                            <label className='form-label' htmlFor='date_of_birth'>
                                                Date of Birth
                                            </label>
                                            <input
                                                type='date'
                                                className='form-control'
                                                id='date_of_birth'
                                                name='date_of_birth'
                                                value={formData.date_of_birth}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className='col-md-6 mb-3'>
                                            <label className='form-label' htmlFor='date_of_death'>
                                                Date of Death
                                            </label>
                                            <input
                                                type='date'
                                                className='form-control'
                                                id='date_of_death'
                                                name='date_of_death'
                                                value={formData.date_of_death}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                </section>
                            )}

                            {/* Band fields */}
                            {formData.performer_type === 'band' && (
                                <section aria-label='Band information'>
                                    <h3 className='h6 text-muted mb-3'>Band Information</h3>

                                    <div className='mb-3'>
                                        <label className='form-label' htmlFor='band_name'>
                                            Band Name
                                        </label>
                                        <input
                                            type='text'
                                            className='form-control'
                                            id='band_name'
                                            name='band_name'
                                            value={formData.band_name}
                                            onChange={handleChange}
                                            required
                                            aria-required='true'
                                        />
                                    </div>

                                    <div className='row'>
                                        <div className='col-md-4 mb-3'>
                                            <label className='form-label' htmlFor='formed_year'>
                                                Formed Year
                                            </label>
                                            <input
                                                type='number'
                                                className='form-control'
                                                id='formed_year'
                                                name='formed_year'
                                                value={formData.formed_year}
                                                onChange={handleChange}
                                                min='1900'
                                                max='2155'
                                            />
                                        </div>
                                        <div className='col-md-4 mb-3'>
                                            <label className='form-label' htmlFor='disbanded_year'>
                                                Disbanded Year
                                            </label>
                                            <input
                                                type='number'
                                                className='form-control'
                                                id='disbanded_year'
                                                name='disbanded_year'
                                                value={formData.disbanded_year}
                                                onChange={handleChange}
                                                min='1900'
                                                max='2155'
                                            />
                                        </div>
                                        <div className='col-md-4 mb-3'>
                                            <label className='form-label' htmlFor='country'>
                                                Country
                                            </label>
                                            <input
                                                type='text'
                                                className='form-control'
                                                id='country'
                                                name='country'
                                                value={formData.country}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                </section>
                            )}

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
                            to={`/performers/${id}`}
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

export default EditPerformer