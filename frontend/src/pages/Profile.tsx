import { useState, useRef } from 'react';
import { useAuth } from '../context/auth';
import { api, ApiError } from '../lib/api';
import { Button, Card, Field, inputClasses } from '../components/ui';

export default function ProfilePage() {
  const { user, setAuthUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [physicalDescription, setPhysicalDescription] = useState(user?.physicalDescription || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [profileMsg, setProfileMsg] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [error, setError] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await api.uploadPhoto(file);
      const res = await api.me();
      setAuthUser(res.user as any);
    } catch (e: any) {
      setError(e?.message || 'Failed to upload photo');
    }
  }

  async function handleDeletePhoto() {
    try {
      await api.deletePhoto();
      const res = await api.me();
      setAuthUser(res.user as any);
    } catch (e: any) {
      setError(e?.message || 'Failed to delete photo');
    }
  }

  async function saveProfile() {
    setError('');
    setProfileMsg('');
    if (phone && !/^03[0-9]{2}-?[0-9]{7}$/.test(phone.replace(/\s/g, ''))) {
      setError('Please enter a valid Pakistani phone number (03XX-XXXXXXX)');
      return;
    }
    setSavingProfile(true);
    try {
      const res = await api.updateMe({ name, phone: phone || null, physicalDescription: physicalDescription || null });
      setAuthUser(res.user as any);
      setProfileMsg('Profile updated.');
    } catch (e: any) {
      setError(e?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  }

  async function changePassword() {
    setError('');
    setPwMsg('');
    if (newPassword !== confirm) { setError('New passwords do not match'); return; }
    setSavingPw(true);
    try {
      const res = await api.changePassword({ currentPassword, newPassword });
      setPwMsg(res.message);
      setCurrentPassword(''); setNewPassword(''); setConfirm('');
    } catch (e: any) {
      setError(e?.message || 'Failed to change password');
    } finally {
      setSavingPw(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>
        <p className="text-sm text-gray-500 dark:text-brand-300">Manage your account information.</p>
      </div>

      <Card className="p-6">
        <h2 className="font-bold text-gray-900 dark:text-white mb-4">Profile information</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            {user?.profilePhoto ? (
              <img src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || ''}/uploads/${user.profilePhoto}`} alt="Profile" className="w-20 h-20 rounded-full object-cover border-2 border-brand-200" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-brand-600 text-white flex items-center justify-center text-3xl font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-brand-200 mb-1">Profile Photo</label>
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handlePhotoUpload} className="text-sm text-gray-500 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-100 file:text-brand-700 hover:file:bg-brand-200" />
              {user?.profilePhoto && <button onClick={handleDeletePhoto} className="ml-2 text-xs text-red-600 hover:underline">Remove</button>}
            </div>
          </div>
          <Field label="Name" htmlFor="p-name">
            <input id="p-name" className={inputClasses} value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Email" htmlFor="p-email">
            <input id="p-email" className={inputClasses} value={user?.email || ''} disabled />
          </Field>
          <Field label="Phone" htmlFor="p-phone">
            <input id="p-phone" className={inputClasses} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="03XX-XXXXXXX" />
          </Field>
          <Field label="Physical Description" htmlFor="p-phys" hint="E.g., mole on left cheek, scar on right wrist. Helps identify you in emergencies.">
            <textarea id="p-phys" rows={2} className={inputClasses} value={physicalDescription} onChange={(e) => setPhysicalDescription(e.target.value)} placeholder="e.g., mole on left cheek, scar on right wrist" />
          </Field>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {profileMsg && <p className="text-sm text-green-600">{profileMsg}</p>}
          <Button onClick={saveProfile} loading={savingProfile}>Save changes</Button>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-bold text-gray-900 dark:text-white mb-4">Security</h2>
        <div className="space-y-4">
          <Field label="Current password" htmlFor="cur-pw">
            <input id="cur-pw" type="password" className={inputClasses} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
          </Field>
          <Field label="New password" htmlFor="new-pw">
            <input id="new-pw" type="password" className={inputClasses} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </Field>
          <Field label="Confirm new password" htmlFor="conf-pw">
            <input id="conf-pw" type="password" className={inputClasses} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </Field>
          {pwMsg && <p className="text-sm text-green-600">{pwMsg}</p>}
          <Button onClick={changePassword} loading={savingPw}>Change password</Button>
        </div>
      </Card>
    </div>
  );
}

