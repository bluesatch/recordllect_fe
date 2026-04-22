import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from "../context/AuthContext.js"
import { api } from "../services/api.js"

import AlbumGrid from "../components/AlbumGrid.js"
import Pagination from "../components/Pagination.js"

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
    // const [collection, setCollection] = useState([])
    const [followers, setFollowers] = useState([])
    const [following, setFollowing] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [activeTab, setActiveTab] = useState('collection')

    // const [page, setPage] = useState(1)
    // const [totalPages, setTotalPages] = useState(1)
    // const [total, setTotal] = useState(0)
    // const [sort, setSort] = useState('added_desc')

    const [isFollowing, setIsFollowing] = useState(false)
    const [followLoading, setFollowLoading] = useState(false)
    const [userSearch, setUserSearch] = useState('')
    const [userSearchResults, setUserSearchResults] = useState([])
    const [searchLoading, setSearchLoading] = useState(false)

    const LIMIT = 20

    const isOwnProfile = isAuthenticated && currentUser?.users_id === parseInt(id)

    // useEffects 

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

    // useEffect(()=> {
    //     const fetchCollection = async ()=> {
    //         try {   
    //             const data = await api.get(`/users/${id}/albums?page=${page}&limit=${LIMIT}&sort=${sort}`)
    //             setCollection(data.albums || [])
    //             setTotalPages(data.totalPages || 1)
    //             setTotal(data.total || 0)
    //         } catch (err) {
    //             console.error('Failed to load collection:', err)
    //         }
    //     }

    //     if (activeTab === 'collection') {
    //         fetchCollection()
    //     }
    // }, [id, page, activeTab, sort])

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

    // useEffect(()=> {
    //     window.scrollTo({ top: 0, behavior: 'smooth'})
    // }, [page])

    useEffect(()=> {
        const checkFollowing = async ()=> {
            if (!isAuthenticated || isOwnProfile) return 

            try {
                const data = await api.get(`/users/${id}/following/check`)
                setIsFollowing(data.isFollowing)
            } catch (err) {
                console.error('Failed to check following status:', err)
            }
        }

        if (profile) {
            checkFollowing()
        }
    }, [id, isAuthenticated, isOwnProfile, profile])

    // HANDLERS 

    // sort handler
    // const handleSortChange =(e)=> {
    //     setSort(e.target.value)
    //     setPage(1)
    // }

    // follow/unfollow
    const handleFollow = async ()=> {
        setFollowLoading(true)

        try {
            if (isFollowing) {
                await api.delete(`/users/${id}/follow`)
                setIsFollowing(false)
                setProfile(prevProfile => ({
                    ...prevProfile,
                    followers_count: prevProfile.followers_count - 1
                }))
            } else {
                await api.post(`/users/${id}/follow`)
                setIsFollowing(true)
                setProfile(prevProfile => ({
                    ...prevProfile,
                    followers_count: prevProfile.followers_count + 1
                }))
            }
        } catch (err) {
            console.error('Failed to follow/unfollow:', err)
        } finally {
            setFollowLoading(false)
        }
    }

    // search users 
    const handleUserSearch = async (e)=> {
        e.preventDefault()

        if (!userSearch.trim()) return 

        setSearchLoading(true)

        try {
            const data = await api.get(
                `/users/search?search=${encodeURIComponent(userSearch)}&id=${currentUser.users_id}`
            )
            setUserSearchResults(data.users || [])
        } catch (err) {
            console.error('Failed to search users:', err)
        } finally {
            setSearchLoading(false)
        }
    }

    const handleClearSearch =()=> {
        setUserSearch('')
        setUserSearchResults([])
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
                                                {profile.username?.slice(0, 2).toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                {/* Profile info */}
                                <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                        <h2 className="m-1">{profile.username}</h2>
                                        {profile.email && isOwnProfile && (
                                            <p className="text-muted mb-1">
                                                <small>{profile.email}</small>
                                            </p>
                                        )}
                                        {(profile.city || profile.state || profile.country) && (
                                            <p className="text-muted mb-0">
                                                <small>
                                                    {[profile.city, profile.state, profile.country].filter(Boolean).join(', ')}
                                                </small>
                                            </p>
                                        )}
                                    </div>
                                    <div className="d-flex gap 2">
                                        {isOwnProfile && (
                                            <Link 
                                                to={`/users/${id}/edit`}
                                                className="btn btn-outline-secondary btn-sm"
                                                aria-label='Edit profile'
                                            >
                                                Edit Profile
                                            </Link>
                                        )}
                                        {!isOwnProfile && isAuthenticated && (
                                            <button 
                                                className={`btn btn-sm ${
                                                    isFollowing
                                                        ? 'btn-outline-secondary'
                                                        : 'btn-primary'
                                                }`}
                                                onClick={handleFollow}
                                                disabled={followLoading}
                                                aria-busy={followLoading}
                                                aria-label={isFollowing
                                                    ? `Unfollow ${profile.username}`
                                                    : `Follow ${profile.username}`
                                                }
                                            >
                                                {followLoading
                                                    ? '...'
                                                    :isFollowing
                                                        ? 'Unfollow'
                                                        : 'Follow'
                                                }
                                            </button>
                                        )}
                                    </div>
                                </div>
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
                                <h3 className='display-6'>{profile.album_count || 0}</h3>
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

                {/* User search - own profile only */}
                {isOwnProfile && (
                    <section aria-label='Find users' className="mb-4">
                        <div className="card p-3">
                            <h3 className="h6 mb-3">Find Users</h3>
                            <form onSubmit={handleUserSearch}>
                                <div className="row g-2 align-items-end">
                                    <div className="col">
                                        <input 
                                            type='text'
                                            className="form-control form-control-sm"
                                            placeholder="Search by username..."
                                            value={userSearch}
                                            onChange={e => setUserSearch(e.target.value)}
                                            aria-label="Search users by username"
                                        />
                                    </div>
                                    <div className="col-auto">
                                        <button 
                                            type='submit'
                                            className="btn btn-primary btn-sm"
                                            disabled={searchLoading}
                                            aria-busy={searchLoading}
                                        >
                                            {searchLoading ? 'Searching...' : 'Search'}
                                        </button>
                                    </div>
                                    {userSearchResults.length > 0 && (
                                        <div className="col-auto">
                                            <button 
                                                type='button'
                                                className="btn btn-outline-secondary btn-sm"
                                                onClick={handleClearSearch}
                                            >
                                                Clear
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </form>
                            {/* Search Results */}
                            {userSearchResults.length > 0 && (
                                <div className="mt-3">
                                    {userSearchResults.map(result => (
                                        <div 
                                            key={result.users_id}
                                            className="d-flex align-items-center justify-content-between py-2 border-bottom"
                                        >
                                            <div className="d-flex align-items-center gap-2">
                                                {result.profile_image_url ? (
                                                    <img 
                                                        src={result.profile_image_url}
                                                        alt={result.username}
                                                        className="rounded-circle"
                                                        style={{width: '36px', height: '36px', objectFit: 'cover'}}
                                                    />
                                                ) : (
                                                    <div
                                                        className='rounded-circle bg-secondary d-flex align-items-center justify-content-center flex-shrink-0'
                                                        style={{ width: '36px', height: '36px' }}
                                                        aria-hidden='true'
                                                    >
                                                        <span className='text-white small'>
                                                            {result.username?.slice(0, 2).toUpperCase()}
                                                        </span>
                                                    </div>
                                                )}
                                                <Link
                                                    to={`/users/${result.users_id}`}
                                                    className='text-decoration-none'
                                                >
                                                    {result.username}
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {userSearch && userSearchResults.length === 0 && !searchLoading && (
                                <p className='text-muted mt-3 mb-0'>
                                    <small>No users found for "{userSearch}"</small>
                                </p>
                            )}
                        </div>
                    </section>
                )}

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
                                title={isOwnProfile ? 'My Collection' : `${profile.username}'s Collection`}
                                showBrowseButton={isOwnProfile}
                                emptyMessage="No albums in collection yet."
                            />
                        </>
                    )}

                    {/* Followers tab */}
                    {activeTab === 'followers' && (
                        <>
                            <h3 className='mb-3'>{profile.username}'s Followers</h3>
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
                                                            {follower.username?.charAt(0)}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <Link 
                                                            to={`/users/${follower.users_id}`}
                                                            className='text-decoration-none'
                                                        >
                                                            <p className='mb-0 fw-500'>
                                                                {follower.username}
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
                            <h3 className='mb-3'>{profile.username} is Following</h3>
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
                                                            {followed.username?.charAt(0)}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <Link 
                                                            to={`/users/${followed.users_id}`}
                                                            className='text-decoration-none'
                                                        >
                                                            <p className='mb-0 fw-500'>
                                                                {followed.username} 
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