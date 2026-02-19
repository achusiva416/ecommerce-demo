// src/pages/blogs/BlogAdd.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import apiClient from "../../services/apiClient";
import { IMAGE_PATH } from "../../utils/constants"; // still ok even if unused now
import RichTextEditor from "../product/components/RichTextEditor";

const BlogAdd = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    short_description: "",
    content: "The content field is required.",
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
    canonical_tag: "",
    og_title: "",
    og_description: "",
    status: "draft", 
  });

  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [ogImageFile, setOgImageFile] = useState(null);
  const [ogImagePreview, setOgImagePreview] = useState("");
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [readingTime, setReadingTime] = useState(null);

  const [slugTouched, setSlugTouched] = useState(false);

  const [descriptionSections, setDescriptionSections] = useState([
    {
      title: "",
      content: "",
      imageFile: null,
      imagePreview: "",
    },
  ]);

  // ---------- Helpers ----------
  const generateSlug = (value) => {
    return value
      .toString()
      .trim()
      .toLowerCase()
      .replace(/[\s_]+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Base update
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "title" && !slugTouched) {
      const slug = generateSlug(value);
      setFormData((prev) => ({
        ...prev,
        title: value,
        slug,
      }));
    }

    if (name === "slug") {
      setSlugTouched(true);
      setFormData((prev) => ({
        ...prev,
        slug: generateSlug(value),
      }));
    }
  };

  const handleContentChange = (content) => {
    setFormData((prev) => ({ ...prev, content }));

    // estimate reading time from HTML
    const text = content
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const words = text ? text.split(" ").length : 0;
    const minutes = Math.max(1, Math.ceil(words / 200));
    setReadingTime(words ? minutes : null);
  };

  // ---------- Thumbnail (Main Image) ----------
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (thumbnailPreview) {
      URL.revokeObjectURL(thumbnailPreview);
    }
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const handleRemoveThumbnail = () => {
    if (thumbnailPreview) {
      URL.revokeObjectURL(thumbnailPreview);
    }
    setThumbnailFile(null);
    setThumbnailPreview("");
  };

  // ---------- OG Image ----------
  const handleOgImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (ogImagePreview) {
      URL.revokeObjectURL(ogImagePreview);
    }
    setOgImageFile(file);
    setOgImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveOgImage = () => {
    if (ogImagePreview) {
      URL.revokeObjectURL(ogImagePreview);
    }
    setOgImageFile(null);
    setOgImagePreview("");
  };

  const handleStatusChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      status: value,
    }));
  };

  // ---------- Description section handlers ----------
  const addDescriptionSection = () => {
    setDescriptionSections((prev) => [
      ...prev,
      { title: "", content: "", imageFile: null, imagePreview: "" },
    ]);
  };

  const updateSectionField = (index, field, value) => {
    setDescriptionSections((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleSectionTitleChange = (index, e) => {
    updateSectionField(index, "title", e.target.value);
  };

  const handleSectionContentChange = (index, content) => {
    updateSectionField(index, "content", content);
  };

  const handleSectionImageChange = (index, e) => {
    const file = e.target.files[0];
    if (!file) return;

    setDescriptionSections((prev) => {
      const copy = [...prev];
      const current = copy[index];

      // clean old preview if any
      if (current.imagePreview) {
        URL.revokeObjectURL(current.imagePreview);
      }

      copy[index] = {
        ...current,
        imageFile: file,
        imagePreview: URL.createObjectURL(file),
      };

      return copy;
    });
  };

  const handleRemoveSectionImage = (index) => {
    setDescriptionSections((prev) => {
      const copy = [...prev];
      const current = copy[index];

      if (current.imagePreview) {
        URL.revokeObjectURL(current.imagePreview);
      }

      copy[index] = {
        ...current,
        imageFile: null,
        imagePreview: "",
      };

      return copy;
    });
  };

  const removeDescriptionSection = (index) => {
    setDescriptionSections((prev) => {
      if (prev.length === 1) {
        toast.info("At least one section is recommended.");
        return prev;
      }

      const copy = [...prev];
      const section = copy[index];

      if (section.imagePreview) {
        URL.revokeObjectURL(section.imagePreview);
      }

      copy.splice(index, 1);
      return copy;
    });
  };

  // ---------- Submit ----------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.slug) {
      toast.error("Title  required");
      return;
    }

    setIsSaving(true);

    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("slug", formData.slug);
      data.append("content", formData.content);

      if (formData.short_description) {
        data.append("short_description", formData.short_description);
      }

      if (thumbnailFile) {
        data.append("thumbnail", thumbnailFile);
      }

      if (formData.meta_title) data.append("meta_title", formData.meta_title);
      if (formData.meta_description)
        data.append("meta_description", formData.meta_description);
      if (formData.meta_keywords)
        data.append("meta_keywords", formData.meta_keywords);
      if (formData.canonical_tag)
        data.append("canonical_tag", formData.canonical_tag);

      if (formData.og_title) data.append("og_title", formData.og_title);
      if (formData.og_description)
        data.append("og_description", formData.og_description);
      if (ogImageFile) data.append("og_image", ogImageFile);

      data.append("status", formData.status);

      if (formData.status === "published") {
       
        data.append("published_at", new Date().toISOString());
      }

      if (readingTime) {
        data.append("reading_time", readingTime);
      }
      if (coverImageFile) {
        data.append("cover_image", coverImageFile);
      }

      
      descriptionSections.forEach((section, index) => {
        const hasData =
          section.title ||
          (section.content && section.content !== "<p></p>") ||
          section.imageFile;

        if (!hasData) return;

        if (section.title) {
          data.append(`description_sections[${index}][title]`, section.title);
        }
        if (section.content && section.content !== "<p></p>") {
          data.append(
            `description_sections[${index}][content]`,
            section.content
          );
        }
        if (section.imageFile) {
          data.append(
            `description_sections[${index}][image]`,
            section.imageFile
          );
        }
        


        data.append(`description_sections[${index}][order]`, index);
      });

      await apiClient.post("/blogs", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Blog created successfully!");
      navigate("/blogs");
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.message || "Failed to create blog. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (coverImagePreview) URL.revokeObjectURL(coverImagePreview);

    setCoverImageFile(file);
    setCoverImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveCoverImage = () => {
    if (coverImagePreview) URL.revokeObjectURL(coverImagePreview);
    setCoverImageFile(null);
    setCoverImagePreview("");
  };

 
  useEffect(() => {
    return () => {
      if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
      if (ogImagePreview) URL.revokeObjectURL(ogImagePreview);

      descriptionSections.forEach((section) => {
        if (section.imagePreview) {
          URL.revokeObjectURL(section.imagePreview);
        }
      });
    };
   
  }, []);

  return (
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
            <li className="breadcrumb-item">
              <Link to="/blogs" className="text-decoration-none">
                <i className="bi bi-journal-text me-1"></i>
                Blogs
              </Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              <i className="bi bi-folder-plus me-1"></i>
              Add Blog
            </li>
          </ol>
        </nav>
      </div>

      <div className="card shadow-sm border-0 overflow-hidden">
        <div className="card-body p-4">
          <form onSubmit={(e) => e.preventDefault()} className="needs-validation" noValidate>
            <div className="row g-4">
              {/* 1. BASIC INFO */}
              <div className="col-12">
                <h6 className="text-secondary mb-3 fw-semibold border-bottom pb-2">
                  Basic Information
                </h6>
              </div>

              {/* Title */}
              <div className="col-md-12">
                <div className="form-floating mb-3">
                  <input
                    type="text"
                    className="form-control"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Blog Title"
                    required
                  />
                  <label htmlFor="title" className="text-gray-700">
                    Title
                  </label>
                </div>
              </div>

              {/* Slug */}
              <div className="col-md-12">
                <div className="form-floating mb-3">
                  <input
                    type="text"
                    className="form-control"
                    id="slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    placeholder="Slug"
                    required
                  />
                  <label htmlFor="slug" className="text-gray-700">
                    Slug
                  </label>
                  <div className="form-text">
                    This will be used in the blog URL (auto-generated from
                    title, but you can edit).
                  </div>
                </div>
              </div>

              {/* Short Description */}
              <div className="col-12">
                <div className="form-floating mb-3">
                  <textarea
                    className="form-control"
                    id="short_description"
                    name="short_description"
                    value={formData.short_description}
                    onChange={handleInputChange}
                    placeholder="Short description"
                    style={{ minHeight: "80px" }}
                  />
                  <label htmlFor="short_description" className="text-gray-700">
                    Short Description (excerpt)
                  </label>
                </div>
              </div>

              {/* 2. THUMBNAIL */}
              <div className="col-md-6">
                <label className="form-label fw-medium">Thumbnail (4:5)</label>

                <div className="border rounded p-3 text-center" style={{ borderColor: "#b87333" }}>
                    {!thumbnailPreview ? (
                    <label className="cursor-pointer w-100">
                        <i className="bi bi-cloud-upload fs-2 text-brown"></i>
                        <div className="mt-2">Upload Thumbnail</div>
                        <input
                        type="file"
                        accept="image/*"
                        className="d-none"
                        onChange={handleThumbnailChange}
                        />
                    </label>
                    ) : (
                    <>
                        <img
                        src={thumbnailPreview}
                        className="img-fluid rounded"
                        style={{ aspectRatio: "4 / 5", objectFit: "cover" }}
                        />
                        <button
                        type="button"
                        className="btn btn-outline-danger btn-sm mt-2 w-100"
                        onClick={handleRemoveThumbnail}
                        >
                        Remove
                        </button>
                    </>
                    )}
                </div>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-medium">Cover Image (950 × 230)</label>

                <div className="border rounded p-3 text-center" style={{ borderColor: "#b87333" }}>
                    {!coverImagePreview ? (
                    <label className="cursor-pointer w-100">
                        <i className="bi bi-cloud-upload fs-2 text-brown"></i>
                        <div className="mt-2">Upload Cover Image</div>
                        <input
                        type="file"
                        accept="image/*"
                        className="d-none"
                        onChange={handleCoverImageChange}
                        />
                    </label>
                    ) : (
                    <>
                        <img
                          src={coverImagePreview}
                          className="img-fluid rounded"
                          style={{ aspectRatio: "950 / 230", objectFit: "cover" }}
                        />
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm mt-2 w-100"
                          onClick={handleRemoveCoverImage}
                        >
                        Remove
                        </button>
                    </>
                    )}
                </div>
              </div>


              {/* 3. MAIN CONTENT */}
              {/* <div className="col-12 mt-4">
                <h6 className="text-secondary mb-3 fw-semibold border-bottom pb-2">
                  Content
                </h6>
              </div>

              <div className="col-12">
                <div className="mb-2 d-flex justify-content-between align-items-center">
                  <label className="form-label fw-medium text-secondary mb-0">
                    Blog Content
                  </label>
                  {readingTime && (
                    <small className="text-muted">
                      Estimated reading time: {readingTime} min
                    </small>
                  )}
                </div>
                <RichTextEditor
                  content={formData.content}
                  onUpdate={handleContentChange}
                  placeholder="Write your blog content here..."
                  enableImageUpload={true}
                />
              </div> */}

              {/* 4. DESCRIPTION SECTIONS */}
              <div className="col-12 mt-4">
                <h6 className="text-secondary mb-3 fw-semibold border-bottom pb-2">
                  Additional Description Sections
                </h6>
                <p className="text-muted small mb-3">
                  These sections will appear as separate blocks on the blog page.
                  Each block can have a title, rich description, and an image.
                  Recommended image ratio: <strong>4 : 5</strong>.
                </p>
              </div>

              <div className="col-12">
                {descriptionSections.map((section, index) => (
                  <div className="card border-0 shadow-sm mb-3">
                    <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6 className="mb-0 text-secondary">Section {index + 1}</h6>

                        <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => removeDescriptionSection(index)}
                        >
                            <i className="bi bi-trash me-1"></i> Remove
                        </button>
                        </div>

                        <div className="row g-3">
                        {/* Left: Content */}
                        <div className="col-md-9">
                            <label className="form-label fw-medium text-secondary">Content</label>
                            <RichTextEditor
                            content={section.content}
                            onUpdate={(value) => handleSectionContentChange(index, value)}
                            placeholder="Write section content..."
                            enableImageUpload={false}
                            />
                        </div>

                        {/* Right: Image Upload */}
                        <div className="col-md-3">
                            <label className="form-label fw-medium text-secondary">Image</label>

                            <div
                            className="border rounded p-3 d-flex flex-column align-items-center justify-content-center"
                            style={{
                                height: "300px",
                                background: "#f8f9fa",
                                borderColor: "#c67a4a"
                            }}
                            >
                            {!section.imagePreview ? (
                                <label className="text-center cursor-pointer">
                                <i className="bi bi-cloud-upload fs-2 text-brown"></i>
                                <div className="mt-2 text-brown">Upload Image</div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="d-none"
                                    onChange={(e) => handleSectionImageChange(index, e)}
                                />
                                </label>
                            ) : (
                                <>
                                <img
                                    src={section.imagePreview}
                                    className="img-fluid rounded"
                                    style={{ aspectRatio: "4 / 5", objectFit: "cover" }}
                                />
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger w-100 mt-2"
                                    onClick={() => handleRemoveSectionImage(index)}
                                >
                                    Remove
                                </button>
                                </>
                            )}
                            </div>

                            <small className="text-muted">
                            Recommended ratio <strong>4 : 5</strong>
                            </small>
                        </div>
                        </div>
                    </div>
                    </div>

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

              {/* 5. OG META */}
              <div className="col-12 mt-4">
                <h6 className="text-secondary mb-3 fw-semibold border-bottom pb-2">
                  Open Graph (Social Sharing)
                </h6>
              </div>

              <div className="col-md-6">
                <div className="form-floating mb-3">
                  <input
                    type="text"
                    className="form-control"
                    id="og_title"
                    name="og_title"
                    value={formData.og_title}
                    onChange={handleInputChange}
                    placeholder="OG Title"
                  />
                  <label htmlFor="og_title">OG Title</label>
                </div>
              </div>

              <div className="col-md-6">
                <div className="mb-3">
                  <div className="d-flex align-items-center gap-3 mb-2">
                    <label
                      className="btn btn-outline-primary px-4"
                      style={{ borderRadius: "4px" }}
                    >
                      <i className="bi bi-image me-2"></i>Select OG Image
                      <input
                        type="file"
                        accept="image/*"
                        className="d-none"
                        onChange={handleOgImageChange}
                      />
                    </label>
                    {ogImagePreview && (
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm px-3"
                        onClick={handleRemoveOgImage}
                        style={{ borderRadius: "4px" }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  {ogImagePreview && (
                    <div
                      className="position-relative mt-2"
                      style={{ width: "120px" }}
                    >
                      <img
                        src={ogImagePreview}
                        alt="OG preview"
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
              


              <div className="col-md-12">
                <div className="form-floating mb-3">
                  <textarea
                    className="form-control"
                    id="og_description"
                    name="og_description"
                    value={formData.og_description}
                    onChange={handleInputChange}
                    placeholder="OG Description"
                    style={{ minHeight: "80px" }}
                  />
                  <label htmlFor="og_description">OG Description</label>
                </div>
              </div>

              {/* 6. SEO META (basic) */}
              <div className="col-12 mt-4">
                <h6 className="text-secondary mb-3 fw-semibold border-bottom pb-2">
                  SEO Meta
                </h6>
              </div>

              <div className="col-md-6">
                <div className="form-floating mb-3">
                  <input
                    type="text"
                    className="form-control"
                    id="meta_title"
                    name="meta_title"
                    value={formData.meta_title}
                    onChange={handleInputChange}
                    placeholder="Meta Title"
                  />
                  <label htmlFor="meta_title">Meta Title</label>
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-floating mb-3">
                  <textarea
                    className="form-control"
                    id="meta_description"
                    name="meta_description"
                    value={formData.meta_description}
                    onChange={handleInputChange}
                    placeholder="Meta Description"
                    style={{ minHeight: "80px" }}
                  />
                  <label htmlFor="meta_description">Meta Description</label>
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-floating mb-3">
                  <input
                    type="text"
                    className="form-control"
                    id="meta_keywords"
                    name="meta_keywords"
                    value={formData.meta_keywords}
                    onChange={handleInputChange}
                    placeholder="Meta Keywords"
                  />
                  <label htmlFor="meta_keywords">
                    Meta Keywords (comma separated)
                  </label>
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-floating mb-3">
                  <input
                    type="text"
                    className="form-control"
                    id="canonical_tag"
                    name="canonical_tag"
                    value={formData.canonical_tag}
                    onChange={handleInputChange}
                    placeholder="Canonical URL"
                  />
                  <label htmlFor="canonical_tag">Canonical URL</label>
                </div>
              </div>

              {/* 7. PUBLISHING */}
              <div className="col-12 mt-4">
                <h6 className="text-secondary mb-3 fw-semibold border-bottom pb-2">
                  Publishing
                </h6>
              </div>

              <div className="col-md-4">
                <label className="form-label text-secondary mb-2">
                  Status
                </label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={handleStatusChange}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
                <div className="form-text">
                  Published posts will be visible on the live site.
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="col-12 mt-4 pt-2">
                <div className="d-flex justify-content-end gap-3">
                  <button
                    type="button"
                    className="btn btn-outline-secondary px-4"
                    onClick={() => navigate("/blogs")}
                    style={{ borderRadius: "4px" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary px-4"
                    style={{ borderRadius: "4px" }}
                    disabled={isSaving}
                    onClick={handleSubmit}
                  >
                    {isSaving ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        ></span>
                        Saving...
                      </>
                    ) : (
                      "Create Blog"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BlogAdd;
