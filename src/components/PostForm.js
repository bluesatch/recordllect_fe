import { useState, useEffect } from 'react'
import { api } from '../services/api.js'

/**
 * PostForm - Create or edit a post 
 * 
 * Props: 
 * - onPostCreated: callback after successful post creation 
 * - editPost: optional post object for editing mode 
 * - onEditCancel: callback to cancel editing 
 * - onPostUpdated: callback after successful post update
 */

const PostForm = ({ onPostCreated, editPost, onEditCancel, onPostUpdated })=> {

    // STATE 
    const [body, setBody] = useState('')
    const [imageUrl, setImageUrl] = useState('')
    const [videoUrl, setVideoUrl] = useState('')
    const [altText, setAltText] = useState('')
    const [selectedTags, setSelectedTags] = useState([])
    const [allTags, setAllTags] = useState([])
    const [tagSearch, setTagSearch] = useState('')
    const [tagResults, setTagResults] = useState([])
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState(null)

    // What does !! mean? => double negation or double bang operator. Converts any value into a proper boolean
    const isEditing = !!editPost 

    // USEEFFECTS
    // Fetch all tags on mount
    useEffect(()=> {
        const fetchTags = async ()=> {
            try {
                const data = await api.get('/tags')
                setAllTags(data.tags || [])
            } catch (err) {
                console.error('Failed to load tags:', err)
            }
        }
        fetchTags()
    }, [])

    // Prepopulate form when editing 
    useEffect(()=> {
        if (editPost) {
            setBody(editPost.body || '')
            setImageUrl(editPost.image_url || '')
            setVideoUrl(editPost.video_url || '')
            setAltText(editPost.alt_text || '')
            setSelectedTags(editPost.tags || [])
        }
    }, [editPost])

    // Filter tags as user types 
    useEffect(()=> {
        if (!tagSearch.trim()) {
            setTagResults([])
            return 
        }

        const filtered = allTags.filter(t => t.tag_name.includes(tagSearch.toLowerCase()) && !selectedTags.find(s => s.tag_id === t.tag_id))

        setTagResults(filtered)
    }, [tagSearch, allTags, selectedTags])

    // HANDLERS 
    const handleTagSelect = (tag)=> {
        setSelectedTags(prev => [...prev, tag])
        setTagSearch('')
        setTagResults([])
    }

    const handleTagRemove = (tagId)=> {
        setSelectedTags(prev => prev.filter(t => t.tag_id !== tagId))
    }

    const handleCreateTag = async ()=> {
        if (!tagSearch.trim()) return 
        
        const normalizedTag = tagSearch.toLowerCase().trim().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')

        if (!normalizedTag) {
            console.error('Tag name is empty after normalization')
            return 
        }

        try {
            
            const data = await api.post('/tags', { tag_name: normalizedTag })
            const newTag = { tag_id: data.tag_id, tag_name: data.tag_name }

            // Add to allTags if it's truly new 
            if (!allTags.find(t => t.tag_id === data.tag_id)) {
                setSelectedTags(prev => [...prev, newTag])
            }

            setTagSearch('')
            setTagResults([])
        } catch (err) {
            console.error('Failed to create tag:', err)
        }
    }

    const handleSubmit = async (e)=> {
        e.preventDefault()

        setSubmitting(true)
        setError(null)

        if (!body.trim() && !imageUrl && !videoUrl) {
            setError('Post must have at least some text, an image, or a video.')
            setSubmitting(false)
            return
        }

        try {
            const payload = {
                body: body.trim() || null,
                image_url: imageUrl || null,
                video_url: videoUrl || null,
                alt_text: altText || null,
                tag_ids: selectedTags.map(t => t.tag_id)
            }

            if (isEditing) {
                await api.put(`/posts/${editPost.post_id}`, payload)
                onPostUpdated?.()
            } else {
                await api.post('/posts', payload)
                // Reset form 
                setBody('')
                setImageUrl('')
                setVideoUrl('')
                setAltText('')
                setSelectedTags([])
                onPostCreated?.()
            }
        } catch (err) {
            setError('Failed to save post. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className='card mb-4'>
            <div className='card-body'>
                <h3 className='h6 mb-3'>
                    {isEditing ? 'Edit Post' : 'Create Post'}
                </h3>

                {error && (
                    <div className='alert alert-danger' role='alert' aria-live='polite'>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                    {/* Body */}
                    <div className='mb-3'>
                        <label className='form-label' htmlFor='post-body'>
                            What's on your mind?
                        </label>
                        <textarea 
                            className='form-control'
                            id='post-body'
                            rows={3}
                            value={body}
                            onChange={e => setBody(e.target.value)}
                            placeholder="Share something about music..."
                            maxLength={2000}
                            aria-label='Post body'
                        />
                        <div className='form-text text-end'>
                            {body.length}/2000
                        </div>
                    </div>

                    {/* Image URL */}
                    <div className='mb-3'>
                        <label className='form-label' htmlFor='post-image'>
                            Image URL
                        </label>
                        <input 
                            type='url'
                            className='form-control'
                            id='post-image'
                            value={imageUrl}
                            onChange={e => setImageUrl(e.target.value)}
                            placeholder='https://...'
                            aria-label='Image URL'
                        />
                        {imageUrl && (
                            <div className='mt-2'>
                                <img 
                                    src={imageUrl}
                                    alt='Preview'
                                    style={{ maxHeight: '150px', objectFit: 'cover', borderRadius: '4px'}}
                                    onError={e => e.target.style.display = 'none'}
                                />
                            </div>
                        )}
                    </div>

                    {/* Video URL */}
                    <div className='mb-3'>
                        <label className='form-label' htmlFor='post-video'>
                            Video URL
                        </label>
                        <input 
                            type="url"
                            className='form-control'
                            id='post-video'
                            value={videoUrl}
                            onChange={e => setVideoUrl(e.target.value)}
                            placeholder='https://youtube.com/...'
                            aria-label='Video URL'
                        />
                    </div>
                    {/* Alt text - only shows if image or video URL entered */}
                    {(imageUrl || videoUrl) && (
                        <div className='mb-3'>
                            <label className='form-label' htmlFor='post-alt'>
                                Alt Text
                            </label>
                            <input 
                                type='text'
                                className='form-control'
                                id='post-alt'
                                value={altText}
                                onChange={e => setAltText(e.target.value)}
                                placeholder='Describe the image or video for accessibility...'
                                maxLength={500}
                                aria-label='Alt text for image or video'
                            />
                            <div className='form-text'>
                                {altText.length}/500 - helps users with screen readers
                            </div>
                        </div>
                    )}
                    {/* Tag selector */}
                    <div className='mb-3'>
                        <label className='form-label' htmlFor='post-tags'>
                            Tags
                        </label>
                        {/* Selected tags */}
                        {selectedTags.length > 0 && (
                            <div className='d-flex flex-wrap gap-1 mb-2'>
                                {selectedTags.map(tag => (
                                    <span 
                                        key={tag.tag_id}
                                        className='badge bg-primary d-flex align-items-center gap-1'
                                    >
                                        #{tag.tag_name}
                                        <button 
                                            type='button'
                                            className='btn-close btn-close-white'
                                            style={{ fontSize: '0.6rem'}}
                                            onClick={()=> handleTagRemove(tag.tag_id)}
                                            aria-label={`Remove tag ${tag.tag_name}`}
                                        />
                                    </span>
                                ))}
                            </div>
                        )}
                        {/* Tag search input */}
                        <div className='d-flex gap-2'>
                            <input 
                                type='text'
                                className='form-control form-control-sm'
                                id='post-tags'
                                value={tagSearch}
                                onChange={e => setTagSearch(e.target.value)}
                                placeholder='Search or create a tag...'
                                aria-label='Search tags'
                            />
                            {tagSearch && tagResults.length === 0 && (
                                <button 
                                    type='button'
                                    className='btn btn-outline-secondary btn-sm text-nowrap'
                                    onClick={handleCreateTag}
                                    aria-label={`Create tag ${tagSearch}`}
                                >
                                    + Create #{tagSearch.toLowerCase().trim().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')}
                                </button>
                            )}
                        </div>
                        {/* Tag results dropdown */}
                        {tagResults.length > 0 && (
                            <div 
                                className='border rounded mt-1'
                                style={{ maxHeight: '150px', overflowY: 'auto'}}
                            >
                                {tagResults.map(tag => (
                                    <button 
                                        key={tag.tag_id}
                                        type='button'
                                        className='d-block w-100 text-start px-3 py-2 btn btn-light btn-sm border-0 rounded-0'
                                        onClick={()=> handleTagSelect(tag)}
                                    >
                                        #{tag.tag_name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    {/* Buttons */}
                    <div className='d-flex gap-2'>
                        <button 
                            type='submit'
                            className='btn btn-primary btn-sm'
                            disabled={submitting}
                            aria-busy={submitting}
                        >
                            {submitting 
                                ? 'Saving...'
                                : 'Post'
                            }
                        </button>
                        {isEditing && (
                            <button 
                                type='button'
                                className='btn btn-outline-secondary btn-sm'
                                onClick={onEditCancel}
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    )

}

export default PostForm 