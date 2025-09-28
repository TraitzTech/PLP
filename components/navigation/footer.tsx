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

const socialLinks = [
  { name: 'Facebook', href: '#', icon: Facebook },
  { name: 'Twitter', href: '#', icon: Twitter },
  { name: 'Instagram', href: '#', icon: Instagram },
  { name: 'LinkedIn', href: '#', icon: Linkedin },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Careers', href: '/careers' },
      { name: 'Press', href: '/press' },
      { name: 'Blog', href: '/blog' },
    ],
    support: [
      { name: 'Help Center', href: '/help' },
      { name: 'Contact Us', href: '/contact' },
      { name: 'Safety', href: '/safety' },
      { name: 'Terms of Service', href: '/terms' },
    ],
    discover: [
      { name: 'Hotels', href: '/search?type=hotels' },
      { name: 'Houses', href: '/search?type=houses' },
      { name: 'Land', href: '/search?type=land' },
      { name: 'Featured Properties', href: '/featured' },
    ],
    host: [
      { name: 'List Your Property', href: '/host' },
      { name: 'Host Resources', href: '/host/resources' },
      { name: 'Host Community', href: '/host/community' },
      { name: 'Pricing Tools', href: '/host/pricing' },
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
              The trusted bridge for seamless property listing, booking, and discovery. Connecting property owners with travelers worldwide.
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
                <h3 className="font-semibold text-white mb-4">Company</h3>
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
                <h3 className="font-semibold text-white mb-4">Support</h3>
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
                <h3 className="font-semibold text-white mb-4">Discover</h3>
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
                <h3 className="font-semibold text-white mb-4">Hosting</h3>
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
              © {currentYear} Property Listing Portal. All rights reserved.
            </div>
            
            <div className="flex items-center space-x-6 text-sm">
              <Link href="/privacy" className="hover:text-plp-yellow transition-colors">Privacy Policy</Link>
              <Link href="/cookies" className="hover:text-plp-yellow transition-colors">Cookie Policy</Link>
              <Link href="/accessibility" className="hover:text-plp-yellow transition-colors">Accessibility</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}