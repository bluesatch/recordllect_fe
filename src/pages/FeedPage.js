import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.js'
import Feed from '../components/Feed.js'

/**
 * FeedPage - Dedicated feed page
 * Route: /feed
 *
 * Displays posts from followed users
 * Redirects to login if not authenticated
 */

const FeedPage = () => {

    const { isAuthenticated, loading } = useAuth()
    const navigate = useNavigate()

    // USEEFFECT 
    // Redirect if not authenticated
    useEffect(() => {
        if (!loading && !isAuthenticated) {
            navigate('/login')
        }
    }, [isAuthenticated, loading, navigate])

    if (loading) {
        return (
            <div className='container mt-5 text-center'>
                <p>Loading...</p>
            </div>
        )
    }

    return (
        <main>
            <div className='container mt-4'>
                <div className='row'>

                    {/* Main feed */}
                    <div className='col-md-8'>
                        <h2 className='mb-4'>Feed</h2>
                        <Feed
                            endpoint='/posts/feed'
                            showForm={true}
                            emptyMessage="You're not following anyone yet. Discover users to follow!"
                        />
                    </div>

                    {/* Sidebar */}
                    <aside className='col-md-4'>
                        <div className='card mb-3'>
                            <div className='card-body'>
                                <h3 className='h6 mb-2'>Your Feed</h3>
                                <p className='text-muted mb-0' style={{ fontSize: '0.85rem' }}>
                                    Posts from people you follow appear here.
                                    Find new people to follow on the
                                    <a href='/discover' className='ms-1'>
                                        Discover page
                                    </a>.
                                </p>
                            </div>
                        </div>
                    </aside>

                </div>
            </div>
        </main>
    )
}

export default FeedPage