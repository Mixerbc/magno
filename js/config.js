/**
 * Franquicias Magno — Global config
 * Prepara endpoint, WhatsApp y tracking sin integrar backend aún.
 */
window.MagnoConfig = {
  siteName: "Franquicias Magno",
  siteUrl: "https://franquiciasmagno.com",
  phoneDisplay: "+52 1 961 154 2067",
  phoneE164: "5219611542067",
  email: "ventas@franquiciasmagno.com",
  address: "8a Sur Oriente 831, Tuxtla Gutiérrez, Chiapas, MX",
  social: {
    facebook: "https://www.facebook.com/", // [EDITABLE: URL real de Facebook]
    instagram: "https://www.instagram.com/", // [EDITABLE: URL real de Instagram]
  },
  forms: {
    /**
     * Cambia este valor cuando conectes PHP / API / CRM.
     * Ejemplo PHP: "/api/prospect.php"
     * Ejemplo API: "https://api.tudominio.com/leads"
     */
    endpoint: null,
    method: "POST",
  },
  whatsapp: {
    getMessage(franchiseName) {
      const name = franchiseName || "Franquicias Magno";
      return `Hola, quiero información sobre la franquicia ${name}.`;
    },
    getUrl(franchiseName) {
      const text = encodeURIComponent(this.getMessage(franchiseName));
      return `https://wa.me/${window.MagnoConfig.phoneE164}?text=${text}`;
    },
  },
  app: {
    iosUrl: "", // [EDITABLE: enlace de la app en App Store]
    androidUrl: "", // [EDITABLE: enlace de la app en Google Play]
    popupDelayMs: 600,
  },
  analytics: {
    enabled: false, // Activar cuando se implemente Analytics
  },
};
