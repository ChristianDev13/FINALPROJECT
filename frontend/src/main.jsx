import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import AuthPage from './AuthPage.jsx'
import PortfolioBuilder from './PortfolioBuilder.jsx'
import CreativePortfolioBuilder from './CreativePortfolioBuilder.jsx'
import CreativePortfolio from './CreativePortfolio.jsx'
import MinimalPortfolio from './MinimalPortfolio.jsx'
import ProfessionalPortfolioBuilder from './ProfessionalPortfolioBuilder.jsx'
import ProfessionalPortfolio from './ProfessionalPortfolio.jsx'
import ScrollReveal from './ScrollReveal.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ScrollReveal />
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />
        <Route path="/create/creative" element={<CreativePortfolioBuilder />} />
        <Route path="/portfolio/creative" element={<CreativePortfolio />} />
        <Route path="/create" element={<PortfolioBuilder />} />
        <Route path="/portfolio/minimal" element={<MinimalPortfolio />} />
        <Route path="/create/professional" element={<ProfessionalPortfolioBuilder />} />
        <Route path="/portfolio/professional" element={<ProfessionalPortfolio />} />
        <Route path="*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
