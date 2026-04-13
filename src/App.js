import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.js'
import Home from './pages/Home.js'
import Login from './pages/Login.js'
import Register from './pages/Register.js'
import Albums from './pages/Albums.js'
import AlbumDetail from './pages/AlbumDetail.js'
import Performers from './pages/Performers.js'
import Labels from './pages/Labels.js'
import NotFound from './pages/NotFound.js'

const App =()=> {
    return (
        <>
            <Navbar />
            <Routes>
                <Route path='/' element={ <Home /> } />
                <Route path='/login' element={ <Login /> } />
                <Route path='/register' element={ <Register /> } />
                <Route path='/albums' element={ <Albums /> } />
                <Route path='/albums/:id' element={ <AlbumDetail /> } />
                <Route path='/performers' element={ <Performers /> } />
                <Route path='/labels' element={ <Labels /> } />
                <Route path="*" element={ <NotFound /> } />
            </Routes>
        </>
    )
}

export default App