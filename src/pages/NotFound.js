import { Link } from "react-router-dom";

const NotFound =()=> {
    return (
        <div className="container text-center mt-5">
            <h1>404</h1>
            <p>Your page request skipped a groove</p>
            <Link to="/">Go back home</Link>
        </div>
    )
}

export default NotFound