import { useState } from "react"
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.js'
import { api } from "../services/api.js"

import StarRating from "./StarRating.js"

/**
 * ReviewCard - Single review display 
 * 
 * Props: 
 * - review: review object from API 
 * - onReviewUpdated: callback after edit or delete
 * 
 */

const ReviewCard =({ review, onReviewUpdated })=> {

    const { user, isAuthenticated } = useAuth() 

    // STATE 
    const [isEditing, setIsEditing] = useState(false)
    const [editBody, setEditBody] = useState(review.body)
    const [saving, setSaving] = useState(false)
    const [helpful, setHelpful] = useState(!!review.marked_helpful)
    const [helpfulCount, setHelpfulCount] = useState(review.helpful_count || 0)

    const isOwnReview = isAuthenticated && user?.users_id === review.users_id 

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

    // HANDLERS
    const handleSaveEdit = async ()=> {
        if (!editBody.trim()) return 
        setSaving(true)

        try {
            await api.put(`/reviews/${review.review_id}`, { body: editBody})
            setIsEditing(false)
            onReviewUpdated?.()
        } catch (err) {
            console.error('Failed to update review:', err)
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async ()=> {
        if (!window.confirm('Are you sure you want to delete this review?')) return 

        try {
            await api.delete(`/reviews/${review.review_id}`)
            onReviewUpdated?.()
        } catch (err) {
            console.error('Failed to delete review:', err)
        }
    }

    const handleHelpful = async ()=> {
        if (!isAuthenticated || isOwnReview) return 

        try {
            if (helpful) {
                await api.delete(`/reviews/${review.review_id}/helpful`)
                setHelpful(false)
                setHelpfulCount(prev => prev - 1)
            } else {
                await api.post(`/reviews/${review.review_id}/helpful`)
                setHelpful(true)
                setHelpfulCount(prev => prev + 1)
            }
        } catch (err) {
            console.error('Failed to mark helpful:', err)
        }
    }

    return (
        <div className="card mb-3">
            <div className="card-body">

                {/* Review header */}
                <div className="d-flex justify-content-between align-items-start mb-2">
                    <div className="d-flex align-items-center gap-2">

                        {/* Avatar */}
                        {review.profile_image_url ? (
                            <img 
                                src={review.profile_image_url}
                                alt={`@${review.username}`}
                                className="rounded-circle"
                                style={{ width: '36px', height: '36px', objectFit: 'cover'}}
                            />
                        ) : (
                            <div 
                                className="rounded-circle bg-secondary d-flex align-items-center justify-content-center"
                                style={{ width: '36px', height: '36px'}}
                                aria-hidden='true'
                            >
                                <span className="text-white" style={{ fontSize: '0.75rem'}}>
                                    {review.username?.slice(0, 2).toUpperCase()}
                                </span>
                            </div>
                        )}
                        <div>
                            <Link 
                                to={`/users/${review.users_id}`}
                                className="text-decoration-none fw-semibold"
                                style={{ fontSize: '0.9rem'}}
                            >
                                @{review.username}
                            </Link>
                            <p className="text-muted mb-0" style={{ fontSize: '0.75rem'}}>
                                {formatTimeAgo(review.created_at)}
                                {review.updated_at !== review.created_at && (
                                    <span className="ms-1">(edited)</span>
                                )}
                            </p>
                        </div>
                    </div>
                    {/* Rating */}
                    {review.rating && (
                        <StarRating 
                            rating={review.rating}
                            readOnly={true}
                            size='sm'
                        />
                    )}
                </div>
                {/* Review body */}
                {isEditing ? (
                    <div className="mb-2">
                        <textarea 
                            className="form-control form-control-sm mb-2"
                            rows={3}
                            value={editBody}
                            onChange={e => setEditBody(e.target.value)}
                            maxLength={350}
                            aria-label='Edit review'
                        />
                        <div className="form-text mb-2">
                            {editBody.length}/350
                        </div>
                        <div className="d-flex gap-2">
                            <button 
                                className="btn btn-primary btn-sm"
                                onClick={handleSaveEdit}
                                disabled={saving || !editBody.trim()}
                                aria-busy={saving}
                            >
                                {saving ? 'Saving...' : 'Save'}
                            </button>
                            <button 
                                className="btn btn-outline-secondary btn-sm"
                                onClick={()=> {
                                    setIsEditing(false)
                                    setEditBody(review.body)
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="mb-2" style={{ fontSize: '0.9rem' }}>
                        {review.body}
                    </p>
                )}

                {/* Footer actions */}
                <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-3">

                        {/* Helpful button */}
                        {isAuthenticated && !isOwnReview && (
                            <button 
                                className={`btn btn-link btn-sm p-0 text-decoration-none ${
                                    helpful ? 'text-success' : 'text-muted'
                                }`}
                                onClick={handleHelpful}
                                aria-pressed={helpful}
                                aria-label={helpful ? 'Unmark as helpful' : 'Mark as helpful'}
                                style={{ fontSize: '0.8rem' }}
                            >
                                👍 Helpful? { helpfulCount > 0 && `(${helpfulCount})`}
                            </button>
                        )}

                        {/* Helpful count - read only for own review */}
                        {isOwnReview && helpfulCount > 0 && (
                            <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                                👍 {helpfulCount} found this helpful
                            </span>
                        )}
                    </div>

                    {/* Edit/Delete */}
                    {isOwnReview && !isEditing && (
                        <div className="d-flex gap-2">
                            <button 
                                className="btn btn-link btn-sm p-0 text-muted text-decoration-none"
                                onClick={()=> setIsEditing(true)}
                                style={{ fontSize: '0.8rem' }}
                            >
                                Edit 
                            </button>
                            <button 
                                className="btn btn-link btn-sm p-0 text-danger text-decoration-none"
                                onClick={handleDelete}
                                style={{ fontSize: '0.8rem' }}
                            >
                                Delete
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )

}

export default ReviewCard