import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';

export default function WhatsAppShareButton({
  title = 'Smart Krushi Bazar',
  text = '',
  url = '',
  className = '',
  showLabel = true
}) {
  const { language } = useLanguage();

  const handleShare = (e) => {
    e.stopPropagation();
    const shareUrl = url || window.location.href;
    const fullMessage = `${title ? `*${title}*\n\n` : ''}${text ? `${text}\n\n` : ''}🔗 Link: ${shareUrl}\n\n_Shared via Smart Krushi Bazar Platform_`;
    const encoded = encodeURIComponent(fullMessage);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank', 'noopener,noreferrer');
  };

  const getLabel = () => {
    if (language === 'gu') return 'WhatsApp શેર';
    if (language === 'hi') return 'व्हाट्सएप शेयर';
    return 'Share via WhatsApp';
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      title="Share to WhatsApp"
      className={`inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-medium text-xs shadow-md shadow-emerald-600/20 transition-all ${className}`}
    >
      <FaWhatsapp className="text-base text-white shrink-0" />
      {showLabel && <span>{getLabel()}</span>}
    </button>
  );
}
