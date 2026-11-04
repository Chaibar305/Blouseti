'use client';

import React, { useState } from 'react';
import { X, Ruler, HelpCircle, MessageCircle, Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { SHIPPING_POLICY } from '@/data/morocco';

export default function SizeGuideModal() {
  const { isSizeGuideOpen, closeSizeGuide } = useCart();
  const [activeTab, setActiveTab] = useState<'men' | 'women' | 'coats'>('men');

  if (!isSizeGuideOpen) return null;

  const menSizes = [
    { size: 'XS', chest: '88 - 92 cm', waist: '74 - 78 cm', hips: '88 - 92 cm', length: '98 cm' },
    { size: 'S', chest: '93 - 97 cm', waist: '79 - 83 cm', hips: '93 - 97 cm', length: '100 cm' },
    { size: 'M', chest: '98 - 103 cm', waist: '84 - 89 cm', hips: '98 - 103 cm', length: '102 cm' },
    { size: 'L', chest: '104 - 109 cm', waist: '90 - 95 cm', hips: '104 - 109 cm', length: '104 cm' },
    { size: 'XL', chest: '110 - 116 cm', waist: '96 - 102 cm', hips: '110 - 116 cm', length: '106 cm' },
    { size: 'XXL', chest: '117 - 124 cm', waist: '103 - 110 cm', hips: '117 - 124 cm', length: '107 cm' },
  ];

  const womenSizes = [
    { size: 'XS (34)', chest: '80 - 84 cm', waist: '62 - 66 cm', hips: '86 - 90 cm', length: '96 cm' },
    { size: 'S (36)', chest: '85 - 89 cm', waist: '67 - 71 cm', hips: '91 - 95 cm', length: '98 cm' },
    { size: 'M (38-40)', chest: '90 - 95 cm', waist: '72 - 77 cm', hips: '96 - 101 cm', length: '100 cm' },
    { size: 'L (42)', chest: '96 - 101 cm', waist: '78 - 83 cm', hips: '102 - 107 cm', length: '102 cm' },
    { size: 'XL (44)', chest: '102 - 108 cm', waist: '84 - 90 cm', hips: '108 - 114 cm', length: '103 cm' },
    { size: 'XXL (46+)', chest: '109 - 116 cm', waist: '91 - 98 cm', hips: '115 - 122 cm', length: '104 cm' },
  ];

  const coatsSizes = [
    { size: 'XS', chest: '84 - 88 cm', shoulders: '39 cm', length: '90 cm', sleeve: '58 cm' },
    { size: 'S', chest: '89 - 94 cm', shoulders: '41 cm', length: '92 cm', sleeve: '60 cm' },
    { size: 'M', chest: '95 - 100 cm', shoulders: '43 cm', length: '94 cm', sleeve: '61 cm' },
    { size: 'L', chest: '101 - 106 cm', shoulders: '45 cm', length: '96 cm', sleeve: '62 cm' },
    { size: 'XL', chest: '107 - 113 cm', shoulders: '47 cm', length: '98 cm', sleeve: '63 cm' },
    { size: 'XXL', chest: '114 - 120 cm', shoulders: '49 cm', length: '100 cm', sleeve: '64 cm' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#1B2A4A] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ruler className="w-5 h-5 text-sky-400" />
            <div>
              <h3 className="text-base font-bold">Guide des Tailles Blouseti Maroc</h3>
              <p className="text-xs text-slate-300">Mesures précises en centimètres (cm)</p>
            </div>
          </div>
          <button
            onClick={closeSizeGuide}
            className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Tab buttons */}
          <div className="flex rounded-xl bg-slate-100 p-1 text-xs sm:text-sm font-bold">
            <button
              onClick={() => setActiveTab('men')}
              className={`flex-1 py-2.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'men' ? 'bg-white text-[#1B2A4A] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Scrubs Homme / Unisexe
            </button>
            <button
              onClick={() => setActiveTab('women')}
              className={`flex-1 py-2.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'women' ? 'bg-white text-[#1B2A4A] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Scrubs Femme (Cintrés)
            </button>
            <button
              onClick={() => setActiveTab('coats')}
              className={`flex-1 py-2.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'coats' ? 'bg-white text-[#1B2A4A] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Blouses Blanches
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#1B2A4A]/5 text-[#1B2A4A] font-bold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Taille</th>
                  <th className="px-4 py-3">Tour Poitrine</th>
                  {activeTab !== 'coats' ? (
                    <>
                      <th className="px-4 py-3">Tour Taille</th>
                      <th className="px-4 py-3">Tour Hanches</th>
                      <th className="px-4 py-3">Long. Pantalon</th>
                    </>
                  ) : (
                    <>
                      <th className="px-4 py-3">Carrure Épaules</th>
                      <th className="px-4 py-3">Longueur Blouse</th>
                      <th className="px-4 py-3">Longueur Manches</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(activeTab === 'men' ? menSizes : activeTab === 'women' ? womenSizes : coatsSizes).map((row) => (
                  <tr key={row.size} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-black text-slate-900">{row.size}</td>
                    <td className="px-4 py-3 text-slate-700">{row.chest}</td>
                    {'waist' in row && <td className="px-4 py-3 text-slate-700">{row.waist}</td>}
                    {'hips' in row && <td className="px-4 py-3 text-slate-700">{row.hips}</td>}
                    {'length' in row && <td className="px-4 py-3 text-slate-700">{row.length}</td>}
                    {'shoulders' in row && <td className="px-4 py-3 text-slate-700">{row.shoulders}</td>}
                    {'sleeve' in row && <td className="px-4 py-3 text-slate-700">{row.sleeve}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Advice notes */}
          <div className="bg-sky-50 rounded-2xl p-4 border border-sky-100 text-xs text-sky-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sky-950">
              <HelpCircle className="w-4 h-4 text-sky-600" />
              <span>Conseil de notre modéliste :</span>
            </div>
            <p className="leading-relaxed">
              Nos scrubs sont confectionnés en tissu <strong>4-Way Stretch légèrement extensible</strong>. Si vous êtes entre deux tailles et préférez une coupe plus ajustée (près du corps), choisissez la taille inférieure. Si vous privilégiez l’ampleur pour bouger en toute liberté, prenez la taille supérieure.
            </p>
          </div>

          {/* Exchange guarantee & WhatsApp advice */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="text-xs text-slate-600 text-center sm:text-left">
              <p className="font-bold text-slate-900">Rassurez-vous : Échange facile sous 48h !</p>
              <p className="text-slate-500">Si la taille ne convient pas à la réception, nous l&apos;échangeons sans frais de retour.</p>
            </div>
            <a
              href={`https://wa.me/${SHIPPING_POLICY.whatsappNumber}?text=Bonjour%20Blouseti,%20j%27h%C3%A9site%20entre%20deux%20tailles,%20pouvez-vous%20m%27aider%20?`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors shrink-0 shadow-xs"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Aide Taille sur WhatsApp</span>
            </a>
          </div>

        </div>

      </div>
    </div>
  );
}
