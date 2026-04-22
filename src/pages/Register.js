import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../services/api.js'

const validatePassword = (password) => {
    const rules = [
        { test: password.length >= 8, message: 'At least 8 characters' },
        { test: /[A-Z]/.test(password), message: 'At least one uppercase letter' },
        { test: /[a-z]/.test(password), message: 'At least one lowercase letter' },
        { test: /[^A-Za-z0-9]/.test(password), message: 'At least one special character' }
    ]
    return rules.filter(rule => !rule.test).map(rule => rule.message)
}

const Register = () => {

    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        username: '',
        password: '',
        address_line_1: '',
        address_line_2: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'US',
        profile_image_url: ''
    })

    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)
    const [passwordErrors, setPasswordErrors] = useState([])

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
        if (e.target.name === 'password') {
            setPasswordErrors(validatePassword(e.target.value))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)

        const errors = validatePassword(formData.password)
        if (errors.length > 0) {
            setError(errors.join(', '))
            return
        }

        setLoading(true)

        try {
            const data = await api.post('/users/register', formData)

            if (data.message === 'User registered successfully') {
                navigate('/login')
            } else {
                setError(data.message)
            }
        } catch (err) {
            setError('Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='container mt-5'>
            <div className='row justify-content-center'>
                <div className='col-md-6'>
                    <h2 className='mb-4'>Create an Account</h2>

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

                        <h3 className='mt-3 mb-2 text-muted'>Required</h3>

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
                                    required
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
                                    required
                                />
                            </div>
                        </div>

                        <div className='mb-3'>
                            <label className='form-label' htmlFor='email'>
                                Email
                            </label>
                            <input
                                type='email'
                                className='form-control'
                                id='email'
                                name='email'
                                value={formData.email}
                                onChange={handleChange}
                                autoComplete='email'
                                required
                            />
                        </div>
                        <div className='mb-3'>
                            <label className='form-label' htmlFor='username'>Username</label>
                            <input 
                                type='text'
                                className='form-control'
                                id='username'
                                value={formData.username}
                                onChange={handleChange}
                                autoComplete='username'
                                required
                                aria-required='true'
                                placeholder='Letters, numbers, and underscores only'
                            />
                        </div>

                        <div className='mb-3'>
                            <label className='form-label' htmlFor='password'>
                                Password
                            </label>
                            <input
                                type='password'
                                className='form-control'
                                id='password'
                                name='password'
                                value={formData.password}
                                onChange={handleChange}
                                autoComplete='new-password'
                                aria-describedby='password-requirements'
                                required
                            />
                            {formData.password && (
                                <ul
                                    id='password-requirements'
                                    className='mt-2 ps-3'
                                    aria-label='Password requirements'
                                    aria-live='polite'
                                >
                                    {[
                                        { test: formData.password.length >= 8, message: 'At least 8 characters' },
                                        { test: /[A-Z]/.test(formData.password), message: 'At least one uppercase letter' },
                                        { test: /[a-z]/.test(formData.password), message: 'At least one lowercase letter' },
                                        { test: /[^A-Za-z0-9]/.test(formData.password), message: 'At least one special character' }
                                    ].map((rule, index) => (
                                        <li
                                            key={index}
                                            style={{ color: rule.test ? 'green' : 'red', fontSize: '0.85rem' }}
                                            aria-label={`${rule.message}: ${rule.test ? 'met' : 'not met'}`}
                                        >
                                            {rule.test ? '✓' : '✗'} {rule.message}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <h3 className='mt-4 mb-2 text-muted'>Optional</h3>

                        <div className='mb-3'>
                            <label className='form-label' htmlFor='address_line_1'>
                                Address Line 1
                            </label>
                            <input
                                type='text'
                                className='form-control'
                                id='address_line_1'
                                name='address_line_1'
                                value={formData.address_line_1}
                                onChange={handleChange}
                                autoComplete='address-line1'
                            />
                        </div>

                        <div className='mb-3'>
                            <label className='form-label' htmlFor='address_line_2'>
                                Address Line 2
                            </label>
                            <input
                                type='text'
                                className='form-control'
                                id='address_line_2'
                                name='address_line_2'
                                value={formData.address_line_2}
                                onChange={handleChange}
                                autoComplete='address-line2'
                            />
                        </div>

                        <div className='row'>
                            <div className='col-md-5 mb-3'>
                                <label className='form-label' htmlFor='city'>
                                    City
                                </label>
                                <input
                                    type='text'
                                    className='form-control'
                                    id='city'
                                    name='city'
                                    value={formData.city}
                                    onChange={handleChange}
                                    autoComplete='address-level2'
                                />
                            </div>
                            <div className='col-md-3 mb-3'>
                                <label className='form-label' htmlFor='state'>
                                    State
                                </label>
                                <input
                                    type='text'
                                    className='form-control'
                                    id='state'
                                    name='state'
                                    value={formData.state}
                                    onChange={handleChange}
                                    autoComplete='address-level1'
                                />
                            </div>
                            <div className='col-md-4 mb-3'>
                                <label className='form-label' htmlFor='postal_code'>
                                    Postal Code
                                </label>
                                <input
                                    type='text'
                                    className='form-control'
                                    id='postal_code'
                                    name='postal_code'
                                    value={formData.postal_code}
                                    onChange={handleChange}
                                    autoComplete='postal-code'
                                />
                            </div>
                        </div>

                        <div className='mb-3'>
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
                                autoComplete='country-name'
                            />
                        </div>

                        <div className='mb-4'>
                            <label className='form-label' htmlFor='profile_image_url'>
                                Profile Image URL
                            </label>
                            <input
                                type='url'
                                className='form-control'
                                id='profile_image_url'
                                name='profile_image_url'
                                value={formData.profile_image_url}
                                onChange={handleChange}
                            />
                        </div>

                        <button
                            type='submit'
                            className='btn btn-primary w-100'
                            disabled={loading || passwordErrors.length > 0}
                            aria-busy={loading}
                        >
                            {loading ? 'Registering...' : 'Register'}
                        </button>

                    </form>

                    <p className='text-center mt-3'>
                        Already have an account? <Link to='/login'>Login</Link>
                    </p>

                </div>
            </div>
        </div>
    )
}

export default Register