import React, { useState } from 'react'

export default function FormExample() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'Viewer',
    status: true,
    notes: ''
  })
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }
  const handleSubmit = (e) => {
    e.preventDefault()
    alert('Submitted: ' + JSON.stringify(form, null, 2))
  }
  return (
    <div className="container-fluid">
      <h4 className="mb-3">Create / Edit User</h4>
      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit} className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Name</label>
              <input className="form-control" name="name" value={form.name} onChange={handleChange} required />
            </div>
            <div className="col-md-6">
              <label className="form-label">Email</label>
              <input type="email" className="form-control" name="email" value={form.email} onChange={handleChange} required />
            </div>
            <div className="col-md-6">
              <label className="form-label">Role</label>
              <select className="form-select" name="role" value={form.role} onChange={handleChange}>
                <option>Admin</option>
                <option>Editor</option>
                <option>Viewer</option>
              </select>
            </div>
            <div className="col-md-6 d-flex align-items-end">
              <div className="form-check form-switch">
                <input className="form-check-input" type="checkbox" id="status" name="status" checked={form.status} onChange={handleChange} />
                <label className="form-check-label" htmlFor="status">Active</label>
              </div>
            </div>
            <div className="col-12">
              <label className="form-label">Notes</label>
              <textarea className="form-control" rows="3" name="notes" value={form.notes} onChange={handleChange}></textarea>
            </div>
            <div className="col-12">
              <button className="btn btn-primary" type="submit">Save</button>
              <button className="btn btn-outline-secondary ms-2" type="reset" onClick={()=>setForm({name:'',email:'',role:'Viewer',status:true,notes:''})}>Reset</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
