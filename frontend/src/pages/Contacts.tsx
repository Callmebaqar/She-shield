import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Button, Card, EmptyState, Field, inputClasses, Modal, Spinner } from '../components/ui';
import type { EmergencyContact } from '../lib/types';

const empty = { name: '', phone: '', relation: '', isPrimary: false };

export default function ContactsPage() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  async function load() {
    try {
      const res = await api.getContacts();
      setContacts(res.contacts as any);
    } catch (e: any) {
      setError(e?.message || 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function openAdd() { setEditingId(null); setForm(empty); setModalOpen(true); }
  function openEdit(c: EmergencyContact) {
    setEditingId(c.id);
    setForm({ name: c.name, phone: c.phone, relation: c.relation || '', isPrimary: c.isPrimary });
    setModalOpen(true);
  }

  async function save() {
    setSaving(true);
    setError('');
    const payload = { ...form, relation: form.relation || undefined };
    try {
      if (editingId) {
        const res = await api.updateContact(editingId, payload);
        setContacts((c) => c.map((x) => x.id === editingId ? (res.contact as any) : x));
      } else {
        const res = await api.createContact(payload);
        setContacts((c) => [res.contact as any, ...c]);
      }
      setModalOpen(false);
    } catch (e: any) {
      setError(e?.message || 'Failed to save contact');
    } finally {
      setSaving(false);
    }
  }

  async function del(id: string) {
    try {
      await api.deleteContact(id);
      setContacts((c) => c.filter((x) => x.id !== id));
    } catch (e: any) {
      alert(e?.message || 'Failed to delete contact');
    }
  }

  async function setPrimary(id: string) {
    try {
      await api.updateContact(id, { isPrimary: true });
      setContacts((c) => c.map((x) => ({ ...x, isPrimary: x.id === id })));
    } catch (e: any) {
      alert(e?.message || 'Failed to set primary');
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Emergency Contacts</h1>
          <p className="text-sm text-gray-500 dark:text-brand-300">Save up to 5 trusted people you can reach in an emergency.</p>
        </div>
        <Button onClick={openAdd} disabled={contacts.length >= 5}>+ Add contact</Button>
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {!loading && contacts.length === 0 && (
        <Card><EmptyState icon="👤" title="No emergency contacts yet" text="Add trusted family or friends so you can reach them quickly in an emergency." action={<Button onClick={openAdd}>+ Add your first contact</Button>} /></Card>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {contacts.map((c) => (
          <Card key={c.id} className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-brand-100 dark:bg-brand-800 flex items-center justify-center text-lg font-bold text-brand-700 dark:text-brand-200">
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    {c.name}
                    {c.isPrimary && <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">Primary</span>}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-brand-300">{c.phone}{c.relation ? ` · ${c.relation}` : ''}</p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <a href={`tel:${c.phone}`}><Button size="sm" variant="primary">Call</Button></a>
              <a href={c.phone && c.phone.replace(/[^0-9]/g, '') ? `https://wa.me/${c.phone.replace(/[^0-9]/g, '')}` : '#'} target="_blank" rel="noopener noreferrer"><Button size="sm" variant="secondary">WhatsApp</Button></a>
              <Button size="sm" variant="ghost" onClick={() => openEdit(c)}>Edit</Button>
              {!c.isPrimary && <Button size="sm" variant="ghost" onClick={() => setPrimary(c.id)}>Set primary</Button>}
              <Button size="sm" variant="danger" onClick={() => setDeleteConfirmId(c.id)}>Delete</Button>
            </div>
          </Card>
        ))}
      </div>

      {loading && <div className="flex justify-center py-10"><Spinner /></div>}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit contact' : 'Add contact'}>
        <div className="space-y-4">
          <Field label="Name" htmlFor="c-name">
            <input id="c-name" className={inputClasses} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Phone" htmlFor="c-phone">
            <input id="c-phone" className={inputClasses} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="03XX-XXXXXXX" />
          </Field>
          <Field label="Relation (optional)" htmlFor="c-rel">
            <input id="c-rel" className={inputClasses} value={form.relation} onChange={(e) => setForm({ ...form, relation: e.target.value })} placeholder="e.g. Mother, Sister, Friend" />
          </Field>
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-brand-200">
            <input type="checkbox" checked={form.isPrimary} onChange={(e) => setForm({ ...form, isPrimary: e.target.checked })} className="accent-brand-600" />
            Set as primary contact
          </label>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={save} loading={saving} disabled={!form.name || form.phone.length < 7}>Save</Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)} title="Delete Contact">
        <p className="text-sm text-gray-600 dark:text-brand-200 mb-4">Are you sure you want to delete this emergency contact? This cannot be undone.</p>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
          <Button variant="danger" onClick={() => { if (deleteConfirmId) { del(deleteConfirmId); setDeleteConfirmId(null); } }}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}

