import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import apiClient from "../../services/apiClient";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableImageItem from "../product/components/SortableImageItem";
import DescriptionSection from "../product/components/DescriptionSection";
import RichTextEditor from "../product/components/RichTextEditor";
import { Link } from "react-router-dom";
import ComboGroupingModal from "./components/ComboGroupingModal";

const ComboProductAdd = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    parent_id: "",
    code: "",
  });

  const [comboImage, setComboImage] = useState(null);
  const [mainImagePreview, setMainImagePreview] = useState("");
  const [additionalImages, setAdditionalImages] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [comboProducts, setComboProducts] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState(null);
  const [activePreview, setActivePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Sizes & variants (single select)
  const [sizeOptions, setSizeOptions] = useState([]);
  const [variantOptions, setVariantOptions] = useState([]);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [variantImage, setVariantImage] = useState({ file: null, preview: "" });
  const [openSizeDialog, setOpenSizeDialog] = useState(false);
  const [openVariantDialog, setOpenVariantDialog] = useState(false);
  const [newSize, setNewSize] = useState("");
  const [newVariant, setNewVariant] = useState("");

  // NEW: specification + description sections
  const [specification, setSpecification] = useState("");
  const [descriptionSections, setDescriptionSections] = useState([
    {
      content: "",
      image: null,
      existingImage: null,
    },
  ]);

  const [showGroupingModal, setShowGroupingModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const animatedComponents = makeAnimated();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch regular products for product selection
  const fetchAllProducts = async () => {
    try {
      const response = await apiClient.get("/products");
      setAllProducts(response.data.data || []);
    } catch (error) {
      toast.error("Failed to fetch products");
      console.error(error);
    }
  };

  // Fetch combo products for parent_id selection
  const fetchComboProducts = async () => {
    try {
      const response = await apiClient.get("/combo-products");
      setComboProducts(response.data.data.data || []);
    } catch (error) {
      toast.error("Failed to fetch combo products");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSizes = async () => {
    try {
      const res = await apiClient.get("/sizes");
      setSizeOptions(res.data || []);
    } catch (error) {
      console.error("Error fetching sizes:", error);
    }
  };

  const fetchVariants = async () => {
    try {
      const res = await apiClient.get("/variants");
      setVariantOptions(res.data || []);
    } catch (error) {
      console.error("Error fetching variants:", error);
    }
  };

  useEffect(() => {
    fetchAllProducts();
    fetchComboProducts();
    fetchSizes();
    fetchVariants();
  }, []);

  // Convert regular products to react-select format (for product selection)
  const productOptions = allProducts.map((product) => ({
    value: product.id,
    label: `${product.name} - ₹${product.price}`,
    product: product,
  }));

  // Convert combo products to react-select format (for parent_id selection)
  const comboProductOptions = comboProducts.map((combo) => ({
    value: combo.id,
    label: `${combo.title} `,
    product: combo,
  }));

  // Handle product selection change (for regular products)
  const handleProductChange = (selectedOptions) => {
    const selectedProductsData = selectedOptions.map((option) => option.product);
    setSelectedProducts(selectedProductsData);
  };

  // Handle parent product selection change (for combo products)
  const handleParentProductChange = (selectedOption) => {
    if (selectedOption) {
      setFormData((prev) => ({ ...prev, parent_id: selectedOption.value }));
    } else {
      setFormData((prev) => ({ ...prev, parent_id: "" }));
    }
  };

  const handleGroupingConfirm = (group, combos) => {
    setFormData(prev => ({ ...prev, parent_id: group.value }));
    setSelectedGroup(group.label);
    toast.success(`Combo assigned to group: ${group.label}`);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Size and Variant handlers - Updated for single select
  const handleSizeChange = (selectedOption) => {
    setSelectedSize(selectedOption);
  };

  const handleVariantChange = (selectedOption) => {
    setSelectedVariant(selectedOption);
    if (variantImage.preview) {
      URL.revokeObjectURL(variantImage.preview);
    }
    setVariantImage({ file: null, preview: "" });
  };

  const handleVariantImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (variantImage.preview) {
        URL.revokeObjectURL(variantImage.preview);
      }
      const preview = URL.createObjectURL(file);
      setVariantImage({ file, preview });
    }
  };

  const handleRemoveVariantImage = () => {
    if (variantImage.preview) {
      URL.revokeObjectURL(variantImage.preview);
    }
    setVariantImage({ file: null, preview: "" });
  };

  const addNewSize = async () => {
    if (!newSize.trim()) return;
    try {
      const res = await apiClient.post("/sizes", {
        name: newSize,
      });
      setSizeOptions((prev) => [...prev, res.data.data]);
      setNewSize("");
      setOpenSizeDialog(false);
      toast.success("Size added successfully!");
    } catch (err) {
      console.log(err);
      toast.error("Failed to add size");
    }
  };

  const addNewVariant = async () => {
    if (!newVariant.trim()) return;
    try {
      const res = await apiClient.post("/variants", {
        name: newVariant,
      });
      setVariantOptions((prev) => [...prev, res.data]);
      setNewVariant("");
      setOpenVariantDialog(false);
      toast.success("Variant added successfully!");
    } catch (err) {
      console.log(err);
      toast.error("Failed to add variant");
    }
  };

  const handleMainImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setComboImage(file);
      setMainImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAdditionalImagesUpload = (e) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    const files = Array.from(e.target.files);

    const validImages = files.filter((file) => allowedTypes.includes(file.type));

    if (validImages.length !== files.length) {
      toast.error("Some files were not valid images (jpg, jpeg, png).");
    }

    const imagesWithPreview = validImages.map((file, index) => ({
      id: `img-${Date.now()}-${index}`,
      file,
      preview: URL.createObjectURL(file),
      order: additionalImages.length + index,
    }));

    setAdditionalImages((prev) => [...prev, ...imagesWithPreview]);
  };

  const handleRemoveMainImage = () => {
    if (mainImagePreview) URL.revokeObjectURL(mainImagePreview);
    setComboImage(null);
    setMainImagePreview("");
  };

  const handleRemoveAdditionalImage = (index) => {
    const newImages = [...additionalImages];
    URL.revokeObjectURL(newImages[index].preview);
    newImages.splice(index, 1);
    setAdditionalImages(newImages);
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
    setIsDragging(true);
    const activeItem = additionalImages.find((img) => img.id === event.active.id);
    if (activeItem) {
      setActivePreview(activeItem.preview);
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setAdditionalImages((currentItems) => {
        const oldIndex = currentItems.findIndex((item) => item.id === active.id);
        const newIndex = currentItems.findIndex((item) => item.id === over.id);

        const newItems = arrayMove(currentItems, oldIndex, newIndex);

        return newItems.map((item, idx) => ({
          ...item,
          order: idx,
        }));
      });
    }

    setActiveId(null);
    setActivePreview(null);
    setIsDragging(false);
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setActivePreview(null);
    setIsDragging(false);
  };

  // NEW: description sections handlers
  const addDescriptionSection = () => {
    setDescriptionSections((prev) => [
      ...prev,
      {
        content: "",
        image: null,
        existingImage: null,
      },
    ]);
  };

  const updateDescriptionSection = (index, field, value) => {
    const updated = [...descriptionSections];
    updated[index][field] = value;
    setDescriptionSections(updated);
  };

  const removeDescriptionSection = (index) => {
    if (descriptionSections.length <= 1) {
      toast.info("At least one description section is required");
      return;
    }
    const updated = [...descriptionSections];
    updated.splice(index, 1);
    setDescriptionSections(updated);
  };

  const saveCombo = async () => {
    try {
      setSaving(true);
      const formDataToSend = new FormData();
      formDataToSend.append("code", formData.code);
      formDataToSend.append("name", formData.name);
      formDataToSend.append("price", formData.price);

      // Parent combo
      if (formData.parent_id) {
        formDataToSend.append("parent_id", formData.parent_id);
      }

      // Specification -> same as product: send as "description"
      if (specification && specification !== "<p></p>") {
        formDataToSend.append("specifications", specification);
      }

      // Multiple description sections (same format as product)
      descriptionSections.forEach((section, index) => {
        if (section.content && section.content !== "<p></p>") {
          formDataToSend.append(
            `description_sections[${index}][content]`,
            section.content
          );
        }
        if (section.image) {
          formDataToSend.append(
            `description_sections[${index}][image]`,
            section.image
          );
        }
      });

      if (comboImage) formDataToSend.append("image", comboImage);

      // Selected products
      selectedProducts.forEach((product, index) => {
        formDataToSend.append(`products[${index}]`, product.id);
      });

      // Single size
      if (selectedSize) {
        formDataToSend.append("size", selectedSize.value);
      }

      // Variant + image
      if (selectedVariant) {
        formDataToSend.append("variant", selectedVariant.label);
        if (variantImage.file) {
          formDataToSend.append("variant_image", variantImage.file);
        }
      }

      // Additional images
      additionalImages
        .filter((img) => img.file instanceof File)
        .forEach((img, index) => {
          formDataToSend.append(`media[${index}][file]`, img.file);
          formDataToSend.append(`media[${index}][orders]`, index);
        });

      await apiClient.post("/combo-products", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Combo created successfully!");

      // Cleanup previews
      additionalImages.forEach((img) => URL.revokeObjectURL(img.preview));
      if (mainImagePreview) URL.revokeObjectURL(mainImagePreview);
      if (variantImage.preview) URL.revokeObjectURL(variantImage.preview);

      // Reset state
      setFormData({
        name: "",
        price: "",
        parent_id: "",
        code: "",
      });
      setComboImage(null);
      setMainImagePreview("");
      setAdditionalImages([]);
      setSelectedProducts([]);
      setSelectedSize(null);
      setSelectedVariant(null);
      setVariantImage({ file: null, preview: "" });
      setSpecification("");
      setDescriptionSections([
        {
          content: "",
          image: null,
          existingImage: null,
        },
      ]);

      navigate("/combo-products");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create combo");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    return () => {
      additionalImages.forEach((img) => URL.revokeObjectURL(img.preview));
      if (mainImagePreview) URL.revokeObjectURL(mainImagePreview);
      if (variantImage.preview) URL.revokeObjectURL(variantImage.preview);
    };
  }, [additionalImages, mainImagePreview, variantImage.preview]);

  // Custom styles for react-select
  const customStyles = {
    control: (base, state) => ({
      ...base,
      border: "1px solid #dee2e6",
      borderRadius: "0.375rem",
      minHeight: "45px",
      boxShadow: state.isFocused
        ? "0 0 0 0.2rem rgba(13, 110, 253, 0.25)"
        : "none",
      borderColor: state.isFocused ? "#86b7fe" : "#dee2e6",
    }),

    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
    }),

    menu: (base) => ({
      ...base,
      backgroundColor: "#fff",
      borderRadius: "0.375rem",
      border: "1px solid #dee2e6",
      boxShadow: "0 0.5rem 1rem rgba(0,0,0,0.15)",
      zIndex: 9999,
    }),

    menuList: (base) => ({
      ...base,
      backgroundColor: "#fff",
    }),
  };

  // Convert sizes and variants to react-select format
  const sizeSelectOptions = sizeOptions.map((size) => ({
    value: size.size,
    label: size.size,
  }));

  const variantSelectOptions = variantOptions.map((variant) => ({
    value: variant.id,
    label: variant.name,
  }));

  const selectedParentProduct = comboProductOptions.find(
    (option) => option.value.toString() === formData.parent_id.toString()
  );

  if (loading) {
    return (
      <div className="container py-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-2">
      <div className="col-12 px-0 col-md-6 d-flex justify-content-md-start py-2">
        <nav aria-label="breadcrumb" className="mb-1">
          <ol className="breadcrumb mb-0">
            <li className="breadcrumb-item">
              <Link to="/" className="text-decoration-none">
                <i className="bi bi-house-door me-1"></i>
                Dashboard
              </Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              <Link to="/combo-products" className="text-decoration-none">
                <i className="bi bi-boxes me-1"></i>
                Combo Products
              </Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              <i className="bi bi-folder-plus me-1"></i>
              Add Combo Products
            </li>
          </ol>
        </nav>
      </div>
      <div className="card shadow-sm border-0 overflow-hidden">
        <div className="card-body p-4">
          <div className="row g-4">
            {/* Basic Information Section */}
            <div className="col-12">
              <h6 className="text-secondary mb-3 fw-semibold border-bottom pb-2">
                Basic Information
              </h6>
            </div>

            {/* Parent Product Selection - Single Select (Combo Products) */}
            

            <div className="col-md-6">
              <div className="form-floating">
                <input
                  type="text"
                  className="form-control"
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  placeholder="Code "
                  required
                />
                <label htmlFor="code" className="text-gray-700">
                  Code
                </label>
              </div>
            </div>

            <div className="col-md-6">
              <div className="form-floating">
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Combo Name"
                  required
                />
                <label htmlFor="name" className="text-gray-700">
                  Combo Name
                </label>
              </div>
            </div>

            <div className="col-md-6">
              <div className="form-floating">
                <input
                  type="number"
                  className="form-control"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="Price"
                  required
                  min="0"
                  step="0.01"
                />
                <label htmlFor="price" className="text-gray-700">
                  Price (₹)
                </label>
              </div>
            </div>

            {/* Size and Variant Section */}
            <div className="col-12 mt-4">
              <h6 className="text-secondary mb-3 fw-semibold border-bottom pb-2">
                Sizes & Variants
              </h6>
            </div>

            <div className="col-md-12">
              <div className="mb-2">
                <div className="d-flex align-items-center gap-3">
                  <button
                    type="button"
                    className="btn btn-outline-primary px-4"
                    onClick={() => setShowGroupingModal(true)}
                    style={{ borderRadius: '4px' }}
                  >
                    <i className="bi bi-grid-3x3-gap-fill me-2"></i>
                    {formData.parent_id ? 'Change Group' : 'Add to Group'}
                  </button>
                  {formData.parent_id && (
                    <div className="d-flex align-items-center">
                      <span className="badge bg-light text-primary border border-primary p-2">
                        <i className="bi bi-link-45deg me-1"></i>
                        Group: {selectedGroup || formData.parent_id}
                      </span>
                      <button 
                        type="button" 
                        className="btn btn-sm btn-link text-danger ms-2"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, parent_id: "" }));
                          setSelectedGroup(null);
                        }}
                        title="Remove from group"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  )}
                </div>
                <div className="form-text">
                  Optional: Add this combo to a group for variant management
                </div>
              </div>
            </div>

            {/* Size Selection - Single Select */}
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label fw-medium text-secondary mb-2">
                  Size
                </label>
                <div className="d-flex gap-2 mb-2">
                  <Select
                    options={sizeSelectOptions}
                    value={selectedSize}
                    onChange={handleSizeChange}
                    styles={customStyles}
                    placeholder="Select size..."
                    noOptionsMessage={() => "No sizes found"}
                    isClearable={true}
                    className="flex-grow-1"
                  />
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={() => setOpenSizeDialog(true)}
                    style={{ borderRadius: "4px", whiteSpace: "nowrap" }}
                  >
                    <i className="bi bi-plus-lg me-1"></i> New
                  </button>
                </div>
                {selectedSize && (
                  <div className="mt-2">
                    <span className="badge bg-primary p-2">
                      Selected: {selectedSize.label}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Variant Selection - Single Select */}
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label fw-medium text-secondary mb-2">
                  Variant
                </label>
                <div className="d-flex gap-2 mb-2">
                  <Select
                    options={variantSelectOptions}
                    value={selectedVariant}
                    onChange={handleVariantChange}
                    styles={customStyles}
                    placeholder="Select variant..."
                    noOptionsMessage={() => "No variants found"}
                    isClearable={true}
                    className="flex-grow-1"
                  />
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={() => setOpenVariantDialog(true)}
                    style={{ borderRadius: "4px", whiteSpace: "nowrap" }}
                  >
                    <i className="bi bi-plus-lg me-1"></i> New
                  </button>
                </div>
                {selectedVariant && (
                  <div className="mt-2">
                    <span className="badge bg-primary p-2">
                      Selected: {selectedVariant.label}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Variant Image Section - Only show when variant is selected */}
            {selectedVariant && (
              <div className="col-12">
                <div className="mb-3">
                  <label className="form-label fw-medium text-secondary mb-3">
                    Variant Image for {selectedVariant.label}
                  </label>
                  <div className="row">
                    <div className="col-md-6 col-lg-4">
                      <div className="card border-0 shadow-sm">
                        <div className="card-body text-center">
                          <div className="mb-2">
                            <label className="btn btn-outline-primary btn-sm w-100 mb-2">
                              <i className="bi bi-image me-1"></i>
                              {variantImage.preview
                                ? "Change Image"
                                : "Upload Image"}
                              <input
                                type="file"
                                accept="image/*"
                                className="d-none"
                                onChange={handleVariantImageUpload}
                              />
                            </label>
                          </div>

                          {variantImage.preview && (
                            <div className="position-relative">
                              <img
                                src={variantImage.preview}
                                alt={`${selectedVariant.label} preview`}
                                className="img-thumbnail mb-2"
                                style={{
                                  width: "100px",
                                  height: "100px",
                                  objectFit: "cover",
                                }}
                              />
                              <button
                                type="button"
                                className="btn btn-danger btn-sm position-absolute top-0 end-0 p-1"
                                onClick={handleRemoveVariantImage}
                                style={{
                                  borderRadius: "50%",
                                  width: "24px",
                                  height: "24px",
                                }}
                              >
                                <i className="bi bi-x"></i>
                              </button>
                            </div>
                          )}

                          {!variantImage.preview && (
                            <div className="text-muted small">
                              No image selected for this variant
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Product Selection Section */}
            <div className="col-12 mt-4">
              <h6 className="text-secondary mb-3 fw-semibold border-bottom pb-2">
                Product Selection
              </h6>
            </div>

            <div className="col-12">
              <div className="mb-3">
                <label className="form-label fw-medium text-secondary mb-2">
                  Select Products *
                </label>
                <Select
                  isMulti
                  options={productOptions}
                  value={productOptions.filter((option) =>
                    selectedProducts.some((product) => product.id === option.value)
                  )}
                  onChange={handleProductChange}
                  components={animatedComponents}
                  styles={customStyles}
                  placeholder="Search and select products..."
                  noOptionsMessage={() => "No products found"}
                  isSearchable={true}
                  isClearable={true}
                  closeMenuOnSelect={false}
                  hideSelectedOptions={false}
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
                <div className="form-text mt-2">
                  Start typing to search products. You can select multiple products.
                </div>
              </div>
            </div>

            {/* Selected Products Display */}
            {selectedProducts.length > 0 && (
              <div className="col-12">
                <div className="mb-3">
                  <label className="form-label fw-medium text-secondary">
                    Selected Products ({selectedProducts.length}):
                  </label>
                  <div className="d-flex flex-wrap gap-2 mt-2">
                    {selectedProducts.map((product) => (
                      <div
                        key={product.id}
                        className="badge bg-primary p-2 d-flex align-items-center"
                      >
                        <span>{product.name}</span>
                        <button
                          type="button"
                          className="btn-close btn-close-white ms-2"
                          onClick={() => {
                            setSelectedProducts(
                              selectedProducts.filter((p) => p.id !== product.id)
                            );
                          }}
                          style={{ fontSize: "0.7rem" }}
                        ></button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Media Section */}
            <div className="col-12 mt-4">
              <h6 className="text-secondary mb-3 fw-semibold border-bottom pb-2">
                Media
              </h6>
            </div>

            {/* Main Image Upload */}
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label fw-medium text-secondary mb-2">
                  Main Combo Image
                </label>
                <div className="d-flex align-items-center gap-3 mb-2">
                  <label
                    className="btn btn-primary px-4"
                    style={{ borderRadius: "4px" }}
                  >
                    <i className="bi bi-image me-2"></i>Select Image
                    <input
                      type="file"
                      accept="image/*"
                      className="d-none"
                      onChange={handleMainImageUpload}
                    />
                  </label>
                  {comboImage && (
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm px-3"
                      onClick={handleRemoveMainImage}
                      style={{ borderRadius: "4px" }}
                    >
                      Remove
                    </button>
                  )}
                </div>
                {mainImagePreview && (
                  <div
                    className="position-relative mt-2"
                    style={{ width: "120px" }}
                  >
                    <img
                      src={mainImagePreview}
                      alt="Combo preview"
                      className="img-thumbnail"
                      style={{
                        width: "120px",
                        height: "120px",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Additional Images */}
            <div className="col-6">
              <div className="mb-3">
                <label className="form-label fw-medium text-secondary">
                  Additional Images
                </label>
                <div className="d-flex align-items-center gap-3 mb-3">
                  <label
                    className="btn btn-outline-primary px-4"
                    style={{ borderRadius: "4px" }}
                  >
                    <i className="bi bi-image me-2"></i>Select Images
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="d-none"
                      onChange={handleAdditionalImagesUpload}
                    />
                  </label>
                  <small className="text-muted">
                    JPEG, PNG files only
                  </small>
                </div>

                {additionalImages.length > 0 && (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onDragCancel={handleDragCancel}
                  >
                    <SortableContext
                      items={additionalImages.map((img) => img.id)}
                      strategy={horizontalListSortingStrategy}
                    >
                      <div className="d-flex flex-wrap gap-3">
                        {additionalImages
                          .sort((a, b) => a.order - b.order)
                          .map((img, index) => (
                            <SortableImageItem
                              key={img.id}
                              id={img.id}
                              index={index}
                              img={img}
                              handleRemoveImage={handleRemoveAdditionalImage}
                            />
                          ))}
                      </div>
                    </SortableContext>
                    <DragOverlay>
                      {activeId && activePreview ? (
                        <div
                          className="position-relative"
                          style={{ width: "120px", height: "120px" }}
                        >
                          <img
                            src={activePreview}
                            className="w-100 h-100 object-fit-cover rounded shadow-lg"
                          />
                        </div>
                      ) : null}
                    </DragOverlay>
                  </DndContext>
                )}
              </div>
            </div>

            

            {/* SPECIFICATION (Rich Text) */}
            <div className="col-12 mt-4">
              <h6 className="text-secondary mb-3 fw-semibold border-bottom pb-2">
                Specification
              </h6>
            </div>

            <div className="col-12">
              <div className="mb-3">
                <label className="form-label fw-medium text-secondary mb-2">
                  Specification
                </label>
                <RichTextEditor
                  content={specification}
                  onUpdate={(content) => setSpecification(content)}
                  placeholder="Enter combo specifications..."
                />
              </div>
            </div>

            {/* DESCRIPTION SECTIONS */}
            <div className="col-12 mt-4">
              <h6 className="text-secondary mb-3 fw-semibold border-bottom pb-2">
                Description Sections
              </h6>
            </div>

            <div className="col-12">
              {descriptionSections.map((section, index) => (
                <DescriptionSection
                  key={`desc-${index}`}
                  section={section}
                  index={index}
                  onUpdate={updateDescriptionSection}
                  onRemove={removeDescriptionSection}
                />
              ))}

              <div className="text-center mb-4">
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={addDescriptionSection}
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  Add Description Section
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="col-12 mt-4 pt-2">
              <div className="d-flex justify-content-end gap-3">
                <button
                  type="button"
                  className="btn btn-outline-secondary px-4"
                  onClick={() => navigate("/combo-products")}
                  style={{ borderRadius: "4px" }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={saveCombo}
                  disabled={
                    saving ||
                    !formData.name ||
                    !formData.price ||
                    selectedProducts.length === 0
                  }
                  style={{ borderRadius: "4px" }}
                >
                  {saving ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                      ></span>
                      Creating...
                    </>
                  ) : (
                    "Create Combo"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Size Modal */}
      <div
        className={`modal fade ${openSizeDialog ? "show d-block" : ""}`}
        tabIndex="-1"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title">Add New Size</h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={() => setOpenSizeDialog(false)}
              ></button>
            </div>
            <div className="modal-body">
              <div className="form-floating mb-3">
                <input
                  type="text"
                  className="form-control"
                  id="newSize"
                  value={newSize}
                  onChange={(e) => setNewSize(e.target.value)}
                  autoFocus
                  placeholder="Size Name"
                />
                <label htmlFor="newSize">Size Name</label>
              </div>
            </div>
            <div className="modal-footer border-0">
              <button
                type="button"
                className="btn btn-outline-secondary px-4"
                onClick={() => setOpenSizeDialog(false)}
                style={{ borderRadius: "4px" }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary px-4"
                onClick={addNewSize}
                style={{ borderRadius: "4px" }}
              >
                Add Size
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Variant Modal */}
      <div
        className={`modal fade ${openVariantDialog ? "show d-block" : ""}`}
        tabIndex="-1"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title">Add New Variant</h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={() => setOpenVariantDialog(false)}
              ></button>
            </div>
            <div className="modal-body">
              <div className="form-floating mb-3">
                <input
                  type="text"
                  className="form-control"
                  id="newVariant"
                  value={newVariant}
                  onChange={(e) => setNewVariant(e.target.value)}
                  autoFocus
                  placeholder="Variant Name"
                />
                <label htmlFor="newVariant">Variant Name</label>
              </div>
            </div>
            <div className="modal-footer border-0">
              <button
                type="button"
                className="btn btn-outline-secondary px-4"
                onClick={() => setOpenVariantDialog(false)}
                style={{ borderRadius: "4px" }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary px-4"
                onClick={addNewVariant}
                style={{ borderRadius: "4px" }}
              >
                Add Variant
              </button>
            </div>
          </div>
        </div>
      </div>

      {(openSizeDialog || openVariantDialog || showGroupingModal) && (
        <div className="modal-backdrop fade show"></div>
      )}

      <ComboGroupingModal
        show={showGroupingModal}
        onClose={() => setShowGroupingModal(false)}
        onConfirm={handleGroupingConfirm}
      />
    </div>
  );
};

export default ComboProductAdd;
