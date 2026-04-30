import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from "../context/AuthContext.js"
import { api } from "../services/api.js"

import AlbumGrid from "../components/AlbumGrid.js"
import StatCard from "../components/StatCard.js"
import UserCard from "../components/UserCard.js"
import TopEight from "../components/TopEight.js"
import Wantlist from "../components/Wantlist.js"
import Feed from "../components/Feed.js"


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
    const [followers, setFollowers] = useState([])
    const [following, setFollowing] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [activeTab, setActiveTab] = useState('collection')

    const [isFollowing, setIsFollowing] = useState(false)
    const [followLoading, setFollowLoading] = useState(false)
    const [userSearch, setUserSearch] = useState('')
    const [userSearchResults, setUserSearchResults] = useState([])
    const [searchLoading, setSearchLoading] = useState(false)

    const [topEightCount, setTopEightCount] = useState(0)
    const [pendingAlbum, setPendingAlbum] = useState(null)

    const [nowPlaying, setNowPlaying] = useState(null)

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
                setNowPlaying(profileData.now_playing || null)

            } catch (err) {
                setError('Failed to load profile. Please try again.')
            } finally {
                setLoading(false)
            }
        }

        fetchProfile()
    }, [id])

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

    const handleAddToTopEight = (album)=> {
        setPendingAlbum(album)
    }

    const handleSetNowPlaying = async (album)=> {
        try {
            await api.put(`/users/${id}/now-playing`, {
                album_id: album.album_id
            })
            setNowPlaying({
                album_id: album.album_id,
                title: album.title,
                performer_name: album.performer_name
            })
        } catch (err) {
            console.error('Failed to set now playing', err)
        }
    }

    const handleClearNowPlaying = async ()=> {
        try {
            await api.delete(`/users/${id}/now-playing`)
            setNowPlaying(null)
        } catch (err) {
            console.error('Failed to clear now playing:', err)
        }
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
        <main>
            <div className='container mt-4'>

                {/* Profile header — full width */}
                <section aria-label='Profile information' className='mb-4'>
                    <div className='card'>
                        <div className='card-body'>
                            <div className='row align-items-center'>

                                {/* Avatar */}
                                <div className='col-sm-auto'>
                                    {profile.profile_image_url ? (
                                        <img
                                            src={profile.profile_image_url}
                                            alt={`@${profile.username}`}
                                            className='rounded-circle'
                                            style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <div
                                            className='rounded-circle bg-secondary d-flex align-items-center justify-content-center'
                                            style={{ width: '80px', height: '80px' }}
                                            aria-hidden='true'
                                        >
                                            <span className='text-white fs-3'>
                                                {profile.username?.slice(0, 2).toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Profile info */}
                                <div className='col'>
                                    <h2 className='mb-1'>@{profile.username}</h2>
                                    {profile.bio && (
                                        <p className='mb-1'>{profile.bio}</p>
                                    )}
                                    {profile.email && isOwnProfile && (
                                        <p className='text-muted mb-1'>
                                            <small>{profile.email}</small>
                                        </p>
                                    )}
                                    {(profile.city || profile.state || profile.country) && (
                                        <p className='text-muted mb-0'>
                                            <small>
                                                {[profile.city, profile.state, profile.country]
                                                    .filter(Boolean)
                                                    .join(', ')}
                                            </small>
                                        </p>
                                    )}

                                    {/* Now Playing */}
                                    {nowPlaying && (
                                        <div className="d-flex align-items-center gap-2 mt-2">
                                            <span style={{ fontSize: '1rem'}}>🎵</span>
                                            <div>
                                                <p className="mb-0" style={{ fontSize: '0.85rem' }}>
                                                    <strong>Now Playing</strong> {nowPlaying.title}
                                                </p>
                                                <p className="text-muted mb-0" style={{ fontSize: '0.8rem' }}>
                                                    {nowPlaying.performer_name}
                                                </p>
                                            </div>
                                            {isOwnProfile && (
                                                <button 
                                                    className="btn btn-link btn-sm p-0 text-muted text-decoration-none ms-2"
                                                    onClick={handleClearNowPlaying}
                                                    aria-label='Clear now playing'
                                                    style={{ fontSize: '0.75rem'}}
                                                >
                                                    x
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Action buttons */}
                                <div className='col-auto d-flex gap-2'>
                                    {isOwnProfile && (
                                        <Link
                                            to={`/users/${id}/edit`}
                                            className='btn btn-outline-secondary btn-sm'
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
                                        >
                                            {followLoading
                                                ? '...'
                                                : isFollowing
                                                    ? 'Unfollow'
                                                    : 'Follow'
                                            }
                                        </button>
                                    )}
                                </div>

                            </div>
                        </div>
                    </div>
                </section>

                {/* Main layout — aside + content */}
                <div className='row'>

                    {/* Aside — stats and user search */}
                    <aside className='col-md-3 mb-4'>

                        {/* Stats */}
                        <div className='card mb-3'>
                            <div className='card-body p-2'>
                                <div className="row">
                                    <div className="col-6 mb-2">
                                        <StatCard
                                            value={profile.album_count || 0}
                                            label='Albums'
                                            onClick={() => setActiveTab('collection')}
                                            isActive={activeTab === 'collection'}
                                        />
                                    </div>
                                    <div className="col-6 mb-2">
                                        <StatCard
                                            value={profile.followers_count || 0}
                                            label='Followers'
                                            onClick={() => setActiveTab('followers')}
                                            isActive={activeTab === 'followers'}
                                        />
                                    </div>
                                    <div className="col-6 mb-2">
                                        <StatCard
                                            value={profile.following_count || 0}
                                            label='Following'
                                            onClick={() => setActiveTab('following')}
                                            isActive={activeTab === 'following'}
                                        />
                                    </div>
                                    <div className="col-6 mb-2">
                                        <StatCard
                                            value={profile.wantlist_count || 0}
                                            label='Wantlist'
                                            onClick={() => setActiveTab('wantlist')}
                                            isActive={activeTab === 'wantlist'}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* User search — own profile only */}
                        {isOwnProfile && (
                            <div className='card'>
                                <div className='card-body'>
                                    <h3 className='h6 mb-3'>Find Users</h3>
                                    <form onSubmit={handleUserSearch}>
                                        <div className='d-flex gap-2 mb-2'>
                                            <input
                                                type='text'
                                                className='form-control form-control-sm'
                                                placeholder='Search by username...'
                                                value={userSearch}
                                                onChange={e => setUserSearch(e.target.value)}
                                                aria-label='Search users by username'
                                            />
                                            <button
                                                type='submit'
                                                className='btn btn-primary btn-sm'
                                                disabled={searchLoading}
                                                aria-busy={searchLoading}
                                            >
                                                {searchLoading ? '...' : 'Go'}
                                            </button>
                                        </div>
                                        {userSearchResults.length > 0 && (
                                            <button
                                                type='button'
                                                className='btn btn-outline-secondary btn-sm w-100 mb-2'
                                                onClick={handleClearSearch}
                                            >
                                                Clear Results
                                            </button>
                                        )}
                                    </form>

                                    {/* Search results */}
                                    {userSearchResults.length > 0 && (
                                        <div className='mt-2'>
                                            {userSearchResults.map(result => (
                                                <div key={result.users_id} className='mb-2'>
                                                    <UserCard user={result} />
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {userSearch && userSearchResults.length === 0 && !searchLoading && (
                                        <p className='text-muted mb-0'>
                                            <small>No users found for "{userSearch}"</small>
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </aside>

                    {/* Main content area */}
                    <div className='col-md-9'>

                        {/* Tab buttons */}
                        <div className='d-flex flex-wrap gap-2 mb-4'>
                            {[
                                { key: 'collection', label: 'Collection' },
                                { key: 'feed', label: 'Feed' },
                                { key: 'wantlist', label: 'Wantlist' },
                                { key: 'followers', label: 'Followers' },
                                { key: 'following', label: 'Following' }
                            ].map(tab => (
                                <button
                                    key={tab.key}
                                    className={`btn btn-sm ${
                                        activeTab === tab.key
                                            ? 'btn-primary'
                                            : 'btn-outline-secondary'
                                    }`}
                                    onClick={() => setActiveTab(tab.key)}
                                    aria-pressed={activeTab === tab.key}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Tab content */}
                        <section aria-label='Profile content'>

                            {/* Collection tab */}
                            {activeTab === 'collection' && (
                                <>
                                    <TopEight
                                        userId={id}
                                        isOwnProfile={isOwnProfile}
                                        pendingAlbum={pendingAlbum}
                                        onPendingHandled={() => setPendingAlbum(null)}
                                        onCountChange={setTopEightCount}
                                    />
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
                                        title={isOwnProfile ? 'My Collection' : `@${profile.username}'s Collection`}
                                        showBrowseButton={isOwnProfile}
                                        emptyMessage='No albums in collection yet.'
                                        onAddToTopEight={isOwnProfile ? handleAddToTopEight : undefined}
                                        topEightFull={topEightCount >= 8}
                                        scrollToTop={false}
                                        onSetNowPlaying={isOwnProfile ? handleSetNowPlaying : undefined}
                                    />
                                </>
                            )}

                            {/* Feed tab — placeholder for now */}
                            {activeTab === 'feed' && (
                                <Feed 
                                    endpoint={`/users/${id}/posts`}
                                    showForm={isOwnProfile}
                                    emptyMessage={
                                        isOwnProfile
                                            ? "You haven't posted anything yet."
                                            : `@${profile.username} hasn't posted anything yet.`
                                    }
                                />
                            )}

                            {/* Wantlist tab */}
                            {activeTab === 'wantlist' && (
                                <>
                                    <div className='d-flex justify-content-between align-items-center mb-3'>
                                        <h3 className='mb-0'>
                                            {isOwnProfile
                                                ? 'My Wantlist'
                                                : `@${profile.username}'s Wantlist`
                                            }
                                        </h3>
                                        {isOwnProfile && (
                                            <Link
                                                to={`/users/${id}/wantlist`}
                                                className='btn btn-outline-secondary btn-sm'
                                            >
                                                View Full Page
                                            </Link>
                                        )}
                                    </div>
                                    <Wantlist
                                        userId={id}
                                        isOwnProfile={isOwnProfile}
                                    />
                                </>
                            )}

                            {/* Followers tab */}
                            {activeTab === 'followers' && (
                                <>
                                    <h3 className='mb-3'>
                                        @{profile.username}'s Followers
                                    </h3>
                                    {followers.length === 0 ? (
                                        <p className='text-muted'>No followers yet.</p>
                                    ) : (
                                        <div className='row'>
                                            {followers.map(follower => (
                                                <div key={follower.users_id} className='col-md-6 mb-3'>
                                                    <UserCard user={follower} />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Following tab */}
                            {activeTab === 'following' && (
                                <>
                                    <h3 className='mb-3'>
                                        @{profile.username} is Following
                                    </h3>
                                    {following.length === 0 ? (
                                        <p className='text-muted'>Not following anyone yet.</p>
                                    ) : (
                                        <div className='row'>
                                            {following.map(followed => (
                                                <div key={followed.users_id} className='col-md-6 mb-3'>
                                                    <UserCard user={followed} />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}

                        </section>
                    </div>
                </div>
            </div>
        </main>
    )
}

export default UserProfile