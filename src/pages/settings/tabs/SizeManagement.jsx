import React, { useState, useRef } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../../services/apiClient";

const SizeManagement = () => {
  const [inputValue, setInputValue] = useState("");
  const [editId, setEditId] = useState(null);
  const inputRef = useRef(null);

  const queryClient = useQueryClient();

  const { data : sizes = [] ,isLoading } = useQuery({
    queryKey: ['sizes'],
    queryFn: async () => {
      const res = await apiClient.get('/sizes');
      return res.data;
    }
  })

  const addSizes = useMutation({
    mutationFn: (name) => {
      return apiClient.post('/sizes',{
        name
      });
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries(['sizes']);
      setInputValue('')
      setEditId(null)
    }
  })


  const updateSizes = useMutation({
    mutationFn: ({ name,id }) => {
      return apiClient.put(`/sizes/${id}`,{
        name
      });

    },
    onSuccess: () => {
      queryClient.invalidateQueries(['sizes']);
      setInputValue('')
    },
    onError: (err) => {
      console.log(err)
    }
  })



  const deleteSizes = useMutation({
    mutationFn: (id) => {
      return apiClient.delete(`/sizes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['sizes']);
    }
  })

  const handleAddOrUpdate  = () => {
    if (editId) {
      
      updateSizes.mutate({ id: editId, name: inputValue });

    } else {
      addSizes.mutate(inputValue);
    }
  }

  const handleDelete  = (id) => {
    deleteSizes.mutate(id)
  }

  return (
    <div className="card shadow-sm border-0 p-4">
      <h5 className="fw-normal text-secondary mb-3 border-bottom pb-2">
        Size Management
      </h5>

    
      <div className="d-flex gap-2 mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="Enter size "
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          ref={inputRef}
        />

        <button
          className="btn btn-primary px-4"
          onClick={handleAddOrUpdate}
          style={{ borderRadius: "4px" }}
        >
          {editId !== null ? "Update" : "Add"}
        </button>
      </div>

      {/* Size List */}
      <ul className="list-group">
        {sizes.map((item, index) => (
          <li
            key={index}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            <span>{item.size}</span>

            <div className="d-flex gap-2">
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => {
                  setEditId(item.id)
                  setInputValue(item.size)
                  inputRef.current.focus()
                }}
              >
                <Pencil size={14} />
              </button>

              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => handleDelete(item.id)}
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

export default SizeManagement;
