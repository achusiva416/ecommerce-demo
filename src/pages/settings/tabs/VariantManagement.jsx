import React, { useState,useRef } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../../services/apiClient";

const VariantManagement = () => {
  const queryClient = useQueryClient();
  const inputRef = useRef(null);

  const [inputValue, setInputValue] = useState("");
  const [editId, setEditId] = useState(null); 

  
  const { data: variants = [], isLoading } = useQuery({
    queryKey: ["variants"],
    queryFn: async () => {
      const res = await apiClient.get("/variants");
      return res.data;  
      
    },
  });

  
  const createVariant = useMutation({
    mutationFn: async (name) => {
      return await apiClient.post("/variants", { name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["variants"]);
      setInputValue("");
    },
  });

  
  const updateVariant = useMutation({
    mutationFn: async ({ id, name }) => {
      return await apiClient.put(`/variants/${id}`, { name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["variants"]);
      setInputValue("");
      setEditId(null);
    },
    onError: (err) => {
      console.log(err)
    }
  });

  
  const deleteVariant = useMutation({
    mutationFn: async (id) => {
      return await apiClient.delete(`/variants/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["variants"]);
    },
  });

  
  const handleEdit = (variant) => {
    setEditId(variant.id);
    setInputValue(variant.name);
  };

  const handleAddOrUpdate = () => {
    if (!inputValue.trim()) return;

    if (editId) {
      updateVariant.mutate({ id: editId, name: inputValue });
    } else {
      createVariant.mutate(inputValue);
    }
  };

  const handleDelete = (id) => {
    deleteVariant.mutate(id);
  };

  if (isLoading) {
    return (
      <div className="card shadow-sm border-0 p-4">
        <h5 className="fw-normal text-secondary mb-3 border-bottom pb-2">
          Variant Management
        </h5>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="card shadow-sm border-0 p-4">
      <h5 className="fw-normal text-secondary mb-3 border-bottom pb-2">
        Variant Management
      </h5>

      {/* Input + Button */}
      <div className="d-flex gap-2 mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="Enter variant"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          ref={inputRef}
        />

        <button
          className="btn btn-primary px-4"
          onClick={handleAddOrUpdate}
          style={{ borderRadius: "4px" }}
        >
          {editId ? "Update" : "Add"}
        </button>
      </div>

      {/* Variant List */}
      <ul className="list-group">
        {variants.map((variant) => (
          <li
            key={variant.id}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            <span>{variant.name}</span>

            <div className="d-flex gap-2">
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => {handleEdit(variant); inputRef.current.focus();}}
              >
                <Pencil size={14} />
              </button>

              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => handleDelete(variant.id)}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default VariantManagement;
