'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Calendar, QrCode, Trash2, Search, Loader2, User, ShieldCheck, FileText, Fingerprint, Lock } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import QRCode from 'qrcode';

interface Photo {
    id: string;
    filename: string;
    originalName: string;
    title: string | null;
    description: string | null;
    date: string;
    createdAt: string;
    qrCodeData: string | null;
}

interface UserProfile {
    firstName: string;
    lastName: string;
    cryptoSignature: string;
}

export default function PhotosPage() {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [qrSignatures, setQrSignatures] = useState<Record<string, string>>({});

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Fetch User & Photos
                const [userRes, photosRes] = await Promise.all([
                    fetch('/api/user'),
                    fetch('/api/photos')
                ]);

                if (userRes.ok && photosRes.ok) {
                    const userData = await userRes.json();
                    const photosData = await photosRes.json();
                    setUser(userData);
                    setPhotos(photosData);

                    // Generate QR for Creator Signature if available
                    if (userData.cryptoSignature) {
                        const qr = await QRCode.toDataURL(userData.cryptoSignature);
                        setQrSignatures({ creator: qr });
                    }
                }
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const deletePhoto = async (id: string) => {
        if (!confirm('Voulez-vous vraiment supprimer ce certificat ?')) return;
        try {
            const response = await fetch(`/api/photos/${id}`, { method: 'DELETE' });
            if (response.ok) setPhotos(photos.filter(p => p.id !== id));
        } catch (error) {
            console.error('Failed to delete photo:', error);
        }
    };

    const filteredPhotos = photos.filter(photo =>
        photo.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        photo.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
                <p className="text-gray-500 font-medium">Génération de vos certificats...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
                <div className="space-y-2">
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Registre des Certificats</h1>
                    <p className="text-slate-500 text-lg">Visualisez et gérez vos preuves d'authenticité numériques.</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Rechercher un certificat..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-12 pr-6 py-4 w-full md:w-96 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-12 px-4">
                {filteredPhotos.map((photo) => (
                    <div key={photo.id} className="relative group">
                        {/* Shadow layers for "stacked paper" effect */}
                        <div className="absolute inset-0 bg-white rounded-3xl shadow-xl translate-y-2 translate-x-1 group-hover:translate-y-3 transition-transform"></div>

                        <div className="relative bg-white border border-slate-200 rounded-3xl overflow-hidden flex flex-col md:flex-row min-h-[450px]">

                            {/* Side Accent (Security Band) */}
                            <div className="w-2 bg-gradient-to-b from-blue-600 to-indigo-800"></div>

                            {/* MAIN CONTENT AREA */}
                            <div className="flex-1 p-8 md:p-12 flex flex-col justify-between">

                                <div className="flex flex-col md:flex-row gap-8">
                                    {/* Left: Metadata */}
                                    <div className="flex-1 space-y-8">
                                        <div className="flex items-center space-x-3 text-blue-600">
                                            <ShieldCheck className="h-6 w-6" />
                                            <span className="font-bold uppercase tracking-wider text-sm">Certificat d'Authenticité</span>
                                        </div>

                                        <div className="space-y-4">
                                            <h2 className="text-3xl font-black text-slate-900 leading-tight">
                                                {photo.title || "Document Sans Titre"}
                                            </h2>
                                            <p className="text-slate-600 text-lg leading-relaxed max-w-2xl italic">
                                                "{photo.description || "Aucune description fournie pour ce certificat."}"
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-8 pt-4">
                                            <div className="space-y-1">
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center">
                                                    <Calendar className="h-3 w-3 mr-1" /> Date de Certification
                                                </p>
                                                <p className="text-slate-700 font-semibold italic">
                                                    {format(new Date(photo.date), 'dd MMMM yyyy', { locale: fr })}
                                                </p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center">
                                                    <Fingerprint className="h-3 w-3 mr-1" /> ID Certificat
                                                </p>
                                                <p className="text-slate-500 font-mono text-xs">{photo.id}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Photo (Top Right) */}
                                    <div className="w-full md:w-64 h-64 relative rounded-2xl overflow-hidden border-4 border-slate-50 shadow-inner shrink-0 group-hover:scale-105 transition-transform duration-500">
                                        <Image
                                            src={`/api/uploads/${photo.filename}`}
                                            alt={photo.title || "Certificat"}
                                            fill
                                            className="object-cover"
                                            unoptimized
                                        />
                                        <div className="absolute inset-0 bg-blue-600/10 mix-blend-multiply"></div>
                                    </div>
                                </div>

                                {/* FOOTER: TRIPLE QR CODES */}
                                <div className="mt-12 pt-8 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-8">

                                    {/* 1. Creator QR */}
                                    <div className="flex items-center space-x-4">
                                        <div className="p-2 border bg-white rounded-xl shadow-sm">
                                            {qrSignatures.creator ? (
                                                <Image src={qrSignatures.creator} alt="Creator Sig" width={70} height={70} />
                                            ) : (
                                                <div className="h-[70px] w-[70px] bg-slate-50 flex items-center justify-center">
                                                    <Loader2 className="h-4 w-4 animate-spin text-slate-300" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-blue-600 tracking-tighter uppercase">Signature Créateur</p>
                                            <p className="text-[11px] text-slate-400 leading-tight">Généré via TruStation ID</p>
                                        </div>
                                    </div>

                                    {/* 2. Certificate QR - Lien de vérification */}
                                    <div className="flex items-center space-x-4">
                                        <div className="p-2 border bg-white rounded-xl shadow-sm">
                                            {photo.qrCodeData ? (
                                                <Image src={photo.qrCodeData} alt="Certificate QR" width={70} height={70} />
                                            ) : (
                                                <div className="h-[70px] w-[70px] bg-slate-50 flex items-center justify-center">
                                                    <QrCode className="h-8 w-8 text-slate-300" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-green-600 tracking-tighter uppercase">QR Vérification</p>
                                            <p className="text-[11px] text-slate-400 leading-tight">Lien d'authenticité</p>
                                        </div>
                                    </div>

                                    {/* 3. Global QR (Placeholder) */}
                                    <div className="flex items-center space-x-4 opacity-40">
                                        <div className="p-2 border border-dashed border-slate-300 bg-slate-50 rounded-xl">
                                            <Lock className="h-[70px] w-[70px] text-slate-200 p-2" strokeWidth={1} />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-slate-400 tracking-tighter uppercase">Empreinte Globale</p>
                                            <p className="text-[11px] text-slate-400 leading-tight italic">Compilation cryptée</p>
                                        </div>
                                    </div>

                                </div>
                            </div>

                            {/* Action Float */}
                            <button
                                onClick={() => deletePhoto(photo.id)}
                                className="absolute bottom-6 right-6 md:top-6 md:right-6 md:bottom-auto h-12 w-12 bg-white hover:bg-rose-50 border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:text-rose-600 transition-all shadow-sm opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 className="h-5 w-5" />
                            </button>

                        </div>
                    </div>
                ))}
            </div>

            {filteredPhotos.length === 0 && !isLoading && (
                <div className="text-center py-20 bg-white border border-dashed rounded-3xl mx-4">
                    <FileText className="h-16 w-16 text-slate-200 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-900">Aucun certificat</h3>
                    <p className="text-slate-400 mt-2">Commencez par ajouter une photo pour générer votre premier certificat.</p>
                </div>
            )}
        </div>
    );
}
