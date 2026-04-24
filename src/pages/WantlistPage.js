import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext.js'
import { api } from '../services/api.js'
import Wantlist from '../components/Wantlist.js'

/**
 * WantlistPage - Dedicated wantlist page
 * Route: /users/:id/wantlist
 */

const WantlistPage = () => {

    const { id } = useParams()
    const { user: currentUser, isAuthenticated } = useAuth()
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    const isOwnProfile = isAuthenticated && currentUser?.users_id === parseInt(id)

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await api.get(`/users/${id}`)
                setProfile(data)
            } catch (err) {
                console.error('Failed to load profile:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchProfile()
    }, [id])

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

                {/* Back button */}
                <Link
                    to={`/users/${id}`}
                    className='btn btn-outline-secondary btn-sm mb-4'
                    aria-label='Back to profile'
                >
                    &larr; Back to Profile
                </Link>

                <div className='d-flex justify-content-between align-items-center mb-4'>
                    <h2 className='mb-0'>
                        {isOwnProfile
                            ? 'My Wantlist'
                            : `@${profile?.username}'s Wantlist`
                        }
                    </h2>
                </div>

                <Wantlist
                    userId={id}
                    isOwnProfile={isOwnProfile}
                />

            </div>
        </main>
    )
}

export default WantlistPage