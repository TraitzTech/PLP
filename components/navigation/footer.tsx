'use client'

import React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/ui/logo';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Mail, 
  Phone, 
  MapPin,
  ArrowRight 
} from 'lucide-react';
import { useTranslations } from '@/components/translation-provider';

const socialLinks = [
  { name: 'Facebook', href: '#', icon: Facebook },
  { name: 'Twitter', href: '#', icon: Twitter },
  { name: 'Instagram', href: '#', icon: Instagram },
  { name: 'LinkedIn', href: '#', icon: Linkedin },
];

export function Footer() {
  const currentYear = new Date().getFullYear();
  const t = useTranslations();

  const footerLinks = {
    company: [
      { name: t('footer.company.about','About Us'), href: '/about' },
      { name: t('footer.company.careers','Careers'), href: '/careers' },
      { name: t('footer.company.press','Press'), href: '/press' },
      { name: t('footer.company.blog','Blog'), href: '/blog' },
    ],
    support: [
      { name: t('footer.support.help','Help Center'), href: '/help' },
      { name: t('footer.support.contact','Contact Us'), href: '/contact' },
      { name: t('footer.support.safety','Safety'), href: '/safety' },
      { name: t('footer.support.terms','Terms of Service'), href: '/terms' },
    ],
    discover: [
      { name: t('footer.discover.hotels','Hotels'), href: '/search?type=hotels' },
      { name: t('footer.discover.houses','Houses'), href: '/search?type=houses' },
      { name: t('footer.discover.land','Land'), href: '/search?type=land' },
      { name: t('footer.discover.featured','Featured Properties'), href: '/featured' },
    ],
    host: [
      { name: t('footer.host.list','List Your Property'), href: '/host' },
      { name: t('footer.host.resources','Host Resources'), href: '/host/resources' },
      { name: t('footer.host.community','Host Community'), href: '/host/community' },
      { name: t('footer.host.pricing','Pricing Tools'), href: '/host/pricing' },
    ],
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Company Info */}
          <div className="lg:col-span-4 space-y-6">
            <Logo showText variant="horizontal" className="text-white" />
            <p className="text-gray-400 leading-relaxed">
              {t('footer.description','The trusted bridge for seamless property listing, booking, and discovery. Connecting property owners with travelers worldwide.')}
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-plp-yellow" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-plp-yellow" />
                <span>support@propertylistingportal.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-plp-yellow" />
                <span>123 Business Ave, Suite 100, City, ST 12345</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <Link
                    key={social.name}
                    href={social.href}
                    className="w-10 h-10 bg-gray-800 hover:bg-plp-purple rounded-lg flex items-center justify-center transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Footer Links */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <h3 className="font-semibold text-white mb-4">{t('footer.sections.company','Company')}</h3>
                <ul className="space-y-2">
                  {footerLinks.company.map((link) => (
                    <li key={link.name}>
                      <Link 
                        href={link.href}
                        className="hover:text-plp-yellow transition-colors"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-4">{t('footer.sections.support','Support')}</h3>
                <ul className="space-y-2">
                  {footerLinks.support.map((link) => (
                    <li key={link.name}>
                      <Link 
                        href={link.href}
                        className="hover:text-plp-yellow transition-colors"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-4">{t('footer.sections.discover','Discover')}</h3>
                <ul className="space-y-2">
                  {footerLinks.discover.map((link) => (
                    <li key={link.name}>
                      <Link 
                        href={link.href}
                        className="hover:text-plp-yellow transition-colors"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-4">{t('footer.sections.hosting','Hosting')}</h3>
                <ul className="space-y-2">
                  {footerLinks.host.map((link) => (
                    <li key={link.name}>
                      <Link 
                        href={link.href}
                        className="hover:text-plp-yellow transition-colors"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-400">
              {t('footer.copyright','© {year} Property Listing Portal. All rights reserved.').replace('{year}', String(currentYear))}
            </div>
            
            <div className="flex items-center space-x-6 text-sm">
              <Link href="/privacy" className="hover:text-plp-yellow transition-colors">{t('footer.legal.privacy','Privacy Policy')}</Link>
              <Link href="/cookies" className="hover:text-plp-yellow transition-colors">{t('footer.legal.cookies','Cookie Policy')}</Link>
              <Link href="/accessibility" className="hover:text-plp-yellow transition-colors">{t('footer.legal.accessibility','Accessibility')}</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}