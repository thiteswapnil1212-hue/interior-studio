/**
 * PWA Service Worker Registration Module
 * 
 * Handles registration, updates, and lifecycle management of the service worker
 * for the Interior Studio - Sharp Share PWA.
 * 
 * Features:
 * - Graceful fallback if service workers aren't supported
 * - Automatic update detection and user notification
 * - Offline detection and status indication
 * - Install prompt handling for "Add to Home Screen"
 */

(function initPWA() {
  // Check browser support for service workers
  if (!('serviceWorker' in navigator)) {
    console.info('📱 Service Workers not supported. This is OK for older browsers.');
    return;
  }

  // Page visibility API for efficiency
  let isPageVisible = !document.hidden;
  document.addEventListener('visibilitychange', () => {
    isPageVisible = !document.hidden;
    if (isPageVisible) {
      console.log('[PWA] Page visible. Checking for service worker updates...');
      checkForUpdates();
    }
  });

  // ============================================
  // Service Worker Registration
  // ============================================

  /**
   * Register the service worker
   */
  function registerServiceWorker() {
    navigator.serviceWorker.register('/service-worker.js', {
      scope: '/',
    })
      .then((registration) => {
        console.log('✓ Service Worker registered successfully');
        console.log(`  Scope: ${registration.scope}`);
        
        // Set up update checking
        registration.addEventListener('updatefound', onUpdateFound);
        
        // Check for updates every 6 hours
        setInterval(() => {
          if (isPageVisible) {
            registration.update().catch((error) => {
              console.warn('[PWA] Update check failed:', error);
            });
          }
        }, 6 * 60 * 60 * 1000); // 6 hours

        // Log current content type
        if (registration.active) {
          console.log('✓ Service Worker is active and serving cache');
        }
      })
      .catch((error) => {
        console.error('✗ Service Worker registration failed:', error);
        
        // Provide helpful error messages
        if (error.message && error.message.includes('404')) {
          console.error(
            'Service worker file not found (404). ' +
            'Ensure service-worker.js is in the root directory.'
          );
        } else if (error.message && error.message.includes('insecure')) {
          console.error(
            'Service workers require HTTPS or localhost. ' +
            'This app will work fully in production.'
          );
        }
      });
  }

  /**
   * Handle service worker updates
   */
  function onUpdateFound(event) {
    const registration = event.target;
    const newWorker = registration.installing;

    if (!newWorker) return;

    console.log('[PWA] New service worker found. Checking state...');

    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
        // New service worker is ready and there's an old one
        console.log('[PWA] ⚡ Update available!');
        notifyUserOfUpdate(registration);
      }
    });
  }

  /**
   * Notify user of available service worker update
   */
  function notifyUserOfUpdate(registration) {
    // Option 1: Simple console message
    console.log(
      '💡 A new version of Interior Studio is available! ' +
      'Refresh the page to get the latest updates.'
    );

    // Option 2: Show banner (uncomment to enable)
    // showUpdateBanner(registration);

    // Option 3: Automatic reload after a delay (uncomment to enable)
    // skipWaitingAndReload(registration);
  }

  /**
   * Show update banner to user
   * @param {ServiceWorkerRegistration} registration
   */
  function showUpdateBanner(registration) {
    // Create banner element
    const banner = document.createElement('div');
    banner.id = 'pwa-update-banner';
    banner.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      right: 20px;
      max-width: 400px;
      background: linear-gradient(135deg, #D4AF37, #FFD700);
      color: #000000;
      padding: 16px 20px;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      font-weight: 600;
      z-index: 10000;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      animation: slideUp 0.4s ease-out;
    `;

    banner.innerHTML = `
      <span>✨ Interior Studio updated. Refresh to see changes.</span>
      <div style="display: flex; gap: 8px;">
        <button id="pwa-update-yes" style="
          padding: 8px 16px;
          background: #000000;
          color: #D4AF37;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        ">Refresh</button>
        <button id="pwa-update-no" style="
          padding: 8px 16px;
          background: transparent;
          color: #000000;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        ">Later</button>
      </div>
    `;

    document.body.appendChild(banner);

    // Add animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideUp {
        from { transform: translateY(100%); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);

    // Handle button clicks
    document.getElementById('pwa-update-yes').addEventListener('click', () => {
      skipWaitingAndReload(registration);
    });

    document.getElementById('pwa-update-no').addEventListener('click', () => {
      banner.remove();
    });

    // Auto-dismiss after 10 seconds
    setTimeout(() => {
      if (banner.parentNode) {
        banner.remove();
      }
    }, 10000);
  }

  /**
   * Force the new service worker to activate and reload
   */
  function skipWaitingAndReload(registration) {
    const newWorker = registration.waiting;
    if (!newWorker) return;

    // Tell service worker to skip waiting
    newWorker.postMessage({ type: 'SKIP_WAITING' });

    // Reload once the new service worker activates
    let reloadPending = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!reloadPending) {
        reloadPending = true;
        console.log('[PWA] ✓ Update activated. Reloading...');
        window.location.reload();
      }
    });
  }

  /**
   * Check for service worker updates manually
   */
  function checkForUpdates() {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.update();
      })
      .catch((error) => {
        console.warn('[PWA] Update check failed:', error);
      });
  }

  // ============================================
  // Offline Detection
  // ============================================

  /**
   * Monitor online/offline status
   */
  window.addEventListener('online', () => {
    console.log('✓ Back online');
    showOfflineStatus(false);
  });

  window.addEventListener('offline', () => {
    console.log('✗ Connection lost. Serving from cache.');
    showOfflineStatus(true);
  });

  /**
   * Display offline status indicator
   * @param {boolean} isOffline - True if offline
   */
  function showOfflineStatus(isOffline) {
    let indicator = document.getElementById('pwa-offline-indicator');

    if (isOffline) {
      if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'pwa-offline-indicator';
        indicator.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: #ff6b6b;
          color: white;
          padding: 12px 20px;
          text-align: center;
          font-weight: 600;
          z-index: 9999;
          font-size: 0.9rem;
        `;
        indicator.textContent = '📡 No connection. Working offline.';
        document.body.insertBefore(indicator, document.body.firstChild);
      }
    } else if (indicator) {
      indicator.remove();
    }
  }

  // ============================================
  // Install Prompt (Add to Home Screen)
  // ============================================

  let installPromptEvent = null;

  /**
   * Capture the beforeinstallprompt event
   */
  window.addEventListener('beforeinstallprompt', (event) => {
    // Prevent the mini-infobar from appearing on mobile
    event.preventDefault();
    
    // Store the event for later use
    installPromptEvent = event;
    
    console.log('✓ App can be installed');
    showInstallPrompt();
  });

  /**
   * Show custom install prompt
   */
  function showInstallPrompt() {
    if (!installPromptEvent) return;

    // Create a custom install button (optional)
    const installBtn = document.getElementById('install-app-btn');
    if (installBtn) {
      installBtn.style.display = 'flex';
      installBtn.addEventListener('click', () => {
        if (installPromptEvent) {
          installPromptEvent.prompt();
          installPromptEvent.userChoice
            .then((choiceResult) => {
              if (choiceResult.outcome === 'accepted') {
                console.log('✓ User accepted install prompt');
              } else {
                console.log('ℹ️  User dismissed install prompt');
              }
              installPromptEvent = null;
            });
        }
      });
    }
  }

  /**
   * Handle app installed event
   */
  window.addEventListener('appinstalled', () => {
    console.log('🎉 App successfully installed!');
    // Hide the install button after installation
    const installBtn = document.getElementById('install-app-btn');
    if (installBtn) {
      installBtn.style.display = 'none';
    }
  });

  // ============================================
  // Initialize PWA
  // ============================================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', registerServiceWorker);
  } else {
    registerServiceWorker();
  }

  // Expose PWA utilities globally
  window.pwaUtils = {
    registerServiceWorker,
    checkForUpdates,
    showUpdateBanner,
    skipWaitingAndReload,
    showInstallPrompt,
  };

  console.log('✓ PWA module initialized');
})();
