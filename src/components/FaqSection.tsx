'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle, PhoneCall } from 'lucide-react';
import { FAQS } from '@/data/products';
import { SHIPPING_POLICY } from '@/data/morocco';
import { useLanguage } from '@/context/LanguageContext';

const FAQS_AR = [
  {
    question: 'كيف يتم الدفع عند الاستلام (Cash on Delivery)؟',
    answer:
      'الأمر بسيط وآمن 100%: تطلب بنقرة واحدة بدون دفع مسبق. يسلمك الموزع الطرد في منزلك أو عيادتك، ولا تدفع المبلغ نقداً إلا عند الاستلام.',
  },
  {
    question: 'ما هي مدة التوصيل بالمغرب؟',
    answer:
      'نشحن من ورشتنا خلال 24 ساعة. يستغرق التوصيل عادة 24 ساعة لمحور الدار البيضاء-الرباط-القنيطرة، ومن 24 إلى 48 ساعة عمل لمراكش وطنجة وفاس وأكادير ووجدة وباقي مدن المملكة.',
  },
  {
    question: 'هل يمكنني تبديل المقاس إذا لم يناسبني؟',
    answer:
      'بالتأكيد! إذا لم يناسبك المقاس بعد القياس، تواصل مع فريقنا عبر واتساب خلال 48 ساعة وسننظم لك عملية تبديل سريعة وبدون تعقيد.',
  },
  {
    question: 'كيف يعمل التطريز الشخصي للاسم؟',
    answer:
      'يمكنك تفعيل خيار التطريز (+45 درهم فقط، أو مجاناً في الباقات). نقوم بتطريز اسمك ولقبك وتخصصك بخيط متين وعالي الدقة على جيب الصدر.',
  },
  {
    question: 'هل تقدمون أسعاراً خاصة للعيادات والمجموعات؟',
    answer:
      'نعم! ابتداءً من 5 أزياء لفريقكم الطبي أو دفعتكم الدراسية، نطبق تعريفة تفضيلية مع تطريز شعار العيادة مجاناً. تواصلوا معنا عبر واتساب للحصول على عرض فوري.',
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const { lang, t } = useLanguage();
  const faqItems = lang === 'AR' ? FAQS_AR : FAQS;

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="py-16 bg-slate-50 border-b border-slate-200/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-800 bg-sky-100/70 px-3.5 py-1.5 rounded-full mb-3">
            <HelpCircle className="w-3.5 h-3.5 text-sky-600" />
            <span>{t('faq_badge')}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1B2A4A] tracking-tight">
            {t('faq_title')}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {t('faq_subtitle')}
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {faqItems.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full px-5 sm:px-6 py-4 sm:py-5 text-start font-bold text-sm sm:text-base text-slate-900 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'transform rotate-180 text-sky-600' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 sm:px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 animate-in fade-in duration-150">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Contact Banner */}
        <div className="mt-8 text-center bg-white p-5 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-600 text-center sm:text-start">
            <p className="font-bold text-slate-900">{t('faq_contact_title')}</p>
            <p className="text-slate-500">{t('faq_contact_sub')}</p>
          </div>
          <a
            href={`https://wa.me/${SHIPPING_POLICY.whatsappNumber}?text=Bonjour%20Blouseti,%20j%27ai%20une%20question%20avant%20de%20commander.`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors shrink-0"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>{t('faq_contact_btn')}</span>
          </a>
        </div>

      </div>
    </section>
  );
}
