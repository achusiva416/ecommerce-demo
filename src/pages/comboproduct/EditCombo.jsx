import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import apiClient from "../../services/apiClient";
import { IMAGE_PATH } from "../../utils/constants";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import SortableImageItem from "../product/components/SortableImageItem";
import DescriptionSection from "../product/components/DescriptionSection";
import RichTextEditor from "../product/components/RichTextEditor";
import { Link } from "react-router-dom";
import ComboGroupingModal from "./components/ComboGroupingModal";

const ComboProductEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    parent_id: "",
    code: "",
    specification: "",
  });
  const [comboImage, setComboImage] = useState(null);
  const [mainImagePreview, setMainImagePreview] = useState("");
  const [additionalImages, setAdditionalImages] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [comboProducts, setComboProducts] = useState([]); // For parent_id selection
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [combo, setCombo] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [activePreview, setActivePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [removedExistingImages, setRemovedExistingImages] = useState([]);

  // New state for sizes, variants, and variant images
  const [sizeOptions, setSizeOptions] = useState([]);
  const [variantOptions, setVariantOptions] = useState([]);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [variantImage, setVariantImage] = useState({ file: null, preview: "" });
  const [openSizeDialog, setOpenSizeDialog] = useState(false);
  const [openVariantDialog, setOpenVariantDialog] = useState(false);
  const [newSize, setNewSize] = useState("");
  const [newVariant, setNewVariant] = useState("");

  // ✅ New: Description sections state (like product)
  const [descriptionSections, setDescriptionSections] = useState([
    {
      content: "",
      image: null,
      imagePreview: null,
      existingImage: null,
      sectionId: null,
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

  useEffect(() => {
    fetchSizes();
    fetchVariants().then((variants) => {
      setVariantOptions(variants);
      fetchCombo(variants);
    });
    
    fetchAllProducts();
    fetchComboProducts();
  }, [id]);

  const fetchCombo = async (variants) => {
    try {
      const response = await apiClient.get(`/combo-products/${id}`);
      setCombo(response.data);
      // console.log(response.data)
      setFormData({
        name: response.data.title || "",
        price: response.data.combo_price || "",
        code: response.data.code || "",
        parent_id: response.data.parent_id || "",
    
        specification: response.data.specifications || response.data.description || "",
      });

      setSelectedGroup(response.data.group_name);

      setSelectedProducts(response.data.products || []);

      // ✅ Load description sections if backend provides them
      const rawSections =
        response.data.combo_descriptions ||
        response.data.product_description ||
        [];

      if (rawSections.length > 0) {
        const sections = rawSections.map((section) => ({
          content: section.content || "",
          image: null,
          imagePreview: section.image_path
            ? IMAGE_PATH + section.image_path
            : null,
          existingImage: section.image_path || null,
          sectionId: section.id,
        }));
        setDescriptionSections(sections);
      } else {
        setDescriptionSections([
          {
            content: "",
            image: null,
            imagePreview: null,
            existingImage: null,
            sectionId: null,
          },
        ]);
      }

      // Set size and variant if they exist
      if (response.data.size) {
        setSelectedSize({
          value: response.data.size,
          label: response.data.size,
        });
      }

      if (response.data.varient) {
        const previousVariant = variants.find(
          (v) => v.name === response.data.varient
        );
        if (previousVariant) {
          setSelectedVariant({
            label: previousVariant.name,
            value: previousVariant.id,
          });
        }

        // Set variant image if it exists
        if (response.data.varient_image_path) {
          setVariantImage({
            file: null,
            preview: `${IMAGE_PATH}${response.data.varient_image_path}`,
          });
        }
      }

      if (response.data.image_path) {
        setMainImagePreview(`${IMAGE_PATH}${response.data.image_path}`);
      }

      if (response.data.media?.length) {
        const existingPreviews = response.data.media.map((m, index) => ({
          id: `existing-${m.id}`,
          url: IMAGE_PATH + m.file_path,
          isExisting: true,
          fileId: m.id,
          order: m.orders || index,
        }));
        setAdditionalImages(existingPreviews);
      }
    } catch (error) {
      toast.error("Failed to fetch combo details");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

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
      return res.data || [];
    } catch (error) {
      console.error("Error fetching variants:", error);
    }
  };

  // Convert products to react-select format
  const productOptions = allProducts.map((product) => ({
    value: product.id,
    label: `${product.name} - ₹${product.price}`,
    product: product,
  }));

  // Convert combo products to react-select format (for parent_id selection)
  const comboProductOptions = comboProducts.map((combo) => ({
    value: combo.id,
    label: `${combo.title}`,
    product: combo,
  }));

  // Handle product selection change
  const handleProductChange = (selectedOptions) => {
    const selectedProductsData = selectedOptions.map((option) => option.product);
    setSelectedProducts(selectedProductsData);
  };

  // Handle parent product selection change
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

  // Size and Variant handlers
  const handleSizeChange = (selectedOption) => {
    setSelectedSize(selectedOption);
  };

  const handleVariantChange = (selectedOption) => {
    setSelectedVariant(selectedOption);
    // Clear variant image when variant changes
    if (variantImage.preview && !variantImage.preview.includes(IMAGE_PATH)) {
      URL.revokeObjectURL(variantImage.preview);
    }
    setVariantImage({ file: null, preview: "" });
  };

  const handleVariantImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Cleanup previous preview if exists
      if (variantImage.preview && !variantImage.preview.includes(IMAGE_PATH)) {
        URL.revokeObjectURL(variantImage.preview);
      }
      const preview = URL.createObjectURL(file);
      setVariantImage({ file, preview });
    }
  };

  const handleRemoveVariantImage = () => {
    if (variantImage.preview) {
      if (!variantImage.preview.includes(IMAGE_PATH)) {
        URL.revokeObjectURL(variantImage.preview);
      }
      setVariantImage({ file: null, preview: "" });
    }
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
      id: `new-${Date.now()}-${index}`,
      file,
      preview: URL.createObjectURL(file),
      isExisting: false,
      order: additionalImages.length + index,
    }));

    setAdditionalImages((prev) => [...prev, ...imagesWithPreview]);
  };

  const handleRemoveMainImage = () => {
    if (comboImage) {
      URL.revokeObjectURL(mainImagePreview);
      setComboImage(null);

      // Reset to original image if it exists
      if (combo?.image_path) {
        setMainImagePreview(`${IMAGE_PATH}${combo.image_path}`);
      } else {
        setMainImagePreview("");
      }
    } else if (combo?.image_path) {
      // Mark the main image for removal on server
      setComboImage("REMOVE");
      setMainImagePreview("");
    }
  };

  const handleRemoveAdditionalImage = (index, isExisting) => {
    const imageToRemove = additionalImages[index];

    if (isExisting) {
      // Add to removed images list for server processing
      setRemovedExistingImages((prev) => [...prev, imageToRemove.fileId]);
    } else if (imageToRemove.preview) {
      // Clean up object URL for new images
      URL.revokeObjectURL(imageToRemove.preview);
    }

    // Remove from display
    const newImages = [...additionalImages];
    newImages.splice(index, 1);
    setAdditionalImages(newImages);
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
    setIsDragging(true);
    const activeItem = additionalImages.find((img) => img.id === event.active.id);
    if (activeItem) {
      setActivePreview(activeItem.preview || activeItem.url);
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

  // ✅ Description section helpers
  const addDescriptionSection = () => {
    setDescriptionSections((prev) => [
      ...prev,
      {
        content: "",
        image: null,
        imagePreview: null,
        existingImage: null,
        sectionId: null,
      },
    ]);
  };

  const updateDescriptionSection = (index, field, value) => {
    const updatedSections = [...descriptionSections];
    updatedSections[index][field] = value;
    setDescriptionSections(updatedSections);
  };

  const removeDescriptionSection = (index) => {
    if (descriptionSections.length <= 1) {
      toast.info("At least one description section is required");
      return;
    }

    const updatedSections = [...descriptionSections];
    if (updatedSections[index].imagePreview) {
      URL.revokeObjectURL(updatedSections[index].imagePreview);
    }
    updatedSections.splice(index, 1);
    setDescriptionSections(updatedSections);
  };

  const saveCombo = async () => {
    try {
      setSaving(true);
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("code", formData.code);
      formDataToSend.append("price", formData.price);

      
      if (
        formData.specification &&
        formData.specification !== "" &&
        formData.specification !== "<p></p>"
      ) {
        formDataToSend.append("specifications", formData.specification);
      }

      if (formData.parent_id) {
        formDataToSend.append("parent_id", formData.parent_id);
      }

      if (comboImage === "REMOVE") {
        formDataToSend.append("remove_main_image", "1");
      } else if (comboImage) {
        formDataToSend.append("image", comboImage);
      }

      selectedProducts.forEach((product, index) => {
        formDataToSend.append(`products[${index}]`, product.id);
      });

 
      if (selectedSize) {
        formDataToSend.append("size", selectedSize.value);
      }

  
      if (selectedVariant) {
        formDataToSend.append("variant", selectedVariant.label);
        if (variantImage.file) {
          formDataToSend.append("variant_image", variantImage.file);
        } else if (!variantImage.preview && combo?.variant_image_path) {
      
          formDataToSend.append("remove_variant_image", "1");
        }
      }

   
      additionalImages
        .filter((img) => !img.isExisting && img.file instanceof File)
        .forEach((img, index) => {
          formDataToSend.append(`media[${index}][file]`, img.file);
          formDataToSend.append(`media[${index}][orders]`, index);
        });

      // Handle removed existing images
      if (removedExistingImages.length) {
        formDataToSend.append(
          "remove_media",
          JSON.stringify(removedExistingImages)
        );
      }

      // Update orders for retained existing images
      const retainedExisting = additionalImages
        .filter((img) => img.isExisting)
        .map((img, index) => ({
          id: img.fileId,
          orders: index,
        }));

      if (retainedExisting.length) {
        formDataToSend.append(
          "existing_media",
          JSON.stringify(retainedExisting)
        );
      }

      // ✅ Append description sections like product edit
      descriptionSections.forEach((section, index) => {
        if (section.sectionId) {
          formDataToSend.append(
            `description_sections[${index}][id]`,
            section.sectionId
          );
        }

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

        if (section.existingImage && !section.image) {
          formDataToSend.append(
            `description_sections[${index}][existing_image]`,
            section.existingImage
          );
        }

        if (
          section.existingImage &&
          !section.imagePreview &&
          !section.image
        ) {
          formDataToSend.append(
            `description_sections[${index}][remove_image]`,
            1
          );
        }
      });

      await apiClient.post(`/combo-products/${id}?_method=PUT`, formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Combo updated successfully!");

      // Cleanup
      additionalImages
        .filter((img) => !img.isExisting && img.preview)
        .forEach((img) => URL.revokeObjectURL(img.preview));

      if (
        comboImage &&
        comboImage !== "REMOVE" &&
        mainImagePreview &&
        !mainImagePreview.includes(IMAGE_PATH)
      ) {
        URL.revokeObjectURL(mainImagePreview);
      }

      if (
        variantImage.file &&
        variantImage.preview &&
        !variantImage.preview.includes(IMAGE_PATH)
      ) {
        URL.revokeObjectURL(variantImage.preview);
      }

      descriptionSections.forEach((section) => {
        if (section.imagePreview && section.imagePreview.startsWith("blob:")) {
          URL.revokeObjectURL(section.imagePreview);
        }
      });

      navigate("/combo-products");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update combo");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup object URLs
      additionalImages
        .filter((img) => !img.isExisting && img.preview)
        .forEach((img) => URL.revokeObjectURL(img.preview));

      if (
        comboImage &&
        comboImage !== "REMOVE" &&
        mainImagePreview &&
        !mainImagePreview.includes(IMAGE_PATH)
      ) {
        URL.revokeObjectURL(mainImagePreview);
      }

      if (
        variantImage.file &&
        variantImage.preview &&
        !variantImage.preview.includes(IMAGE_PATH)
      ) {
        URL.revokeObjectURL(variantImage.preview);
      }

      descriptionSections.forEach((section) => {
        if (section.imagePreview && section.imagePreview.startsWith("blob:")) {
          URL.revokeObjectURL(section.imagePreview);
        }
      });
    };
  }, [additionalImages, comboImage, mainImagePreview, variantImage, descriptionSections]);

  // Custom styles for react-select
  const customStyles = {
    control: (base, state) => ({
      ...base,
      border: "1px solid #dee2e6",
      borderRadius: "0.375rem",
      minHeight: "35px",
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
      backgroundColor: "#fff", // <--- MUST BE HERE
      borderRadius: "0.375rem",
      border: "1px solid #dee2e6",
      boxShadow: "0 0.5rem 1rem rgba(0,0,0,0.15)",
      zIndex: 9999, // important
    }),

    menuList: (base) => ({
      ...base,
      backgroundColor: "#fff", // <--- MUST BE HERE
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

  // Find the currently selected parent product for react-select
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
          <p className="mt-2 text-muted">Loading combo details...</p>
        </div>
      </div>
    );
  }

  if (!combo) {
    return (
      <div className="container py-4">
        <div className="card shadow-sm border-0 overflow-hidden">
          <div className="card-body text-center py-5">
            <i className="bi bi-exclamation-triangle display-4 text-muted mb-3"></i>
            <h4 className="text-muted">Combo not found</h4>
            <button
              className="btn btn-primary mt-2"
              onClick={() => navigate("/combo-products")}
            >
              Back to Combo Products
            </button>
          </div>
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
              Edit Combo Products
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

            

            <div className="col-md-6">
              <div className="form-floating">
                <input
                  type="text"
                  className="form-control"
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  placeholder="Code"
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

            {/* Parent Product Selection - Single Select */}
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
                          {/* Variant Image Upload */}
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

                          {/* Variant Image Preview */}
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
                    selectedProducts.some(
                      (product) => product.id === option.value
                    )
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
                  Start typing to search products. You can select multiple
                  products.
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
                              selectedProducts.filter(
                                (p) => p.id !== product.id
                              )
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
                  {mainImagePreview && (
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
                              isExisting={img.isExisting}
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
                  content={formData.specification}
                  onUpdate={(content) =>
                    setFormData((prev) => ({
                      ...prev,
                      specification: content,
                    }))
                  }
                  placeholder="Enter combo specifications..."
                />
              </div>
            </div>


            <div className="col-12 mt-4">
              <h6 className="text-secondary mb-3 fw-semibold border-bottom pb-2">
                Description Sections
              </h6>
            </div>

            <div className="col-12">
              {descriptionSections.map((section, index) => (
                <DescriptionSection
                  key={`desc-${index}-${section.sectionId || "new"}-${
                    section.imagePreview ? "with-image" : "no-image"
                  }`}
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
                  className="btn btn-primary px-4"
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
                      Updating...
                    </>
                  ) : (
                    "Update Combo"
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

export default ComboProductEdit;
