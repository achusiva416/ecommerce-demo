import React from 'react'
import DataTable from '../components/DataTable'

const columns = [
  { key: 'id', header: 'ID' },
  { key: 'name', header: 'Name' },
  { key: 'email', header: 'Email' },
  { key: 'role', header: 'Role' },
  { key: 'status', header: 'Status', render: (v)=> v ? 'Active' : 'Inactive' }
]

const data = Array.from({length: 42}).map((_,i)=> ({
  id: i+1,
  name: `User ${i+1}`,
  email: `user${i+1}@example.com`,
  role: ['Admin','Editor','Viewer'][i%3],
  status: i%2===0
}))

export default function Users() {
  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="m-0">Users</h4>
        <button className="btn btn-primary">Add User</button>
      </div>
      <DataTable columns={columns} data={data} />
    </div>
  )
}
