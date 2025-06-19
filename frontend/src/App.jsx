import {BrowserRouter , Routes , Route} from 'react-router-dom';
import FotografiyaLogin from './pages/Login';

function App() {

  return (
    <>   

    <BrowserRouter>
    <Routes>
      <Route path="/" element={<FotografiyaLogin />}/>
    
    </Routes>
    </BrowserRouter>

    </>
  )
}

export default App
