import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api.js'
import { useAuth } from '../context/AuthContext.js'
import CommentSection from './CommentSection.js'
import PostForm from './PostForm.js'

/**
 * PostCard - Single post display
 *
 * Props:
 * - post: post object from API
 * - onPostUpdated: callback after post is edited or deleted
 */

const PostCard = ({ post, onPostUpdated }) => {

    const { user, isAuthenticated } = useAuth()

    // STATE
    const [showComments, setShowComments] = useState(false)
    const [comments, setComments] = useState([])
    const [commentsLoading, setCommentsLoading] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [liked, setLiked] = useState(!!post.liked_by_user)
    const [likeCount, setLikeCount] = useState(post.like_count || 0)

    const isOwnPost = isAuthenticated && user?.users_id === post.users_id

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

    const fetchComments = async () => {
        setCommentsLoading(true)
        try {
            const data = await api.get(`/posts/${post.post_id}/comments`)
            setComments(data.comments || [])
        } catch (err) {
            console.error('Failed to load comments:', err)
        } finally {
            setCommentsLoading(false)
        }
    }

    // HANDLERS 
    const handleToggleComments = () => {
        if (!showComments) {
            fetchComments()
        }
        setShowComments(prev => !prev)
    }

    const handleLike = async () => {
        if (!isAuthenticated) return

        // Optimistic update
        setLiked(prev => !prev)
        setLikeCount(prev => liked ? prev - 1 : prev + 1)

        try {
            if (liked) {
                await api.delete(`/posts/${post.post_id}/like`)
            } else {
                await api.post(`/posts/${post.post_id}/like`)
            }
        } catch (err) {
            // Revert on error
            setLiked(prev => !prev)
            setLikeCount(prev => liked ? prev + 1 : prev - 1)
            console.error('Failed to like post:', err)
        }
    }

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this post?')) return

        try {
            await api.delete(`/posts/${post.post_id}`)
            onPostUpdated?.()
        } catch (err) {
            console.error('Failed to delete post:', err)
        }
    }

    const getVideoEmbed = (url) => {
        if (!url) return null

        // YouTube
        const youtubeMatch = url.match(
            /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/
        )
        if (youtubeMatch) {
            return `https://www.youtube.com/embed/${youtubeMatch[1]}`
        }

        // Vimeo
        const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
        if (vimeoMatch) {
            return `https://player.vimeo.com/video/${vimeoMatch[1]}`
        }

        return null
    }

    const embedUrl = getVideoEmbed(post.video_url)

    const tagBadges = post.tags?.map(tag => (
        <span key={tag.tag_id} className='badge bg-secondary me-1'>
            #{tag.tag_name}
        </span>
    ))

    if (isEditing) {
        return (
            <PostForm
                editPost={post}
                onEditCancel={() => setIsEditing(false)}
                onPostUpdated={() => {
                    setIsEditing(false)
                    onPostUpdated?.()
                }}
            />
        )
    }

    return (
        <article className='card mb-3'>
            <div className='card-body'>

                {/* Post header */}
                <header className='d-flex justify-content-between align-items-start mb-3'>
                    <div className='d-flex align-items-center gap-2'>

                        {/* Avatar */}
                        {post.profile_image_url ? (
                            <img
                                src={post.profile_image_url}
                                alt={`@${post.username}`}
                                className='rounded-circle'
                                style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                            />
                        ) : (
                            <div
                                className='rounded-circle bg-secondary d-flex align-items-center justify-content-center'
                                style={{ width: '40px', height: '40px' }}
                                aria-hidden='true'
                            >
                                <span className='text-white'>
                                    {post.username?.slice(0, 2).toUpperCase()}
                                </span>
                            </div>
                        )}

                        <div>
                            <Link
                                to={`/users/${post.users_id}`}
                                className='text-decoration-none fw-semibold'
                            >
                                @{post.username}
                            </Link>
                            <p className='text-muted mb-0' style={{ fontSize: '0.8rem' }}>
                                {formatTimeAgo(post.created_at)}
                                {post.updated_at !== post.created_at && (
                                    <span className='ms-1'>(edited)</span>
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Edit/Delete menu */}
                    {isOwnPost && (
                        <div className='d-flex gap-2'>
                            <button
                                className='btn btn-link btn-sm p-0 text-muted text-decoration-none'
                                onClick={() => setIsEditing(true)}
                                aria-label='Edit post'
                            >
                                Edit
                            </button>
                            <button
                                className='btn btn-link btn-sm p-0 text-danger text-decoration-none'
                                onClick={handleDelete}
                                aria-label='Delete post'
                            >
                                Delete
                            </button>
                        </div>
                    )}
                </header>

                {/* Post body */}
                {post.body && (
                    <p className='mb-3' style={{ whiteSpace: 'pre-wrap' }}>
                        {post.body}
                    </p>
                )}

                {/* Image */}
                {post.image_url && (
                    <div className='mb-3'>
                        <img
                            src={post.image_url}
                            alt={post.alt_text || 'Post image'}
                            className='img-fluid rounded'
                            style={{ maxHeight: '400px', objectFit: 'cover', width: '100%' }}
                        />
                    </div>
                )}

                {/* Video embed */}
                {post.video_url && embedUrl && (
                    <div className='mb-3 ratio ratio-16x9'>
                        <iframe
                            src={embedUrl}
                            title={post.alt_text || 'Post video'}
                            allowFullScreen
                            allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                        />
                    </div>
                )}

                {/* Video URL fallback — if not YouTube or Vimeo */}
                {post.video_url && !embedUrl && (
                    <div className='mb-3'>
                        <a
                            href={post.video_url}
                            target='_blank'
                            rel='noreferrer'
                            className='btn btn-outline-secondary btn-sm'
                        >
                            Watch Video
                        </a>
                    </div>
                )}

                {/* Tags */}
                {post.tags?.length > 0 && (
                    <div className='mb-3'>
                        {tagBadges}
                    </div>
                )}

                {/* Actions */}
                <footer className='d-flex align-items-center gap-3 border-top pt-2'>

                    {/* Like */}
                    <button
                        className={`btn btn-link btn-sm p-0 text-decoration-none ${
                            liked ? 'text-danger' : 'text-muted'
                        }`}
                        onClick={handleLike}
                        disabled={!isAuthenticated}
                        aria-label={liked ? 'Unlike post' : 'Like post'}
                        aria-pressed={liked}
                    >
                        ♥ {likeCount > 0 && likeCount}
                    </button>

                    {/* Comments toggle */}
                    <button
                        className='btn btn-link btn-sm p-0 text-muted text-decoration-none'
                        onClick={handleToggleComments}
                        aria-label={showComments ? 'Hide comments' : 'Show comments'}
                        aria-expanded={showComments}
                    >
                        💬 {post.comment_count > 0 && post.comment_count}
                        {showComments ? ' Hide' : ' Comment'}
                    </button>

                </footer>

                {/* Comments section */}
                {showComments && (
                    <div className='mt-3'>
                        {commentsLoading ? (
                            <p className='text-muted' style={{ fontSize: '0.85rem' }}>
                                Loading comments...
                            </p>
                        ) : (
                            <CommentSection
                                postId={post.post_id}
                                comments={comments}
                                onCommentsUpdate={fetchComments}
                            />
                        )}
                    </div>
                )}

            </div>
        </article>
    )
}

export default PostCard