import Countdown2 from "./components/CountDown";
import {BrowserRouter , Routes , Route} from 'react-router-dom';
import FotografiyaLogin from './pages/Login';

function App() {
  
    <>   

    <BrowserRouter>
    <Routes>
      <Route path="/" element={<FotografiyaLogin />}/>
      <Route path="/countodown" element={<Countdown2 />}/>
    </Routes>
    </BrowserRouter>

    </>

}

export default App;
