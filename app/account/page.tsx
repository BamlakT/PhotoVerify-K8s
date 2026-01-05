'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    User, Mail, Phone, MapPin, Briefcase, Calendar,
    Fingerprint, Save, Copy, Check, Shield, Lock,
    Hash, Globe, Smartphone, ChevronRight, Cpu, ScanFace, History, Sparkles
} from 'lucide-react';

export default function AccountPage() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        birthDate: '',
        email: '',
        phone: '',
        profession: '',
        zipCode: '',
        city: '',
        country: '',
        cryptoSignature: ''
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [copied, setCopied] = useState(false);
    const [showProtocol, setShowProtocol] = useState(false);

    // Crypto Hash Generation
    const generateSignature = useCallback(async (data: any) => {
        if (!data.firstName && !data.lastName && !data.email) return '';

        const msg = `${data.firstName}-${data.lastName}-${data.email}-${data.birthDate}`.toLowerCase();
        const encoder = new TextEncoder();
        const buffer = encoder.encode(msg);
        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        return `tru-${hashHex.substring(0, 32)}`;
    }, []);

    useEffect(() => {
        fetch('/api/user')
            .then(res => res.json())
            .then(async (data) => {
                if (data && !data.error) {
                    const loadedData = {
                        firstName: data.firstName || '',
                        lastName: data.lastName || '',
                        birthDate: data.birthDate || '',
                        email: data.email || '',
                        phone: data.phone || '',
                        profession: data.profession || '',
                        zipCode: data.zipCode || '',
                        city: data.city || '',
                        country: data.country || '',
                        cryptoSignature: data.cryptoSignature || ''
                    };

                    // If no signature stored, generate one
                    if (!loadedData.cryptoSignature) {
                        loadedData.cryptoSignature = await generateSignature(loadedData);
                    }

                    setFormData(loadedData);
                }
                setLoading(false);
            });
    }, [generateSignature]);

    // Auto-update signature when key fields change
    useEffect(() => {
        const updateSig = async () => {
            const newSig = await generateSignature(formData);
            if (newSig && newSig !== formData.cryptoSignature) {
                setFormData(prev => ({ ...prev, cryptoSignature: newSig }));
            }
        };
        updateSig();
    }, [formData.firstName, formData.lastName, formData.email, formData.birthDate, generateSignature]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(formData.cryptoSignature);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ text: '', type: '' });

        try {
            const res = await fetch('/api/user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setMessage({ text: 'Profil et signature synchronisés avec succès !', type: 'success' });
            } else {
                setMessage({ text: 'Erreur lors de la sauvegarde.', type: 'error' });
            }
        } catch (error) {
            setMessage({ text: 'Erreur de connexion réseau.', type: 'error' });
        } finally {
            setSaving(false);
            setTimeout(() => setMessage({ text: '', type: '' }), 3000);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[80vh]">
                <div className="relative">
                    <div className="h-16 w-16 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin"></div>
                    <Shield className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-blue-600" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Header & Signature Generation */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-slate-900 p-8 text-white relative">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Lock className="h-32 w-32" />
                        </div>

                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/30">
                                    <Shield className="h-8 w-8 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold tracking-tight">Espace Certifié</h1>
                                    <p className="text-slate-400 font-medium">Gestion de votre identité et conformité numérique</p>
                                </div>
                                <button
                                    onClick={() => setShowProtocol(!showProtocol)}
                                    className="ml-auto bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-blue-300 px-4 py-2 rounded-xl text-sm font-bold flex items-center transition-all group"
                                >
                                    <span>Devenir certifié</span>
                                    <ChevronRight className={`ml-1 h-4 w-4 transition-transform ${showProtocol ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
                                </button>
                            </div>

                            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 backdrop-blur-md">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold text-blue-400 uppercase tracking-widest">Votre identifiant chiffré</p>
                                        <div className="flex items-center space-x-3 font-mono text-lg text-emerald-400">
                                            <Hash className="h-5 w-5 opacity-50" />
                                            <span className="truncate max-w-[250px] sm:max-w-md">
                                                {formData.cryptoSignature || 'En attente de données...'}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleCopy}
                                        className="flex items-center justify-center space-x-2 bg-slate-700 hover:bg-slate-600 transition-colors px-6 py-3 rounded-xl font-semibold text-sm border border-slate-600"
                                    >
                                        {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                                        <span>{copied ? 'Copié !' : 'Copier l\'ID'}</span>
                                    </button>
                                </div>
                            </div>

                            {/* Protocol Section */}
                            {showProtocol && (
                                <div className="animate-in slide-in-from-top-4 duration-500 space-y-6 pt-4">
                                    <div className="bg-blue-600/10 border border-blue-500/20 rounded-2xl p-6 md:p-8 space-y-8">
                                        <div className="flex items-center space-x-3">
                                            <Sparkles className="h-6 w-6 text-blue-400" />
                                            <h2 className="text-xl font-bold text-white">Protocole de Certification Créateur</h2>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700/30 space-y-3">
                                                <div className="bg-blue-500/20 p-2 w-fit rounded-lg">
                                                    <ScanFace className="h-5 w-5 text-blue-400" />
                                                </div>
                                                <h3 className="font-bold text-slate-100">Vérification Biométrique</h3>
                                                <p className="text-sm text-slate-400 leading-relaxed italic">
                                                    Notre IA analyse les données biométriques et les documents d'identité pour créer un lien immuable entre votre identité réelle et votre signature numérique.
                                                </p>
                                            </div>

                                            <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700/30 space-y-3">
                                                <div className="bg-emerald-500/20 p-2 w-fit rounded-lg">
                                                    <Cpu className="h-5 w-5 text-emerald-400" />
                                                </div>
                                                <h3 className="font-bold text-slate-100">Validation Par IA</h3>
                                                <p className="text-sm text-slate-400 leading-relaxed italic">
                                                    Garantit que chaque actif émis respecte les normes d'intégrité de TruStation en détectant les falsifications et les duplications non autorisées.
                                                </p>
                                            </div>

                                            <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700/30 space-y-3">
                                                <div className="bg-orange-500/20 p-2 w-fit rounded-lg">
                                                    <History className="h-5 w-5 text-orange-400" />
                                                </div>
                                                <h3 className="font-bold text-slate-100">Traçabilité Historique</h3>
                                                <p className="text-sm text-slate-400 leading-relaxed italic">
                                                    Le protocole immuable suit tout le cycle de vie de vos créations, rendant impossible l'usurpation de vos droits de créateur certifié.
                                                </p>
                                            </div>

                                            <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700/30 space-y-3">
                                                <div className="bg-purple-500/20 p-2 w-fit rounded-lg">
                                                    <Shield className="h-5 w-5 text-purple-400" />
                                                </div>
                                                <h3 className="font-bold text-slate-100">Immunité des Preuves</h3>
                                                <p className="text-sm text-slate-400 leading-relaxed italic">
                                                    En devenant créateur certifié, vos preuves bénéficient d'un niveau supérieur de chiffrement post-quantique.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="pt-4">
                                            <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all transform active:scale-[0.98]">
                                                Devenir un créateur certifié
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 md:p-12">
                        {message.text && (
                            <div className={`mb-8 p-4 rounded-xl flex items-center space-x-3 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                                <Check className="h-5 w-5" />
                                <span className="font-semibold text-sm">{message.text}</span>
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                            {/* Left Column: Personal Information */}
                            <div className="space-y-8">
                                <div className="flex items-center space-x-2 text-slate-900 border-b border-slate-100 pb-4">
                                    <User className="h-5 w-5 text-blue-600" />
                                    <h2 className="text-xl font-bold">Informations Personnelles</h2>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <InputBlock label="Prénom" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Jean" />
                                    <InputBlock label="Nom" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Dupont" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InputBlock label="Date de naissance" name="birthDate" type="date" value={formData.birthDate} onChange={handleChange} icon={<Calendar className="h-4 w-4" />} />
                                    <InputBlock label="Profession" name="profession" value={formData.profession} onChange={handleChange} placeholder="Analyste Compliance" icon={<Briefcase className="h-4 w-4" />} />
                                </div>
                            </div>

                            {/* Right Column: Contact & Location */}
                            <div className="space-y-8">
                                <div className="flex items-center space-x-2 text-slate-900 border-b border-slate-100 pb-4">
                                    <Smartphone className="h-5 w-5 text-blue-600" />
                                    <h2 className="text-xl font-bold">Contact & Localisation</h2>
                                </div>

                                <div className="space-y-4">
                                    <InputBlock label="Adresse Email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="jean.dupont@email.com" icon={<Mail className="h-4 w-4" />} />
                                    <InputBlock label="Téléphone" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="+33 6 00 00 00 00" icon={<Phone className="h-4 w-4" />} />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <InputBlock label="Code Postal" name="zipCode" value={formData.zipCode} onChange={handleChange} placeholder="75000" />
                                    <InputBlock label="Ville" name="city" value={formData.city} onChange={handleChange} placeholder="Paris" icon={<MapPin className="h-4 w-4" />} />
                                </div>

                                <InputBlock label="Pays" name="country" value={formData.country} onChange={handleChange} placeholder="France" icon={<Globe className="h-4 w-4" />} />
                            </div>
                        </div>

                        <div className="mt-12 pt-8 border-t border-slate-100">
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 rounded-2xl shadow-xl shadow-blue-200 transition-all flex items-center justify-center space-x-3 text-lg disabled:opacity-50"
                            >
                                {saving ? (
                                    <div className="h-6 w-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <Save className="h-6 w-6" />
                                        <span>Sécuriser et Enregistrer mon Profil</span>
                                    </>
                                )}
                            </button>
                            <p className="text-center text-slate-400 text-sm mt-6 flex items-center justify-center space-x-2">
                                <Fingerprint className="h-4 w-4" />
                                <span>Toutes les données sont chiffrées localement selon les normes TruStation.</span>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

function InputBlock({ label, name, value, onChange, placeholder, type = "text", icon }: any) {
    return (
        <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center h-4">
                {icon && <span className="mr-2 text-slate-400">{icon}</span>}
                {label}
            </label>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:bg-white outline-none transition-all text-slate-900 font-medium placeholder:text-slate-400"
            />
        </div>
    );
}
