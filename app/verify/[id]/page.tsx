'use client';

import { useState, useEffect, use } from 'react';
import Image from 'next/image';
import { ShieldCheck, Calendar, Info, FileText, ArrowLeft, Loader2, Maximize2 } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale'; // Using available fr-CA if fr is not directly available or as fallback

interface Photo {
    id: string;
    filename: string;
    originalName: string;
    title: string | null;
    description: string | null;
    date: string;
    createdAt: string;
}

export default function VerifyPage({ params }: { params: Promise<{ id: string }> }) {
    const unwrappedParams = use(params);
    const id = unwrappedParams.id;
    const [photo, setPhoto] = useState<Photo | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const fetchPhoto = async () => {
            try {
                const response = await fetch(`/api/photos/${id}`);
                if (response.ok) {
                    const data = await response.json();
                    setPhoto(data);
                } else {
                    setError('Document non trouvé ou invalide.');
                }
            } catch (err) {
                setError('Erreur de connexion au serveur.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchPhoto();
    }, [id]);

    if (isLoading) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
                <p className="text-gray-500 font-medium">Authentification du document...</p>
            </div>
        );
    }

    if (error || !photo) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-6 text-center px-4">
                <div className="bg-red-100 p-4 rounded-full">
                    <Info className="h-12 w-12 text-red-600" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-gray-900 italic">Oups !</h1>
                    <p className="text-gray-500 max-w-sm">{error || "Nous n'avons pas pu trouver la photo associée à ce QR code."}</p>
                </div>
                <Link
                    href="/"
                    className="flex items-center space-x-2 text-blue-600 font-semibold hover:underline"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Retour à l'accueil</span>
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12">
            {/* Header Badge */}
            <div className="flex justify-center">
                <div className="inline-flex items-center space-x-2 bg-green-50 border border-green-200 px-6 py-2 rounded-full shadow-sm">
                    <ShieldCheck className="h-5 w-5 text-green-600" />
                    <span className="text-green-700 font-bold uppercase tracking-wider text-sm">Authenticité Vérifiée</span>
                </div>
            </div>

            {/* Main Content */}
            <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden">
                {/* Image Display */}
                <div
                    className="relative aspect-[4/3] sm:aspect-video bg-black cursor-pointer group"
                    onClick={() => setIsFullscreen(!isFullscreen)}
                >
                    <Image
                        src={`/uploads/${photo.filename}`}
                        alt={photo.title || "Document vérifié"}
                        fill
                        className={`object-contain transition-transform duration-500 ${isFullscreen ? 'scale-110' : ''}`}
                        priority
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <Maximize2 className="h-12 w-12 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                    </div>
                </div>

                {/* Details Section */}
                <div className="p-8 md:p-12 bg-white">
                    <div className="space-y-8">
                        <div className="border-b border-gray-100 pb-6">
                            <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
                                {photo.title || photo.originalName}
                            </h1>
                            <p className="text-sm font-mono text-blue-600 mt-2">ID Verification: {photo.id}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-6">
                                <div className="flex items-start space-x-4">
                                    <div className="bg-blue-50 p-3 rounded-2xl shrink-0">
                                        <Calendar className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest px-1 py-1 italic text-center">Date du document</h3>
                                            <p className="text-lg font-semibold text-gray-800 text-center">
                                                {format(new Date(photo.date), 'dd MMMM yyyy', { locale: fr })}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="bg-indigo-50 p-3 rounded-2xl shrink-0">
                                        <FileText className="h-6 w-6 text-indigo-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest px-1 py-1">Description</h3>
                                        <p className="text-gray-600 leading-relaxed italic">
                                            {photo.description || "Aucune description supplémentaire fournie pour ce document."}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 space-y-4">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest text-center px-1 py-1 italic">Détails de mise en ligne</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Ajouté le :</span>
                                        <span className="font-medium text-gray-800 italic">{format(new Date(photo.createdAt), 'dd/MM/yyyy HH:mm')}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Nom original :</span>
                                        <span className="font-medium text-gray-800 truncate max-w-[150px] italic">{photo.originalName}</span>
                                    </div>
                                    <div className="pt-4 mt-4 border-t border-slate-200">
                                        <button
                                            className="w-full py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-100 transition-all flex items-center justify-center space-x-2"
                                            onClick={() => window.open(`/uploads/${photo.filename}`, '_blank')}
                                        >
                                            <Maximize2 className="h-4 w-4" />
                                            <span>Haute Résolution</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <footer className="text-center text-gray-400 text-xs">
                Document sécurisé par PhotoVerify Technologie. <br />
                L'authenticité de cette image a été confirmée numériquement.
            </footer>
        </div>
    );
}
