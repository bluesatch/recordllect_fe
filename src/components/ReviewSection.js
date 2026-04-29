import { useState, useEffect, useCallback } from "react"
import { useAuth } from "../context/AuthContext.js"
import { api } from "../services/api.js"

import StarRating from "./StarRating.js"
import ReviewCard from "./ReviewCard.js"

/**
 * ReviewSection - Ratings and reviews for an album 
 * 
 * Props: 
 * - albumId: the album's ID
 */

const ReviewSection =({ albumId})=> {

    const { user, isAuthenticated } = useAuth()

    // STATE
    const [ratingStats, setRatingsStats] = useState(null)
    const [userRating, setUserRating] = useState(null)
    const [reviews, setReviews] = useState([])
    const [loading, setLoading] = useState(true)
    const [reviewBody, setReviewBody] = useState('')
    const [submittingReview, setSubmittingReview] = useState(false)
    const [showReviewForm, setShowReviewForm] = useState(false)
    const [error, setError] = useState(null)

    const hasUserReviewed = reviews.some(r => r.users_id === user?.users_id)

    // useCallback
    const fetchRatingsAndReviews = useCallback(async ()=> {
        setLoading(true)
        setError(null)

        try {
            const [ratingsData, reviewsData] = await Promise.all([
                api.get(`/albums/${albumId}/ratings`),
                api.get(`/albums/${albumId}/reviews`)
            ])

            setRatingsStats(ratingsData.stats)
            setUserRating(ratingsData.user_rating)
            setReviews(reviewsData.reviews || [])
        } catch (err) {
            setError('Failed to load ratings and reviews.')
        } finally {
            setLoading(false)
        }
    }, [albumId])

    // useEffect
    useEffect(()=> {
        fetchRatingsAndReviews()
    }, [fetchRatingsAndReviews])

    // Handlers 
    const handleRate = async (rating)=> {
        if (!isAuthenticated) return 

        try {
            if (userRating) {
                await api.put(`/albums/${albumId}/ratings`, { rating })
            } else {
                await api.post(`/albums/${albumId}/ratings`, { rating })
            }

            fetchRatingsAndReviews()
        } catch (err) {
            console.error('Failed to rate album:', err)
        }
    }

    const handleRemoveRating = async ()=> {
        try {
            await api.delete(`/albums/${albumId}/ratings`)
            fetchRatingsAndReviews()
        } catch (err) {
            console.error('Failed to remove rating:', err)
        }
    }

    const handleSubmitReview = async (e)=> {
        e.preventDefault() 
        if (!reviewBody.trim()) return 

        setSubmittingReview(true) 

        try {
            await api.post(`/albums/${albumId}/reviews`, { body: reviewBody})
            setReviewBody('')
            setShowReviewForm(false)
            fetchRatingsAndReviews()
        } catch (err) {
            console.error('Failed to submit review:', err)
        } finally {
            setSubmittingReview(false)
        }
    }

    if (loading) {
        return (
            <div className="text-center mt-3">
                <p>Loading ratings and reviews...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="alert alert-danger" role='alert'>
                {error}
            </div>
        )
    }

    return (
        <section aria-label='Ratings and reviews' className="mt-4">
            <h3 className="mb-4">Ratings & Reviews</h3>

            {/* Ratings stats */}
            <div className="card mb-4">
                <div className="card-body">
                    <div className="row align-items-center">

                        {/* Average rating */}
                        <div className="col-md-3 text-center mb-3 mb-md-0">
                            <h2 className="display-4 mb-0">{ratingStats?.average_rating || '-'}</h2>
                            <StarRating 
                                rating={Math.round(ratingStats?.average_rating || 0)}
                                readOnly={true}
                                size='sm'
                            />
                            <p className="text-muted mb-0" style={{ fontSize: '0.8rem'}}>
                                {ratingStats?.total_ratings || 0} rating{ratingStats?.total_ratings !== 1 ? 's' : ''}
                            </p>
                        </div>

                        {/* Rating breakdown */}
                        <div className="col-md-5 mb-3 mb-md-0">
                            {[5, 4, 3, 2, 1].map(star => {
                                const count = ratingStats?.[['one', 'two', 'three', 'four', 'five'][star - 1]] || 0
                                const total = ratingStats?.total_ratings || 1
                                const pct = Math.round((count / total) * 100)

                                return (
                                    <div key={star} className="d-flex align-items-center gap-2 mb-1">
                                        <span style={{ fontSize: '0.8rem', width: '20px'}}>{star}</span>
                                        <span style={{ fontSize: '0.8rem', }}>🎵</span>
                                        <div className="progress flex-grow-1" style={{ height: '8px' }}>
                                            <div 
                                                className="progress-bar bg-warning"
                                                style={{ width: `${pct}%` }}
                                                aria-valuenow={pct}
                                                aria-valuemin={0}
                                                aria-valuemax={100}
                                            />
                                        </div>
                                        <span className='text-muted' style={{ fontSize: '0.8rem', width: '24px' }}>
                                            {count}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>

                        {/* User rating */}
                        <div className="col-md-4 text-center">
                            {isAuthenticated ? (
                                <div>
                                    <p className="mb-2" style={{ fontSize: '0.85rem' }}>
                                        {userRating ? 'Your rating:' : 'Rate this album:'}
                                    </p>
                                    <StarRating 
                                        rating={userRating?.rating || 0}
                                        onRate={handleRate}
                                        readOnly={false}
                                        size='lg'
                                    />
                                    {userRating && (
                                        <button 
                                            className="btn btn-link btn-sm text-muted text-decoration-none mt-1"
                                            onClick={handleRemoveRating}
                                            style={{ fontSize: '0.8rem' }}
                                        >
                                            Remove rating
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>
                                    Log in to rate this album
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Reviews Section */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="mb-0">
                    Reviews 
                    {reviews.length > 0 && (
                        <span className="text-muted fs-6 ms-2">{reviews.length}</span>
                    )}
                </h4>
                {isAuthenticated && !hasUserReviewed && (
                    <button 
                        className="btn btn-outline-primary btn-sm"
                        onClick={()=> setShowReviewForm(prev => !prev)}
                    >
                        {showReviewForm ? 'Cancel' : 'Write a Review'}
                    </button>
                )}
            </div>

            {/* Review form */}
            {showReviewForm && (
                <div className="card mb-4">
                    <div className="card-body">
                        <form onSubmit={handleSubmitReview}>
                            <div className="mb-2">
                                <label className="form-label" htmlFor="review-body">Your Review</label>
                                <textarea 
                                    className="form-control"
                                    id="review-body"
                                    rows={4}
                                    value={reviewBody}
                                    onChange={e => setReviewBody(e.target.value)}
                                    placeholder="Share your thoughts on this album..."
                                    maxLength={350}
                                    aria-label='Write your review'
                                />
                                <div className="form-text text-end">
                                    {reviewBody.length}/350
                                </div>
                            </div>
                            <div className="d-flex gap-2">
                                <button 
                                    type="submit"
                                    className="btn btn-primary btn-sm"
                                    disabled={submittingReview || !reviewBody.trim()}
                                    aria-busy={submittingReview}
                                >
                                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                                </button>
                                <button 
                                    type='button'
                                    className="btn btn-outline-secondary btn-sm"
                                    onClick={()=> {
                                        setShowReviewForm(false)
                                        setReviewBody('')
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Reviews list */}
            {reviews.length === 0 ? (
                <div className="text-center mt-3">
                    <p className="text-muted">
                        No reviews yet. {isAuthenticated && !hasUserReviewed && ' Be the first to review this album!'}
                    </p>
                </div>
            ) : (
                <div>
                    {reviews.map(review => (
                        <ReviewCard 
                            key={review.review_id}
                            review={review}
                            onReviewUpdated={fetchRatingsAndReviews}
                        />
                    ))}
                </div>
            )}

            {/* close section */}
        </section>
    )

    // close ReviewSection
}

export default ReviewSection