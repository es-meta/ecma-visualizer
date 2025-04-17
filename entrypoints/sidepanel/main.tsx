import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './main.css'
import App from './App';
import { Provider } from 'jotai';
import { store } from './atoms/store';
import { RegisterAtoms } from './atoms/register-atoms';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
      <RegisterAtoms />
    </Provider>
  </StrictMode>
)
