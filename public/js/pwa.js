// PWA Registration and Install Prompt
// Add this script to index.html

let deferredPrompt;
let installButton;

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('✅ Service Worker registered:', registration.scope);
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker available
              if (confirm('New version available! Reload to update?')) {
                window.location.reload();
              }
            }
          });
        });
      })
      .catch((error) => {
        console.log('❌ Service Worker registration failed:', error);
      });
  });
}

// Handle install prompt
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('💾 beforeinstallprompt fired');
  
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault();
  
  // Save the event so it can be triggered later
  deferredPrompt = e;
  
  // Show install button
  showInstallButton();
});

// Show install button
function showInstallButton() {
  // Create install button if it doesn't exist
  if (!installButton) {
    installButton = document.createElement('button');
    installButton.id = 'pwa-install-btn';
    installButton.className = 'pwa-install-button';
    installButton.innerHTML = '📱 Install App';
    installButton.addEventListener('click', installApp);
    
    // Add to welcome screen
    const welcomeCard = document.querySelector('.welcome-card');
    if (welcomeCard) {
      welcomeCard.insertBefore(installButton, welcomeCard.firstChild);
    }
  }
  
  installButton.style.display = 'block';
}

// Install the app
async function installApp() {
  if (!deferredPrompt) {
    return;
  }
  
  // Show the install prompt
  deferredPrompt.prompt();
  
  // Wait for the user's response
  const { outcome } = await deferredPrompt.userChoice;
  
  console.log(`User response: ${outcome}`);
  
  if (outcome === 'accepted') {
    console.log('✅ User installed the app');
    installButton.style.display = 'none';
  } else {
    console.log('❌ User dismissed the install prompt');
  }
  
  // Clear the deferred prompt
  deferredPrompt = null;
}

// Hide install button when app is installed
window.addEventListener('appinstalled', (e) => {
  console.log('✅ App installed!');
  if (installButton) {
    installButton.style.display = 'none';
  }
  deferredPrompt = null;
});

// Check if already installed
function isInstalled() {
  // Check if display-mode is standalone
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true;
  }
  
  // Check if launched from home screen (iOS)
  if (window.navigator.standalone === true) {
    return true;
  }
  
  return false;
}

// Hide install button if already installed
if (isInstalled()) {
  console.log('✅ App is already installed');
  if (installButton) {
    installButton.style.display = 'none';
  }
}

// Add CSS for install button
const style = document.createElement('style');
style.textContent = `
  .pwa-install-button {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
    transition: all 0.3s ease;
    display: none;
    animation: slideInDown 0.5s ease;
  }
  
  .pwa-install-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 28px rgba(102, 126, 234, 0.4);
  }
  
  @keyframes slideInDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @media (max-width: 768px) {
    .pwa-install-button {
      top: 10px;
      right: 10px;
      padding: 10px 20px;
      font-size: 13px;
    }
  }
`;
document.head.appendChild(style);
