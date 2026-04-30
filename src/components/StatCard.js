/**
 * StatCard - Reusable stat card component 
 * 
 * Props:
 * - value: the number to display
 * - label: the label below the number
 * - onClick: optional click handler
 * - isActive: optional boolean for active state
 */

const StatCard =({ value, label, onClick, isActive })=> {
    return (
        <div 
            className={ `card text-center p-3 ${onClick ? 'border-primary' : ''} ${isActive ? 'bg-light' : ''}` } 
            style={{ cursoer: onClick ? 'pointer' : 'default' }}
            onClick={onClick}
            role={onClick ? 'button' : undefined}
            aria-pressed={onClick ? isActive : undefined}
            tabIndex={onClick ? 0 : undefined}
            onKeyDown={onClick ? e => e.key === 'Enter' && onClick() : undefined}
        >
            <h3 className="display-6" style={{ fontSize: '22px'}}>{value ?? 0}</h3>
            <p className="text-muted mb-0">{label}</p>

        </div>
    )
}

export default StatCard