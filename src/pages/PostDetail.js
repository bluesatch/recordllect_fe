import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.js'
import { api } from '../services/api.js'
import PostCard from '../components/PostCard.js'

/**
 * PostDetail - Single post view
 * Route: /posts/:id
 *
 * Displays:
 * - Single post with full comment section
 * - Back button to feed
 */

const PostDetail = () => {

    const { id } = useParams()
    const navigate = useNavigate()
    const { isAuthenticated, loading: authLoading } = useAuth()

    const [post, setPost] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchPost = async () => {
            setLoading(true)
            setError(null)

            try {
                const data = await api.get(`/posts/${id}`)

                if (data.message) {
                    setError(data.message)
                    return
                }

                setPost(data)
            } catch (err) {
                setError('Failed to load post. Please try again.')
            } finally {
                setLoading(false)
            }
        }

        fetchPost()
    }, [id])

    if (authLoading || loading) {
        return (
            <div className='container mt-5 text-center'>
                <p>Loading...</p>
            </div>
        )
    }

    if (error) {
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
                <div className='row justify-content-center'>
                    <div className='col-md-8'>

                        {/* Back button */}
                        <button
                            className='btn btn-outline-secondary btn-sm mb-4'
                            onClick={() => navigate(-1)}
                            aria-label='Go back'
                        >
                            &larr; Back
                        </button>

                        {/* Post */}
                        {post && (
                            <PostCard
                                post={post}
                                onPostUpdated={() => navigate('/feed')}
                                defaultShowComments={true}
                            />
                        )}

                    </div>
                </div>
            </div>
        </main>
    )
}

export default PostDetail