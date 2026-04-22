import { Link } from "react-router-dom"

/**
 * LabelCard - Reusable label card component
 * 
 * Props:
 * - label: label object from API
 */

const LabelCard = ({ label })=> {

    return (
        <div className="card h-100">
            <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-2">
                    <h3 className="card-title h6 mb-0">{label.label_name}</h3>
                    <span className={`badge ms-2 ${
                        label.status === 'active'
                        ? 'bg-success'
                        : 'bg-secondary'
                        }`}>
                        {label.status}
                    </span>
                </div>
                {label.country && (
                    <p className="text-muted mb-1">
                        <small>Country: {label.country}</small>
                    </p>
                )}

                {label.founded_year && (
                    <p className="text-muted mb-1">
                        <small>Founded: {label.founded_year}</small>
                    </p>
                )}

                {label.website_url && (
                    <p className="text-muted mb-0">
                        <small>
                            <a 
                                href={label.website_url}
                                target='_blank'
                                rel='noreferrer'
                                aria-label={`Visit ${label.label_name} website`}
                            >
                                Website
                            </a>
                        </small>
                    </p>
                )}
            </div>
            <footer className="card-footer">
                <Link 
                    to={`/labels/${label.label_id}`}
                    className="btn btn-outline-primary btn-sm 2-100"
                >
                    View Label
                </Link>
            </footer>
        </div>
    )
}

export default LabelCard