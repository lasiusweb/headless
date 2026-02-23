/**
 * Internationalization (i18n) Configuration
 * 
 * Supports multiple languages for rural farmers
 * Languages: English, Telugu, Kannada
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
  en: {
    translation: {
      // Navigation
      'nav.home': 'Home',
      'nav.shop': 'Shop',
      'nav.cart': 'Cart',
      'nav.login': 'Login',
      'nav.signup': 'Sign Up',
      'nav.dashboard': 'Dashboard',
      'nav.logout': 'Logout',
      
      // Portal Selection
      'portal.dealer.title': "I'm a Dealer",
      'portal.dealer.description': 'Wholesale pricing, bulk ordering & exclusive benefits for dealers and distributors',
      'portal.dealer.benefits.1': '40-55% off MRP',
      'portal.dealer.benefits.2': 'Bulk order tools',
      'portal.dealer.benefits.3': 'Credit management',
      'portal.dealer.benefits.4': 'Priority support',
      'portal.dealer.button': 'Enter Dealer Portal',
      
      'portal.farmer.title': "I'm a Farmer",
      'portal.farmer.description': 'Farm inputs at competitive prices delivered to your farm gate',
      'portal.farmer.benefits.1': 'Quality assured products',
      'portal.farmer.benefits.2': 'Direct from manufacturers',
      'portal.farmer.benefits.3': 'Expert guidance',
      'portal.farmer.benefits.4': 'Timely delivery',
      'portal.farmer.button': 'Shop Now',
      
      // Common
      'common.loading': 'Loading...',
      'common.error': 'Error',
      'common.success': 'Success',
      'common.submit': 'Submit',
      'common.cancel': 'Cancel',
      'common.save': 'Save',
      'common.delete': 'Delete',
      'common.edit': 'Edit',
      'common.search': 'Search',
      'common.filter': 'Filter',
      'common.sort': 'Sort',
      
      // Product
      'product.name': 'Product Name',
      'product.price': 'Price',
      'product.mrp': 'MRP',
      'product.discount': 'Discount',
      'product.add_to_cart': 'Add to Cart',
      'product.out_of_stock': 'Out of Stock',
      'product.in_stock': 'In Stock',
      
      // Cart
      'cart.title': 'Shopping Cart',
      'cart.empty': 'Your cart is empty',
      'cart.total': 'Total',
      'cart.checkout': 'Checkout',
      'cart.continue_shopping': 'Continue Shopping',
      
      // Auth
      'auth.email': 'Email',
      'auth.password': 'Password',
      'auth.forgot_password': 'Forgot Password?',
      'auth.remember_me': 'Remember Me',
      'auth.sign_in': 'Sign In',
      'auth.sign_up': 'Sign Up',
      
      // Accessibility
      'a11y.skip_to_content': 'Skip to content',
      'a11y.open_menu': 'Open menu',
      'a11y.close_menu': 'Close menu',
      'a11y.toggle_high_contrast': 'Toggle high contrast mode',
    },
  },
  
  te: {
    translation: {
      // Navigation - Telugu
      'nav.home': 'హోమ్',
      'nav.shop': 'షాప్',
      'nav.cart': 'కార్ట్',
      'nav.login': 'లాగిన్',
      'nav.signup': 'సైన్ అప్',
      'nav.dashboard': 'డాష్‌బోర్డ్',
      'nav.logout': 'లాగౌట్',
      
      // Portal Selection - Telugu
      'portal.dealer.title': 'నేను డీలర్‌ని',
      'portal.dealer.description': 'డీలర్లు మరియు డిస్ట్రిబ్యూటర్ల కోసం హోల్‌సేల్ ధరలు, బల్క్ ఆర్డర్లు మరియు ప్రత్యేక ప్రయోజనాలు',
      'portal.dealer.benefits.1': 'MRP పై 40-55% తగ్గింపు',
      'portal.dealer.benefits.2': 'బల్క్ ఆర్డర్ సాధనాలు',
      'portal.dealer.benefits.3': 'క్రెడిట్ నిర్వహణ',
      'portal.dealer.benefits.4': 'ప్రాధాన్యత మద్దతు',
      'portal.dealer.button': 'డీలర్ పోర్టల్‌ను నమోదు చేయండి',
      
      'portal.farmer.title': 'నేను రైతును',
      'portal.farmer.description': 'పోటీ ధరల వద్ద వ్యవసాయ ఇన్‌పుట్లు మీ ఫార్మ్ గేట్‌కు డెలివరీ',
      'portal.farmer.benefits.1': 'నాణ్యత ధృవీకరించిన ఉత్పత్తులు',
      'portal.farmer.benefits.2': 'తయారీదారుల నుండి నేరుగా',
      'portal.farmer.benefits.3': 'నిపుణుల మార్గదర్శకత్వం',
      'portal.farmer.benefits.4': 'సమయానికి డెలివరీ',
      'portal.farmer.button': 'ఇప్పుడు కొనండి',
      
      // Common - Telugu
      'common.loading': 'లోడ్ అవుతోంది...',
      'common.error': 'లోపం',
      'common.success': 'విజయం',
      'common.submit': 'సమర్పించు',
      'common.cancel': 'రద్దు చేయి',
      'common.save': 'సేవ్ చేయి',
      'common.delete': 'తొలగించు',
      'common.edit': 'సవరించు',
      'common.search': 'శోధన',
      'common.filter': 'ఫిల్టర్',
      'common.sort': 'వరుసలో అమర్చు',
      
      // Product - Telugu
      'product.name': 'ఉత్పత్తి పేరు',
      'product.price': 'ధర',
      'product.mrp': 'MRP',
      'product.discount': 'తగ్గింపు',
      'product.add_to_cart': 'కార్ట్‌కు జోడించు',
      'product.out_of_stock': 'స్టాక్ లేదు',
      'product.in_stock': 'స్టాక్‌లో ఉంది',
      
      // Cart - Telugu
      'cart.title': 'షాపింగ్ కార్ట్',
      'cart.empty': 'మీ కార్ట్ ఖాళీగా ఉంది',
      'cart.total': 'మొత్తం',
      'cart.checkout': 'చెకౌట్',
      'cart.continue_shopping': 'షాపింగ్ కొనసాగించు',
      
      // Auth - Telugu
      'auth.email': 'ఇమెయిల్',
      'auth.password': 'పాస్‌వర్డ్',
      'auth.forgot_password': 'పాస్‌వర్డ్ మర్చిపోయారా?',
      'auth.remember_me': 'నన్ను గుర్తుంచుకో',
      'auth.sign_in': 'సైన్ ఇన్',
      'auth.sign_up': 'సైన్ అప్',
      
      // Accessibility - Telugu
      'a11y.skip_to_content': 'కంటెంట్‌కు వెళ్ళు',
      'a11y.open_menu': 'మెనూ తెరవండి',
      'a11y.close_menu': 'మెనూ మూసివేయండి',
      'a11y.toggle_high_contrast': 'అధిక కాంట్రాస్ట్ మోడ్‌ను మార్చండి',
    },
  },
  
  kn: {
    translation: {
      // Navigation - Kannada
      'nav.home': 'ಮುಖಪುಟ',
      'nav.shop': 'ಅಂಗಡಿ',
      'nav.cart': 'ಬಂಡಿ',
      'nav.login': 'ಲಾಗ್‌ಇನ್',
      'nav.signup': 'ಸೈನ್ ಅಪ್',
      'nav.dashboard': 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
      'nav.logout': 'ಲಾಗ್‌ಔಟ್',
      
      // Portal Selection - Kannada
      'portal.dealer.title': 'ನಾನು ಡೀಲರ್',
      'portal.dealer.description': 'ಡೀಲರ್‌ಗಳು ಮತ್ತು ವಿತರಕರಿಗೆ ಥೋಕ್ರೆ ಬೆಲೆಗಳು, ಬಲ್ಕ್ ಆರ್ಡರ್‌ಗಳು ಮತ್ತು ವಿಶೇಷ ಪ್ರಯೋಜನಗಳು',
      'portal.dealer.benefits.1': 'MRP ಮೇಲೆ 40-55% ರಿಯಾಯಿತಿ',
      'portal.dealer.benefits.2': 'ಬಲ್ಕ್ ಆರ್ಡರ್ ಸಾಧನಗಳು',
      'portal.dealer.benefits.3': 'ಸಾಲ ನಿರ್ವಹಣೆ',
      'portal.dealer.benefits.4': 'ಆದ್ಯತೆ ಬೆಂಬಲ',
      'portal.dealer.button': 'ಡೀಲರ್ ಪೋರ್ಟಲ್ ಪ್ರವೇಶಿಸಿ',
      
      'portal.farmer.title': 'ನಾನು ರೈತ',
      'portal.farmer.description': 'ಸ್ಪರ್ಧಾತ್ಮಕ ಬೆಲೆಗಳಲ್ಲಿ ಕೃಷಿ ಇನ್‌ಪುಟ್‌ಗಳು ನಿಮ್ಮ ಫಾರ್ಮ್ ಗೇಟ್‌ಗೆ ತಲುಪಿಸಲಾಗುತ್ತದೆ',
      'portal.farmer.benefits.1': 'ಗುಣಮಟ್ಟದ ಖಾತರಿ ಉತ್ಪನ್ನಗಳು',
      'portal.farmer.benefits.2': 'ತಯಾರಕರಿಂದ ನೇರವಾಗಿ',
      'portal.farmer.benefits.3': 'ತಜ್ಞರ ಮಾರ್ಗದರ್ಶನ',
      'portal.farmer.benefits.4': 'ಸಮಯಕ್ಕೆ ತಲುಪಿಸುವಿಕೆ',
      'portal.farmer.button': 'ಈಗ ಖರೀದಿಸಿ',
      
      // Common - Kannada
      'common.loading': 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
      'common.error': 'ದೋಷ',
      'common.success': 'ಯಶಸ್ಸು',
      'common.submit': 'ಸಲ್ಲಿಸಿ',
      'common.cancel': 'ರದ್ದುಗೊಳಿಸಿ',
      'common.save': 'ಉಳಿಸಿ',
      'common.delete': 'ಅಳಿಸಿ',
      'common.edit': 'ಸಂಪಾದಿಸಿ',
      'common.search': 'ಹುಡುಕಿ',
      'common.filter': 'ಫಿಲ್ಟರ್',
      'common.sort': 'ವಿಂಗಡಿಸಿ',
      
      // Product - Kannada
      'product.name': 'ಉತ್ಪನ್ನದ ಹೆಸರು',
      'product.price': 'ಬೆಲೆ',
      'product.mrp': 'MRP',
      'product.discount': 'ರಿಯಾಯಿತಿ',
      'product.add_to_cart': 'ಬಂಡಿಗೆ ಸೇರಿಸಿ',
      'product.out_of_stock': 'ಸ್ಟಾಕ್ ಇಲ್ಲ',
      'product.in_stock': 'ಸ್ಟಾಕ್‌ನಲ್ಲಿದೆ',
      
      // Cart - Kannada
      'cart.title': 'ಷಾಪಿಂಗ್ ಬಂಡಿ',
      'cart.empty': 'ನಿಮ್ಮ ಬಂಡಿ ಖಾಲಿಯಾಗಿದೆ',
      'cart.total': 'ಒಟ್ಟು',
      'cart.checkout': 'ಚೆಕೌಟ್',
      'cart.continue_shopping': 'ಷಾಪಿಂಗ್ ಮುಂದುವರಿಸಿ',
      
      // Auth - Kannada
      'auth.email': 'ಇಮೇಲ್',
      'auth.password': 'ಪಾಸ್‌ವರ್ಡ್',
      'auth.forgot_password': 'ಪಾಸ್‌ವರ್ಡ್ ಮರೆತಿದ್ದೀರಾ?',
      'auth.remember_me': 'ನನ್ನನ್ನು ನೆನಪಿಟ್ಟುಕೊ',
      'auth.sign_in': 'ಸೈನ್ ಇನ್',
      'auth.sign_up': 'ಸೈನ್ ಅಪ್',
      
      // Accessibility - Kannada
      'a11y.skip_to_content': 'ವಿಷಯಕ್ಕೆ ಹೋಗಿ',
      'a11y.open_menu': 'ಮೆನು ತೆರೆಯಿರಿ',
      'a11y.close_menu': 'ಮೆನು ಮುಚ್ಚಿ',
      'a11y.toggle_high_contrast': 'ಹೈ ಕಾಂಟ್ರಾಸ್ಟ್ ಮೋಡ್ ಟಾಗಲ್ ಮಾಡಿ',
    },
  },
};

// Initialize i18n
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'te', 'kn'],
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false, // React already escapes
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
