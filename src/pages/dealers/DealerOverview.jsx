import React, { useEffect, useState } from 'react';
import { 
  ArrowLeft,
  Pencil,
  Phone,
  MapPin,
  IndianRupee,
  Clock,
  Calendar,
  Image as ImageIcon,
  Check,
  Circle,
  Plus,
  Gauge,
  LayoutDashboard,
  ShoppingCart,
} from 'lucide-react';

import useDealer from '../../hooks/useDealer';
import Overview from './components/OverView';
import ProductRate from './components/ProductRate';
import PurchaseHistory from './components/PurchaseHistory';
import AddPurcchase from './components/AddPurcchase';
import PurchaseOrderModal from './components/PurchaseOrderModal';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const DealerProfile = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [showPurchaseOrderModal, setShowPurchaseOrderModal] = useState(false);

  // Pagination and Filter State
  const [purchasePage, setPurchasePage] = useState(1);
  const [purchasePerPage, setPurchasePerPage] = useState(10);
  const [purchaseSearch, setPurchaseSearch] = useState("");
  const [purchaseStartDate, setPurchaseStartDate] = useState("");
  const [purchaseEndDate, setPurchaseEndDate] = useState("");

  const [ratesPage, setRatesPage] = useState(1);
  const [ratesPerPage, setRatesPerPage] = useState(10);
  const [ratesSearch, setRatesSearch] = useState("");

  const {
    dealer,
    summary,
    productRates,
    ratesTotal,
    isRatesLoading,
    purchaseHistory,
    purchaseTotal,
    isPurchasesLoading,
    markDelivered,
    uploadPhotos,
    syncStock,
    refetchPurchases,
    refetchDealer
  } = useDealer(id, {
    purchasePage,
    purchasePerPage,
    purchaseSearch,
    purchaseStartDate,
    purchaseEndDate,
    ratesPage,
    ratesPerPage,
    ratesSearch
  });

  // Handle status update for purchase
  const handleStatusUpdate = async (purchaseId, status) => {
    try {
      await markDelivered({ purchaseId, status });
    } catch (error) {
      // Error handled in hook
    }
  };

  // Handle photos upload for purchase
  const handlePhotosUpload = async (purchaseId, photos, notes = '') => {
    try {
      const formData = new FormData();
      photos.forEach((photo, index) => {
        formData.append(`photos[${index}]`, photo);
      });
      if (notes) {
        formData.append('notes', notes);
      }
      await uploadPhotos({ purchaseId, formData });
    } catch (error) {
      // Error handled in hook
    }
  };

  // Handle stock sync for purchase
  const handleSyncStock = async (purchaseId) => {
    try {
      await syncStock(purchaseId);
    } catch (error) {
      // Error handled in hook
    }
  };

  return (
    <div className="container-fluid" style={{ maxWidth: '1400px' }}>
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 dealer-header">
        <div className="d-flex align-items-center">
          <Link to="/dealers" className="btn btn-link text-secondary p-0 me-3" style={{ fontSize: '20px' }}>
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h3 className="mb-1 fw-semibold fs-4">{dealer.name}</h3>
            <div className="d-flex align-items-center text-muted small">
              <MapPin size={14} className="me-1" />
              <span className="me-3">{dealer.location}</span>
              <span>{dealer.phone}</span>
            </div>
          </div>
        </div>
        <div className="d-flex align-items-center gap-2">
          <button 
            className="btn btn-primary me-2 d-flex align-items-center"
            onClick={() => setShowPurchaseOrderModal(true)}
          >
            <ShoppingCart size={14} className="me-1" />
            Make Purchase Order
          </button>
          <Link to={`/dealers/edit/${id}`} className="btn btn-outline-secondary me-2">
            <Pencil size={14} className="me-2" />
            Edit Dealer
          </Link>
          
        </div>
      </div>

      {/* Nav Tabs */}
      <ul className="nav nav-tabs dealer-nav mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <LayoutDashboard size={16} className="me-1" />
            Overview
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'rates' ? 'active' : ''}`}
            onClick={() => setActiveTab('rates')}
          >
            <IndianRupee size={16} className="me-1" />
            Product Rates
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <Clock size={16} className="me-1" />
            Purchase History
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'add' ? 'active' : ''}`}
            onClick={() => setActiveTab('add')}
          >
            <Plus size={16} className="me-1" />
            Add Purchase
          </button>
        </li>
      </ul>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <Overview dealer={dealer} summary={summary} />
      )}

      {/* Product Rates Tab */}
      {activeTab === 'rates' && (
        <ProductRate 
          productRates={productRates} 
          isLoading={isRatesLoading}
          pagination={{
            currentPage: ratesPage,
            totalPages: Math.ceil(ratesTotal / ratesPerPage),
            totalItems: ratesTotal,
            itemsPerPage: ratesPerPage,
            onPageChange: setRatesPage,
            onItemsPerPageChange: (val) => { setRatesPerPage(val); setRatesPage(1); }
          }}
          onSearch={setRatesSearch}
          searchVal={ratesSearch}
        />
      )}

      {/* Purchase History Tab */}
      {activeTab === 'history' && (
        <PurchaseHistory 
          purchaseHistory={purchaseHistory} 
          isLoading={isPurchasesLoading}
          fetchPurchaseHistory={refetchPurchases}
          onStatusUpdate={handleStatusUpdate}
          onPhotosUpload={handlePhotosUpload}
          onSyncStock={handleSyncStock}
          dealerName={dealer.name}
          pagination={{
            currentPage: purchasePage,
            totalPages: Math.ceil(purchaseTotal / purchasePerPage),
            totalItems: purchaseTotal,
            itemsPerPage: purchasePerPage,
            onPageChange: setPurchasePage,
            onItemsPerPageChange: (val) => { setPurchasePerPage(val); setPurchasePage(1); }
          }}
          filters={{
            search: purchaseSearch,
            setSearch: (val) => { setPurchaseSearch(val); setPurchasePage(1); },
            startDate: purchaseStartDate,
            setStartDate: (val) => { setPurchaseStartDate(val); setPurchasePage(1); },
            endDate: purchaseEndDate,
            setEndDate: (val) => { setPurchaseEndDate(val); setPurchasePage(1); }
          }}
        />
      )}

      {activeTab === 'add' && (
        <AddPurcchase 
          id={id} 
          fetchPurchaseHistory={refetchPurchases}
          onCancel={() => setActiveTab('history')}
          dealerName={dealer.name}
        />
      )}

      <PurchaseOrderModal 
        isOpen={showPurchaseOrderModal}
        onClose={() => setShowPurchaseOrderModal(false)}
        dealerId={id}
        dealerName={dealer.name}
        onOrderCreated={() => {
          refetchPurchases();
          refetchDealer();
        }}
      />
    </div>
  );
};

export default DealerProfile;