import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from "../context/AuthContext.js"
import { api } from "../services/api.js"

import AlbumGrid from "../components/AlbumGrid.js"

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
                            <AlbumGrid 
                                endpoint={`/users/${id}/albums`}
                                defaultSort='added_desc'
                                sortOptions={[
                                    { value: 'added_desc', label: 'Recently Added' },
                                    { value: 'added_asc', label: 'Oldest Added' },
                                    { value: 'title_asc', label: 'Title A-Z' },
                                    { value: 'title_desc', label: 'Title Z-A' },
                                    { value: 'year_desc', label: 'Year — Newest' },
                                    { value: 'year_asc', label: 'Year — Oldest' }
                                ]}
                                limit={20}
                                paginated={true}
                                title={isOwnProfile ? 'My Collection' : `{profile.first_name}'s Collection`}
                                showBrowseButton={isOwnProfile}
                                emptyMessage="No albums in collection yet."
                            />
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