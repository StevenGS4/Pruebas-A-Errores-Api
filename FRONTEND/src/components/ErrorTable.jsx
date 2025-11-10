import React from 'react'

export default function ErrorTable({ items=[], loading, onSelect, onEdit }) {
  if (loading) return <p>Cargando...</p>
  if (!items.length) return <p>No hay errores.</p>

  return (
    <div className="table-wrapper">
      <table className="table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Módulo</th>
            <th>Severidad</th>
            <th>Mensaje</th>
            <th>Estatus</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map(row=>(
            <tr key={String(row._id)} onClick={()=>onSelect?.(row)}>
              <td>{row.ERRORDATETIME ? new Date(row.ERRORDATETIME).toLocaleString() : '-'}</td>
              <td>{row.MODULE}</td>
              <td>{row.SEVERITY}</td>
              <td title={row.ERRORMESSAGE}>{row.ERRORMESSAGE?.slice(0,50)}…</td>
              <td>{row.STATUS}</td>
              <td>
                <button onClick={(e)=>{ e.stopPropagation(); onEdit?.(row) }}>Editar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
