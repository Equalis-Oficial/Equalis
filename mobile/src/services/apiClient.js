/**
 * Cliente HTTP Resiliente — Equalis Mobile
 * Trata resolução dinâmica de endereços de rede (Túnel Expo, LAN Wi-Fi e Localhost).
 */
import { NativeModules, Platform } from 'react-native';
import Constants from 'expo-constants';

export function buildCandidateApiUrls() {
  const candidates = [];
  const addUrl = (u) => {
    if (u && !candidates.includes(u)) {
      candidates.push(u.replace(/\/+$/, ''));
    }
  };

  // 0. Variável de ambiente explícita
  if (process.env.EXPO_PUBLIC_API_URL) {
    addUrl(process.env.EXPO_PUBLIC_API_URL);
  }

  // 1. Execução no Navegador Web
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location) {
    if (window.location.origin) {
      addUrl(`${window.location.origin}/api`);
    }
    if (window.location.hostname) {
      addUrl(`http://${window.location.hostname}:3333/api`);
    }
  }

  // 2. ScriptURL do React Native (Metro Bundler origin)
  const scriptURL = NativeModules?.SourceCode?.scriptURL;
  if (scriptURL) {
    const originMatch = scriptURL.match(/^(https?:\/\/[^/]+)/);
    if (originMatch && originMatch[1]) {
      addUrl(`${originMatch[1]}/api`);
    }
    const hostMatch = scriptURL.match(/https?:\/\/([^/:]+)/);
    if (hostMatch && hostMatch[1] && /^(\d{1,3}\.){3}\d{1,3}$/.test(hostMatch[1])) {
      addUrl(`http://${hostMatch[1]}:3333/api`);
      addUrl(`http://${hostMatch[1]}:8081/api`);
    }
  }

  // 3. Linking URI / Experience URL do Expo
  const linkingUri = Constants?.linkingUri || Constants?.experienceUrl;
  if (linkingUri && typeof linkingUri === 'string') {
    const cleanLinking = linkingUri.replace(/^exps?:\/\//, '').split('/')[0];
    const linkingHost = cleanLinking.split(':')[0];
    if (linkingHost.includes('.expo.app') || linkingHost.includes('.exp.direct') || linkingHost.includes('ngrok')) {
      addUrl(`https://${cleanLinking}/api`);
      addUrl(`https://${linkingHost}/api`);
    } else if (/^(\d{1,3}\.){3}\d{1,3}$/.test(linkingHost)) {
      addUrl(`http://${cleanLinking}/api`);
      addUrl(`http://${linkingHost}:8081/api`);
      addUrl(`http://${linkingHost}:3333/api`);
    }
  }

  // 4. HostUri do Expo Constants
  const hostUri =
    Constants?.expoConfig?.hostUri ||
    Constants?.expoGoConfig?.debuggerHost ||
    Constants?.manifest?.debuggerHost ||
    Constants?.manifest2?.extra?.expoGo?.debuggerHost;
  if (hostUri) {
    const cleanHostUri = hostUri.replace(/^https?:\/\//, '').split('/')[0];
    const hostOnly = cleanHostUri.split(':')[0];
    if (hostOnly.includes('.expo.app') || hostOnly.includes('.exp.direct') || hostOnly.includes('ngrok')) {
      addUrl(`https://${cleanHostUri}/api`);
      addUrl(`https://${hostOnly}/api`);
      addUrl(`http://${cleanHostUri}/api`);
    } else if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostOnly)) {
      addUrl(`http://${cleanHostUri}/api`);
      addUrl(`http://${hostOnly}:3333/api`);
      addUrl(`http://${hostOnly}:8081/api`);
    }
  }

  // 5. Fallbacks locais de desenvolvimento (Rede Wi-Fi atual e Loopback)
  addUrl('http://192.168.0.8:3333/api');
  addUrl('http://192.168.0.8:8081/api');
  addUrl('http://10.80.99.211:3333/api');
  addUrl('http://10.80.99.211:8081/api');
  addUrl('http://localhost:3333/api');
  addUrl('http://127.0.0.1:3333/api');

  return candidates;
}

export const API_CANDIDATE_URLS = buildCandidateApiUrls();
let activeApiBaseUrl = API_CANDIDATE_URLS[0] || 'http://192.168.0.8:3333/api';

export function getActiveApiBaseUrl() {
  return activeApiBaseUrl;
}

export async function apiFetch(pathOrUrl, options = {}) {
  const relativePath = pathOrUrl.startsWith('http')
    ? pathOrUrl.replace(/^https?:\/\/[^/]+(\/api)?/, '')
    : pathOrUrl.startsWith('/api')
      ? pathOrUrl.replace(/^\/api/, '')
      : pathOrUrl;

  const normalizedPath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;

  const headers = {
    'Bypass-Tunnel-Reminder': 'true',
    'ngrok-skip-browser-warning': 'true',
    ...(options.headers || {}),
  };

  const dynamicCandidates = buildCandidateApiUrls();
  const orderedUrls = [
    activeApiBaseUrl,
    ...dynamicCandidates.filter((u) => u !== activeApiBaseUrl),
  ];

  let lastError = null;
  for (const base of orderedUrls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const response = await fetch(`${base}${normalizedPath}`, {
        ...options,
        headers,
        signal: options.signal || controller.signal,
      });
      clearTimeout(timeoutId);
      activeApiBaseUrl = base;
      return response;
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError || new Error('NetworkError when attempting to fetch resource.');
}

