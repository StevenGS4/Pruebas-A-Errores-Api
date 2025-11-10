import React, { useState, useEffect } from 'react'

export default function ErrorForm({ open, initialValue, onClose, onSubmit }) {
  const [form, setForm] = useState({
    ERRORMESSAGE:'', ERRORCODE:'', ERRORSOURCE:'',
    SEVERITY:'ERROR', STATUS:'NEW', MODULE:'UI', APPLICATION:'Error Manager'
  })

  useEffect(()=>{ if (initialValue) setForm(prev=>({ ...prev, ...initialValue })) }, [initialValue])

  if (!open) return null

  const handleChange = (e)=> setForm(f=>({ ...f, [e.target.name]: e.target.value }))
  const handleSubmit = (e)=>{ e.preventDefault(); onSubmit?.(form) }

  return (
    <div className="modal">
      <div className="modal-card">
        <h3>{initialValue? 'Editar error' : 'Nuevo error'}</h3>
        <form onSubmit={handleSubmit}>
          <label>Mensaje</label>
          <textarea name="ERRORMESSAGE" required value={form.ERRORMESSAGE} onChange={handleChange}/>
          <div className="row">
            <div>
              <label>Código</label>
              <input name="ERRORCODE" value={form.ERRORCODE} onChange={handleChange}/>
            </div>
            <div>
              <label>Fuente</label>
              <input name="ERRORSOURCE" value={form.ERRORSOURCE} onChange={handleChange}/>
            </div>
          </div>
          <div className="row">
            <div>
              <label>Módulo</label>
              <input name="MODULE" value={form.MODULE} onChange={handleChange}/>
            </div>
            <div>
              <label>Severidad</label>
              <select name="SEVERITY" value={form.SEVERITY} onChange={handleChange}>
                <option>INFO</option><option>WARNING</option><option>ERROR</option><option>CRITICAL</option>
              </select>
            </div>
            <div>
              <label>Estatus</label>
              <select name="STATUS" value={form.STATUS} onChange={handleChange}>
                <option>NEW</option><option>IN_PROGRESS</option><option>RESOLVED</option><option>IGNORED</option>
              </select>
            </div>
          </div>
          <div className="actions">
            <button type="button" onClick={onClose}>Cancelar</button>
            <button type="submit">{initialValue? 'Guardar' : 'Crear'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
