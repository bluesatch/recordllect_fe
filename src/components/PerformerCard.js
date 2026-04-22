import { Link } from "react-router-dom"

/**
 * PerformerCard - Reusable performer card component
 * 
 * Props:
 * - performer: performer object from API
 */

const PerformerCard = ({ performer })=> {
    const formatYears =()=> {
        if (performer.performer_type === 'band') {
            if (performer.formed_year && performer.disbanded_year) {
                return `${performer.formed_year} - ${performer.disbanded_year}`
            }
            if (performer.formed_year) return `Est. ${performer.formed_year}`
        }

        if (performer.performer_type === 'artist') {
            if (performer.date_of_birth && performer.date_of_death) {
                return `${new Date(performer.date_of_birth).getUTCFullYear()} - ${new Date(performer.date_of_death).getFullYear()}`
            }
            if (performer.date_of_birth) {
                return  `b. ${new Date(performer.date_of_birth).getUTCFullYear()}`
            }
        }

        return null
    }

    return (
        <div className="card h-100">
            <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-2">
                    <h3 className="card-title h6 mb-0">{performer.performer_name}</h3>
                    <span className={`badge ms-2 ${
                        performer.performer_type === 'band'
                        ? 'bg-primary'
                        : 'bg-secondary'
                    }`}>
                        {performer.performer_type}
                    </span>
                </div>

                {formatYears() && (
                    <p className="text-muted mb-1">
                        <small>{formatYears()}</small>
                    </p>
                )}

                {performer.performer_type === 'band' && performer.country && (
                    <p className="text-muted mb-1">
                        <small>Country: {performer.country}</small>
                    </p>
                )}
            </div>
            <footer className="card-footer">
                <Link 
                    to={`/performers/${performer.performer_id}`}
                    className="btn btn-outline-primary btn-sm w-100"
                >
                    View Profile
                </Link>
            </footer>
        </div>
    )
}

export default PerformerCard
