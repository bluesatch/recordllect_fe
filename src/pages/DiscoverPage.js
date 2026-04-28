import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext.js"
import { api } from "../services/api.js"
import UserCard from "../components/UserCard.js"

/**
 * DiscoverPage - Find and follow other users 
 * Route: /discover 
 * 
 * Features: 
 * - Search by username
 * - Filter by city, state, country
 * - Filter by genre interests (multi-select)
 * - Follow/Unfollow directly from results
 */

const DiscoverPage =()=> {

    const { isAuthenticated, loading: authLoading } = useAuth()
    const navigate = useNavigate()

    // STATE
    const [users, setUsers] = useState([])
    const [genres, setGenres] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [hasSearched, setHasSearched] = useState(false)

    // Search state 
    const [searchInput, setSearchInput] = useState('')
    const [search, setSearch] = useState('')
    const [city, setCity] = useState('')
    const [state, setState] = useState('')
    const [country, setCountry] = useState('')
    const [selectedGenres, setSelectedGenres] = useState([])

    // USEEFFECT
    // Redirect if not authenticated 
    useEffect(()=> {
        if (!authLoading && !isAuthenticated) {
            navigate('/login')
        }
    }, [isAuthenticated, authLoading, navigate])

    // Fetch genres for filters 
    useEffect(()=> {
        const fetchGenres = async ()=> {
            try {
                const data = await api.get('/genres')
                setGenres(data.genres || [])
            } catch (err) {
                console.error('Failed to load genres:', err)
            }
        }
        fetchGenres()
    }, [])

    // USECALLBACK 
    const fetchUsers = async ()=> {
        setLoading(true)
        setError(null)
        setHasSearched(true)

        try {
            
            const params = new URLSearchParams()

            if (search) params.append('search', search)
            if (city) params.append('city', city)
            if (state) params.append('state', state)
            if (country) params.append('country', country)
            if (selectedGenres.length > 0) {
                params.append('genres', selectedGenres.join(','))
            }

            const data = await api.get(`/users/search?${params.toString()}`)
            setUsers(data.users || [])
        } catch (err) {
            setError('Failed to search users. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = async (e)=> {
        e.preventDefault()
        setSearch(searchInput)
        setHasSearched(true)
        await fetchUsers()
    }

    // Re-fetch when filters change 
    // useEffect(()=> {
    //     if (hasSearched) {
    //         fetchUsers()
    //     }
    // }, [fetchUsers])

    // const handleCityChange =(e)=> {
    //     setCity(e.target.value)
    //     setHasSearched(true)
    // }

    // const handleStateChange =(e)=> {
    //     setState(e.target.value)
    //     setHasSearched(true)
    // }

    // const handleCountryChange =(e)=> {
    //     setCountry(e.target.value)
    //     setHasSearched(true)
    // }

    const handleGenreToggle = async (genreId)=> {

        const updated = selectedGenres.includes(genreId)
            ? selectedGenres.filter(id => id !== genreId)
            : [...selectedGenres, genreId]


        setSelectedGenres(updated)
        setHasSearched(true)

        // Fetch with updated genres directly since state update is async 
        try {
            setLoading(true)
            const params = new URLSearchParams()
            if (search) params.append('search', search)
            if (city) params.append('city', city)
            if (state) params.append('state', state)
            if (country) params.append('country', country)
            if (updated.length > 0) params.append('genres', updated.join(','))
            
            const data = await api.get(`/users/search?${params.toString()}`)
            setUsers(data.users || [])
        } catch (err) {
            setError('Failed to search users.')
        } finally {
            setLoading(false)
        }
    }

    const handleClearFilters =()=> {
        setSearch('')
        setSearchInput('')
        setCity('')
        setState('')
        setCountry('')
        setSelectedGenres([])
        setUsers([])
        setHasSearched(false)
    }

    const hasActiveFilters = search || city || state || country || selectedGenres.length > 0

    if (authLoading) {
        return (
            <div className="container mt-5 text-center">
                <p>Loading...</p>
            </div>
        )
    }

    return (
        <main className="main">
            <div className="container mt-4">
                <h2 className="mb-4">Discover</h2>
                <div className="row">

                    {/* Filters sidebar */}
                    <aside className="col-md-3 mb-4">
                        <div className="card">
                            <div className="card-body">
                                <h3 className="h6 mb-3">Filter Users</h3>

                                <form onSubmit={handleSearch}>

                                    {/* Username search */}
                                    <div className="mb-3">
                                        <label className="form-label" htmlFor="search">Username</label>
                                        <div className="d-flex gap-2">
                                            <input 
                                                type='text'
                                                className="form-control form-control-sm"
                                                id='search'
                                                value={searchInput}
                                                onChange={e => setSearchInput(e.target.value)}
                                                placeholder="Search username..."
                                                aria-label='Search by username'
                                            />
                                            <button 
                                                type='submit'
                                                className="btn btn-primary btn-sm"
                                                aria-label='Search'
                                            >
                                                Go
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {/* Location filters */}
                                    <div className="mb-3">
                                        <label className="form-label" htmlFor="city">City</label>
                                        <input 
                                            type='text'
                                            className="form-control form-control-sm"
                                            id='city'
                                            value={city}
                                            onChange={e => setCity(e.target.value)}
                                            placeholder="City..."
                                            aria-label='Filter by city'
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label" htmlFor="state">State</label>
                                        <input 
                                            type='text'
                                            className="form-control form-control-sm"
                                            id='state'
                                            value={state}
                                            onChange={e => setState(e.target.value)}
                                            placeholder="State..."
                                            aria-label='Filter by state'
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label" htmlFor="country">Country</label>
                                        <input 
                                            type='text'
                                            className="form-control form-control-sm"
                                            id='country'
                                            value={country}
                                            onChange={e => setCountry(e.target.value)}
                                            placeholder="Country..."
                                            aria-label='Filter by country'
                                        />
                                    </div>
                                </form>

                                {/* Genre filter */}
                                <div className="mb-3">
                                    <label className="form-label">Genre Interests</label>
                                    <div className="d-flex flex-wrap gap-1">
                                        {genres.map(genre => {
                                            const isSelected = selectedGenres.includes(genre.genre_id)

                                            return (
                                                <button 
                                                    key={genre.genre_id}
                                                    type='button'
                                                    className={`btn btn-sm ${
                                                        isSelected
                                                            ? 'btn-primary'
                                                            : 'btn-outline-secondary'
                                                    }`}
                                                    onClick={()=> handleGenreToggle(genre.genre_id)}
                                                    aria-pressed={isSelected}
                                                    aria-label={`${isSelected ? 'Remove' : 'Add'} ${genre.genre_name} filter`}
                                                    style={{ fontSize: '0.75rem' }}
                                                >
                                                    {genre.genre_name}
                                                </button>
                                            )
                                        })}
                                    </div>
                                    {selectedGenres.length > 0 && (
                                        <p className="text-muted mt-1 mb-0">
                                            <small>
                                                {selectedGenres.length} genre{selectedGenres.length !== 1 ? 's' : ''} selected
                                            </small>
                                        </p>
                                    )}
                                </div>

                                {/* Clear filters */}
                                {hasActiveFilters && (
                                    <button 
                                        type='button'
                                        className="btn btn-outline-secondary btn-sm w-100"
                                        onClick={handleClearFilters}
                                    >
                                        Clear All Filters
                                    </button>
                                )}
                            </div>
                        </div>
                    </aside>
                    
                    {/* Results */}
                    <div className="col-md-9">

                        {!hasSearched && (
                            <div className="text-center mt-5">
                                <p className="text-muted">
                                    Use the filters to find users who share your music taste.
                                </p>
                            </div>
                        )}

                        {error && (
                            <div className="alert alert-danger" role='alert'>
                                {error}
                            </div>
                        )}

                        {loading ? (
                            <div className="text-center mt-4">
                                <p>Searching...</p>
                            </div>
                        ) : hasSearched && users.length === 0 ? (
                            <div className="text-center mt-4">
                                <p className="text-muted">No users found matching your filters.</p>
                                <button 
                                    className="btn btn-outline-secondary btn-sm"
                                    onClick={handleClearFilters}
                                >   
                                    Clear Filters
                                </button>
                            </div>
                        ) : (
                            <div className="row">
                                {users.map(user => (
                                    <div key={user.users_id} className="col-md-6 mb-3">
                                        <UserCard 
                                            user={user}
                                            showFollowButton={true}
                                            isFollowing={false}
                                            onFollowChange={(userId, following) => {
                                                if (following) {
                                                    setUsers(prev => prev.filter(u => u.users_id !== userId))
                                                }
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Cose row */}
                </div>

                {/* close container */}
            </div>
        </main>
    )
}

export default DiscoverPage