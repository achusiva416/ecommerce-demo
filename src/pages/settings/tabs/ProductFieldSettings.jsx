import React, { useState } from "react";
import { Pencil, Trash2, Plus, GripVertical,Layers } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../../services/apiClient";
import { toast } from "react-toastify";

const ProductFieldSettings = () => {
  const [inputValue, setInputValue] = useState("");
  const [editId, setEditId] = useState(null);
  const queryClient = useQueryClient();

  const { data: fields = [], isLoading } = useQuery({
    queryKey: ["product-fields"],
    queryFn: async () => {
      const res = await apiClient.get("/product-fields");
      console.log(res.data);
      return res.data; 
    },
  });



  const addField = useMutation({
    mutationFn: (name) => apiClient.post("/product-fields", { name }),
    onSuccess: () => {
      queryClient.invalidateQueries(["product-fields"]);
      setInputValue("");
      toast.success("Field added successfully");
    },
    onError: () => {
        toast.error("Failed to add field");
    }
  });

  const updateField = useMutation({
    mutationFn: ({ id, name }) => apiClient.put(`/product-fields/${id}`, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries(["product-fields"]);
      setInputValue("");
      setEditId(null);
      toast.success("Field updated successfully");
    },
    onError: () => {
        toast.error("Failed to update field");
    }
  });

  const deleteField = useMutation({
    mutationFn: (id) => apiClient.delete(`/product-fields/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["product-fields"]);
      toast.success("Field deleted successfully");
    },
    onError: () => {
       toast.error("Failed to delete field");
    }
  });

  const handleAddOrUpdate = () => {
    if (!inputValue.trim()) return;

    if (editId) {
      updateField.mutate({ id: editId, name: inputValue.trim() });
    } else {
      addField.mutate(inputValue.trim());
    }
  };

  const handleEdit = (item) => {
    setInputValue(item.feild_name);
    setEditId(item.id);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this field? It will no longer appear as a default field for new products.")) {
      deleteField.mutate(id);
    }
  };

  return (
    <div className="card shadow-sm border-0 p-4">
      <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
        <h5 className="fw-normal text-secondary mb-0">
          Product Custom Fields Management
        </h5>
        <span className="badge bg-light text-muted fw-normal">Controls default fields in Add Product</span>
      </div>

      <p className="text-muted small mb-4">
        Add or edit the labels for custom fields that appear when creating a new product. 
        These fields help store specific attributes like 'Material', 'Stone Type', etc.
      </p>

      <div className="d-flex gap-2 mb-4">
        <div className="flex-grow-1 position-relative">
          <input
            type="text"
            className="form-control"
            placeholder="Field Label (e.g., Material, Shape, length)"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            style={{ paddingLeft: '12px' }}
          />
        </div>

        <button
          className="btn btn-primary px-4 d-flex align-items-center gap-2"
          onClick={handleAddOrUpdate}
          disabled={!inputValue.trim()}
          style={{ borderRadius: "4px" }}
        >
          {editId ? <Pencil size={16} /> : <Plus size={16} />}
          {editId ? "Update Field" : "Add Field"}
        </button>
      </div>

      <div className="field-list-container">
        {isLoading ? (
          <div className="text-center py-4">
             <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
             <span className="ms-3 text-muted">Loading fields...</span>
          </div>
        ) : fields.length === 0 ? (
          <div className="text-center py-5 bg-light rounded shadow-inner">
            <Layers size={40} className="text-muted opacity-25 mb-2" />
            <p className="text-muted mb-0">No Custom Fields Configured</p>
            <small className="text-muted">Add your first field above to get started</small>
          </div>
        ) : (
          <div className="row g-3">
            {fields.map((item) => (
              <div key={item.id} className="col-md-6">
                <div className="list-group-item d-flex justify-content-between align-items-center border rounded p-3 bg-white hover-shadow-sm transition-all">
                  <div className="d-flex align-items-center gap-3">
                    <div className="text-muted opacity-50 cursor-grab">
                      <GripVertical size={16} />
                    </div>
                    <span className="fw-semibold text-dark">{item.feild_name}</span>
                  </div>

                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-sm btn-light text-primary border"
                      onClick={() => handleEdit(item)}
                      title="Edit Label"
                    >
                      <Pencil size={14} />
                    </button>

                    <button
                      className="btn btn-sm btn-light text-danger border"
                      onClick={() => handleDelete(item.id)}
                      title="Remove Field"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .hover-shadow-sm:hover {
          box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
          border-color: #dee2e6 !important;
        }
        .transition-all {
          transition: all 0.2s ease-in-out;
        }
        .cursor-grab {
          cursor: grab;
        }
      `}</style>
    </div>
  );
};

export default ProductFieldSettings;
