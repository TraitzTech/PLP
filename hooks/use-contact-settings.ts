'use client';

import { useEffect, useState } from 'react';
import { settingsService } from '@/services/settingsService';

export type ContactSettings = {
  primaryPhone: string;
  secondaryPhone: string;
  whatsappPhone: string;
  supportEmail: string;
  contactEmail: string;
  officeAddress: string;
};

export const CONTACT_FALLBACKS: ContactSettings = {
  primaryPhone: '+237680090360',
  secondaryPhone: '+237659471779',
  whatsappPhone: '+237680090360',
  supportEmail: 'support@plplistings.com',
  contactEmail: 'info@plplistings.com',
  officeAddress: 'ENS Street Bambili, Bamenda, Cameroon',
};

const CONTACT_KEYS = [
  'site_phone',
  'support_phone_secondary',
  'support_whatsapp_phone',
  'support_email',
  'contact_email',
  'site_email',
  'site_address',
];

const normalizePhone = (raw: string | null | undefined, fallback: string): string => {
  const input = String(raw || '').trim();
  if (!input) return fallback;

  const digits = input.replace(/\D/g, '');
  if (!digits) return fallback;

  if (digits.startsWith('237')) return `+${digits}`;
  if (digits.length === 9) return `+237${digits}`;
  if (digits.startsWith('00')) return `+${digits.slice(2)}`;
  return `+${digits}`;
};

export const toWhatsappNumber = (phone: string): string => {
  const digits = String(phone || '').replace(/\D/g, '');
  if (!digits) return '237680090360';
  if (digits.length === 9) return `237${digits}`;
  if (digits.startsWith('00')) return digits.slice(2);
  return digits;
};

export const buildWhatsappMessageUrl = (phone: string, message: string): string => {
  const normalized = toWhatsappNumber(phone);
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
};

export function useContactSettings() {
  const [contact, setContact] = useState<ContactSettings>(CONTACT_FALLBACKS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const settings = await settingsService.getPublicSettings(CONTACT_KEYS);
        if (!mounted) return;

        const primaryPhone = normalizePhone(settings.site_phone, CONTACT_FALLBACKS.primaryPhone);
        const secondaryPhone = normalizePhone(settings.support_phone_secondary, CONTACT_FALLBACKS.secondaryPhone);
        const whatsappPhone = normalizePhone(
          settings.support_whatsapp_phone || settings.site_phone,
          CONTACT_FALLBACKS.whatsappPhone
        );

        const supportEmail = String(settings.support_email || settings.site_email || CONTACT_FALLBACKS.supportEmail).trim();
        const contactEmail = String(settings.contact_email || settings.site_email || CONTACT_FALLBACKS.contactEmail).trim();
        const officeAddress = String(settings.site_address || CONTACT_FALLBACKS.officeAddress).trim();

        setContact({
          primaryPhone,
          secondaryPhone,
          whatsappPhone,
          supportEmail,
          contactEmail,
          officeAddress,
        });
      } catch {
        if (!mounted) return;
        setContact(CONTACT_FALLBACKS);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  return { contact, loading };
}
