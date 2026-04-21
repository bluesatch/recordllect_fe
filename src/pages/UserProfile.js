import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from "../context/AuthContext.js"
import { api } from "../services/api.js"

/**
 * UserProfile - User profile page
 * 
 * Displays:
 * - Profile info (name, location, email, avatar)
 * - Dashboard stats (collection count, followers, following)
 * - User's album collection with pagination
 * - Followers and following lists
 * 
 */

const UserProfile =()=> {

    const { id } = useParams()
    const navigate = useNavigate()
    const { user: currentUser, isAuthenticated } = useAuth()

    // STATE
    const [profile, setProfile] = useState(null)
    const [collection, setCollection] = useState([])
    const [followers, setFollowers] = useState([])
    const [following, setFollowing] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [activeTab, setActiveTab] = useState('collection')

    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [total, setTotal] = useState(0)
    const [sort, setSort] = useState('added_desc')

    const LIMIT = 20

    const isOwnProfile = isAuthenticated && currentUser?.users_id === parseInt(id)

    useEffect(()=> {
        const fetchProfile = async ()=> {
            setLoading(true)
            setError(null)

            try {
                const profileData = await api.get(`/users/${id}`)

                if (profileData.message) {
                    setError(profileData.message)
                    return
                }

                setProfile(profileData)

            } catch (err) {
                setError('Failed to load profile. Please try again.')
            } finally {
                setLoading(false)
            }
        }

        fetchProfile()
    }, [id])

    useEffect(()=> {
        const fetchCollection = async ()=> {
            try {   
                const data = await api.get(`/users/${id}/albums?page=${page}&limit=${LIMIT}&sort=${sort}`)
                setCollection(data.albums || [])
                setTotalPages(data.totalPages || 1)
                setTotal(data.total || 0)
            } catch (err) {
                console.error('Failed to load collection:', err)
            }
        }

        if (activeTab === 'collection') {
            fetchCollection()
        }
    }, [id, page, activeTab, sort])

    useEffect(()=> {
        const fetchFollowers = async ()=> {
            try {
                const data = await api.get(`/users/${id}/followers`)
                setFollowers(data.followers || [])
            } catch (err) {
                console.error('Failed to load followers:', err)
            }
        }

        const fetchFollowing = async ()=> {
            try {
                const data = await api.get(`/users/${id}/following`)
                setFollowing(data.following || [])
            } catch (err) {
                console.error('Failed to load following:', err)
            }
        }

        if (activeTab === 'followers') fetchFollowers()
        if (activeTab === 'following') fetchFollowing()
    }, [id, activeTab])

    useEffect(()=> {
        window.scrollTo({ top: 0, behavior: 'smooth'})
    }, [page])

    // sort handler
    const handleSortChange =(e)=> {
        setSort(e.target.value)
        setPage(1)
    }

    if (loading) {
        return (
            <div className='container mt-5 text-center'>
                <p>Loading profile...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className='container mt-5'>
                <div className='alert alert-danger' role='alert'>
                    {error}
                </div>
                <button className='btn btn-outline-secondary' onClick={()=> navigate(-1)}>
                    Go Back
                </button>
            </div>
        )
    }

    return (
        <main className="main">
            <div className='container mt-4'>
                {/* profile header */}
                <section aria-label='Profile information'>
                    <div className='card mb-4'>
                        <div className='card-body'>
                            <div className='row align-items-center'>
                                {/* Avatar */}
                                <div className='col-md-2 text-center mb-3 mb-md-0'>
                                    {profile.profile_image_url ? (
                                        <img 
                                            src={profile.profile_image_url}
                                            alt={`${profile.first_name} ${profile.last_name}'s profile`}
                                            className='rounded-circle img-fluid'
                                            style={{ width: '100px', height: '100px', objectFit: 'cover'}}
                                        />
                                    ) : (
                                        <div 
                                            className='rounded-circle bg-secondary d-flex align-items-center justify-content-center mx-auto'
                                            style={{ width: '100px', height: '100px'}}
                                            aria-label='No profile image'
                                        >
                                            <span className='text-white fs-3'>
                                                {profile.first_name?.charAt(0)}{profile.last_name?.charAt(0)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                {/* Profile info */}
                                <div className='col-md-7'>
                                    <h2 className='mb-1'>
                                        {profile.first_name} {profile.last_name}
                                    </h2>
                                    {profile.email && isOwnProfile && (
                                        <p className='text-muted mb-1'>
                                            <small>{profile.email}</small>
                                        </p>
                                    )}
                                    {(profile.city || profile.state || profile.country) && (
                                        <p className='text-muted mb-0'>
                                            <small>
                                                {[profile.city, profile.state, profile.country].filter(Boolean).join(', ')}
                                            </small>
                                        </p>
                                    )}
                                </div>
                                {/* Edit button for own profile */}
                                {isOwnProfile && (
                                    <div className='col-md-3 text-md-end mt-3 mt-md-0'>
                                        <Link
                                            to={`/users/${id}/edit`}
                                            className='btn btn-outline-secondary btn-sm'
                                            aria-label='Edit profile'
                                        >
                                            Edit Profile
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
                
                {/* Stats */}
                <section aria-label='Profile statistics'>
                    <div className='row mb-4'>
                        <div className='col-4'>
                            <div
                                className='card text-center p-3'
                                style={{ cursor: 'pointer'}}
                                onClick={()=> setActiveTab('collection')}
                                role='button'
                                aria-pressed={activeTab === 'collection'}
                                tabIndex={0}
                                onKeyDown={e => e.key === 'Enter' && setActiveTab('collection')} 
                            >
                                <h3 className='display-6'>{total}</h3>
                                <p className='text-muted mb-0'>Albums</p>
                            </div>
                        </div>
                        <div className='col-4'>
                            <div 
                                className='card text-center p-3'
                                style={{ cursor: 'pointer'}}
                                onClick={()=> setActiveTab('followers')}
                                role='button'
                                aria-pressed={activeTab === 'followers'}
                                tabIndex={0}
                                onKeyDown={e => e.key === 'Enter' && setActiveTab('followers')}
                            >
                                <h3 className='display-6'>{profile.followers_count || 0}</h3>
                                <p className='text-muted mb-0'>Followers</p>
                            </div>
                        </div>
                        <div className='col-4'>
                            <div 
                                className='card text-center p-3'
                                style={{ cursor: 'pointer'}}
                                onClick={()=> setActiveTab('following')}
                                role='button'
                                aria-pressed={activeTab === 'following'}
                                tabIndex={0}
                                onKeyDown={e => e.key === 'Enter' && setActiveTab('following')}
                            >
                                <h3 className='display-6'>{profile.following_count || 0}</h3>
                                <p className='text-muted mb-0'>Following</p>
                            </div>
                        </div>
                        {/* End row */}
                    </div>
                </section>

                {/* Tabs */}
                <section aria-label='Profile content'>
                    {/* Collection tab */}
                    {activeTab === 'collection' && (
                        <>
                            <h3 className='mb-3'>
                                {isOwnProfile ? 'My Collection' : `${profile.first_name}'s Collection`}
                            </h3>

                            <div className="d-flex align-items-center gap-2 mb-3">
                                <label className="form-label mb-0" htmlFor="profile-sort">Sort By</label>
                                <select 
                                    className="form-select form-select-sm"
                                    id='profile-sort'
                                    name='sort'
                                    value={sort}
                                    onChange={handleSortChange}
                                    aria-label='Sort collection'
                                    style={{ width: 'auto'}}
                                >   
                                    <option value='added_desc'>Recently Added</option>
                                    <option value='added_asc'>Oldest Added</option>
                                    <option value='title_asc'>Title A - Z</option>
                                    <option value='title_desc'>Title Z - A</option>
                                    <option value='year_desc'>Year - Newest</option>
                                    <option value ='year_asc'>Year - Oldest</option>
                                </select>
                                {isOwnProfile && (
                                    <Link to='/albums' className='btn btn-primary btn-sm'>
                                        Browse Albums
                                    </Link>
                                )}
                            </div>

                            {collection.length === 0 ? (
                                <div className='text-center mt-4'>
                                    <p className='text-muted'>
                                        No albums in collection yet.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className='row'>
                                        {collection.map(album => (
                                            <div key={album.album_id} className='col-md-3 col-sm-6 mb-4'>
                                                <div className='card h-100'>
                                                    {album.album_image_url ? (
                                                        <img 
                                                            src={album.album_image_url}
                                                            alt={`${album.title} album cover`}
                                                            className='card-img-top'
                                                            style={{ objectFit: 'cover', height: '180px'}}
                                                        />
                                                    ) : (
                                                        <div 
                                                            className='bg-secondary d-flex align-items-center justify-content-center'
                                                            style={{ height: '180px'}}
                                                            arial-label='No album cover available'
                                                        >
                                                            <span className='text-white'>No Image</span>
                                                        </div>
                                                    )}
                                                    <div className='card-body'>
                                                        <h4 className='card-title h6'>{album.title}</h4>
                                                        <p className='card-text text-muted mb-1'>
                                                            {album.performer_name}
                                                        </p>
                                                        <p className='card-text text-muted mb-0'>
                                                            <small>{album.release_year} | {album.format_name}</small>
                                                        </p>
                                                    </div>
                                                    <footer className='card-footer'>
                                                        <Link 
                                                            to={`/albums/${album.album_id}`}
                                                            className='btn btn-outline-primary btn-sm w-100'
                                                        >
                                                            View
                                                        </Link>
                                                    </footer>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                        <nav aria-label='Collection pagination' className='mt-4 mb-5'>
                                            <ul className='pagination justify-content-center'>
                                                <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                                                    <button
                                                        className='page-link'
                                                        onClick={()=> setPage(1)}
                                                        disabled={page=== 1}
                                                        aria-label="First page"
                                                    >
                                                        &laquo;
                                                    </button>
                                                </li>
                                                <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                                                    <button 
                                                        className='page-link'
                                                        onClick={()=> setPage(p => p -1)}
                                                        disabled={page === 1}
                                                        aria-label='Previous page'
                                                    >
                                                        Previous
                                                    </button>
                                                </li>
                                                <li className='page-item disabled'>
                                                    <span className='page-link'>
                                                        Page {page} of {totalPages}
                                                    </span>
                                                </li>
                                                <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                                                    <button
                                                        className='page-link'
                                                        onClick={()=> setPage(p => p + 1)}
                                                        disabled={page === totalPages}
                                                        aria-label='Next page'
                                                    >
                                                        Next
                                                    </button>
                                                </li>
                                                <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                                                    <button
                                                        className='page-link'
                                                        onClick={()=> setPage(totalPages)}
                                                        disabled={page === totalPages}
                                                        aria-label='Last page'
                                                    >
                                                        &raquo;
                                                    </button>
                                                </li>
                                            </ul>
                                        </nav>
                                    )}
                                </>
                            )}
                        </>
                    )}

                    {/* Followers tab */}
                    {activeTab === 'followers' && (
                        <>
                            <h3 className='mb-3'>Followers</h3>
                            {followers.length === 0 ? (
                                <p className='text-muted'>No followers yet.</p>
                            ) : (
                                <div className='row'>
                                    {followers.map(follower => (
                                        <div key={follower.users_id} className='col-md-4 col-sm-6 mb-3'>
                                            <div className='card'>
                                                <div className='card-body d-flex align-items-center gap-3'>
                                                    <div 
                                                        className='rounded-circle bg-secondary d-flex align-items-center justify-content-center flex-shrink-0'
                                                        style={{ width: '44px', height: '44px' }}
                                                        aria-hidden='true'
                                                    >
                                                        <span className='text-white'>
                                                            {follower.first_name?.charAt(0)}{follower.last_name?.charAt(0)}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <Link 
                                                            to={`/users/${follower.users_id}`}
                                                            className='text-decoration-none'
                                                        >
                                                            <p className='mb-0 fw-500'>
                                                                {follower.first_name} {follower.last_name}
                                                            </p>
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* Following Tab */}
                    {activeTab === 'following' && (
                        <>
                            <h3 className='mb-3'>Following</h3>
                            {following.length === 0 ? (
                                <p className='text-muted'>Not following anyone yet.</p>
                            ) : (
                                <div className='row'>
                                    {following.map(followed => (
                                        <div key={followed.users_id} className='col-md-4 col-sm-6 mb-3'>
                                            <div className='card'>
                                                <div className='card-body d-flex align-items-center gap-3'>
                                                    <div 
                                                        className='rounded-circle bg-secondary d-flex align-items-center justify-content-center flex-shrink-0'
                                                        style={{ width: '44px', height: '44px' }}
                                                        aria-hidden='true'
                                                    >
                                                        <span className='text-white'>
                                                            {followed.first_name?.charAt(0)}{followed.last_name?.charAt(0)}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <Link 
                                                            to={`/users/${followed.users_id}`}
                                                            className='text-decoration-none'
                                                        >
                                                            <p className='mb-0 fw-500'>
                                                                {followed.first_name} {followed.last_name}
                                                            </p>
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </section>
            </div>
        </main>
    )
}

export default UserProfile