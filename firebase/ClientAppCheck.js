'use client'

import { useEffect } from 'react'
import { firebaseApp } from './clientApp'
import { getAppCheckToken } from '@/app/actions/actions'

export default function ClientAppCheck() {
  useEffect(() => {
    let appCheckModule
    let appCheckInstance
    let unsubscribeTokenListener

    // 1) dynamically import the App Check code
    import('firebase/app-check').then(mod => {
      appCheckModule     = mod
      const { CustomProvider, initializeAppCheck, onTokenChanged } = mod

      // 2) create & install your custom provider
      const provider = new CustomProvider({
        getToken: async () => {
          const { appCheckToken, expiresAt } = await getAppCheckToken({
            appId: '1:854100669672:web:c224be87d85439b5af855d'
          })
          return {
            token: appCheckToken,
            expireTimeMillis: expiresAt * 1000
          }
        }
      })
      // 3) initialize App Check and keep the returned instance
      appCheckInstance = initializeAppCheck(firebaseApp, {
        provider,
        isTokenAutoRefreshEnabled: true
      })

      // 4) (optional) subscribe to token changes, keep the unsubscribe fn
      unsubscribeTokenListener = onTokenChanged(
        appCheckInstance,
        (tokenResult) => {
          console.log('AppCheck token updated:', tokenResult)
        }
      )
    })

    return () => {
      if (appCheckModule && appCheckInstance) {
        // stop the automatic refresh
        appCheckModule.setTokenAutoRefreshEnabled(appCheckInstance, false) 
        // and unsubscribe any listener you registered
        unsubscribeTokenListener?.()
      }
    }
  }, [])

  return null
}
