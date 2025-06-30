import { createRoot } from 'react-dom/client'
import './index.css'
import { StrictMode } from 'react'
import App from './App.jsx'
import store from "./store/start"
import { Provider } from 'react-redux';
import { CookiesProvider } from 'react-cookie';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <CookiesProvider>
  <App />
      </CookiesProvider>
  
    </Provider>
  </StrictMode>
)
