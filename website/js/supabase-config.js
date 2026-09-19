/**
 * --------------------------------------------------------------------------
 * Configuración de Supabase para Baqueano Nicaragua
 * --------------------------------------------------------------------------
 * Este archivo inicializa el cliente oficial de Supabase para ser utilizado
 * en la subida de archivos multimedia al ecosistema Cloud Storage de Supabase.
 */

(function (window) {
  'use strict';

  // Solo inicializar si la librería de Supabase está cargada
  if (!window.supabase || !window.supabase.createClient) {
    console.warn('[Baqueano Supabase] La librería @supabase/supabase-js no se ha cargado.');
    return;
  }

  // Credenciales públicas de Supabase (Soberanía y Almacenamiento Seguro)
  const SUPABASE_URL = 'https://heiudfpthqwtjrtluqlm.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_q7ZhqRIRjlerZK7WOu_Qxw_X_AqXV1d';

  try {
    // Inicializar cliente global
    window.baqueanoSupabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.info('🟢 [Baqueano Supabase] Cliente de Almacenamiento inicializado con éxito.');
  } catch (err) {
    console.error('🔴 [Baqueano Supabase] Error inicializando Supabase:', err.message);
  }

})(window);
