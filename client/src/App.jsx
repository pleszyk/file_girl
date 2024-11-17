import Login from './components/Login';
import Register from './components/Register';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from 'react-router-dom';
import store from './store';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import PrivateRoute from './components/PrivateRoute';
import Upload from './components/Upload';
import Nav from './components/Nav';
import Home from './components/Home';

function App() {
  return (
    <Provider store={store}>
      <Toaster />
      <Router>
      <Nav/>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='' element={<PrivateRoute />}>
            <Route path='/library' element={<Upload />} />
          </Route>
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;