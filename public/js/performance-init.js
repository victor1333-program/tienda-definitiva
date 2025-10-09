// Performance initialization script
// This runs only on the client side to avoid hydration issues

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
  try {
    // Basic performance optimizations
    if (typeof window !== 'undefined' && window.performance) {
      // Log performance metrics in development
      window.addEventListener('load', () => {
        const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
        console.log(`Página cargada en ${loadTime}ms`);
      });
      
      // Prefetch important resources after page load
      window.addEventListener('load', () => {
        setTimeout(() => {
          const prefetchLinks = [
            '/api/products',
            '/api/categories'
          ];
          
          prefetchLinks.forEach(url => {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = url;
            document.head.appendChild(link);
          });
        }, 1000); // Wait 1 second after load
      });
    }
  } catch (error) {
    console.warn('Error inicializando optimizaciones de rendimiento:', error);
  }
});