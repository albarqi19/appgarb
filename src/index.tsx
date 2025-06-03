import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './styles/uthmani.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
// إضافة دعم للغة العربية والاتجاه من اليمين إلى اليسار
import { unstable_ClassNameGenerator } from '@mui/material/className';

// تعريف اتجاه المستند للعربية
document.dir = 'rtl';
document.documentElement.lang = 'ar';

// تكوين أسماء الـ CSS لتجنب تعارض الأنماط
unstable_ClassNameGenerator.configure((componentName) => `gharb-${componentName}`);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
