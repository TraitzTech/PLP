'use client'

import { useEffect, useState } from 'react'
import { settingsService } from '@/services/settingsService'
import { authService } from '@/services/authService'
import { MaintenancePage } from '@/components/maintenance/maintenance-page'
import type { ReactNode } from 'react'

export function MaintenanceWrapper({ children }: { children: ReactNode }) {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [settings, setSettings] = useState({
    siteName: 'PLP Listings',
    siteEmail: 'support@plplistings.com',
    sitePhone: undefined as string | undefined,
  })

  useEffect(() => {
    const checkMaintenanceMode = async () => {
      try {
        // Check if current user is an admin (admins can bypass maintenance mode)
        let isUserAdmin = false
        
        try {
          const currentUser = await authService.getCurrentUser()
          isUserAdmin = currentUser?.user_type === 'admin'
        } catch (error) {
          // If fetching user fails, assume not admin
          isUserAdmin = false
        }

        setIsAdmin(isUserAdmin)

        const publicSettings = await settingsService.getPublicSettings([
          'maintenance_mode',
          'site_name',
          'site_email',
          'site_phone',
        ])

        setIsMaintenanceMode(publicSettings.maintenance_mode === true)
        setSettings({
          siteName: publicSettings.site_name || 'PLP Listings',
          siteEmail: publicSettings.site_email || 'support@plplistings.com',
          sitePhone: publicSettings.site_phone,
        })
      } catch (error) {
        console.error('Failed to check maintenance mode:', error)
        // Default to not in maintenance mode if fetch fails
        setIsMaintenanceMode(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkMaintenanceMode()
  }, [])

  // Show loading state while checking (optional - you can remove this)
  if (isLoading) {
    return <>{children}</>
  }

  // Show maintenance page if maintenance mode is enabled AND user is not an admin
  if (isMaintenanceMode && !isAdmin) {
    return (
      <MaintenancePage
        siteName={settings.siteName}
        siteEmail={settings.siteEmail}
        sitePhone={settings.sitePhone}
      />
    )
  }

  // Show normal content
  return <>{children}</>
}
