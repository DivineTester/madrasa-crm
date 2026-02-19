
import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/StoreContext';
import { SystemSettings } from '../../types';
import { ICONS } from '../../constants';
import { Eye, EyeOff } from 'lucide-react';

const Settings: React.FC = () => {
    const { settings, updateSettings } = useStore();
    const [formData, setFormData] = useState<SystemSettings>(settings);
    const [isDirty, setIsDirty] = useState(false);
    const [showSaveSuccess, setShowSaveSuccess] = useState(false);

    // Admin password change state
    const [adminPasswordData, setAdminPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordChangeMessage, setPasswordChangeMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Substitute password change state
    const [substitutePasswordData, setSubstitutePasswordData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [showSubstitutePassword, setShowSubstitutePassword] = useState(false);
    const [showSubstituteConfirmPassword, setShowSubstituteConfirmPassword] = useState(false);
    const [isChangingSubstitutePassword, setIsChangingSubstitutePassword] = useState(false);
    const [substitutePasswordChangeMessage, setSubstitutePasswordChangeMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        setFormData(settings);
    }, [settings]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setIsDirty(true);
        setShowSaveSuccess(false);
    };

    const handleSave = () => {
        updateSettings(formData);
        setIsDirty(false);
        setShowSaveSuccess(true);
        setTimeout(() => setShowSaveSuccess(false), 3000);
    };

    const handleAdminPasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordChangeMessage(null);

        if (adminPasswordData.newPassword !== adminPasswordData.confirmPassword) {
            setPasswordChangeMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }

        if (adminPasswordData.newPassword.length < 4) {
            setPasswordChangeMessage({ type: 'error', text: 'New password must be at least 4 characters long' });
            return;
        }

        setIsChangingPassword(true);

        try {
            const response = await fetch('https://madrasa.quantumautomationssuite.com/backend/update_admin_password.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: adminPasswordData.currentPassword,
                    newPassword: adminPasswordData.newPassword
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                setPasswordChangeMessage({ type: 'success', text: 'Admin password updated successfully!' });
                setAdminPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                setPasswordChangeMessage({ type: 'error', text: result.error || 'Failed to update password' });
            }
        } catch (error) {
            console.error('Password update error:', error);
            setPasswordChangeMessage({ type: 'error', text: 'Unable to connect to server. Please check your internet connection or contact administrator.' });
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleSubstitutePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubstitutePasswordChangeMessage(null);

        if (substitutePasswordData.newPassword !== substitutePasswordData.confirmPassword) {
            setSubstitutePasswordChangeMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }

        if (substitutePasswordData.newPassword.length < 4) {
            setSubstitutePasswordChangeMessage({ type: 'error', text: 'New password must be at least 4 characters long' });
            return;
        }

        setIsChangingSubstitutePassword(true);

        try {
            // Update settings with new substitute password
            const updatedSettings = { ...formData, substitutePassword: substitutePasswordData.newPassword };
            await updateSettings(updatedSettings);
            setSubstitutePasswordChangeMessage({ type: 'success', text: 'Substitute password updated successfully!' });
            setSubstitutePasswordData({ newPassword: '', confirmPassword: '' });
        } catch (error) {
            setSubstitutePasswordChangeMessage({ type: 'error', text: 'Failed to update password' });
        } finally {
            setIsChangingSubstitutePassword(false);
        }
    };

    // Prevent accidental navigation
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty]);

    return (
        <>
            <div className="space-y-8 animate-in fade-in duration-500">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Settings</h1>
                        <p className="text-slate-500 mt-2">Manage institution details and system-wide configurations.</p>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={!isDirty}
                        className={`px-8 py-3 rounded-xl font-bold uppercase tracking-wide transition-all shadow-lg flex items-center gap-2
            ${isDirty
                                ? 'bg-emerald-600 text-white hover:bg-emerald-700 hover:scale-105 shadow-emerald-200'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                    >
                        {ICONS.CheckCircle2}
                        Save Changes
                    </button>
                </div>

                {showSaveSuccess && (
                    <div className="bg-emerald-50 text-emerald-700 px-4 py-3 rounded-xl border border-emerald-100 flex items-center gap-2 animate-in slide-in-from-top-2">
                        {ICONS.CheckCircle2}
                        <span className="font-bold">Settings saved successfully!</span>
                    </div>
                )}

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Institution Profile */}
                <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                            {ICONS.Talaba}
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-900">Institution Profile</h3>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">General Information</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Institution Name</label>
                            <input
                                type="text"
                                name="institutionName"
                                value={formData.institutionName}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-bold text-slate-700"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Phone</label>
                                <input
                                    type="text"
                                    name="contactPhone"
                                    value={formData.contactPhone}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-slate-600"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Email</label>
                                <input
                                    type="email"
                                    name="contactEmail"
                                    value={formData.contactEmail}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-slate-600"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Address</label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                rows={3}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-slate-600 resize-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Finance Configuration */}
                <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                            {ICONS.Finance}
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-900">Finance Configuration</h3>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Receipts & Payments</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                            <div className="flex gap-3">
                                <div className="text-amber-500 mt-1">{ICONS.CheckCircle2}</div>
                                <div>
                                    <h4 className="font-bold text-amber-800 text-sm">Authorized Signature</h4>
                                    <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                                        The name entered below will be automatically generated on all Fee Receipts and Salary Slips as the authorized signatory.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Authorized Signatory Name</label>
                            <input
                                type="text"
                                name="authorizedSignature"
                                value={formData.authorizedSignature}
                                onChange={handleChange}
                                placeholder="e.g. Mudir Name"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-bold text-slate-700"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Currency</label>
                                <input
                                    type="text"
                                    name="currency"
                                    value={formData.currency}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium text-slate-600"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Academic Year</label>
                                <input
                                    type="text"
                                    name="academicYear"
                                    value={formData.academicYear}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium text-slate-600"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Admin Security */}
                <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-900">Admin Security</h3>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Change Admin Password</p>
                        </div>
                    </div>

                    <form onSubmit={handleAdminPasswordChange} className="space-y-6">
                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Current Password</label>
                            <div className="relative">
                                <input
                                    type={showCurrentPassword ? "text" : "password"}
                                    value={adminPasswordData.currentPassword}
                                    onChange={(e) => setAdminPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all font-medium text-slate-600 pr-12"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">New Password</label>
                                <div className="relative">
                                    <input
                                        type={showNewPassword ? "text" : "password"}
                                        value={adminPasswordData.newPassword}
                                        onChange={(e) => setAdminPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all font-medium text-slate-600 pr-12"
                                        required
                                        minLength={4}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Confirm New Password</label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={adminPasswordData.confirmPassword}
                                        onChange={(e) => setAdminPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all font-medium text-slate-600 pr-12"
                                        required
                                        minLength={4}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {passwordChangeMessage && (
                                <div className={`px-4 py-3 rounded-xl border flex items-center gap-2 ${
                                    passwordChangeMessage.type === 'success'
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                        : 'bg-red-50 text-red-700 border-red-100'
                                }`}>
                                    {passwordChangeMessage.type === 'success' ? ICONS.CheckCircle2 : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    )}
                                    <span className="font-bold">{passwordChangeMessage.text}</span>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isChangingPassword}
                                className="w-full py-4 bg-red-600 text-white rounded-xl font-bold uppercase tracking-widest text-xs shadow-lg shadow-red-200 hover:scale-[1.02] transition-transform disabled:opacity-50"
                            >
                                {isChangingPassword ? 'Updating...' : 'Update Admin Password'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Substitute Password */}
                <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                            {ICONS.Users}
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-900">Substitute Access</h3>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Manual Entry Password</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubstitutePasswordChange} className="space-y-6">
                        <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                            <div className="flex gap-3">
                                <div className="text-amber-500 mt-1">{ICONS.CheckCircle2}</div>
                                <div>
                                    <h4 className="font-bold text-amber-800 text-sm">Shared Password</h4>
                                    <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                                        This password is required for all manual entry substitute teachers to access the portal. Set a secure password that can be shared with authorized substitutes.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">New Password</label>
                                <div className="relative">
                                    <input
                                        type={showSubstitutePassword ? "text" : "password"}
                                        value={substitutePasswordData.newPassword}
                                        onChange={(e) => setSubstitutePasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all font-medium text-slate-600 pr-12"
                                        required
                                        minLength={4}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowSubstitutePassword(!showSubstitutePassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showSubstitutePassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Confirm New Password</label>
                                <div className="relative">
                                    <input
                                        type={showSubstituteConfirmPassword ? "text" : "password"}
                                        value={substitutePasswordData.confirmPassword}
                                        onChange={(e) => setSubstitutePasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all font-medium text-slate-600 pr-12"
                                        required
                                        minLength={4}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowSubstituteConfirmPassword(!showSubstituteConfirmPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showSubstituteConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {substitutePasswordChangeMessage && (
                                <div className={`px-4 py-3 rounded-xl border flex items-center gap-2 ${
                                    substitutePasswordChangeMessage.type === 'success'
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                        : 'bg-red-50 text-red-700 border-red-100'
                                }`}>
                                    {substitutePasswordChangeMessage.type === 'success' ? ICONS.CheckCircle2 : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    )}
                                    <span className="font-bold">{substitutePasswordChangeMessage.text}</span>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isChangingSubstitutePassword}
                                className="w-full py-4 bg-amber-600 text-white rounded-xl font-bold uppercase tracking-widest text-xs shadow-lg shadow-amber-200 hover:scale-[1.02] transition-transform disabled:opacity-50"
                            >
                                {isChangingSubstitutePassword ? 'Updating...' : 'Update Substitute Password'}
                            </button>
                        </div>
                    </form>
                </div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 bg-slate-200 text-slate-500 rounded-xl flex items-center justify-center">
                            {ICONS.Settings}
                        </div>
                        <div>
                            <h3 className="font-bold text-md text-slate-700">System Defaults</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Timezone & Locale</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Timezone</label>
                            <div className="font-bold text-slate-600">{formData.timezone}</div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Version</label>
                            <div className="font-bold text-slate-600">v1.4.0 (Build 2025)</div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Database Status</label>
                            <div className="font-bold text-emerald-600 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                Connected
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </>
    );
};

export default Settings;
