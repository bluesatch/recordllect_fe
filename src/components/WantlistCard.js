import { Link } from 'react-router-dom'

/**
 * WantlistCard - Reusable wantlist item card
 *
 * Props:
 * - item: wantlist item object from API
 * - isOwnProfile: boolean — shows edit/remove controls if true
 * - onRemove: callback to remove item
 * - onEdit: callback to edit item
 */

const WantlistCard = ({ item, isOwnProfile, onRemove, onEdit }) => {

    const priorityBadge = {
        high: 'bg-danger',
        medium: 'bg-warning text-dark',
        low: 'bg-secondary'
    }

    return (
        <div className='card h-100'>
            {item.album_image_url ? (
                <img
                    src={item.album_image_url}
                    alt={`${item.title} album cover`}
                    className='card-img-top'
                    style={{ objectFit: 'cover', height: '180px' }}
                />
            ) : (
                <div
                    className='bg-secondary d-flex align-items-center justify-content-center'
                    style={{ height: '180px' }}
                    aria-label='No album cover available'
                >
                    <span className='text-white'>No Image</span>
                </div>
            )}
            <div className='card-body'>
                <div className='d-flex justify-content-between align-items-start mb-1'>
                    <h3 className='card-title h6 mb-0'>{item.title}</h3>
                    <span className={`badge ms-2 ${priorityBadge[item.priority]}`}>
                        {item.priority}
                    </span>
                </div>
                <p className='card-text text-muted mb-1'>
                    {item.performer_name}
                </p>
                <p className='card-text text-muted mb-1'>
                    <small>{item.release_year || '—'} | {item.format_name}</small>
                </p>
                {item.notes && (
                    <p className='card-text mb-0'>
                        <small className='fst-italic'>"{item.notes}"</small>
                    </p>
                )}
            </div>
            <footer className='card-footer d-flex gap-2'>
                <Link
                    to={`/albums/${item.album_id}`}
                    className='btn btn-outline-primary btn-sm flex-grow-1'
                >
                    View
                </Link>
                {isOwnProfile && (
                    <>
                        <button
                            className='btn btn-outline-secondary btn-sm'
                            onClick={() => onEdit(item)}
                            aria-label={`Edit ${item.title} wantlist entry`}
                        >
                            Edit
                        </button>
                        <button
                            className='btn btn-outline-danger btn-sm'
                            onClick={() => onRemove(item.wantlist_id)}
                            aria-label={`Remove ${item.title} from wantlist`}
                        >
                            ✕
                        </button>
                    </>
                )}
            </footer>
        </div>
    )
}

export default WantlistCard