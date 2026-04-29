/**
 * StarRating - Interactive musical note rating component
 * 
 * Props: 
 * 
 * - rating: current rating value (1-5)
 * - onRate: callback when user selects a rating 
 * - readOnly: boolean - disables interaction 
 * - size: 'sm', 'md', 'lg' - controls font size
 */

const StarRating = ({ rating = 0, onRate, readOnly = false, size = 'md'})=> {

    const sizes = {
        sm: '1rem',
        md: '1.5rem',
        lg: '2rem'
    }

    const fontSize = sizes[size] || sizes.md
    const notes = [1, 2, 3, 4, 5]

    return (
        <div 
            className="d-flex gap-1"
            role={readOnly ? 'img' : 'group'}
            aria-label={readOnly 
                ? `Rating: ${rating} out of 5`
                : 'Select a rating'
            }
        >
            {notes.map(note => (
                <button 
                    key={note}
                    type='button'
                    className="btn p-0 border-0 bg-transparent"
                    style={{
                        fontSize,
                        cursor: readOnly ? 'default' : 'pointer',
                        color: note <= rating ? '#f5a623' : '#ccc',
                        lineHeight: 1
                    }}
                    onClick={()=> !readOnly && onRate?.(note)}
                    onMouseEnter={e => {
                        if (!readOnly) {
                            const buttons = e.currentTarget.parentElement.querySelectorAll('button')
                            buttons.forEach((btn, index)=> {
                                btn.style.color = index < note ? '#f5a623' : '#ccc'
                            })
                        }
                    }}
                    onMouseLeave={e => {
                        if (!readOnly) {
                            const buttons = e.currentTarget.parentElement.querySelectorAll('button')
                            buttons.forEach((btn, index)=> {
                                btn.style.color = index < rating ? '#f5a623' : '#ccc'
                            })
                        }
                    }}
                    disabled={readOnly}
                    aria-label={`Rate ${note} out of 5`}
                    aria-pressed={note === rating}
                >
                    🎵
                </button>
            ))}
            {rating > 0 && (
                <span 
                    className="text-muted ms-1"
                    style={{ fontSize: size === 'sm' ? '0.75rem' : '0.9rem', alignSelf: 'center'}}
                >
                    {rating}/5
                </span>
            )}
        </div>
    )
}

export default StarRating