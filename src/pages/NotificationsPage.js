import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.js'
import { api } from '../services/api.js'
import { getSocket } from '../services/socket.js'
import NotificationCard from '../components/NotificationCard.js'
import Pagination from '../components/Pagination.js'

/**
 * NotificationsPage - Dedicated notifications page
 * Route: /notifications
 */

const NotificationsPage = () => {

    const { isAuthenticated, loading: authLoading } = useAuth()
    const navigate = useNavigate()

    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [unread, setUnread] = useState(0)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    const LIMIT = 20

    // Redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/login')
        }
    }, [isAuthenticated, authLoading, navigate])

    const fetchNotifications = useCallback(async () => {
        setLoading(true)
        setError(null)

        try {
            const data = await api.get(
                `/notifications?page=${page}&limit=${LIMIT}`
            )
            setNotifications(data.notifications || [])
            setUnread(data.unread || 0)
            setTotalPages(data.totalPages || 1)
        } catch (err) {
            setError('Failed to load notifications.')
        } finally {
            setLoading(false)
        }
    }, [page])

    useEffect(() => {
        if (isAuthenticated) {
            fetchNotifications()
        }
    }, [fetchNotifications, isAuthenticated])

    // Listen for real-time notifications
    useEffect(() => {
        const socket = getSocket()
        if (!socket) return

        const handleNotification = (notification) => {
            setNotifications(prev => [notification, ...prev])
            setUnread(prev => prev + 1)
        }

        socket.on('notification', handleNotification)

        return () => {
            socket.off('notification', handleNotification)
        }
    }, [])

    const handleRead = async (notificationId) => {
        try {
            await api.put(`/notifications/${notificationId}/read`)
            setNotifications(prev =>
                prev.map(n =>
                    n.notification_id === notificationId
                        ? { ...n, is_read: 1 }
                        : n
                )
            )
            setUnread(prev => Math.max(0, prev - 1))
        } catch (err) {
            console.error('Failed to mark as read:', err)
        }
    }

    const handleDelete = async (notificationId) => {
        try {
            await api.delete(`/notifications/${notificationId}`)
            setNotifications(prev =>
                prev.filter(n => n.notification_id !== notificationId)
            )
        } catch (err) {
            console.error('Failed to delete notification:', err)
        }
    }

    const handleMarkAllRead = async () => {
        try {
            await api.put('/notifications/read-all')
            setNotifications(prev =>
                prev.map(n => ({ ...n, is_read: 1 }))
            )
            setUnread(0)
        } catch (err) {
            console.error('Failed to mark all as read:', err)
        }
    }

    if (authLoading) {
        return (
            <div className='container mt-5 text-center'>
                <p>Loading...</p>
            </div>
        )
    }

    return (
        <main>
            <div className='container mt-4'>
                <div className='row justify-content-center'>
                    <div className='col-md-8'>

                        {/* Header */}
                        <div className='d-flex justify-content-between align-items-center mb-4'>
                            <div className='d-flex align-items-center gap-2'>
                                <h2 className='mb-0'>Notifications</h2>
                                {unread > 0 && (
                                    <span className='badge bg-primary rounded-pill'>
                                        {unread}
                                    </span>
                                )}
                            </div>
                            {unread > 0 && (
                                <button
                                    className='btn btn-outline-secondary btn-sm'
                                    onClick={handleMarkAllRead}
                                >
                                    Mark all as read
                                </button>
                            )}
                        </div>

                        {error && (
                            <div className='alert alert-danger' role='alert'>
                                {error}
                            </div>
                        )}

                        {loading ? (
                            <div className='text-center mt-4'>
                                <p>Loading notifications...</p>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className='text-center mt-5'>
                                <p className='text-muted'>No notifications yet.</p>
                            </div>
                        ) : (
                            <>
                                {notifications.map(notification => (
                                    <NotificationCard
                                        key={notification.notification_id}
                                        notification={notification}
                                        onRead={handleRead}
                                        onDelete={handleDelete}
                                    />
                                ))}
                                <Pagination
                                    page={page}
                                    totalPages={totalPages}
                                    onPageChange={setPage}
                                    label='Notifications pagination'
                                />
                            </>
                        )}

                    </div>
                </div>
            </div>
        </main>
    )
}

export default NotificationsPage