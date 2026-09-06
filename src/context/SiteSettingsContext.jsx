import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const defaultSettings = {
  businessPhone: "+573206468689",
  whatsAppNumber: "573206468689",
  businessEmail: "pedidos@florerialacarreta.com",
  address: "Cra 49 # 131 Sur-69",
  city: "Caldas, Antioquia, Colombia",
  instagramUrl: "https://www.instagram.com/floristeria_la_carreta",
  facebookUrl: "",
  scheduleWeekdays: "Lunes a Sábado: 8:00 AM - 6:00 PM",
  scheduleWeekends: "Domingos y Festivos: Cerrado",
  googleMapsEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3967.0583547070116!2d-75.6378!3d6.0911!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e468307db4ef757%3A0x6b1c4e78a6ea23f0!2sCra.%2049%20%23131%20Sur-69%2C%20Caldas%2C%20Antioquia!5e0!3m2!1ses!2sco!4v1709000000000!5m2!1ses!2sco",
  deliveryNotes: "Entregas en Caldas, La Estrella, Sabaneta, Itagüí y Envigado."
};

const SiteSettingsContext = createContext();

export const SiteSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const data = await api.getSettings();
      if (data) {
        setSettings(prev => ({ ...prev, ...data }));
      }
    } catch (e) {
      console.warn("Could not load dynamic site settings, using default", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateSettings = async (newData) => {
    const updated = await api.updateSettings(newData);
    setSettings(prev => ({ ...prev, ...updated }));
    return updated;
  };

  const getWhatsAppLink = (message = '') => {
    const cleanNumber = (settings.whatsAppNumber || '573206468689').replace(/\D/g, '');
    const encoded = encodeURIComponent(message);
    return `https://wa.me/${cleanNumber}${encoded ? `?text=${encoded}` : ''}`;
  };

  return (
    <SiteSettingsContext.Provider
      value={{
        settings,
        loading,
        refreshSettings: fetchSettings,
        updateSettings,
        getWhatsAppLink,
        phone: settings.businessPhone,
        whatsApp: settings.whatsAppNumber,
        address: settings.address,
        city: settings.city,
        email: settings.businessEmail,
        instagram: settings.instagramUrl,
        facebook: settings.facebookUrl,
        scheduleWeekdays: settings.scheduleWeekdays,
        scheduleWeekends: settings.scheduleWeekends,
        mapsUrl: settings.googleMapsEmbedUrl,
        deliveryNotes: settings.deliveryNotes
      }}
    >
      {children}
    </SiteSettingsContext.Provider>
  );
};

export const useSiteSettings = () => {
  const context = useContext(SiteSettingsContext);
  if (!context) {
    return {
      settings: defaultSettings,
      loading: false,
      refreshSettings: () => {},
      updateSettings: async () => {},
      getWhatsAppLink: (msg = '') => `https://wa.me/573206468689?text=${encodeURIComponent(msg)}`,
      phone: defaultSettings.businessPhone,
      whatsApp: defaultSettings.whatsAppNumber,
      address: defaultSettings.address,
      city: defaultSettings.city,
      email: defaultSettings.businessEmail,
      instagram: defaultSettings.instagramUrl,
      facebook: defaultSettings.facebookUrl,
      scheduleWeekdays: defaultSettings.scheduleWeekdays,
      scheduleWeekends: defaultSettings.scheduleWeekends,
      mapsUrl: defaultSettings.googleMapsEmbedUrl,
      deliveryNotes: defaultSettings.deliveryNotes
    };
  }
  return context;
};
