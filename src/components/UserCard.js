import { useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from '../context/AuthContext.js'
import { api } from "../services/api.js"
/**
 * UserCard - Reusable card component 
 * 
 * Props:
 * - user: user object from API
 * - showFollowButton: boolean - shows follow/unfollow button if true 
 * - isFollowing: boolean - initial follow state 
 * - onFollowChange: callback when follow state changes
 */

const UserCard = ({ 
    user, 
    showFollowButton = false, 
    isFollowing: initialFollowing = false, 
    onFollowChange,
    compact = false 
})=> {

    const { user: currentUser, isAuthenticated } = useAuth()

    // STATE
    const [isFollowing, setIsFollowing] = useState(initialFollowing)
    const [loading, setLoading] = useState(false)

    const isOwnProfile = currentUser?.users_id === user.users_id


    // HANDLERS 
    const handleFollow = async ()=> {
        if (!isAuthenticated || isOwnProfile) return 

        setLoading(true)

        try {
            if (isFollowing) {
                await api.delete(`/users/${user.users_id}/follow`)
                setIsFollowing(false)
                onFollowChange?.(user.users_id, false)
            } else {
                await api.post(`/users/${user.users_id}/follow`)
                setIsFollowing(true)
                onFollowChange?.(user.users_id, true)
            }
        } catch (err) {
            console.error('Failed to follow/unfollow:', err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="card">
            <div className="card-body d-flex align-items-center gap-3">

                {/* Avatar */}
                {user.profile_image_url ? (
                    <img 
                        src={user.profile_image_url}
                        alt={user.username}
                        className="rounded-circle flex-shrink-0"
                        style={{ width: '44px', height: '44px', objectFit: 'cover'}}
                    />
                ) : (
                    <div 
                        className="rounded-circle bg-secondary d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{ width: '44px', height: '44px'}}
                        aria-hidden='true'
                    >
                        <span className="text-white">
                            {user.username?.slice(0, 2).toUpperCase()}
                        </span>
                    </div>
                )}
                
                {/* User info */}
                <div className="flex-grow-1">
                    <Link 
                        to={`/users/${user.users_id}`}
                        className="text-decoration-none"
                    >
                        <p className="mb-0 fw-semibold">@{user.username}</p>
                    </Link>
                    {(user.first_name || user.last_name) && (
                        <p className="text-muted mb-0">
                            <small>{user.first_name} {user.last_name}</small>
                        </p>
                    )}

                    {!compact && (user.city || user.state || user.country) && (
                        <p className="text-muted mb-0">
                            <small>
                                {[user.city, user.state, user.country].filter(Boolean).join(', ')}
                            </small>
                        </p>
                    )}
                    {!compact && user.bio && (
                        <p className='text-muted mb-0'>
                            <small>{user.bio}</small>
                        </p>
                    )}
                    {!compact && user.genres && (
                        <p className="text-muted mb-0">
                            <small>🎵 {user.genres}</small>
                        </p>
                    )}

                    { user.now_playing && (
                        <p className="text-muted mb-0">
                            <small>
                                🎵 <strong>Now Playing:</strong> {user.now_playing.title} - {user.now_playing.performer_name}
                            </small>
                        </p>
                    )}
                </div>

                {/* Follow button */}
                {showFollowButton && isAuthenticated && !isOwnProfile && (
                    <button 
                        className={`btn btn-sm flex-shrink-0 ${
                            isFollowing
                                ? 'btn-outline-secondary'
                                : 'btn-primary'
                        }`}
                        onClick={handleFollow}
                        disabled={loading}
                        aria-busy={loading}
                        aria-label={isFollowing
                            ? `Unfollow @${user.username}`
                            : `Follow @${user.username}`
                        }
                    >
                        {loading ? '...' : isFollowing ? 'Unfollow' : 'Follow'}
                    </button>
                )}
            </div>
        </div>
    )
}

export default UserCard