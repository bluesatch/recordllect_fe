import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { api } from "../services/api.js"

/**
 * 
 * LabelDetail - Single label view
 * 
 * Displays: 
 * - Label info (name, country, founded year, status, website)
 * - All albums associated with the label
 */

const LabelDetail =()=> {

    const { id } = useParams()
    const navigate = useNavigate()

    // STATE
    const [label, setLabel] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [sort, setSort] = useState('year_asc')

    useEffect(()=> {
        const fetchLabel = async ()=> {
            setLoading(true)
            setError(null)

            try {
                const data = await api.get(`/labels/${id}?sort=${sort}`)

                if (data.message) {
                    setError(data.message)
                    return
                }

                setLabel(data)
            } catch (err) {
                setError('Failed to load label. Please try again.')
            } finally {
                setLoading(false)
            }
        }

        fetchLabel()
    }, [id, sort])

    const handleSortChange =(e)=> {
        setSort(e.target.value)
    }

    if (loading) {
        return (
            <div className='container mt-5 text-center'>
                <p>Loading label...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className='container mt-5'>
                <div className="alert alert-danger" role='alert'>
                    {error}
                </div>
                <button 
                    className='btn btn-outline-secondary'
                    onClick={()=> navigate(-1)}
                >
                    Go Back
                </button>
            </div>
        )
    }

    const albumRows = label.albums?.map(album => (
        <tr key={album.album_id}>
            <td>
                <Link to={`/albums/${album.album_id}`}>{album.title}</Link>
            </td>
            <td>
                <Link to={`/performers/${album.performer_id}`}>{album.performer_name}</Link>
            </td>
            <td>{album.release_year || '-'}</td>
            <td>{album.format_name}</td>
        </tr>
    ))

    return (
        <main className='main'>
            <div className='container mt-4'>
                {/* Back button */}
                <Link 
                    to='/labels'
                    className='btn btn-outline-secondary btn-sm mb-4'
                    aria-label='Back to labels'
                >
                    &larr; Back to Labels
                </Link>

                {/* Label header */}
                <section aria-label='Label inforamtion'>
                    <div className="card mb-4">
                        <div className='card-body'>
                            <div className='d-flex justify-content-between align-items-start'>
                                <h2 className='mb-3'>{label.label_name}</h2>
                                <span 
                                    className={`badge ${label.status === 'active' ? 'bg-success' : 'bg-secondary'}`}
                                >
                                    {label.status}
                                </span>
                            </div>
                            <table className='table table-borderless mb-0'>
                                <tbody>
                                    {label.country && (
                                        <tr>
                                            <th scope='row' className="text-muted" style={{ width: '140px'}}>
                                                Country
                                            </th>
                                            <td>{label.country}</td>
                                        </tr>
                                    )}
                                    {label.founded_year && (
                                        <tr>
                                            <th scope='row' className='text-muted'>
                                                Founded
                                            </th>
                                            <td>{label.founded_year}</td>
                                        </tr>
                                    )}
                                    {label.website_url && (
                                        <tr>
                                            <th scope='row' className="text-muted">
                                                Website
                                            </th>
                                            <td>
                                                <a 
                                                    href={label.website_url}
                                                    target='_blank'
                                                    rel='noreferrer'
                                                    aria-label={`Visit ${label.label_name} website`}
                                                >
                                                    {label.website_url}
                                                </a>
                                            </td>
                                        </tr>
                                    )}
                                    <tr>
                                        <th scope='row' className='text-muted'>
                                            Albums
                                        </th>
                                        <td>{label.albums?.length || 0}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                {/* Albums list */}
                <section aria-label='Label discography'>
                    <h3 className='mb-3'>Discography</h3>

                    <div className="d-flex align-items-center gap-2 mb-3">
                        <label className="form-label mb-0" htmlFor="label-sort">Sort By</label>
                        <select 
                            className="form-select form-select-sm"
                            id='label-sort'
                            name='sort'
                            value={sort}
                            onChange={handleSortChange}
                            aria-label='Sort discography'
                            style={{ width: 'auto'}}
                        >
                            <option value='year_asc'>Year - Oldest</option>
                            <option value='year_desc'>Year - Newest</option>
                            <option value='title_asc'>Title A-Z</option>
                            <option value='title_desc'>Title Z-A</option>
                        </select>
                    </div>

                    {!label.albums || label.albums.length === 0 ? (
                        <p className='text-muted'>No albums found for this label.</p>
                    ) : (
                        <div className='table-responsive'>
                            <table className='table table-hover' aria-label='Albums on this label'>
                                <thead>
                                    <tr>
                                        <th scope='col'>Title</th>
                                        <th scope='col'>Performer</th>
                                        <th scope='col'>Year</th>
                                        <th scope='col'>Format</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {albumRows}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>
        </main>
    )
}

export default LabelDetail