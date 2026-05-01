import { Link } from 'react-router-dom'

/**
 * NotificationCard - Single notification display
 * 
 * Props:
 * - notification: notification object from API 
 * - onRead: callback when notification is marked read 
 * - onDelete: callback when notification is deleted
 */

const NotificationCard = ({ notification, onRead, onDelete })=> {

    const formatTimeAgo = (timestamp)=> {
        const now = new Date()
        const then = new Date(timestamp)
        const seconds = Math.floor((now - then) / 1000)

        if (seconds < 60) return 'just now'
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
        return then.toLocaleDateString()
    }

    const getNotificationLink =()=> {
        switch (notification.type) {
            case 'like_post':
            case 'comment':
                return `/posts/${notification.reference_id}`
            case 'like_comment':
            case 'reply':
                return `/posts/${notification.reference_id}`
            case 'follow':
                return `/users/${notification.sender_id}`
            case 'repost':
                return `/posts/${notification.reference_id}`
            case 'wantlist_match':
                return `/users/${notification.sender_id}/wantlist`
            default:
                return `/notifications`
        }
    }

    const getNotificationIcon =()=> {
        switch (notification.type) {
            case 'like_post':
            case 'like_comment':
                return '♥'
            case 'comment':
                return '💬'
            case 'reply':
                return '↩'
            case 'follow':
                return '👤'
            case 'repost':
                return '🔁'
            case 'wantlist_match':
                return '🎵'
            default:
                return '🔔'
        }
    }

    return (
        <div 
            className={`card mb-2 ${
                !notification.is_read ? 'border-primary' : ''
            }`}
            style={{ backgroundColor: notification.is_read? '' : '#f0f7ff'
            }}
        >
            <div className='card-body py-2'>
                <div className='d-flex align-items-center gap-3'>
                    {/* Icon */}
                    <span style={{ fontSize: '1.2rem', flexShrink: 0}}>
                        {getNotificationIcon()}
                    </span>

                    {/* Sender avatar */}
                    {notification.sender_image ? (
                        <img 
                            src={notification.sender_image}
                            alt={`@${notification.sender_username}`}
                            className='rounded-circle flex-shrink-0'
                            style={{ width: '36px', height: '36px', objectFit: 'cover'}}
                        />
                    ) : (
                        <div 
                            className='rounded-circle bg-secondary d-flex align-items-center justify-content-center flex-shrink-0'
                            style={{ width: '36px', height: '36px' }}
                            aria-hidden='true'
                        >
                            <span className='text-white' style={{ fontSize: '0.75rem' }}>
                                {notification.sender_username?.slice(0, 2).toUpperCase()}
                            </span>
                        </div>
                    )}

                    {/* Message */}
                    <div className='flex-grow-1'>
                        <Link 
                            to={getNotificationLink()}
                            className='text-decoration-none'
                            onClick={()=> !notification.is_read && onRead?.(notification.notification_id)}
                        >
                            <p className='mb-0' style={{ fontSize: '0.75rem' }}>
                                {notification.message}
                            </p>
                        </Link>
                        <p className='text-muted mb-0' style={{ fontSize: '0.75rem' }}>
                            {formatTimeAgo(notification.created_at)}
                        </p>
                    </div>

                    {/* Actions */}
                    <div className='d-flex gap-2 flex-shrink-0'>
                        {!notification.is_read && (
                            <button 
                                className='btn btn-link btn-sm-0 p-0 text-primary text-decoration-none'
                                onClick={()=> onRead?.(notification.notification_id)}
                                aria-label='Mark as Read'
                                style={{ fontSize: '0.75rem'}}
                            >
                                ✓
                            </button>
                        )}
                        <button 
                            className='btn btn-link btn-sm p-0 text-muted text-decoration-none'
                            onClick={()=> onDelete?.(notification.notification_id)}
                            aria-label='Delete notification'
                            style={{ fontSize: '0.75rem'}}
                        >
                            x
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )

}

export default NotificationCard