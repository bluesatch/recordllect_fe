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
import LabelDetail from './pages/LabelDetail.js'
import UserProfile from './pages/UserProfile.js'
import EditAlbum from './pages/EditAlbum.js'
import EditProfile from './pages/EditProfile.js'
import PerformerDetail from './pages/PerformerDetail.js'
import EditPerformer from './pages/EditPerformer.js'
import WantlistPage from './pages/WantlistPage.js'
import FeedPage from './pages/FeedPage.js'
import DiscoverPage from './pages/DiscoverPage.js'
import AdminDashboard from './pages/AdminDashboard.js'

const App =()=> {
    return (
        <>
            <Navbar />
            <Routes>
                <Route path='/' element={ <Home /> } />
                <Route path='/admin' element={<AdminDashboard />} />
                <Route path='/login' element={ <Login /> } />
                <Route path='/register' element={ <Register /> } />
                <Route path='/albums' element={ <Albums /> } />
                <Route path='/albums/:id' element={ <AlbumDetail /> } />
                <Route path='/albums/:id/edit' element={<EditAlbum />} />
                <Route path='/performers' element={ <Performers /> } />
                <Route path='/performers/:id' element={<PerformerDetail />} />
                <Route path='/performers/:id/edit' element={<EditPerformer />} />
                <Route path='/labels' element={ <Labels /> } />
                <Route path='/labels/:id' element={<LabelDetail />} />
                <Route path='/users/:id' element={<UserProfile />} />
                <Route path='/users/:id/edit' element={<EditProfile />}/>
                <Route path='/users/:id/wantlist' element={<WantlistPage />} />
                <Route path ='/feed' element={<FeedPage />} />
                <Route path='/discover' element={<DiscoverPage />} />
                <Route path="*" element={ <NotFound /> } />
            </Routes>
        </>
    )
}

export default App