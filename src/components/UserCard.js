import { Link } from "react-router-dom"

/**
 * UserCard - Reusable card component 
 * 
 * Props:
 * - user: user object from API
 */

const UserCard = ({ user })=> {

    return (
        <div className="card">
            <div className="card-body d-flex align-items-center gap-3">
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
                <div>
                    <Link 
                        to={`/users/${user.users_id}`}
                        className="text-decoration-none"
                    >
                        <p className="mb-0 fw-semibold">
                            {user.username}
                        </p>
                    </Link>
                    {(user.first_name || user.last_name) && (
                        <p className="text-muted mb-0">
                            <small>{user.first_name} {user.last_name}</small>
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default UserCard