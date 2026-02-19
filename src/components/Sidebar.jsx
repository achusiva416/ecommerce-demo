import React, { use, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  LayoutDashboard,
  ChevronDown,
  ChevronUp,
  Package,
  Boxes,
  ShoppingCart,
  Users,
  UserCog,
  RotateCcw,
  BookOpen,
  UserCheck,
  Layers,
  Undo2,
  Percent,
  BlocksIcon,
  BarChart3
} from 'lucide-react';


export default function Sidebar({ setIsOpen }) {
  const [openSections, setOpenSections] = useState({
    warehouse: true,  // Warehouse always open by default
    workshop: false
  });


  const toggleSection = (section) => {
    setOpenSections(prev => {
      // Close the other section when opening one
      const newState = {
        warehouse: section === 'warehouse' ? !prev.warehouse : false,
        workshop: section === 'workshop' ? !prev.workshop : false
      };
      
      // Ensure warehouse stays open if trying to close both
      if (section === 'workshop' && !prev.workshop) {
        newState.warehouse = false;
      }
      
      return newState;
    });
  };


  const user = useSelector((state) => state.auth.user);

  return (
    <div className="h-100 d-flex flex-column position-relative ">
     

      {/* Main Navigation */}
      <div className="menu">
        {/* Dashboard */}
        <div className="section-title d-flex justify-content-between align-items-center">
          <span>Dashboard</span>
          {/* Close Sidebar Button */}
          <button
            type="button"
            className="btn btn-link p-0 ms-2 d-lg-none text-decoration-none close-btn"
            style={{ lineHeight: 1 }}
            aria-label="Close sidebar"
            onClick={() => {
              setIsOpen(false);
            }}
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <NavLink 
          end 
          to="/" 
          onClick={() => {
              setIsOpen(false);
            }}
          className={({isActive}) => 'nav-link ' + (isActive ? 'active' : '')}
        >
          <LayoutDashboard size={18}/> 
          <span>Overview</span>
        </NavLink>
       
        {user && user.is_admin === 1 && (
          <NavLink 
            to="/analytics" 
            onClick={() => setIsOpen(false)}
            className={({isActive}) => 'nav-link ' + (isActive ? 'active' : '')}
          >
            <BarChart3 size={18}/> 
            <span>Analytics</span>
          </NavLink>
        )}

        {/* Warehouse Section - Always open by default */}
        <div 
          className="section-title mt-3 d-flex justify-content-between align-items-center" 
          style={{cursor: 'pointer'}}
          onClick={() => toggleSection('warehouse')}
        >
          <span>Warehouse</span>
          {/* {openSections.warehouse ? <ChevronUp size={16}/> : <ChevronDown size={16}/>} */}
        </div>

        <NavLink to="/categories" onClick={() => {setIsOpen(false)}} className={({isActive}) => 'nav-link ' + (isActive ? 'active' : '')}>
          <Layers size={18}/> 
          <span>Categories</span>
        </NavLink>

        <NavLink to="/products" onClick={() => {setIsOpen(false)}} className={({isActive}) => 'nav-link ' + (isActive ? 'active' : '')}>
          <Package size={18}/> 
          <span>Products</span>
        </NavLink>

        <NavLink to="/combo-products" onClick={() => {setIsOpen(false)}} className={({isActive}) => 'nav-link ' + (isActive ? 'active' : '')}>
          <Boxes size={18}/> 
          <span>Combo Products</span>
        </NavLink>

        <NavLink to="/orders" onClick={() => {setIsOpen(false)}} className={({isActive}) => 'nav-link ' + (isActive ? 'active' : '')}>
          <ShoppingCart size={18}/> 
          <span>Orders</span>
        </NavLink>
        
        <NavLink to="/returns" onClick={() => {setIsOpen(false)}} className={({isActive}) => 'nav-link ' + (isActive ? 'active' : '')}>
          <Undo2 size={18}/> 
          <span>Return Management</span>
        </NavLink>

        <NavLink to="/inventory" onClick={() => {setIsOpen(false)}} className={({isActive}) => 'nav-link ' + (isActive ? 'active' : '')}>
          <Boxes size={18}/> 
          <span>Inventory</span>
        </NavLink>
        <NavLink to="/users" onClick={() => {setIsOpen(false)}} className={({isActive}) => 'nav-link ' + (isActive ? 'active' : '')}>
          <UserCheck size={18}/> 
          <span>Users</span>
        </NavLink>
        <NavLink 
          to="/dealers" 
          onClick={() => setIsOpen(false)} 
          className={({ isActive }) => 'nav-link ' + (isActive ? 'active' : '')}
        >
          <Users size={18} /> 
          <span>Dealers</span>
        </NavLink>

        {user && user.is_admin === 1 && (
          <NavLink to="/staff" onClick={() => {setIsOpen(false)}} className={({isActive}) => 'nav-link ' + (isActive ? 'active' : '')}>
            <UserCog size={18}/> 
            <span>Staff Management</span>
          </NavLink>
        )}
        {user && user.is_admin === 1 && (
          <NavLink to="/deals" onClick={() => {setIsOpen(false)}} className={({isActive}) => 'nav-link ' + (isActive ? 'active' : '')}>
            <Percent size={18}/> 
            <span>Deals & Rewards</span>
          </NavLink>
        )}

        
        <NavLink to="/blogs" onClick={() => {setIsOpen(false)}} className={({isActive}) => 'nav-link ' + (isActive ? 'active' : '')}>
          <BlocksIcon size={18}/> 
          <span>Blog Management</span>
        </NavLink>
        
        
        {/* {openSections.warehouse && (
          <div className="submenu">
            

          </div>
        )} */}

        {/* {user.is_admin === 1 && (
          <>
            
            <div 
              className="section-title mt-3 d-flex justify-content-between align-items-center" 
              style={{ cursor: 'pointer' }}
              
              onClick={() => toggleSection('workshop')}
            >
              <span>Workshop</span>
              {openSections.workshop ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
            </div>
          </>
        )} */}

        
        {/* {user && user.is_admin === 1 && openSections.workshop && (
          <div className="submenu">
            <NavLink
              onClick={() => {setIsOpen(false)}}
              to="/teachers"
              className={({ isActive }) => 'nav-link ' + (isActive ? 'active' : '')}
            >
              <UserCheck size={18}/> 
              <span>Teachers</span>
            </NavLink>
            <NavLink
              onClick={() => {setIsOpen(false)}}
              to="/classes"
              className={({ isActive }) => 'nav-link ' + (isActive ? 'active' : '')}
            >
              <BookOpen size={18}/> 
              <span>Classes</span>
            </NavLink>
            <NavLink
              onClick={() => {setIsOpen(false)}}
              to="/workshop-users"
              className={({ isActive }) => 'nav-link ' + (isActive ? 'active' : '')}
            >
              <Users size={18}/> 
              <span>Workshop Users</span>
            </NavLink>
          </div>
        )} */}
      </div>
    </div>
  );
}