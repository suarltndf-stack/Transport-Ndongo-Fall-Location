import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { VehicleProvider } from './VehicleContext';
import { Navbar, Footer, TopBanner } from './components';
import { HomePage, CatalogPage, VehicleDetailPage, BookingPage, AdminPage } from './pages';

export default function App() {
  return (
    <VehicleProvider>
      <Router>
        <div className="min-h-screen flex flex-col font-sans">
          <TopBanner />
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/catalog" element={<CatalogPage />} />
              <Route path="/vehicle/:id" element={<VehicleDetailPage />} />
              <Route path="/book/:id" element={<BookingPage />} />
              <Route path="/admin/disponibilites" element={<AdminPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </VehicleProvider>
  );
}
