import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api.js'
import { useAuth } from '../context/AuthContext.js'

/**
 * CommentSection - Comments and replies for a post
 *
 * Props:
 * - postId: the post's ID
 * - comments: array of comment objects from parent
 * - onCommentsUpdate: callback to refresh comments
 */

const CommentSection = ({ postId, comments, onCommentsUpdate }) => {

    const { user, isAuthenticated } = useAuth()

    // STATE
    const [newComment, setNewComment] = useState('')
    const [submittingComment, setSubmittingComment] = useState(false)
    const [replyingTo, setReplyingTo] = useState(null)
    const [replyBody, setReplyBody] = useState('')
    const [submittingReply, setSubmittingReply] = useState(false)
    const [expandedReplies, setExpandedReplies] = useState({})

    // HELPER
    const formatTimeAgo = (timestamp) => {
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
    const handleAddComment = async (e) => {
        e.preventDefault()
        if (!newComment.trim()) return

        setSubmittingComment(true)

        try {
            await api.post(`/posts/${postId}/comments`, { body: newComment })
            setNewComment('')
            onCommentsUpdate?.()
        } catch (err) {
            console.error('Failed to add comment:', err)
        } finally {
            setSubmittingComment(false)
        }
    }

    const handleDeleteComment = async (commentId) => {
        try {
            await api.delete(`/comments/${commentId}`)
            onCommentsUpdate?.()
        } catch (err) {
            console.error('Failed to delete comment:', err)
        }
    }

    const handleLikeComment = async (comment) => {
        try {
            if (comment.liked_by_user) {
                await api.delete(`/comments/${comment.comment_id}/like`)
            } else {
                await api.post(`/comments/${comment.comment_id}/like`)
            }
            onCommentsUpdate?.()
        } catch (err) {
            console.error('Failed to like comment:', err)
        }
    }

    const handleAddReply = async (commentId) => {
        if (!replyBody.trim()) return

        setSubmittingReply(true)

        try {
            await api.post(`/comments/${commentId}/replies`, { body: replyBody })
            setReplyBody('')
            setReplyingTo(null)
            onCommentsUpdate?.()
        } catch (err) {
            console.error('Failed to add reply:', err)
        } finally {
            setSubmittingReply(false)
        }
    }

    const handleDeleteReply = async (replyId) => {
        try {
            await api.delete(`/replies/${replyId}`)
            onCommentsUpdate?.()
        } catch (err) {
            console.error('Failed to delete reply:', err)
        }
    }

    const toggleReplies = (commentId) => {
        setExpandedReplies(prev => ({
            ...prev,
            [commentId]: !prev[commentId]
        }))
    }

    const commentList = comments.map(comment => (
        <div key={comment.comment_id} className='mb-3'>

            {/* Comment */}
            <div className='d-flex gap-2'>

                {/* Avatar */}
                {comment.profile_image_url ? (
                    <img
                        src={comment.profile_image_url}
                        alt={`@${comment.username}`}
                        className='rounded-circle flex-shrink-0'
                        style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                    />
                ) : (
                    <div
                        className='rounded-circle bg-secondary d-flex align-items-center justify-content-center flex-shrink-0'
                        style={{ width: '32px', height: '32px' }}
                        aria-hidden='true'
                    >
                        <span className='text-white' style={{ fontSize: '0.7rem' }}>
                            {comment.username?.slice(0, 2).toUpperCase()}
                        </span>
                    </div>
                )}

                {/* Comment body */}
                <div className='flex-grow-1'>
                    <div className='bg-light rounded p-2'>
                        <div className='d-flex justify-content-between align-items-start'>
                            <Link
                                to={`/users/${comment.users_id}`}
                                className='text-decoration-none fw-semibold'
                                style={{ fontSize: '0.85rem' }}
                            >
                                @{comment.username}
                            </Link>
                            <span className='text-muted' style={{ fontSize: '0.75rem' }}>
                                {formatTimeAgo(comment.created_at)}
                            </span>
                        </div>
                        <p className='mb-0 mt-1' style={{ fontSize: '0.9rem' }}>
                            {comment.body}
                        </p>
                    </div>

                    {/* Comment actions */}
                    <div className='d-flex align-items-center gap-3 mt-1'>

                        {/* Like */}
                        {isAuthenticated && (
                            <button
                                className={`btn btn-link btn-sm p-0 text-decoration-none ${
                                    comment.liked_by_user ? 'text-danger' : 'text-muted'
                                }`}
                                onClick={() => handleLikeComment(comment)}
                                aria-label={comment.liked_by_user ? 'Unlike comment' : 'Like comment'}
                                style={{ fontSize: '0.8rem' }}
                            >
                                ♥ {comment.like_count > 0 && comment.like_count}
                            </button>
                        )}

                        {/* Reply */}
                        {isAuthenticated && (
                            <button
                                className='btn btn-link btn-sm p-0 text-muted text-decoration-none'
                                onClick={() => setReplyingTo(
                                    replyingTo === comment.comment_id ? null : comment.comment_id
                                )}
                                style={{ fontSize: '0.8rem' }}
                            >
                                Reply
                            </button>
                        )}

                        {/* Show/hide replies */}
                        {comment.replies?.length > 0 && (
                            <button
                                className='btn btn-link btn-sm p-0 text-muted text-decoration-none'
                                onClick={() => toggleReplies(comment.comment_id)}
                                style={{ fontSize: '0.8rem' }}
                            >
                                {expandedReplies[comment.comment_id]
                                    ? 'Hide replies'
                                    : `${comment.replies.length} repl${comment.replies.length !== 1 ? 'ies' : 'y'}`
                                }
                            </button>
                        )}

                        {/* Delete */}
                        {isAuthenticated && user?.users_id === comment.users_id && (
                            <button
                                className='btn btn-link btn-sm p-0 text-danger text-decoration-none'
                                onClick={() => handleDeleteComment(comment.comment_id)}
                                aria-label='Delete comment'
                                style={{ fontSize: '0.8rem' }}
                            >
                                Delete
                            </button>
                        )}
                    </div>

                    {/* Reply input */}
                    {replyingTo === comment.comment_id && (
                        <div className='mt-2 d-flex gap-2'>
                            <input
                                type='text'
                                className='form-control form-control-sm'
                                placeholder={`Reply to @${comment.username}...`}
                                value={replyBody}
                                onChange={e => setReplyBody(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                        handleAddReply(comment.comment_id)
                                    }
                                }}
                                autoFocus
                                aria-label='Reply input'
                            />
                            <button
                                className='btn btn-primary btn-sm text-nowrap'
                                onClick={() => handleAddReply(comment.comment_id)}
                                disabled={submittingReply}
                                aria-busy={submittingReply}
                            >
                                {submittingReply ? '...' : 'Reply'}
                            </button>
                            <button
                                className='btn btn-outline-secondary btn-sm'
                                onClick={() => {
                                    setReplyingTo(null)
                                    setReplyBody('')
                                }}
                            >
                                ✕
                            </button>
                        </div>
                    )}

                    {/* Replies */}
                    {expandedReplies[comment.comment_id] && comment.replies?.length > 0 && (
                        <div className='mt-2 ms-3'>
                            {comment.replies.map(reply => (
                                <div key={reply.reply_id} className='d-flex gap-2 mb-2'>

                                    {/* Reply avatar */}
                                    {reply.profile_image_url ? (
                                        <img
                                            src={reply.profile_image_url}
                                            alt={`@${reply.username}`}
                                            className='rounded-circle flex-shrink-0'
                                            style={{ width: '26px', height: '26px', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <div
                                            className='rounded-circle bg-secondary d-flex align-items-center justify-content-center flex-shrink-0'
                                            style={{ width: '26px', height: '26px' }}
                                            aria-hidden='true'
                                        >
                                            <span className='text-white' style={{ fontSize: '0.6rem' }}>
                                                {reply.username?.slice(0, 2).toUpperCase()}
                                            </span>
                                        </div>
                                    )}

                                    {/* Reply body */}
                                    <div className='flex-grow-1'>
                                        <div className='bg-light rounded p-2'>
                                            <div className='d-flex justify-content-between align-items-start'>
                                                <Link
                                                    to={`/users/${reply.users_id}`}
                                                    className='text-decoration-none fw-semibold'
                                                    style={{ fontSize: '0.8rem' }}
                                                >
                                                    @{reply.username}
                                                </Link>
                                                <span className='text-muted' style={{ fontSize: '0.7rem' }}>
                                                    {formatTimeAgo(reply.created_at)}
                                                </span>
                                            </div>
                                            <p className='mb-0 mt-1' style={{ fontSize: '0.85rem' }}>
                                                {reply.body}
                                            </p>
                                        </div>

                                        {/* Delete reply */}
                                        {isAuthenticated && user?.users_id === reply.users_id && (
                                            <button
                                                className='btn btn-link btn-sm p-0 text-danger text-decoration-none mt-1'
                                                onClick={() => handleDeleteReply(reply.reply_id)}
                                                aria-label='Delete reply'
                                                style={{ fontSize: '0.75rem' }}
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    ))

    return (
        <section aria-label='Comments' className='mt-3'>

            {/* Comments list */}
            {comments.length === 0 ? (
                <p className='text-muted mb-3' style={{ fontSize: '0.85rem' }}>
                    No comments yet. Be the first!
                </p>
            ) : (
                <div className='mb-3'>
                    {commentList}
                </div>
            )}

            {/* Add comment */}
            {isAuthenticated && (
                <form onSubmit={handleAddComment} className='d-flex gap-2'>
                    <input
                        type='text'
                        className='form-control form-control-sm'
                        placeholder='Add a comment...'
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        aria-label='Add a comment'
                        maxLength={1000}
                    />
                    <button
                        type='submit'
                        className='btn btn-primary btn-sm text-nowrap'
                        disabled={submittingComment || !newComment.trim()}
                        aria-busy={submittingComment}
                    >
                        {submittingComment ? '...' : 'Post'}
                    </button>
                </form>
            )}
        </section>
    )
}

export default CommentSection