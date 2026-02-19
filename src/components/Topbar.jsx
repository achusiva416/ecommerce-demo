import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { clearUser } from '../features/auth/authSlice';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Settings, User } from 'lucide-react';
import { IMAGE_PATH } from '../utils/constants';

export default function Topbar({setIsOpen, isOpen}) {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const toggleSidebar = () => {
    setIsOpen(true);
  };

  const handleLogout = () => {
    dispatch(clearUser());
    localStorage.removeItem('token');
    localStorage.removeItem('persist:root');
    localStorage.removeItem('redirecturl');
    navigate('/login');
  };
  
  return (
    <div className="container-fluid py-2">
      <div className="d-flex align-items-center">
        <button
          className="btn btn-link p-0 me-3 d-lg-none text-dark"
          type="button"
          aria-label="Toggle sidebar"
          onClick={() => {
            toggleSidebar();
          }}
        >
          <i className="bi bi-list" style={{ fontSize: '1.5rem' }}></i>
        </button>
       
        <div className="row d-none d-sm-block">
          <div className="col-12">
            <h5 className="m-0 h5 text-dark">Yogify Dashboard</h5>
            <p className="text-muted m-0" style={{ fontSize: "13px" }}>
              Simplify your inventory and order management
            </p>
          </div>
        </div>

        <div className="ms-auto d-flex align-items-center gap-3">
          <button className="btn btn-light rounded-circle position-relative">
            <i className="bi bi-bell"></i>
            <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle">
              <span className="visually-hidden">New alerts</span>
            </span>
          </button>
          
          <div className="dropdown">
            <div 
              className="d-flex align-items-center cursor-pointer dropdown-toggle hide-arrow" 
              data-bs-toggle="dropdown" 
              aria-expanded="false"
              role="button"
            >
              <img 
                className="rounded-circle me-2 border" 
                src="https://cdn-icons-png.flaticon.com/512/219/219983.png" 
                width="40" 
                height="40" 
                alt="Profile"
              />
              <div className="d-none d-md-block text-start">
                <div className="fw-semibold text-dark">{user.name}</div>
                <div className="small text-muted" style={{ fontSize: '11px' }}>{ user.is_admin == 1 ? 'Administrator' : 'Inventory Staff'}</div>
              </div>
            </div>
            
            <ul className="dropdown-menu dropdown-menu-end shadow border-0 mt-2">
              <li>
                <div className="d-flex align-items-center px-3 py-2 border-bottom mb-2">
                  <div className="flex-shrink-0 me-2">
                    <img 
                      className="rounded-circle" 
                      src="https://cdn-icons-png.flaticon.com/512/219/219983.png" 
                      width="32" 
                      height="32" 
                      alt="Profile"
                    />
                  </div>
                  <div className="flex-grow-1">
                    <h6 className="mb-0 small fw-bold text-dark">{user.name}</h6>
                    <small className="text-muted" style={{ fontSize: '10px' }}>{user.email}</small>
                  </div>
                </div>
              </li>
              <li>
                <Link className="dropdown-item d-flex align-items-center py-2" to="/settings">
                  <Settings size={16} className="me-2 text-muted" />
                  <span>General Settings</span>
                </Link>
              </li>
              <li><hr className="dropdown-divider" /></li>
              <li>
                <button 
                  className="dropdown-item d-flex align-items-center py-2 text-danger" 
                  onClick={handleLogout}
                >
                  <LogOut size={16} className="me-2" />
                  <span>Logout</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
