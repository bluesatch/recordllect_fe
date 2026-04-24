import { useState, useEffect } from 'react'
import { api } from '../services/api.js'
import WantlistCard from './WantlistCard.js'

/**
 * Wantlist - Reusable wantlist component
 *
 * Props:
 * - userId: the user's ID
 * - isOwnProfile: boolean — shows edit controls if true
 */

const Wantlist = ({ userId, isOwnProfile }) => {

    const [wantlist, setWantlist] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [editingItem, setEditingItem] = useState(null)
    const [editForm, setEditForm] = useState({ notes: '', priority: 'medium' })
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        const fetchWantlist = async () => {
            setLoading(true)
            setError(null)

            try {
                const data = await api.get(`/users/${userId}/wantlist`)
                setWantlist(data.wantlist || [])
            } catch (err) {
                setError(
                    err.message?.includes('403')
                        ? 'You must be following this user to view their wantlist.'
                        : 'Failed to load wantlist.'
                )
            } finally {
                setLoading(false)
            }
        }

        fetchWantlist()
    }, [userId])

    const handleRemove = async (wantlistId) => {
        try {
            await api.delete(`/users/${userId}/wantlist/${wantlistId}`)
            setWantlist(prev => prev.filter(w => w.wantlist_id !== wantlistId))
        } catch (err) {
            console.error('Failed to remove from wantlist:', err)
        }
    }

    const handleEditClick = (item) => {
        setEditingItem(item)
        setEditForm({
            notes: item.notes || '',
            priority: item.priority || 'medium'
        })
    }

    const handleEditSave = async () => {
        setSaving(true)

        try {
            await api.put(
                `/users/${userId}/wantlist/${editingItem.wantlist_id}`,
                editForm
            )

            setWantlist(prev => prev.map(w =>
                w.wantlist_id === editingItem.wantlist_id
                    ? { ...w, notes: editForm.notes, priority: editForm.priority }
                    : w
            ))

            setEditingItem(null)
        } catch (err) {
            console.error('Failed to update wantlist item:', err)
        } finally {
            setSaving(false)
        }
    }

    const handleEditCancel = () => {
        setEditingItem(null)
        setEditForm({ notes: '', priority: 'medium' })
    }

    if (loading) {
        return (
            <div className='text-center mt-4'>
                <p>Loading wantlist...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className='alert alert-warning' role='alert'>
                {error}
            </div>
        )
    }

    return (
        <section aria-label='Wantlist'>

            {/* Edit modal */}
            {editingItem && (
                <div className='card mb-4 p-3 border-primary'>
                    <h4 className='h6 mb-3'>
                        Editing: {editingItem.title}
                    </h4>
                    <div className='mb-3'>
                        <label className='form-label' htmlFor='edit-priority'>
                            Priority
                        </label>
                        <select
                            className='form-select form-select-sm'
                            id='edit-priority'
                            value={editForm.priority}
                            onChange={e => setEditForm({
                                ...editForm,
                                priority: e.target.value
                            })}
                        >
                            <option value='high'>High</option>
                            <option value='medium'>Medium</option>
                            <option value='low'>Low</option>
                        </select>
                    </div>
                    <div className='mb-3'>
                        <label className='form-label' htmlFor='edit-notes'>
                            Notes
                        </label>
                        <textarea
                            className='form-control form-control-sm'
                            id='edit-notes'
                            rows={3}
                            value={editForm.notes}
                            onChange={e => setEditForm({
                                ...editForm,
                                notes: e.target.value
                            })}
                            placeholder='e.g. Looking for original pressing only...'
                            maxLength={500}
                        />
                        <div className='form-text'>
                            {editForm.notes.length}/500 characters
                        </div>
                    </div>
                    <div className='d-flex gap-2'>
                        <button
                            className='btn btn-primary btn-sm'
                            onClick={handleEditSave}
                            disabled={saving}
                            aria-busy={saving}
                        >
                            {saving ? 'Saving...' : 'Save'}
                        </button>
                        <button
                            className='btn btn-outline-secondary btn-sm'
                            onClick={handleEditCancel}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {wantlist.length === 0 ? (
                <div className='text-center mt-4'>
                    <p className='text-muted'>
                        {isOwnProfile
                            ? 'Your wantlist is empty. Add albums from their detail page.'
                            : 'This user\'s wantlist is empty.'
                        }
                    </p>
                </div>
            ) : (
                <div className='row'>
                    {wantlist.map(item => (
                        <div key={item.wantlist_id} className='col-md-3 col-sm-6 mb-4'>
                            <WantlistCard
                                item={item}
                                isOwnProfile={isOwnProfile}
                                onRemove={handleRemove}
                                onEdit={handleEditClick}
                            />
                        </div>
                    ))}
                </div>
            )}
        </section>
    )
}

export default Wantlist