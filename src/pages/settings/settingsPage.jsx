import React, { useState } from "react";
import {
  User,
  KeyRound,
  Tag,
  Package,
  Layers,
} from "lucide-react";

import ProfileSettings from "./tabs/ProfileSettings";
import ChangePassword from "./tabs/ChangePassword";
import KeywordSettings from "./tabs/KeywordSettings";
import SizeManagement from "./tabs/SizeManagement";
import VariantManagement from "./tabs/VariantManagement";
import ProductFieldSettings from "./tabs/ProductFieldSettings";

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("password");

  const tabs = [
    //  { key: "profile", label: "Profile Settings", icon: <User size={16} /> },
    { key: "password", label: "Change Password", icon: <KeyRound size={16} /> },
    { key: "keywords", label: "Keyword Settings", icon: <Tag size={16} /> },
    { key: "sizes", label: "Size Management", icon: <Package size={16} /> },
    { key: "variants", label: "Variant Management", icon: <Layers size={16} /> },
    { key: "product-fields", label: "Product Fields", icon: <Layers size={16} /> },
  ];

  return (
    <div className="container-fluid" style={{ maxWidth: "1300px" }}>
      <div className="settings-tab-wrapper shadow-sm mb-4">
        <ul className="settings-tabs">
          {tabs.map((tab) => (
            <li key={tab.key} className="tab-item">
              <button
                className={`tab-btn ${activeTab === tab.key ? "active" : ""}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-4">
        {activeTab === "profile" && <ProfileSettings />}
        {activeTab === "password" && <ChangePassword />}
        {activeTab === "keywords" && <KeywordSettings />}
        {activeTab === "sizes" && <SizeManagement />}
        {activeTab === "variants" && <VariantManagement />}
        {activeTab === "product-fields" && <ProductFieldSettings />}
      </div>
    </div>
  );
};

export default SettingsPage;
