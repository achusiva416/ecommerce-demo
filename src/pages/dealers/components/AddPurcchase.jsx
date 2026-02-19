import React, { useEffect, useState } from "react";
import { 
  FaArrowLeft, 
  FaPencilAlt, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaRupeeSign,
  FaClock,
  FaCalendarAlt,
  FaImage,
  FaCheck,
  FaCircle  
} from 'react-icons/fa';
import useDealer from "../../../hooks/useDealer";
import Select from 'react-select';
import { toast } from "react-toastify";
import { printPurchaseOrder } from "../../../utils/printPurchaseOrder";
import YogifyPrintLogo from "../../../assets/Yogifyr-Print.png";

const AddPurchase = ({ id, onCancel, dealerName }) => {
  const [quantity, setQuantity] = useState("");
  const [rate, setRate] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [note, setNote] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedProductRate, setSelectedProductRate] = useState(null);

  const { products, createPurchase } = useDealer(id);

  const productOptions = products.map((prod) => ({
    value: prod.id,
    label: prod.name,
  }));

  const handleProductChange = (selectedOption) => {
    setSelectedProduct(selectedOption);
    const prod = products.find((p) => p.id === (selectedOption?.value));
    setSelectedProductRate(prod ? prod.sale_price : null);
  };

  const customStyles = {
    // Styles preserved from original
    control: (base, state) => ({
      ...base,
      border: "1px solid #dee2e6",
      borderRadius: "0.375rem",
      minHeight: "30px",
      boxShadow: state.isFocused
        ? "0 0 0 0.2rem rgba(13, 110, 253, 0.25)"
        : "none",
      borderColor: state.isFocused ? "#86b7fe" : "#dee2e6",
      "&:hover": {
        borderColor: state.isFocused ? "#86b7fe" : "#adb5bd",
      },
    }),
    menu: (base) => ({
      ...base,
      borderRadius: "0.375rem",
      border: "1px solid #dee2e6",
      boxShadow: "0 0.5rem 1rem rgba(0, 0, 0, 0.15)",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#0d6efd"
        : state.isFocused
        ? "#e9ecef"
        : "white",
      color: state.isSelected ? "white" : "#212529",
      ":active": {
        backgroundColor: state.isSelected ? "#0d6efd" : "#dee2e6",
      },
    }),
    singleValue: (base) => ({
      ...base,
      color: "#212529",
    }),
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct) {
      toast.error("Please select a product");
      return;
    }
    if (!quantity || !rate || !purchaseDate) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      await createPurchase({
        product_id: selectedProduct.value,
        quantity,
        rate,
        purchase_date: purchaseDate,
        notes: note,
      });
      
      // Automatic print after creation
      const printItems = [{
        name: selectedProduct.label,
        quantity: quantity,
        rate: rate
      }];
      printPurchaseOrder(printItems, dealerName || 'Dealer', YogifyPrintLogo);

      onCancel();

      // reset form
      setSelectedProduct(null);
      setQuantity("");
      setRate("");
      setPurchaseDate("");
      setNote("");
    } catch (error) {
      // Error handled in hook
    }
  };

  return (
    <div className="card border-0 shadow-sm" >
      <div className="card-body" style={{ padding: "32px" }}>
        <h5 className="mb-3" style={{ fontWeight: "600", fontSize: "18px" }}>
          Add New Purchase
        </h5>

        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6">
                <div className="mb-3">
                    <label
                    className="form-label"
                    style={{ fontSize: "14px", fontWeight: "500" }}
                    >
                    Product <span style={{ color: "#dc3545" }}>*</span>
                    </label>
                    <Select
                    options={productOptions}
                    value={selectedProduct}
                    onChange={handleProductChange}
                    isClearable={true}
                    isSearchable={true}
                    placeholder="Search and select product..."
                    noOptionsMessage={() => "No products found"}
                    styles={customStyles}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    />
                    {selectedProductRate && <span className="rate-indicater">product sale price {selectedProductRate}</span>}
                </div>

                {/* Quantity */}
                <div className="mb-3">
                    <label
                    className="form-label"
                    style={{ fontSize: "14px", fontWeight: "500" }}
                    >
                    Quantity <span style={{ color: "#dc3545" }}>*</span>
                    </label>
                    <input
                    type="number"
                    className="form-control"
                    placeholder="Enter quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    />
                </div>

                {/* Rate */}
                <div className="mb-3">
                    <label
                    className="form-label"
                    style={{ fontSize: "14px", fontWeight: "500" }}
                    >
                    Rate per Unit (₹) <span style={{ color: "#dc3545" }}>*</span>
                    </label>
                    <input
                    type="number"
                    className="form-control"
                    placeholder="Enter rate per unit"
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                    />
                </div>
            </div>
            <div className="col-md-6">
                {/* Purchase Date */}
                <div className="mb-3">
                    <label
                    className="form-label"
                    style={{ fontSize: "14px", fontWeight: "500" }}
                    >
                    Purchase Date <span style={{ color: "#dc3545" }}>*</span>
                    </label>
                    <input
                    type="date"
                    className="form-control"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    />
                </div>

                {/* Note */}
                <div className="mb-3">
                    <label
                    className="form-label"
                    style={{ fontSize: "14px", fontWeight: "500" }}
                    >
                    Note
                    </label>
                    <textarea
                    className="form-control"
                    rows="5"
                    placeholder="Additional notes (optional)"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    ></textarea>
                </div>
                
            </div>
            <div className="col-12 d-flex justify-content-end">
                <button type="submit" className="btn btn-primary">
                    <FaCheck className="me-2" />
                    Add Purchase
                </button>
            </div>  
          </div>
          

          

          
        </form>
      </div>
    </div>
  );
};

export default AddPurchase;
