"use client";
import { useState, useEffect } from 'react';

const translations = {
  en: {}
};

// Load translations from JSON files
const loadTranslations = async (locale: string) => {
  try {
    const response = await fetch(`/messages/${locale}.json`);
    return await response.json();
  } catch (error) {
    console.error(`Failed to load translations for ${locale}:`, error);
    return {};
  }
};

export const useTranslations = (path: string, locale: string) => {
  const [translations, setTranslations] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const loadedTranslations = await loadTranslations(locale);
      setTranslations(loadedTranslations);
      setLoading(false);
    };
    load();
  }, [locale]);

  const getTranslation = (key: string, values?: Record<string, any>) => {
    if (loading) return key;

    const parts = key.split('.');
    let current = translations;

    for (const part of parts) {
      if (!current[part]) return key;
      current = current[part];
    }

    if (typeof current === 'string' && values) {
      return Object.entries(values).reduce((str, [key, value]) => {
        return str.replace(`{{${key}}}`, value.toString());
      }, current);
    }

    return current || key;
  };

  return getTranslation;
};