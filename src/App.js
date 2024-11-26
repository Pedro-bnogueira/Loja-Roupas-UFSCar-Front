import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Login from './pages/Login';
import Home from './pages/Home';
import AdminRegister from './components/AdminRegister';

function App() {
  
  return (
    <div className="wrapper">
      <BrowserRouter>
      <Routes>
        <Route path='/login' element={<Login />}/>
        <Route path='/adm/new/user' element={<AdminRegister />}/>
        <Route path='/' exact element={<Home />}>
          
        </Route>
	
      </Routes>
      </BrowserRouter>
      
    </div>
  );
}

export default App;
