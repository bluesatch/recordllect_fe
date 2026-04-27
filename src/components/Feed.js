import { useState, useEffect, useCallback } from 'react'
import { api } from '../services/api.js'
import PostCard from './PostCard.js'
import PostForm from './PostForm.js'
import Pagination from './Pagination.js'

/**
 * Feed - Reusable paginated list of posts
 *
 * Props:
 * - endpoint: API endpoint to fetch posts from
 * - showForm: boolean — shows PostForm at top if true
 * - emptyMessage: message to show when no posts found
 */

const Feed = ({ endpoint, showForm = false, emptyMessage = 'No posts yet.' }) => {

    // STATE 
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [total, setTotal] = useState(0)

    const LIMIT = 10

    // USECALLBACK 
    const fetchPosts = useCallback(async () => {
        setLoading(true)
        setError(null)

        try {
            const params = new URLSearchParams({ page, limit: LIMIT })
            const data = await api.get(`${endpoint}?${params.toString()}`)
            setPosts(data.posts || [])
            setTotal(data.total || 0)
            setTotalPages(data.totalPages || 1)
        } catch (err) {
            setError('Failed to load posts. Please try again.')
        } finally {
            setLoading(false)
        }
    }, [endpoint, page])

    // USEEFFECT 
    useEffect(() => {
        fetchPosts()
    }, [fetchPosts])

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }, [page])

    return (
        <section aria-label='Feed'>

            {/* Post form */}
            {showForm && (
                <PostForm onPostCreated={fetchPosts} />
            )}

            {error && (
                <div className='alert alert-danger' role='alert' aria-live='polite'>
                    {error}
                </div>
            )}

            {/* Results count */}
            {!loading && total > 0 && (
                <p className='text-muted mb-3'>
                    <small>
                        {total} post{total !== 1 ? 's' : ''}
                    </small>
                </p>
            )}

            {/* Posts */}
            {loading ? (
                <div className='text-center mt-4'>
                    <p>Loading posts...</p>
                </div>
            ) : posts.length === 0 ? (
                <div className='text-center mt-4'>
                    <p className='text-muted'>{emptyMessage}</p>
                </div>
            ) : (
                <>
                    {posts.map(post => (
                        <PostCard
                            key={post.post_id}
                            post={post}
                            onPostUpdated={fetchPosts}
                        />
                    ))}

                    <Pagination
                        page={page}
                        totalPages={totalPages}
                        onPageChange={setPage}
                        label='Feed pagination'
                    />
                </>
            )}

        </section>
    )
}

export default Feed