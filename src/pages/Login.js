import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

// Replacing api with AuthContext
// import { api } from '../services/api.js'
import { useAuth } from '../context/AuthContext.js'

const Login =()=> {

    const navigate = useNavigate()
    const { login } = useAuth()

    const [ formData, setFormData ] = useState({
        email: '',
        password: ''
    })

    const [ error, setError ] = useState(null)
    const [ loading, setLoading ] = useState(false)

    const handleChange =(e)=> {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e)=> {
        e.preventDefault()
        setError(null)
        setLoading(true)

        try {
            const data = await login(formData)

            if (data.message === 'Login successful') {
                navigate('/')
            } else {
                setError(data.message)
            }
        } catch (err) {
            setError('Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return(
        <div className='container mt-5'>
            <div className='row justify-content-center'>
                <div className='col-md-5'>
                    <h2 className='mb-4'>Login</h2>

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
                        <div className='mb-3'>
                            <label className='form-label' htmlFor='email'>Email</label>
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

                        <div className='mb-4'>
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
                                autoComplete='current-password'
                                required
                            />
                        </div>

                        <button
                            type='submit'
                            className='btn btn-primary w-100'
                            disabled={loading}
                            aria-busy={loading}
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>

                    <p className='text-center mt-3'>
                        Don't have an account? <Link to='/register'>Register</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Login