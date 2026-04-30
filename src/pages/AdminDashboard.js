import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.js'
import { api } from '../services/api.js'

/**
 * AdminDashboard - Admin only page
 * Route: /admin
 *
 * Features:
 * - Report stats
 * - Pending reports list
 * - Resolve or dismiss reports
 * - Delete reported albums
 */

const AdminDashboard = () => {

    const { user, isAuthenticated, loading: authLoading } = useAuth()
    const navigate = useNavigate()

    const [stats, setStats] = useState(null)
    const [reports, setReports] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [statusFilter, setStatusFilter] = useState('pending')
    const [actionLoading, setActionLoading] = useState(null)

    // Redirect if not admin
    useEffect(() => {
        if (!authLoading) {
            if (!isAuthenticated) {
                navigate('/login')
                return
            }
            if (user?.is_admin !== 1) {
                navigate('/')
            }
        }
    }, [isAuthenticated, authLoading, user, navigate])

    const fetchData = async () => {
        setLoading(true)
        setError(null)

        try {
            const [statsData, reportsData] = await Promise.all([
                api.get('/admin/reports/stats'),
                api.get(`/admin/reports?status=${statusFilter}`)
            ])

            setStats(statsData.stats)
            setReports(reportsData.reports || [])
        } catch (err) {
            setError('Failed to load reports.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (isAuthenticated && user?.is_admin === 1) {
            fetchData()
        }
    }, [isAuthenticated, user, statusFilter])

    const handleResolve = async (reportId, status) => {
        setActionLoading(reportId)

        try {
            await api.put(`/admin/reports/${reportId}`, { status })
            setReports(prev => prev.filter(r => r.report_id !== reportId))
        } catch (err) {
            console.error('Failed to update report:', err)
        } finally {
            setActionLoading(null)
        }
    }

    const handleDeleteAlbum = async (albumId, reportId) => {
        if (!window.confirm('Are you sure you want to delete this album? This cannot be undone.')) return

        setActionLoading(reportId)

        try {
            await api.delete(`/admin/albums/${albumId}`)
            // Also resolve the report
            await api.put(`/admin/reports/${reportId}`, { status: 'resolved' })
            setReports(prev => prev.filter(r => r.report_id !== reportId))
        } catch (err) {
            console.error('Failed to delete album:', err)
        } finally {
            setActionLoading(null)
        }
    }

    if (authLoading || loading) {
        return (
            <div className='container mt-5 text-center'>
                <p>Loading...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className='container mt-5'>
                <div className='alert alert-danger' role='alert'>{error}</div>
            </div>
        )
    }

    return (
        <main>
            <div className='container mt-4'>
                <div className='d-flex align-items-center gap-3 mb-4'>
                    <h2 className='mb-0'>Admin Dashboard</h2>
                    <span className='badge bg-warning text-dark'>Admin</span>
                </div>

                {/* Stats */}
                {stats && (
                    <div className='row mb-4'>
                        <div className='col-md-3 mb-3'>
                            <div className='card text-center p-3 border-warning'>
                                <h3 className='display-6 text-warning'>
                                    {stats.pending || 0}
                                </h3>
                                <p className='text-muted mb-0'>Pending</p>
                            </div>
                        </div>
                        <div className='col-md-3 mb-3'>
                            <div className='card text-center p-3 border-success'>
                                <h3 className='display-6 text-success'>
                                    {stats.resolved || 0}
                                </h3>
                                <p className='text-muted mb-0'>Resolved</p>
                            </div>
                        </div>
                        <div className='col-md-3 mb-3'>
                            <div className='card text-center p-3'>
                                <h3 className='display-6 text-muted'>
                                    {stats.dismissed || 0}
                                </h3>
                                <p className='text-muted mb-0'>Dismissed</p>
                            </div>
                        </div>
                        <div className='col-md-3 mb-3'>
                            <div className='card text-center p-3'>
                                <h3 className='display-6'>
                                    {stats.total || 0}
                                </h3>
                                <p className='text-muted mb-0'>Total</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filter tabs */}
                <div className='d-flex gap-2 mb-4'>
                    {['pending', 'resolved', 'dismissed'].map(status => (
                        <button
                            key={status}
                            className={`btn btn-sm ${
                                statusFilter === status
                                    ? 'btn-primary'
                                    : 'btn-outline-secondary'
                            }`}
                            onClick={() => setStatusFilter(status)}
                            aria-pressed={statusFilter === status}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Reports list */}
                {reports.length === 0 ? (
                    <div className='text-center mt-4'>
                        <p className='text-muted'>
                            No {statusFilter} reports.
                        </p>
                    </div>
                ) : (
                    <div>
                        {reports.map(report => (
                            <div key={report.report_id} className='card mb-3'>
                                <div className='card-body'>
                                    <div className='row align-items-center'>

                                        {/* Album info */}
                                        <div className='col-md-2 mb-3 mb-md-0'>
                                            {report.album_image_url ? (
                                                <img
                                                    src={report.album_image_url}
                                                    alt={report.album_title}
                                                    className='img-fluid rounded'
                                                    style={{ maxHeight: '80px', objectFit: 'cover' }}
                                                />
                                            ) : (
                                                <div
                                                    className='bg-secondary rounded d-flex align-items-center justify-content-center'
                                                    style={{ height: '80px' }}
                                                >
                                                    <span className='text-white'>No Image</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Report details */}
                                        <div className='col-md-6 mb-3 mb-md-0'>
                                            <h5 className='mb-1'>
                                                <Link to={`/albums/${report.album_id}`}>
                                                    {report.album_title}
                                                </Link>
                                            </h5>
                                            <p className='text-muted mb-1'>
                                                <small>{report.performer_name}</small>
                                            </p>
                                            <p className='mb-1'>
                                                <small>
                                                    <strong>Reported by:</strong> @{report.reporter_username}
                                                </small>
                                            </p>
                                            <p className='mb-1'>
                                                <small>
                                                    <strong>Reason:</strong> {report.reason}
                                                </small>
                                            </p>
                                            <p className='text-muted mb-0'>
                                                <small>
                                                    {new Date(report.created_at).toLocaleString()}
                                                </small>
                                            </p>
                                        </div>

                                        {/* Actions */}
                                        {statusFilter === 'pending' && (
                                            <div className='col-md-4 d-flex flex-column gap-2'>
                                                <button
                                                    className='btn btn-danger btn-sm'
                                                    onClick={() => handleDeleteAlbum(report.album_id, report.report_id)}
                                                    disabled={actionLoading === report.report_id}
                                                    aria-busy={actionLoading === report.report_id}
                                                >
                                                    Delete Album
                                                </button>
                                                <button
                                                    className='btn btn-success btn-sm'
                                                    onClick={() => handleResolve(report.report_id, 'resolved')}
                                                    disabled={actionLoading === report.report_id}
                                                    aria-busy={actionLoading === report.report_id}
                                                >
                                                    Resolve — Keep Album
                                                </button>
                                                <button
                                                    className='btn btn-outline-secondary btn-sm'
                                                    onClick={() => handleResolve(report.report_id, 'dismissed')}
                                                    disabled={actionLoading === report.report_id}
                                                    aria-busy={actionLoading === report.report_id}
                                                >
                                                    Dismiss
                                                </button>
                                            </div>
                                        )}

                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    )
}

export default AdminDashboard