import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext.js"
import { api } from "../services/api.js"

/**
 * 
 * EditProfile - User edit profile page
 * 
 * Editable fields:
 * - First name, last name
 * - Address, city, state, postal code, country
 * - Profile image URL
 * 
 * Email and password are not editable here
 * Redirects to login if not authenticated
 * Redirects to profile is user tries to edit another user's profile
 */

const EditProfile =()=> {

    const { id } = useParams()
    const navigate = useNavigate()
    const { user: currentUser, isAuthenticated} = useAuth()

    // STATE
    const [formData, setFormData] = useState({
        username: '',
        first_name: '',
        last_name: '',
        address_line_1: '',
        address_line_2: '',
        city: '',
        state: '',
        postal_code: '',
        country: '',
        profile_image_url: ''
    })

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState(null)
    const [successMessage, setSuccessMessage] = useState(null)

    // Redirect if not authenticated or trying to edit another user's profile
    useEffect(()=> {

        if (!isAuthenticated) {
            navigate('/login')
            return
        }

        if (currentUser && currentUser.users_id !== parseInt(id)) {
            navigate(`/users/${id}`)
        }
    }, [isAuthenticated, currentUser, id, navigate, loading])

    // Fetch current user data and pre-populate form
    useEffect(()=> {
        const fetchProfile = async ()=> {
            setLoading(true)
            setError(null)

            try {
                const data = await api.get(`/users/${id}`)

                if (data.message) {
                    setError(data.message)
                    return
                }

                setFormData({
                    username: data.username || '',
                    first_name: data.first_name || '',
                    last_name: data.last_name || '',
                    address_line_1: data.address_line_1 || '',
                    address_line_2: data.address_line_2 || '',
                    city: data.city || '',
                    state: data.state || '',
                    postal_code: data.postal_code || '',
                    country: data.country || '',
                    profile_image_url: data.profile_image_url || ''
                })

            } catch (err) {
                setError('Failed to load profile. Please try again.')
            } finally {
                setLoading(false)
            }
        }

        if (isAuthenticated) {
            fetchProfile()
        }
    }, [id, isAuthenticated])

    const handleChange =(e)=> {
        setFormData({ ...formData, [e.target.name]: e.target.value})
    }

    const handleSubmit = async (e)=> {
        e.preventDefault()
        setSaving(true)
        setError(null)
        setSuccessMessage(null)

        try {
            const data = await api.put(`/users/${id}`, formData)

            if (data.message === 'User updated successfully') {
                setSuccessMessage('Profile updated successfully!')
                setTimeout(()=> navigate(`/users/${id}`), 1500)
            } else {
                setError(data.message)
            }
        } catch (err) {
            setError('Failed to update profile. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="container mt-5 text-center">
                <p>Loading profile...</p>
            </div>
        )
    }

    return (
        <main className='main'>
            <div className='container mt-4'>
                {/* Back button */}
                <Link 
                    to={`/users/${id}`}
                    className='btn btn-outline-secondary btn-sm mb-4'
                    aria-label='Back to profile'
                >
                    &larr; Back to Profile
                </Link>
                <h2 className='mb-4'>Edit Profile</h2>

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

                <form onSubmit={handleSubmit} noValidate>
                    <div className='row'>
                        {/* Left col */}
                        <div className='col-md-8'>
                            <section aria-label="Personal information">
                                <h3 className='h6 text-muted mb-3'>Personal Info</h3>

                                <div className='row'>

                                    <div className='mb-3'>
                                        <label className="form-label" htmlFor="username">Username</label>
                                        <input 
                                            type='text'
                                            className="form-control"
                                            id='username'
                                            name='username'
                                            value={formData.username}
                                            onChange={handleChange}
                                            autoComplete="username"
                                        />
                                        <div className='form-text'>
                                            Letters, numbers, and underscores only. 3-50 characters.
                                        </div>
                                    </div>
                                    <div className='col-md-6 mb-3'>
                                        <label className='form-label' htmlFor="first_name">First Name</label>
                                        <input 
                                            type='text'
                                            className="form-control"
                                            id='first_name'
                                            name='first_name'
                                            value={formData.first_name}
                                            onChange={handleChange}
                                            autoComplete='given-name'
                                            required
                                            aria-required='true'
                                        />
                                    </div>
                                    <div className='col-md-6 mb-3'>
                                        <label className='form-label' htmlFor="last_name">Last Name</label>
                                        <input 
                                            type='text'
                                            className="form-control"
                                            id='last_name'
                                            name='last_name'
                                            value={formData.last_name}
                                            onChange={handleChange}
                                            autoComplete="family-name"
                                            required
                                            aria-required='true'
                                        />
                                    </div>
                                </div>
                            </section>

                            <section aria-label='Address information' className='mt-3'>
                                <h3 className="h6 text-muted mb-3">Address</h3>

                                <div className='mb-3'>
                                    <label className='form-label' htmlFor="address_line_1">Address Line 1</label>
                                    <input 
                                        type='text'
                                        className="form-control"
                                        id='address_line_1'
                                        name='address_line_1'
                                        value={formData.address_line_1}
                                        onChange={handleChange}
                                        autoComplete="address-line1"
                                    />
                                </div>
                                <div className='mb-3'>
                                    <label className='form-label' htmlFor="address_line_2">Address Line 2</label>
                                    <input 
                                        type='text'
                                        className="form-control"
                                        id='address_line_2'
                                        name='address_line_2'
                                        value={formData.address_line_2}
                                        onChange={handleChange}
                                        autoComplete="address-line2"
                                    />
                                </div>

                                <div className='row'>
                                    <div className='col-md-5 mb-3'>
                                        <label className='form-label' htmlFor="city">City</label>
                                        <input 
                                            type='text'
                                            className='form-control'
                                            id='city'
                                            name='city'
                                            value={formData.city}
                                            onChange={handleChange}
                                            autoComplete="address-level2"
                                        />
                                    </div>

                                    <div className='col-md-3 mb-3'>
                                        <label className="form-label" htmlFor="state">State</label>
                                        <input 
                                            type='text'
                                            className="form-control"
                                            id='state'
                                            name='state'
                                            value={formData.state}
                                            onChange={handleChange}
                                            autoComplete="address-level1"
                                        />
                                    </div>
                                    <div className="col-md-4 mb-3">
                                        <label className="form-label" htmlFor="postal_code">
                                            Postal Code
                                        </label>
                                        <input 
                                            type='text'
                                            className="form-control"
                                            id='postal_code'
                                            name='postal_code'
                                            value={formData.postal_code}
                                            onChange={handleChange}
                                            autoComplete="postal-code"
                                        />
                                    </div>
                                </div>

                                <div className='mb-3'>
                                    <label className="form-label" htmlFor="country">Country</label>
                                    <input 
                                        type='text'
                                        className="form-control"
                                        id='country'
                                        name='country'
                                        value={formData.country}
                                        onChange={handleChange}
                                        autoComplete="country-name"
                                    />
                                </div>
                            </section>
                        </div>

                        {/* Right col */}
                        <div className='col-md-4'>
                            <section aria-label='Profile image'>
                                <h3 className="h6 text-muted mb-3">Profile Image</h3>

                                <div className='mb-3'>
                                    <label className="form-label" htmlFor="profile_image_url">Image URL</label>
                                    <input 
                                        type='url'
                                        className="form-control"
                                        id='profile_image_url'
                                        name='profile_image_url'
                                        value={formData.profile_image_url}
                                        onChange={handleChange}
                                    />
                                </div>

                                {/* Image preview */}
                                {formData.profile_image_url ? (
                                    <img
                                        src={formData.profile_image_url}
                                        alt='Profile image preview'
                                        className='rounded-circle'
                                        style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                        onError={e => e.target.style.display = 'none'}
                                    />
                                ) : (
                                    <div
                                        className='rounded-circle bg-secondary d-flex align-items-center justify-content-center'
                                        style={{ width: '100px', height: '100px' }}
                                        aria-label='No profile image'
                                    >
                                        <span className='text-white fs-3'>
                                            {formData.first_name?.charAt(0)}{formData.last_name?.charAt(0)}
                                        </span>
                                    </div>
                                )}
                            </section>

                            {/* Note about email and password */}
                            <section aria-label='Account settings note' className="mt-4">
                                <div className='alert alert-info'>
                                    <small>
                                        Email and password cannot be changed here. Contact support to update these.
                                    </small>
                                </div>
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
                            to={`/users/${id}`}
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

export default EditProfile