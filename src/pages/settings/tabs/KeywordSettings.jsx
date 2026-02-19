import React, { useState, useRef } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../../services/apiClient";

const KeywordSettings = () => {
  const [inputValue, setInputValue] = useState("");
  const [editId, setEditId] = useState(null);
  const inputRef = useRef(null);


  const queryClient = useQueryClient();

  const { data: keywords = [], isLoading } = useQuery({
    queryKey: ["keywords"],
    queryFn: async () => {
      const res = await apiClient.get("/keywords");
      return res.data; 
    },
  });

  const addKeyword = useMutation({
    mutationFn: (name) => apiClient.post("/keywords", { name }),
    onSuccess: () => {
      queryClient.invalidateQueries(["keywords"]);
      setInputValue("");
    },
  });

  const updateKeyword = useMutation({
    mutationFn: ({ id, name }) => apiClient.put(`/keywords/${id}`, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries(["keywords"]);
      setInputValue("");
      setEditId(null);
    },
  });

  const deleteKeyword = useMutation({
    mutationFn: (id) => apiClient.delete(`/keywords/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["keywords"]);
    },
    onError: (err) => {
      console.log(err)

    }
  });

  const handleAddOrUpdate = () => {
    if (!inputValue.trim()) return;

    if (editId) {
      updateKeyword.mutate({ id: editId, name: inputValue.trim() });
    } else {
      addKeyword.mutate(inputValue.trim());
    }
  };


  const handleEdit = (item) => {
    setInputValue(item.keyword);
    setEditId(item.id);
  };

  
  const handleDelete = (id) => {
    deleteKeyword.mutate(id);
  };

  return (
    <div className="card shadow-sm border-0 p-4">
      <h5 className="fw-normal text-secondary mb-3 border-bottom pb-2">
        Keyword Settings
      </h5>

      <div className="d-flex gap-2 mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="Enter keyword"
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

      <ul className="list-group">
        {keywords.length === 0 && (
          <li className="list-group-item text-muted">No Keywords Found</li>
        )}

        {keywords.map((item) => (
          <li
            key={item.id}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            <span>{item.keyword}</span>

            <div className="d-flex gap-2">
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => {handleEdit(item); inputRef.current.focus();}}
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

export default KeywordSettings;
