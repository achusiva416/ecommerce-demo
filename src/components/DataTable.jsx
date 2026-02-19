import React, { useMemo, useState } from 'react'

export default function DataTable({ columns, data, pageSize=8 }) {
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState({key: null, dir: 'asc'})

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return data.filter(row => Object.values(row).some(v => String(v).toLowerCase().includes(q)))
  }, [data, query])

  const sorted = useMemo(() => {
    if (!sort.key) return filtered
    const copy = [...filtered]
    copy.sort((a,b)=>{
      const av = a[sort.key]; const bv = b[sort.key]
      if (av < bv) return sort.dir === 'asc' ? -1 : 1
      if (av > bv) return sort.dir === 'asc' ? 1 : -1
      return 0
    })
    return copy
  }, [filtered, sort])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const start = (page-1)*pageSize
  const rows = sorted.slice(start, start+pageSize)

  const toggleSort = (key) => {
    setPage(1)
    setSort(prev => prev.key === key ? {key, dir: prev.dir === 'asc' ? 'desc':'asc'} : {key, dir:'asc'})
  }

  return (
    <div className="card">
      <div className="card-body">
        <div className="d-flex justify-content-between mb-3">
          <h5 className="card-title m-0">Users</h5>
          <input className="form-control w-auto" placeholder="Search..." value={query} onChange={e=>{setPage(1); setQuery(e.target.value)}}/>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                {columns.map(col => (
                  <th role="button" key={col.key} onClick={()=>toggleSort(col.key)}>
                    {col.header} {sort.key===col.key ? (sort.dir==='asc'?'▲':'▼'):''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i)=>(
                <tr key={i}>
                  {columns.map(col => (
                    <td key={col.key}>
                      {col.render ? col.render(row[col.key], row) : String(row[col.key])}
                    </td>
                  ))}
                </tr>
              ))}
              {rows.length===0 && (
                <tr><td colSpan={columns.length} className="text-center text-muted py-5">No results</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="d-flex justify-content-between align-items-center">
          <small className="text-muted">Showing {rows.length} of {sorted.length}</small>
          <div className="btn-group">
            <button className="btn btn-outline-secondary" disabled={page===1} onClick={()=>setPage(1)}>«</button>
            <button className="btn btn-outline-secondary" disabled={page===1} onClick={()=>setPage(page-1)}>Prev</button>
            <button className="btn btn-outline-secondary" disabled={page===totalPages} onClick={()=>setPage(page+1)}>Next</button>
            <button className="btn btn-outline-secondary" disabled={page===totalPages} onClick={()=>setPage(totalPages)}>»</button>
          </div>
        </div>
      </div>
    </div>
  )
}
