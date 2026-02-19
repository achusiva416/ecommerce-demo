import React, { useState, useEffect,useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import apiClient from "../../services/apiClient";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold } from '@tiptap/extension-bold';
import { Italic } from '@tiptap/extension-italic';
import { Underline } from '@tiptap/extension-underline';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { ListItem } from '@tiptap/extension-list-item';
import { BulletList } from '@tiptap/extension-bullet-list';
import { OrderedList } from '@tiptap/extension-ordered-list';
import DescriptionSection from "./components/DescriptionSection";
import RichTextEditor from "./components/RichTextEditor";
import SortableImageItem from "./components/SortableImageItem";
import ProductSavingLoader from "../savingLoader/ProductSavingLoader";
import { useQueryClient } from "@tanstack/react-query";
import GroupingModal from "./components/GroupingModal";
import AddDealerModal from "../dealers/components/AddDealerModal";

const AddProductPage = () => {
  const [formData, setFormData] = useState({
    code: "",
    product_code: "",
    name: "",
    specification: "",
    price: "",
    sale_price: "",
    stock: "",
    size: "",
    variant: "",
    parent_id: "",
    category_id: "",
    video_url: "",
    video_file: null,
    dealer_id: "",
    purchase_price: "",
    pack_of: "",
    brand: "",
    base_material: "",
    net_quantity: "",
    model_name: "",
    gemstone: "",
    color: "",
    model_number: "",
    necklace_type: "",
    finish: "",
    chain_type: "",
    necklace_thickness: "",
    ideal_for: "",
    number_of_gems: "",
    visibility: 1,
    is_custom: false,
    custom_field: {}

  });
  
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [openDealerModal, setOpenDealerModal] = useState(false);
  const [products, setProducts] = useState([]);
  const [images, setImages] = useState([]);
  const [variantThumbnail, setVariantThumbnail] = useState(null);
  const [variantThumbnailPreview, setVariantThumbnailPreview] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [availableKeywords, setAvailableKeywords] = useState([
    "Spiritual", "Traditional", "Ayurveda", "Handmade", "Eco-friendly"
  ]);
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [newKeyword, setNewKeyword] = useState("");
  const [isRecommended, setIsRecommended] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [activePreview, setActivePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [descriptionSections, setDescriptionSections] = useState([{
    content: '',
    image: null,
    imagePreview: null
  }]);
  const [videoOptions, setVideoOptions] = useState({
    useUrl: true,
    useFile: false,
  });
  const [sizeOptions, setSizeOptions] = useState([]);
  const [variantOptions, setVariantOptions] = useState([]);
  const [openSizeDialog, setOpenSizeDialog] = useState(false);
  const [openVariantDialog, setOpenVariantDialog] = useState(false);
  const [newSize, setNewSize] = useState("");
  const [newVariant, setNewVariant] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [videos, setVideos] = useState([
    {
      id: 1,
      useUrl: true,
      useFile: false,
      video_url: "",
      video_file: null,
      video_preview: "",
      isExpanded: true
    }
  ]);

  const [customFieldModalOpen, setCustomFieldModalOpen] = useState(false);
  const [editLabelModalOpen, setEditLabelModalOpen] = useState(false);

  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [editLabelOldKey, setEditLabelOldKey] = useState("");
  const [editLabelNewKey, setEditLabelNewKey] = useState("");

  const [showGroupingModal, setShowGroupingModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const newFieldInputRefs = useRef({});
  const queryClient = useQueryClient();



  const animatedComponents = makeAnimated();

  const specificationEditor = useEditor({
    extensions: [
      StarterKit,
      Bold,
      Italic,
      Underline,
      TextStyle,
      Color,
      BulletList,
      OrderedList,
      ListItem.configure({
        HTMLAttributes: {
          class: 'list-item',
        },
      }),
    ],
    content: formData.specification || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setFormData(prev => ({ ...prev, specification: html }));
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const productOptions = products.map(product => ({
    value: product.id,
    label: `${product.code} - ${product.name}`,
    product: product
  }));

  const handleParentProductChange = (selectedOption) => {
    if (selectedOption) {
      setFormData(prev => ({ ...prev, parent_id: selectedOption.value }));
    } else {
      setFormData(prev => ({ ...prev, parent_id: "" }));
    }
  };

  const handleGroupingConfirm = (group, products) => {
    setFormData(prev => ({ ...prev, parent_id: group.value }));
    setSelectedGroup(group.label);
    toast.success(`Product assigned to group: ${group.label}`);
  };

  const customStyles = {
    control: (base, state) => ({
      ...base,
      border: '1px solid #dee2e6',
      borderRadius: '0.375rem',
      minHeight: '45px',
      boxShadow: state.isFocused ? '0 0 0 0.2rem rgba(13, 110, 253, 0.25)' : 'none',
      borderColor: state.isFocused ? '#86b7fe' : '#dee2e6',
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

  const toggleKeyword = (keyword) => {
    setSelectedKeywords((prev) =>
      prev.includes(keyword)
        ? prev.filter((k) => k !== keyword)
        : [...prev, keyword]
    );
  };

  const addNewKeyword = () => {
    const trimmed = newKeyword.trim();
    if (!trimmed) return;
    apiClient.post("/keywords", { name: trimmed });
    fetchKeywords();
    setNewKeyword("");
  };

  const removeKeyword = (keyword) => {
    setSelectedKeywords((prev) => prev.filter((k) => k !== keyword));
  };

  const fetchKeywords = async () => {
    try {
      const res = await apiClient.get("/keywords");
      const keywords = res.data.map((x) => x.keyword).filter(Boolean);
      // Unique-ify the keywords to prevent duplicate key warnings
      const uniqueKeywords = [...new Set(keywords)];
      setAvailableKeywords(uniqueKeywords || []);
    } catch (error) {
      console.error("Error fetching keywords:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await apiClient.get("/categories");
      setCategories(res.data?.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await apiClient.get("/products");
      setProducts(res.data?.data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
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

  const fetchDealers = async () => {
    try {
      const res = await apiClient.get("/dealers");
      setDealers(res.data.data || []);
    } catch (error) {
      console.error("Error fetching dealers:", error);
    }
  };

  const fetchProductFields = async () => {
    try {
      const res = await apiClient.get("/product-fields");
      if (res.data && Array.isArray(res.data)) {
        const fieldsObj = {};
        res.data.forEach((f) => {
          fieldsObj[f.feild_name] = "";
        });
        setFormData((prev) => ({
          ...prev,
          custom_field: { ...fieldsObj },
        }));
      }
    } catch (error) {
      console.error("Error fetching product fields:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();
    fetchKeywords();
    fetchSizes();
    fetchVariants();
    fetchDealers();
    fetchProductFields();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    const files = Array.from(e.target.files);

    const validImages = files.filter(file => allowedTypes.includes(file.type));

    if (validImages.length !== files.length) {
      toast.error("Some files were not valid images (jpg, jpeg, png).");
    }

    const imagesWithPreview = validImages.map((file, index) => ({
      id: `img-${Date.now()}-${index}`,
      file,
      preview: URL.createObjectURL(file),
      order: images.length + index
    }));

    setImages(prev => [...prev, ...imagesWithPreview]);
  };

  const handleVariantThumbnailUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (variantThumbnailPreview) {
        URL.revokeObjectURL(variantThumbnailPreview);
      }
      setVariantThumbnail(file);
      setVariantThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveVariantThumbnail = () => {
    if (variantThumbnailPreview) {
      URL.revokeObjectURL(variantThumbnailPreview);
    }
    setVariantThumbnail(null);
    setVariantThumbnailPreview("");
  };

  const handleRemoveImage = (index) => {
    const newImages = [...images];
    URL.revokeObjectURL(newImages[index].preview);
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleRemovePdf = () => {
    setPdfFile(null);
  };

  const handleDealerAdded = (newDealer) => {
    setDealers(prev => [...prev, newDealer]);
    setFormData(prev => ({ ...prev, dealer_id: newDealer.id }));
    setOpenDealerModal(false);
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
    setIsDragging(true);
    const activeItem = images.find(img => img.id === event.active.id);
    if (activeItem) {
      setActivePreview(activeItem.preview);
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setImages((currentItems) => {
        const oldIndex = currentItems.findIndex(item => item.id === active.id);
        const newIndex = currentItems.findIndex(item => item.id === over.id);
        
        const newItems = arrayMove(currentItems, oldIndex, newIndex);
        
        return newItems.map((item, idx) => ({
          ...item,
          order: idx
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

  const addVideoSection = () => {
    const newId = videos.length > 0 ? Math.max(...videos.map(v => v.id)) + 1 : 1;
    setVideos(prev => [
      ...prev,
      {
        id: newId,
        useUrl: true,
        useFile: false,
        video_url: "",
        video_file: null,
        video_preview: "",
        isExpanded: true
      }
    ]);
  };

  const removeVideoSection = (id) => {
    if (videos.length <= 1) {
      toast.info("At least one video section is required");
      return;
    }
    
    const videoToRemove = videos.find(v => v.id === id);
    if (videoToRemove && videoToRemove.video_preview) {
      URL.revokeObjectURL(videoToRemove.video_preview);
    }
    
    setVideos(prev => prev.filter(video => video.id !== id));
  };

  const updateVideoSection = (id, field, value) => {
    setVideos(prev => 
      prev.map(video => 
        video.id === id ? { ...video, [field]: value } : video
      )
    );
  };

  const handleVideoOptionChange = (id, option) => {
    setVideos(prev => 
      prev.map(video => 
        video.id === id ? { 
          ...video, 
          [option]: !video[option] 
        } : video
      )
    );
  };

  const handleVideoUpload = (id, e) => {
    const file = e.target.files[0];
    if (file) {
      const videoToUpdate = videos.find(v => v.id === id);
      if (videoToUpdate && videoToUpdate.video_preview) {
        URL.revokeObjectURL(videoToUpdate.video_preview);
      }
      
      setVideos(prev => 
        prev.map(video => 
          video.id === id ? { 
            ...video, 
            video_file: file,
            video_preview: URL.createObjectURL(file)
          } : video
        )
      );
    }
  };

  const handleRemoveVideo = (id) => {
    const videoToUpdate = videos.find(v => v.id === id);
    if (videoToUpdate && videoToUpdate.video_preview) {
      URL.revokeObjectURL(videoToUpdate.video_preview);
    }
    
    setVideos(prev => 
      prev.map(video => 
        video.id === id ? { 
          ...video, 
          video_file: null,
          video_preview: ""
        } : video
      )
    );
  };

  const toggleVideoSection = (id) => {
    setVideos(prev => 
      prev.map(video => 
        video.id === id ? { ...video, isExpanded: !video.isExpanded } : video
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const data = new FormData();
    Object.entries(formData).forEach(([key, val]) => {
      if ((key === 'specification') && (val === '' || val === '<p></p>')) {
        return;
      }
      if (val !== null && val !== undefined) {
        if(key === 'specification'){
          data.append('description', val);
        } else {
          data.append(key, val);
        }
      }
    });

    images.forEach((img, index) => {
      data.append("images[]", img.file);
      data.append(`images_order[${index}]`, index);
    });

    if (variantThumbnail) {
      data.append('variant_thumbnail', variantThumbnail);
    }

    videos.forEach((video, index) => {
      if (video.useUrl && video.video_url) {
        data.append(`videos[${index}][video_url]`, video.video_url);
      }
      if (video.useFile && video.video_file) {
        data.append(`videos[${index}][video_file]`, video.video_file);
      }
      data.append(`videos[${index}][use_url]`, video.useUrl ? 1 : 0);
      data.append(`videos[${index}][use_file]`, video.useFile ? 1 : 0);
    });
    
    data.append("recommended", isRecommended ? 1 : 0);
    data.append("custom_feilds",JSON.stringify(formData.custom_field));

    if (pdfFile) {
      data.append("pdf", pdfFile);
    }

    selectedKeywords.forEach((kw, index) => {
      data.append(`keywords[${index}]`, kw);
    });

    descriptionSections.forEach((section, index) => {
      if (section.content && section.content !== '<p></p>') {
        data.append(`description_sections[${index}][content]`, section.content);
      }
      if (section.image) {
        data.append(`description_sections[${index}][image]`, section.image);
      }
    });

    try {
      await apiClient.post("/products", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Product added successfully!");
      images.forEach(img => URL.revokeObjectURL(img.preview));
      if (videoPreview) URL.revokeObjectURL(videoPreview);
      descriptionSections.forEach(section => {
        if (section.imagePreview) URL.revokeObjectURL(section.imagePreview);
      });
      if (variantThumbnailPreview) URL.revokeObjectURL(variantThumbnailPreview);
      
      setFormData({
        code: "",
        name: "",
        specification: "",
        price: "",
        sale_price: "",
        stock: "",
        size: "",
        variant: "",
        parent_id: "",
        category_id: "",
        video_url: "",
        video_file: null,
        is_custom: false,
        pack_of: "",
        brand: "",
        base_material: "",
        net_quantity: "",
        model_name: "",
        gemstone: "",
        color: "",
        model_number: "",
        necklace_type: "",
        finish: "",
        chain_type: "",
        necklace_thickness: "",
        ideal_for: "",
        number_of_gems: "",
        visibility: 1,
      });
      specificationEditor.commands.setContent('');
      setImages([]);
      setVariantThumbnail(null);
      setVideoFile(null);
      setVideoPreview("");
      setPdfFile(null);
      setSelectedKeywords([]);
      setDescriptionSections([{
        content: '',
        image: null,
        imagePreview: null
      }]);
      navigate('/products/active');
      setIsLoading(false);
      queryClient.invalidateQueries({ queryKey: ['products'] });
    } catch (err) {
      console.log(err);
      
      let errorMessage = "Failed to add product";
      
      if (err.response) {
        errorMessage = err.response.data?.message || err.response.data?.error || "Server error occurred";
      } else if (err.request) {
        errorMessage = "Network error - please check your connection";
      } else {
        errorMessage = err.message || "An unexpected error occurred";
      }
      
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (specificationEditor && formData.specification !== specificationEditor.getHTML()) {
      specificationEditor.commands.setContent(formData.specification || '');
    }
  }, [formData.specification, specificationEditor]);

  const addNewCategory = async () => {
    if (!newCategory.trim()) return;
    try {
      const res = await apiClient.post("/categories", { 
        name: newCategory 
      });
      setCategories(prev => [...prev, res.data.data]);
      setFormData(prev => ({ ...prev, category_id: res.data.data.id }));
      setNewCategory("");
      setOpenCategoryDialog(false);
      toast.success("Category added successfully!");
    } catch (err) {
      console.log(err);
      toast.error(err);
    }
  };

  const addNewSize = async () => {
    if (!newSize.trim()) return;
    try {
      const res = await apiClient.post("/sizes", { 
        name: newSize 
      });
      setSizeOptions(prev => [...prev, res.data.data]);
      setFormData(prev => ({ ...prev, size: res.data.data.size }));
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
        name: newVariant 
      });
        setVariantOptions(prev => [...prev, res.data]);
        setFormData(prev => ({ ...prev, variant: res.data.name }));
        setNewVariant("");
        setOpenVariantDialog(false);
        toast.success("Variant added successfully!");
    } catch (err) {
      console.log(err);
      toast.error("Failed to add variant");
    }
  };

  useEffect(() => {
    return () => {
      images.forEach(img => URL.revokeObjectURL(img.preview));
      if (videoPreview) URL.revokeObjectURL(videoPreview);
      descriptionSections.forEach(section => {
        if (section.imagePreview) URL.revokeObjectURL(section.imagePreview);
      });
      if (variantThumbnailPreview) URL.revokeObjectURL(variantThumbnailPreview);
    };
  }, [images, videoPreview, descriptionSections, variantThumbnailPreview]);

  const addDescriptionSection = () => {
    setDescriptionSections([...descriptionSections, {
      content: '',
      image: null,
      imagePreview: null
    }]);
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

  const selectedParentProduct = productOptions.find(option => 
    option.value.toString() === formData.parent_id.toString()
  );

  const handleVisibilityChange = (e) => {
    if (e.target.checked) {
      setFormData(prev => ({
        ...prev,
        visibility: 0
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        visibility: 1
      }));
    }
  };

  const handleCustomToggle = (e) => {
    if (e.target.checked) {
      setFormData(prev => ({
        ...prev,
        is_custom: true,
        stock: 1000,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        is_custom: false,
        stock: 0,
      }));
    }
  };

  // Add field from modal
  const addCustomFieldFromModal = () => {
    const label = newFieldLabel.trim();
    if (!label) {
      toast.error("Label is required");
      return;
    }

    setFormData(prev => ({
      ...prev,
      custom_field: {
        ...prev.custom_field,
        [label]: ""
      }
    }));

    setCustomFieldModalOpen(false);
    setNewFieldLabel("");

    // Autofocus on new input
    setTimeout(() => {
      if (newFieldInputRefs.current[label]) {
        newFieldInputRefs.current[label].focus();
      }
    }, 150);
  };

  // Edit label save
  const saveEditedLabel = () => {
    const oldKey = editLabelOldKey;
    const newKey = editLabelNewKey.trim();

    if (!newKey) {
      toast.error("Label cannot be empty");
      return;
    }

    setFormData(prev => {
      const updated = { ...prev.custom_field };
      const value = updated[oldKey];

      delete updated[oldKey];
      updated[newKey] = value;

      return { ...prev, custom_field: updated };
    });

    setEditLabelModalOpen(false);
  };

  // Delete field
  const deleteCustomField = (key) => {
    setFormData(prev => {
      const updated = { ...prev.custom_field };
      delete updated[key];
      return { ...prev, custom_field: updated };
    });
  };

  return (
    <>
      <AddDealerModal 
        isOpen={openDealerModal} 
        onClose={() => setOpenDealerModal(false)} 
        onDealerAdded={handleDealerAdded} 
      />

      {isLoading ? (
        <ProductSavingLoader/>
      ) : (
        <>
          <div className="container py-2">
            {/* Breadcrumb */}
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
                    <Link to="/products" className="text-decoration-none">
                      <i className="bi bi-box me-1"></i>
                      Products
                    </Link>
                  </li>
                  <li className="breadcrumb-item active" aria-current="page">
                    <i className="bi bi-folder-plus me-1"></i>
                    Add Products
                  </li>
                </ol>
              </nav>
            </div>

            <div className="card shadow-sm border-0 overflow-hidden">
              <div className="card-body p-4">
                <form onSubmit={handleSubmit} className="needs-validation" noValidate>
                  <div className="row g-4">

                    {/* ========== 1. BASIC INFORMATION ========== */}
                    <div className="col-12">
                      <h6 className="text-secondary mb-3 fw-semibold border-bottom pb-2">
                        Basic Information
                      </h6>
                    </div>

                    {/* Name */}
                    <div className="col-md-6">
                      <div className="form-floating">
                        <input
                          type="text"
                          className="form-control"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Name"
                          required
                        />
                        <label htmlFor="name" className="text-gray-700">
                          Name
                        </label>
                      </div>
                    </div>

                    {/* Code */}
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
                        />
                        <label htmlFor="code" className="text-gray-700">
                          HSN Code
                        </label>
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <div className="form-floating">
                        <input
                          type="text"
                          className="form-control"
                          id="product_code"
                          name="product_code"
                          value={formData.product_code}
                          onChange={handleInputChange}
                          placeholder="Code"
                        />
                        <label htmlFor="code" className="text-gray-700">
                         Product Code
                        </label>
                      </div>
                    </div>
                    {/* Category */}
                    <div className="col-md-6">
                      <div className="form-floating position-relative">
                        <select
                          className="form-select"
                          id="categorySelect"
                          value={formData.category_id}
                          name="category_id"
                          onChange={handleInputChange}
                          required
                        >
                          <option value=""></option>
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.category_name}
                            </option>
                          ))}
                        </select>
                        <label htmlFor="categorySelect" className="text-gray-700">
                          Category
                        </label>
                        <div className="position-absolute end-0 top-0 mt-3 me-3">
                          <button 
                            type="button"
                            className="btn btn-sm btn-outline-primary bg-white"
                            onClick={() => setOpenCategoryDialog(true)}
                            style={{ borderRadius: '4px' }}
                          >
                            <i className="bi bi-plus-lg me-1"></i> New
                          </button>
                        </div>
                      </div>
                    </div>

                    

                    {/* Visibility Toggle */}
                    <div className="col-md-6">
                      <div className="form-check form-switch">
                        <input
                          className={`form-check-input ${!formData.visibility && 'bg-primary'}`}
                          type="checkbox"
                          name="visibility"
                          id="visibilitySwitch"
                          value={formData.visibility}
                          onChange={handleVisibilityChange}
                          checked={formData.visibility == 0}
                        />
                        <label className="form-check-label" htmlFor="visibilitySwitch">
                          Hide Product
                        </label>
                      </div>
                    </div>

                    {/* Custom Product Toggle */}
                    <div className="col-md-6">
                      <div className="form-check form-switch">
                        <input
                          className={`form-check-input ${formData.is_custom && 'bg-primary'}`}
                          type="checkbox"
                          name="is_custom"
                          id="customProductSwitch"
                          value={formData.is_custom}
                          onChange={handleCustomToggle}
                          checked={formData.is_custom}
                        />
                        <label className="form-check-label" htmlFor="customProductSwitch">
                          Check if this is a custom product
                        </label>
                      </div>
                    </div>

                    {/* ========== 3. PRICING & INVENTORY ========== */}
                    <div className="col-12 mt-4">
                      <h6 className="text-secondary mb-3 fw-semibold border-bottom pb-2">
                        Pricing & Inventory
                      </h6>
                    </div>

                    {["price", "sale_price", "stock"].map((field) => (
                      !(formData.is_custom && field === "stock") && (
                        <div className="col-md-4" key={field}>
                          <div className="form-floating">
                            <input
                              type="number"
                              className="form-control"
                              id={field}
                              name={field}
                              value={formData[field]}
                              onChange={handleInputChange}
                              placeholder={field.replace("_", " ")}
                              required={field === "price"}
                              min="0"
                              step={field === "stock" ? "1" : "0.01"}
                            />
                            <label htmlFor={field} className="text-gray-700">
                              {field === "sale_price"
                                ? "Sale Price"
                                : field.charAt(0).toUpperCase() + field.slice(1)}
                              {["price", "sale_price"].includes(field) ? " (₹)" : ""}
                            </label>
                          </div>
                        </div>
                      )
                    ))}

                    {/* ========== PURCHASE INFORMATION ========== */}
                    <div className="col-12 mt-4">
                      <h6 className="text-secondary mb-3 fw-semibold border-bottom pb-2">
                        Purchase Information
                      </h6>
                    </div>

                    <div className="col-md-6">
                      <div className="form-floating position-relative">
                        <select
                          className="form-select"
                          id="dealerSelect"
                          value={formData.dealer_id}
                          name="dealer_id"
                          onChange={handleInputChange}
                        >
                          <option value="">Select Dealer (Optional)</option>
                          {dealers.map((dealer) => (
                            <option key={dealer.id} value={dealer.id}>
                              {dealer.name}
                            </option>
                          ))}
                        </select>
                        <label htmlFor="dealerSelect" className="text-gray-700">
                          Dealer Name
                        </label>
                        <div className="position-absolute end-0 top-0 mt-3 me-3">
                          <button 
                            type="button"
                            className="btn btn-sm btn-outline-primary bg-white"
                            onClick={() => setOpenDealerModal(true)}
                            style={{ borderRadius: '4px' }}
                          >
                            <i className="bi bi-plus-lg me-1"></i> New
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-floating">
                        <input
                          type="number"
                          className="form-control"
                          id="purchase_price"
                          name="purchase_price"
                          value={formData.purchase_price}
                          onChange={handleInputChange}
                          placeholder="Purchase Price"
                          min="0"
                          step="0.01"
                          required={formData.dealer_id !== ""}
                        />
                        <label htmlFor="purchase_price" className="text-gray-700">
                          Purchase Price {formData.dealer_id && "*"}
                        </label>
                      </div>
                    </div>

                    {/* ========== 2. MEDIA (IMAGES & PDF) ========== */}
                    <div className="col-12 mt-4">
                      <h6 className="text-secondary mb-3 fw-semibold border-bottom pb-2">
                        Media
                      </h6>
                    </div>

                    {/* Image Upload */}
                    <div className="col-6">
                      <div className="mb-3">
                        <label className="form-label fw-medium text-secondary">
                          Product Images
                        </label>
                        <div className="d-flex align-items-center gap-3 mb-3">
                          <label className="btn btn-primary px-4" style={{ borderRadius: '4px' }}>
                            <i className="bi bi-image me-2"></i>Select Images
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              className="d-none"
                              onChange={handleImageUpload}
                            />
                          </label>
                          <small className="text-muted">Max 10 images (JPEG, PNG)</small>
                        </div>

                        {images.length > 0 && (
                          <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                            onDragCancel={handleDragCancel}
                          >
                            <SortableContext 
                              items={images.map(img => img.id)} 
                              strategy={horizontalListSortingStrategy}
                            >
                              <div className="d-flex flex-wrap gap-3">
                                {images
                                  .sort((a, b) => a.order - b.order)
                                  .map((img, index) => (
                                    <SortableImageItem
                                      key={img.id}
                                      id={img.id}
                                      index={index}
                                      img={img}
                                      handleRemoveImage={handleRemoveImage}
                                    />
                                  ))}
                              </div>
                            </SortableContext>
                            <DragOverlay>
                              {activeId && activePreview ? (
                                <div
                                  className="position-relative"
                                  style={{ width: '120px', height: '120px' }}
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

                    {/* PDF Upload */}
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label fw-medium text-secondary mb-2">
                          Product Documentation
                        </label>
                        <div className="d-flex align-items-center gap-3">
                          <label
                            className="btn btn-outline-primary px-4"
                            style={{ borderRadius: '4px' }}
                          >
                            <i className="bi bi-file-earmark-pdf me-2"></i>Upload PDF
                            <input
                              type="file"
                              accept=".pdf"
                              className="d-none"
                              onChange={(e) => setPdfFile(e.target.files[0])}
                            />
                          </label>
                          {pdfFile && (
                            <>
                              <span
                                className="small text-muted text-truncate"
                                style={{ maxWidth: '150px' }}
                              >
                                {pdfFile.name}
                              </span>
                              <button
                                type="button"
                                className="btn btn-outline-danger btn-sm px-3"
                                onClick={handleRemovePdf}
                                style={{ borderRadius: '4px' }}
                              >
                                Remove
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    

                    

                    {/* ========== 4. VIDEOS ========== */}
                    <div className="col-12 mt-4">
                      <h6 className="text-secondary mb-3 fw-semibold border-bottom pb-2">
                        Videos
                      </h6>
                    </div>

                    <div className="col-12">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <label className="form-label fw-medium text-secondary mb-0">
                          Product Videos
                        </label>
                        <button 
                          type="button" 
                          className="btn btn-outline-primary btn-sm"
                          onClick={addVideoSection}
                        >
                          <i className="bi bi-plus-circle me-1"></i>Add Video
                        </button>
                      </div>

                      {videos.map((video, index) => (
                        <div key={video.id} className="card border-0 shadow-sm mb-3">
                          <div className="card-body">

                            {/* Header */}
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <h6 className="mb-0">Video {index + 1}</h6>
                              {videos.length > 1 && (
                                <button 
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => removeVideoSection(video.id)}
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              )}
                            </div>

                            <div className="row">
                              {/* Select Type */}
                              <div className="mb-3 col-md-6">
                                <select
                                  className="form-select"
                                  value={video.useFile ? "file" : "url"}
                                  onChange={(e) =>
                                    updateVideoSection(
                                      video.id,
                                      "useFile",
                                      e.target.value === "file"
                                    )
                                  }
                                >
                                  <option value="url">Use Video URL</option>
                                  <option value="file">Upload Video File</option>
                                </select>
                              </div>


                              <div className="col-md-6">
                                  {/* URL INPUT */}
                                  {!video.useFile && (
                                    <div className="form-floating mb-3">
                                      <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Video URL"
                                        value={video.video_url}
                                        onChange={(e) => updateVideoSection(video.id, "video_url", e.target.value)}
                                      />
                                      <label>Video URL</label>
                                    </div>
                                  )}

                                  {/* FILE UPLOAD */}
                                  {video.useFile && (
                                    <div className="mb-3 col-md-6">
                                      <label className="btn btn-outline-primary w-100">
                                        <i className="bi bi-camera-video me-2"></i>Select Video File
                                        <input
                                          type="file"
                                          accept="video/*"
                                          className="d-none"
                                          onChange={(e) => handleVideoUpload(video.id, e)}
                                        />
                                      </label>

                                      {video.video_file && (
                                        <div className="mt-2">
                                          <small className="text-muted">
                                            {video.video_file.name} — {(video.video_file.size / (1024 * 1024)).toFixed(2)} MB
                                          </small>
                                          <button
                                            className="btn btn-sm btn-outline-danger ms-2"
                                            onClick={() => handleRemoveVideo(video.id)}
                                          >
                                            Remove
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  )}
                              </div>

                              
                            </div>

                            

                            {/* Preview */}
                            {video.video_preview && (
                              <video 
                                controls 
                                className="w-100 rounded border mt-2"
                                style={{ maxHeight: "250px" }}
                              >
                                <source src={video.video_preview} />
                              </video>
                            )}

                          </div>
                        </div>
                      ))}

                      {videos.length === 0 && (
                        <div className="text-center py-4 border rounded bg-light">
                          <p className="text-muted mb-2">No videos added</p>
                          <button 
                            type="button" 
                            className="btn btn-outline-primary"
                            onClick={addVideoSection}
                          >
                            <i className="bi bi-plus-circle me-1"></i>Add Video
                          </button>
                        </div>
                      )}
                    </div>


                    {/* ========== 5. PRODUCT DETAILS (ATTRIBUTES) ========== */}
                    <div className="col-12 mt-4">
                      <h6 className="text-secondary mb-3 fw-semibold border-bottom pb-2">
                        Product Details
                      </h6>
                    </div>

                    {/* Add to Group Button */}
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
                          Optional: Add this product to a group for variant management
                        </div>
                      </div>
                    </div>
                    {/* <div className="col-md-6 d-none d-sm-block">

                    </div> */}
                    {/* Size */}
                    <div className="col-md-6">
                      <div className="form-floating position-relative">
                        <select
                          className="form-select"
                          id="size"
                          name="size"
                          value={formData.size}
                          onChange={handleInputChange}
                        >
                          <option value=""></option>
                          {sizeOptions.map((size) => (
                            <option key={size.id} value={size.size}>
                              {size.size}
                            </option>
                          ))}
                        </select>
                        <label htmlFor="size" className="text-gray-700">
                          Size
                        </label>
                        <div className="position-absolute end-0 top-0 mt-3 me-3">
                          <button 
                            type="button"
                            className="btn btn-sm btn-outline-primary bg-white"
                            onClick={() => setOpenSizeDialog(true)}
                            style={{ borderRadius: '4px' }}
                          >
                            <i className="bi bi-plus-lg me-1"></i> New
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Variant */}
                    <div className="col-md-6">
                      <div className="form-floating position-relative">
                        <select
                          className="form-select"
                          id="variant"
                          name="variant"
                          value={formData.variant}
                          onChange={handleInputChange}
                        >
                          <option value=""></option>
                          {variantOptions.map((variant) => (
                            <option key={variant.id} value={variant.name}>
                              {variant.name}
                            </option>
                          ))}
                        </select>
                        <label htmlFor="variant" className="text-gray-700">
                          Variant
                        </label>
                        <div className="position-absolute end-0 top-0 mt-3 me-3">
                          <button 
                            type="button"
                            className="btn btn-sm btn-outline-primary bg-white"
                            onClick={() => setOpenVariantDialog(true)}
                            style={{ borderRadius: '4px' }}
                          >
                            <i className="bi bi-plus-lg me-1"></i> New
                          </button>
                        </div>
                      </div>
                    </div>

                    

                    {/* Variant Thumbnail */}
                    {formData.variant && (
                      <div className="col-12">
                        <div className="mb-3">
                          <label className="form-label fw-medium text-secondary">
                            {formData.variant} Variant Thumbnail
                          </label>
                          <div className="d-flex align-items-center gap-3">
                            <label className="btn btn-outline-primary px-4" style={{ borderRadius: '4px' }}>
                              <i className="bi bi-image me-2"></i>Select Variant Thumbnail
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="d-none" 
                                onChange={handleVariantThumbnailUpload} 
                              />
                            </label>
                            {variantThumbnail && variantThumbnailPreview && (
                              <div className="position-relative" style={{ width: '80px', height: '80px' }}>
                                <img
                                  src={variantThumbnailPreview}
                                  className="w-100 h-100 object-fit-cover rounded border"
                                  alt="Variant thumbnail preview"
                                />
                                <button
                                  type="button"
                                  className="btn btn-sm btn-danger position-absolute top-0 end-0 p-1"
                                  onClick={handleRemoveVariantThumbnail}
                                  style={{ borderRadius: '50%', width: '24px', height: '24px' }}
                                >
                                  <i className="bi bi-x"></i>
                                </button>
                              </div>
                            )}
                          </div>
                          <small className="text-muted">
                            This thumbnail will represent this specific variant
                          </small>
                        </div>
                      </div>
                    )}

                    {/* ========== 6. SPECIFICATION ========== */}
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
                          onUpdate={(content) => setFormData(prev => ({ ...prev, specification: content }))}
                          placeholder="Enter product specifications..."
                        />
                      </div>
                    </div>

                    
                      {/* ===========================
                          DYNAMIC CUSTOM FIELDS (NEW UI)
                      =========================== */}
                      <div className="col-12 mt-4">
                        <h6 className="text-secondary mb-3 fw-semibold border-bottom pb-2">
                          Additional Product Attributes
                        </h6>
                      </div>

                      <div className="col-12">
                        <div className="d-flex justify-content-end mb-3">
                          <button
                            type="button"
                            className="btn btn-outline-primary"
                            onClick={() => setCustomFieldModalOpen(true)}
                          >
                            <i className="bi bi-plus-circle me-2"></i>Add Field
                          </button>
                        </div>

                        {/* List all dynamic fields */}
                        <div className="row g-4">
                          {Object.entries(formData.custom_field).map(([key, value], index) => (
                            <div className="col-md-4" key={key}>

                              <div className="position-relative">

                                <div className="form-floating">
                                  <input
                                    type="text"
                                    className="form-control"
                                    value={value}
                                    placeholder={key}
                                    onChange={(e) =>
                                      setFormData(prev => ({
                                        ...prev,
                                        custom_field: {
                                          ...prev.custom_field,
                                          [key]: e.target.value
                                        }
                                      }))
                                    }
                                    ref={(el) => (newFieldInputRefs.current[key] = el)}
                                  />
                                  <label className="text-gray-700">{key}</label>
                                </div>

                                {/* Action Buttons (top-right) */}
                                <div className="position-absolute end-0 top-0 me-2 mt-2 d-flex gap-2">

                                  {/* Edit Label */}
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-light border px-2 py-1"
                                    onClick={() => {
                                      setEditLabelOldKey(key);
                                      setEditLabelNewKey(key);
                                      setEditLabelModalOpen(true);
                                    }}
                                    style={{ borderRadius: "4px" }}
                                  >
                                    <i className="bi bi-pencil text-primary"></i>
                                  </button>

                                  {/* Delete Field */}
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-light border px-2 py-1"
                                    onClick={() => deleteCustomField(key)}
                                    style={{ borderRadius: "4px" }}
                                  >
                                    <i className="bi bi-trash text-danger"></i>
                                  </button>

                                </div>

                              </div>

                            </div>
                          ))}
                        </div>

                        {Object.keys(formData.custom_field).length === 0 && (
                          <p className="text-muted text-center mt-2">No custom attributes added.</p>
                        )}

                      </div>



                    {/* ========== 8. DESCRIPTION SECTIONS ========== */}
                    <div className="col-12 mt-4">
                      <h6 className="text-secondary mb-3 fw-semibold border-bottom pb-2">
                        Description Sections
                      </h6>
                    </div>

                    <div className="col-12">
                      {descriptionSections.map((section, index) => (
                        <DescriptionSection
                          key={`desc-${index}-${section.imagePreview ? 'with-image' : 'no-image'}`}
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

                    {/* ========== 9. KEYWORDS & RECOMMENDED ========== */}
                    <div className="col-12 mt-4">
                      <h6 className="text-secondary mb-3 fw-semibold border-bottom pb-2">
                        Keywords & Recommendation
                      </h6>
                    </div>

                    {/* Keywords */}
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label fw-medium text-secondary">
                          Keywords
                        </label>
                        <div className="input-group mb-2">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Add keyword"
                            value={newKeyword}
                            onChange={(e) => setNewKeyword(e.target.value)}
                            onKeyDown={(e) => 
                              e.key === "Enter" && (e.preventDefault(), addNewKeyword())
                            }
                          />
                          <button 
                            type="button" 
                            className="btn btn-primary" 
                            onClick={addNewKeyword}
                            style={{ borderRadius: '4px' }}
                          >
                            <i className="bi bi-plus"></i>
                          </button>
                        </div>
                        <div className="d-flex gap-2 flex-wrap">
                          {availableKeywords.map((keyword) => (
                            <div
                              key={keyword}
                              className={`badge ${
                                selectedKeywords.includes(keyword)
                                  ? 'bg-primary'
                                  : 'bg-white text-primary border-primary'
                              } p-2 cursor-pointer`}
                              onClick={() => toggleKeyword(keyword)}
                              style={{ borderRadius: '4px' }}
                            >
                              {keyword}
                              {selectedKeywords.includes(keyword) && (
                                <i 
                                  className="bi bi-x ms-2" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeKeyword(keyword);
                                  }}
                                ></i>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Recommended Toggle */}
                    <div className="col-md-6">
                      <div className="h-100 d-flex flex-column justify-content-center">
                        <div className="form-check form-switch ps-0">
                          <div className="d-flex align-items-center">
                            <input
                              className="form-check-input ms-0 me-2"
                              type="checkbox"
                              role="switch"
                              checked={isRecommended}
                              onChange={(e) => setIsRecommended(e.target.checked)}
                              id="recommendedCheck"
                              style={{ width: '2.5em', height: '1.5em' }}
                            />
                            <label className="form-check-label fw-medium text-secondary" htmlFor="recommendedCheck">
                              Mark as Recommended Product
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ========== 10. ACTION BUTTONS ========== */}
                    <div className="col-12 mt-4 pt-2">
                      <div className="d-flex justify-content-end gap-3">
                        <button
                          type="button"
                          className="btn btn-outline-secondary px-4"
                          onClick={() => navigate(-1)}
                          style={{ borderRadius: '4px' }}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="btn btn-primary px-4"
                          style={{ borderRadius: '4px' }}
                          disabled={isLoading}
                        >
                          {!isLoading ? 'Save Product' : 'Saving..'}
                        </button>
                      </div>
                    </div>

                  </div>
                </form>
              </div>
            </div>

            {/* Add Category Modal */}
            <div className={`modal fade ${openCategoryDialog ? 'show d-block' : ''}`} tabIndex="-1">
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 shadow-lg">
                  <div className="modal-header bg-primary text-white">
                    <h5 className="modal-title">Add New Category</h5>
                    <button
                      type="button"
                      className="btn-close btn-close-white"
                      onClick={() => setOpenCategoryDialog(false)}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <div className="form-floating mb-3">
                      <input
                        type="text"
                        className="form-control"
                        id="newCategory"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        autoFocus
                        placeholder="Category Name"
                      />
                      <label htmlFor="newCategory">Category Name</label>
                    </div>
                  </div>
                  <div className="modal-footer border-0">
                    <button
                      type="button"
                      className="btn btn-outline-secondary px-4"
                      onClick={() => setOpenCategoryDialog(false)}
                      style={{ borderRadius: '4px' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary px-4"
                      onClick={addNewCategory}
                      style={{ borderRadius: '4px' }}
                    >
                      Add Category
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Add Size Modal */}
            <div className={`modal fade ${openSizeDialog ? 'show d-block' : ''}`} tabIndex="-1">
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
                      style={{ borderRadius: '4px' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary px-4"
                      onClick={addNewSize}
                      style={{ borderRadius: '4px' }}
                    >
                      Add Size
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Add Variant Modal */}
            <div className={`modal fade ${openVariantDialog ? 'show d-block' : ''}`} tabIndex="-1">
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
                      style={{ borderRadius: '4px' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary px-4"
                      onClick={addNewVariant}
                      style={{ borderRadius: '4px' }}
                    >
                      Add Variant
                    </button>
                  </div>
                </div>
              </div>
            </div>


            {/* Add Field Modal */}
            <div className={`modal fade ${customFieldModalOpen ? "show d-block" : ""}`}>
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 shadow-lg">

                  <div className="modal-header bg-primary text-white">
                    <h5 className="modal-title">Add New Attribute</h5>
                    <button className="btn-close btn-close-white"
                      onClick={() => setCustomFieldModalOpen(false)}
                    ></button>
                  </div>

                  <div className="modal-body">
                    <div className="form-floating">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Label Name"
                        value={newFieldLabel}
                        onChange={(e) => setNewFieldLabel(e.target.value)}
                        autoFocus
                      />
                      <label>Label Name</label>
                    </div>
                  </div>

                  <div className="modal-footer border-0">
                    <button 
                      className="btn btn-outline-secondary"
                      onClick={() => setCustomFieldModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      className="btn btn-primary"
                      onClick={addCustomFieldFromModal}
                    >
                      Add Field
                    </button>
                  </div>

                </div>
              </div>
            </div>


            {/* Edit Label Modal */}
            <div className={`modal fade ${editLabelModalOpen ? "show d-block" : ""}`}>
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 shadow-lg">

                  <div className="modal-header bg-primary text-white">
                    <h5 className="modal-title">Edit Attribute Label</h5>
                    <button className="btn-close btn-close-white"
                      onClick={() => setEditLabelModalOpen(false)}
                    ></button>
                  </div>

                  <div className="modal-body">
                    <div className="form-floating">
                      <input
                        type="text"
                        className="form-control"
                        value={editLabelNewKey}
                        onChange={(e) => setEditLabelNewKey(e.target.value)}
                        autoFocus
                      />
                      <label>New Label</label>
                    </div>
                  </div>

                  <div className="modal-footer border-0">
                    <button 
                      className="btn btn-outline-secondary"
                      onClick={() => setEditLabelModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      className="btn btn-primary"
                      onClick={saveEditedLabel}
                    >
                      Save Changes
                    </button>
                  </div>

                </div>
              </div>
            </div>



            {/* Grouping Modal */}
            <GroupingModal
              show={showGroupingModal}
              onClose={() => setShowGroupingModal(false)}
              onConfirm={handleGroupingConfirm}
            />

            {(openCategoryDialog || openSizeDialog || openVariantDialog || editLabelModalOpen || customFieldModalOpen || showGroupingModal) && (
              <div className="modal-backdrop fade show"></div>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default AddProductPage;
