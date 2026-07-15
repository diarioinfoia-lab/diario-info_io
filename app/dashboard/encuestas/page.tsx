'use client';
import { useState, useEffect } from 'react';
import { getPolls, createPoll, deletePoll, activatePoll, closePoll, getPollAudit, uploadFile } from '@/lib/api';

interface Option { _id?: string; text: string; votes?: number; imageUrl?: string; }
interface Poll {
  _id: string; title: string; description?: string; options: Option[];
  status: 'draft' | 'active' | 'closed'; totalVotes?: number; isSensitive?: boolean; flagged?: boolean;
}

export default function EncuestasPage() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [opts, setOpts] = useState([{ text: '', imageUrl: '' }, { text: '', imageUrl: '' }]);
  const [sensitive, setSensitive] = useState(false);
  const [msg, setMsg] = useState('');
  const [auditId, setAuditId] = useState<string | null>(null);
  const [auditData, setAuditData] = useState<any>(null);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try { const d = await getPolls({ pageSize: 100 }); setPolls(d.polls || []); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  function reset() { setTitle(''); setDesc(''); setOpts([{ text: '', imageUrl: '' }, { text: '', imageUrl: '' }]); setSensitive(false); setMsg(''); }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const clean = opts.map(o => ({ text: o.text.trim(), imageUrl: o.imageUrl.trim() })).filter(o => o.text);
    if (!title.trim() || clean.length < 2) { setMsg('Falta titulo o opciones (min 2)'); return; }
    try {
      await createPoll({ title, description: desc, options: clean, isSensitive: sensitive });
      setMsg('Creada'); setShowForm(false); reset(); load();
    } catch (err: any) { setMsg('Error: ' + err.message); }
  }

  async function handleImageFile(i: number, file: File | null) {
    if (!file) return;
    setUploadingIdx(i);
    setMsg('');
    try {
      const res = await uploadFile(file);
      if (res && res.status && res.file && res.file.fileUrl) {
        const c = [...opts]; c[i] = { ...c[i], imageUrl: res.file.fileUrl }; setOpts(c);
      } else {
        setMsg('Error al subir imagen: ' + (res?.message || 'desconocido'));
      }
    } catch (err: any) {
      setMsg('Error al subir imagen: ' + err.message);
    } finally {
      setUploadingIdx(null);
    }
  }

  async function doActivate(id: string) { try { await activatePoll(id); load(); } catch (e: any) { setMsg(e.message); } }
  async function doClose(id: string) { if (confirm('Cerrar encuesta?')) { try { await closePoll(id); load(); } catch (e: any) { setMsg(e.message); } } }
  async function doDelete(id: string) { if (confirm('Eliminar encuesta?')) { try { await deletePoll(id); load(); } catch (e: any) { setMsg(e.message); } } }
  async function toggleAudit(id: string) {
    if (auditId === id) { setAuditId(null); setAuditData(null); return; }
    setAuditId(id); setAuditData(null);
    try { const d = await getPollAudit(id); setAuditData(d); } catch (e) { console.error(e); }
  }

  const badge: Record<string, string> = {
    draft: 'bg-gray-200 text-gray-700', active: 'bg-green-200 text-green-800', closed: 'bg-red-200 text-red-800',
  };
  const label: Record<string, string> = { draft: 'Borrador', active: 'Activa', closed: 'Cerrada' };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold dark:text-white">Encuestas</h1>
          <p className="text-sm text-gray-500">Panel temporal de prueba en ia2</p>
        </div>
        <button onClick={() => { reset(); setShowForm(true); }} className="bg-rose-600 text-white px-4 py-2 rounded-lg">+ Nueva</button>
      </div>

      {msg && <div className="mb-4 p-3 bg-blue-50 text-blue-800 rounded-lg text-sm">{msg}</div>}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <form onSubmit={submit} className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md space-y-3 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold dark:text-white">Nueva encuesta</h2>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Titulo" required
              className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white" />
            <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Descripcion (opcional)"
              className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white" />
            {opts.map((o, i) => (
              <div key={i} className="flex gap-2 items-start border rounded-lg p-2">
                <div className="flex-shrink-0 w-14">
                  {o.imageUrl ? (
                    <img src={o.imageUrl} alt="" className="w-14 h-14 rounded object-cover" />
                  ) : (
                    <div className="w-14 h-14 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-[10px] text-gray-400 text-center">Sin imagen</div>
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <input value={o.text} onChange={e => { const c = [...opts]; c[i] = { ...c[i], text: e.target.value }; setOpts(c); }}
                    placeholder={`Opcion ${i + 1}`} className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white" />
                  <label className="flex items-center gap-2 text-xs">
                    <span className="border rounded-lg px-2 py-1 cursor-pointer dark:text-gray-200 dark:border-gray-600">
                      {uploadingIdx === i ? 'Subiendo...' : 'Subir imagen'}
                    </span>
                    <input type="file" accept="image/png,image/jpeg,image/jpg" className="hidden"
                      onChange={e => handleImageFile(i, e.target.files ? e.target.files[0] : null)} />
                    {o.imageUrl && (
                      <button type="button" onClick={() => { const c = [...opts]; c[i] = { ...c[i], imageUrl: '' }; setOpts(c); }}
                        className="text-gray-400 underline">quitar</button>
                    )}
                  </label>
                </div>
              </div>
            ))}
            <button type="button" onClick={() => setOpts([...opts, { text: '', imageUrl: '' }])} className="text-sm text-rose-600">+ Opcion</button>
            <label className="flex items-center gap-2 text-sm dark:text-gray-300">
              <input type="checkbox" checked={sensitive} onChange={e => setSensitive(e.target.checked)} /> Tema sensible
            </label>
            <div className="flex gap-3">
              <button type="submit" className="flex-1 bg-rose-600 text-white py-2 rounded-lg">Crear</button>
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 border py-2 rounded-lg dark:text-white">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {loading ? <p className="text-gray-500">Cargando...</p> : polls.length === 0 ? (
        <p className="text-gray-500">No hay encuestas todavia.</p>
      ) : (
        <div className="space-y-4">
          {polls.map(p => {
            const total = p.totalVotes || p.options.reduce((s, o) => s + (o.votes || 0), 0);
            return (
              <div key={p._id} className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${badge[p.status]}`}>{label[p.status]}</span>
                    {p.isSensitive && <span className="text-xs px-2 py-0.5 rounded-full bg-amber-200 text-amber-800 ml-1">Sensible</span>}
                    {p.flagged && <span className="text-xs px-2 py-0.5 rounded-full bg-red-200 text-red-800 ml-1">Marcada</span>}
                    <h3 className="font-bold dark:text-white mt-1">{p.title}</h3>
                    {p.description && <p className="text-sm text-gray-500">{p.description}</p>}
                  </div>
                  <div className="flex gap-2">
                    {p.status === 'draft' && <button onClick={() => doActivate(p._id)} className="text-xs text-green-700 border rounded-lg px-2 py-1">Activar</button>}
                    {p.status === 'active' && <button onClick={() => doClose(p._id)} className="text-xs text-red-700 border rounded-lg px-2 py-1">Cerrar</button>}
                    <button onClick={() => toggleAudit(p._id)} className="text-xs border rounded-lg px-2 py-1 dark:text-gray-300">Auditoria</button>
                    <button onClick={() => doDelete(p._id)} className="text-xs text-gray-400 border rounded-lg px-2 py-1">Eliminar</button>
                  </div>
                </div>
                <div className="space-y-1">
                  {p.options.map((o, i) => {
                    const pct = total > 0 ? Math.round(((o.votes || 0) / total) * 100) : 0;
                    return (
                      <div key={o._id || i} className="text-xs text-gray-600 dark:text-gray-400">
                        <div className="flex justify-between items-center gap-2">
                          <span className="flex items-center gap-2">
                            {o.imageUrl && <img src={o.imageUrl} alt="" className="w-6 h-6 rounded object-cover" />}
                            {o.text}
                          </span>
                          <span>{o.votes || 0} ({pct}%)</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-rose-500" style={{ width: pct + '%' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-400 mt-2">{total} votos totales</p>
                {auditId === p._id && (
                  <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-xs">
                    {!auditData ? 'Cargando auditoria...' : (
                      <div>
                        <p>Votos totales: {auditData.totalVotes} | Sospechosos: {auditData.flaggedVotes}</p>
                        <p className="mt-1 font-semibold">Por region:</p>
                        {(auditData.byRegion || []).map((r: any) => (
                          <p key={r._id || 'na'}>{r._id || 'Desconocida'}: {r.count}</p>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
'use client';
import { useState, useEffect } from 'react';
import { getPolls, createPoll, deletePoll, activatePoll, closePoll, getPollAudit, uploadFile } from '@/lib/api';

interface Option { _id?: string; text: string; votes?: number; imageUrl?: string; }
interface Poll {
  _id: string; title: string; description?: string; options: Option[];
  status: 'draft' | 'active' | 'closed'; totalVotes?: number; isSensitive?: boolean; flagged?: boolean;
}

export default function EncuestasPage() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [opts, setOpts] = useState([{ text: '', imageUrl: '' }, { text: '', imageUrl: '' }]);
  const [sensitive, setSensitive] = useState(false);
  const [msg, setMsg] = useState('');
  const [auditId, setAuditId] = useState<string | null>(null);
  const [auditData, setAuditData] = useState<any>(null);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try { const d = await getPolls({ pageSize: 100 }); setPolls(d.polls || []); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  function reset() { setTitle(''); setDesc(''); setOpts([{ text: '', imageUrl: '' }, { text: '', imageUrl: '' }]); setSensitive(false); setMsg(''); }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const clean = opts.map(o => ({ text: o.text.trim(), imageUrl: o.imageUrl.trim() })).filter(o => o.text);
    if (!title.trim() || clean.length < 2) { setMsg('Falta titulo o opciones (min 2)'); return; }
    try {
      await createPoll({ title, description: desc, options: clean, isSensitive: sensitive });
      setMsg('Creada'); setShowForm(false); reset(); load();
    } catch (err: any) { setMsg('Error: ' + err.message); }
  }

  async function handleImageFile(i: number, file: File | null) {
    if (!file) return;
    setUploadingIdx(i);
    setMsg('');
    try {
      const res = await uploadFile(file);
      if (res && res.status && res.file && res.file.fileUrl) {
        const c = [...opts]; c[i] = { ...c[i], imageUrl: res.file.fileUrl }; setOpts(c);
      } else {
        setMsg('Error al subir imagen: ' + (res?.message || 'desconocido'));
      }
    } catch (err: any) {
      setMsg('Error al subir imagen: ' + err.message);
    } finally {
      setUploadingIdx(null);
    }
  }

  async function doActivate(id: string) { try { await activatePoll(id); load(); } catch (e: any) { setMsg(e.message); } }
  async function doClose(id: string) { if (confirm('Cerrar encuesta?')) { try { await closePoll(id); load(); } catch (e: any) { setMsg(e.message); } } }
  async function doDelete(id: string) { if (confirm('Eliminar encuesta?')) { try { await deletePoll(id); load(); } catch (e: any) { setMsg(e.message); } } }
  async function toggleAudit(id: string) {
    if (auditId === id) { setAuditId(null); setAuditData(null); return; }
    setAuditId(id); setAuditData(null);
    try { const d = await getPollAudit(id); setAuditData(d); } catch (e) { console.error(e); }
  }

  const badge: Record<string, string> = {
    draft: 'bg-gray-200 text-gray-700', active: 'bg-green-200 text-green-800', closed: 'bg-red-200 text-red-800',
  };
  const label: Record<string, string> = { draft: 'Borrador', active: 'Activa', closed: 'Cerrada' };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold dark:text-white">Encuestas</h1>
          <p className="text-sm text-gray-500">Panel temporal de prueba en ia2</p>
        </div>
        <button onClick={() => { reset(); setShowForm(true); }} className="bg-rose-600 text-white px-4 py-2 rounded-lg">+ Nueva</button>
      </div>

      {msg && <div className="mb-4 p-3 bg-blue-50 text-blue-800 rounded-lg text-sm">{msg}</div>}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <form onSubmit={submit} className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md space-y-3 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold dark:text-white">Nueva encuesta</h2>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Titulo" required
              className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white" />
            <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Descripcion (opcional)"
              className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white" />
            {opts.map((o, i) => (
              <div key={i} className="flex gap-2 items-start border rounded-lg p-2">
                <div className="flex-shrink-0 w-14">
                  {o.imageUrl ? (
                    <img src={o.imageUrl} alt="" className="w-14 h-14 rounded object-cover" />
                  ) : (
                    <div className="w-14 h-14 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-[10px] text-gray-400 text-center">Sin imagen</div>
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <input value={o.text} onChange={e => { const c = [...opts]; c[i] = { ...c[i], text: e.target.value }; setOpts(c); }}
                    placeholder={`Opcion ${i + 1}`} className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:text-white" />
                  <label className="flex items-center gap-2 text-xs">
                    <span className="border rounded-lg px-2 py-1 cursor-pointer dark:text-gray-200 dark:border-gray-600">
                      {uploadingIdx === i ? 'Subiendo...' : 'Subir imagen'}
                    </span>
                    <input type="file" accept="image/png,image/jpeg,image/jpg" className="hidden"
                      onChange={e => handleImageFile(i, e.target.files ? e.target.files[0] : null)} />
                    {o.imageUrl && (
                      <button type="button" onClick={() => { const c = [...opts]; c[i] = { ...c[i], imageUrl: '' }; setOpts(c); }}
                        className="text-gray-400 underline">quitar</button>
                    )}
                  </label>
                </div>
              </div>
            ))}
            <button type="button" onClick={() => setOpts([...opts, { text: '', imageUrl: '' }])} className="text-sm text-rose-600">+ Opcion</button>
            <label className="flex items-center gap-2 text-sm dark:text-gray-300">
              <input type="checkbox" checked={sensitive} onChange={e => setSensitive(e.target.checked)} /> Tema sensible
            </label>
            <div className="flex gap-3">
              <button type="submit" className="flex-1 bg-rose-600 text-white py-2 rounded-lg">Crear</button>
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 border py-2 rounded-lg dark:text-white">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {loading ? <p className="text-gray-500">Cargando...</p> : polls.length === 0 ? (
        <p className="text-gray-500">No hay encuestas todavia.</p>
      ) : (
        <div className="space-y-4">
          {polls.map(p => {
            const total = p.totalVotes || p.options.reduce((s, o) => s + (o.votes || 0), 0);
            return (
              <div key={p._id} className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${badge[p.status]}`}>{label[p.status]}</span>
                    {p.isSensitive && <span className="text-xs px-2 py-0.5 rounded-full bg-amber-200 text-amber-800 ml-1">Sensible</span>}
                    {p.flagged && <span className="text-xs px-2 py-0.5 rounded-full bg-red-200 text-red-800 ml-1">Marcada</span>}
                    <h3 className="font-bold dark:text-white mt-1">{p.title}</h3>
                    {p.description && <p className="text-sm text-gray-500">{p.description}</p>}
                  </div>
                  <div className="flex gap-2">
                    {p.status === 'draft' && <button onClick={() => doActivate(p._id)} className="text-xs text-green-700 border rounded-lg px-2 py-1">Activar</button>}
                    {p.status === 'active' && <button onClick={() => doClose(p._id)} className="text-xs text-red-700 border rounded-lg px-2 py-1">Cerrar</button>}
                    <button onClick={() => toggleAudit(p._id)} className="text-xs border rounded-lg px-2 py-1 dark:text-gray-300">Auditoria</button>
                    <button onClick={() => doDelete(p._id)} className="text-xs text-gray-400 border rounded-lg px-2 py-1">Eliminar</button>
                  </div>
                </div>
                <div className="space-y-1">
                  {p.options.map((o, i) => {
                    const pct = total > 0 ? Math.round(((o.votes || 0) / total) * 100) : 0;
                    return (
                      <div key={o._id || i} className="text-xs text-gray-600 dark:text-gray-400">
                        <div className="flex justify-between items-center gap-2">
                          <span className="flex items-center gap-2">
                            {o.imageUrl && <img src={o.imageUrl} alt="" className="w-6 h-6 rounded object-cover" />}
                            {o.text}
                          </span>
                          <span>{o.votes || 0} ({pct}%)</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-rose-500" style={{ width: pct + '%' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-400 mt-2">{total} votos totales</p>
                {auditId === p._id && (
                  <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-xs">
                    {!auditData ? 'Cargando auditoria...' : (
                      <div>
                        <p>Votos totales: {auditData.totalVotes} | Sospechosos: {auditData.flaggedVotes}</p>
                        <p className="mt-1 font-semibold">Por region:</p>
                        {(auditData.byRegion || []).map((r: any) => (
                          <p key={r._id || 'na'}>{r._id || 'Desconocida'}: {r.count}</p>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
