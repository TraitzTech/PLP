'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { AlertCircle, Clock, Mail, HeartHandshake } from 'lucide-react'
import { useTranslations } from '@/components/translation-provider'

interface MaintenancePageProps {
  siteName?: string
  siteEmail?: string
  sitePhone?: string
}

export function MaintenancePage({
  siteName = 'PLP Listings',
  siteEmail = 'support@plplistings.com',
  sitePhone,
}: MaintenancePageProps) {
  const t = useTranslations()
  const [displayEmail, setDisplayEmail] = useState(siteEmail)
  const [displayPhone, setDisplayPhone] = useState(sitePhone)

  // Add a subtle animation
  useEffect(() => {
    const interval = setInterval(() => {
      // Subtle pulse effect
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-2xl w-full">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-white/20 shadow-2xl">
          {/* Header with icon */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full blur-lg opacity-75 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full p-6">
                <Clock className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>

          {/* Main heading */}
          <h1 className="text-4xl md:text-5xl font-bold text-center text-white mb-4">
            {t('maintenance.title', 'We\'ll Be Back Soon')}
          </h1>

          {/* Subheading */}
          <p className="text-lg text-center text-blue-100 mb-2 font-medium">
            {siteName}
          </p>

          {/* Description */}
          <p className="text-center text-white/80 mb-8 leading-relaxed text-lg">
            {t(
              'maintenance.description',
              'We\'re currently performing scheduled maintenance to improve your experience. We\'ll be back online shortly!'
            )}
          </p>

          {/* Decorative line */}
          <div className="h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent mb-8"></div>

          {/* Contact info cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {displayEmail && (
              <a
                href={`mailto:${displayEmail}`}
                className="group bg-white/10 hover:bg-white/20 transition-all duration-300 rounded-xl p-6 border border-white/20 hover:border-blue-400/50 cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-blue-500/20 group-hover:bg-blue-500/40 transition-colors rounded-lg p-3 mt-0.5">
                    <Mail className="w-6 h-6 text-blue-300" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white/60 text-sm mb-1">{t('maintenance.emailUs', 'Email us')}</p>
                    <p className="text-white font-medium break-all">{displayEmail}</p>
                  </div>
                </div>
              </a>
            )}

            {displayPhone && (
              <a
                href={`tel:${displayPhone}`}
                className="group bg-white/10 hover:bg-white/20 transition-all duration-300 rounded-xl p-6 border border-white/20 hover:border-indigo-400/50 cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-indigo-500/20 group-hover:bg-indigo-500/40 transition-colors rounded-lg p-3 mt-0.5">
                    <HeartHandshake className="w-6 h-6 text-indigo-300" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white/60 text-sm mb-1">{t('maintenance.callUs', 'Call us')}</p>
                    <p className="text-white font-medium">{displayPhone}</p>
                  </div>
                </div>
              </a>
            )}
          </div>

          {/* What we're doing section */}
          <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-xl p-6 border border-blue-400/20 mb-8">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-white font-semibold mb-2">
                  {t('maintenance.whatWeDoing', 'What we\'re doing')}
                </h3>
                <ul className="text-white/80 space-y-1 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                    {t('maintenance.improvingPerformance', 'Improving platform performance')}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                    {t('maintenance.enhancingFeatures', 'Enhancing key features')}
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                    {t('maintenance.ensuringSecurity', 'Ensuring security & reliability')}
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Loading indicator */}
          <div className="flex justify-center items-center gap-2">
            <span className="text-white/60 text-sm">{t('maintenance.progress', 'Maintenance in progress')}</span>
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                style={{ animationDelay: '0.2s' }}
              ></div>
              <div
                className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                style={{ animationDelay: '0.4s' }}
              ></div>
            </div>
          </div>

          {/* Footer message */}
          <p className="text-center text-white/50 text-xs mt-8 pt-8 border-t border-white/10">
            {t(
              'maintenance.thankYou',
              'Thank you for your patience. We appreciate your understanding!'
            )}
          </p>
        </div>

        {/* Decorative elements below */}
        <div className="mt-8 flex justify-center gap-2">
          <div className="w-3 h-3 bg-blue-400/30 rounded-full"></div>
          <div className="w-3 h-3 bg-indigo-400/30 rounded-full"></div>
          <div className="w-3 h-3 bg-purple-400/30 rounded-full"></div>
        </div>
      </div>
    </div>
  )
}
