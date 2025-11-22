const DEFAULT_OBSERVABILITY_URLS = {
  grafana: 'https://prod.windeath44.wiki/admin/grafana',
  kiali: 'https://prod.windeath44.wiki/admin/kiali',
  prometheus: 'https://prod.windeath44.wiki/admin/prometheus',
  kafkaUi: 'https://prod.windeath44.wiki/admin/kafka-ui',
  argoCd: 'https://prod.windeath44.wiki/admin/argocd',
};

export const observabilityConfig = {
  grafanaUrl: process.env.NEXT_PUBLIC_GRAFANA_URL || DEFAULT_OBSERVABILITY_URLS.grafana,
  kialiUrl: process.env.NEXT_PUBLIC_KIALI_URL || DEFAULT_OBSERVABILITY_URLS.kiali,
  prometheusUrl: process.env.NEXT_PUBLIC_PROMETHEUS_URL || DEFAULT_OBSERVABILITY_URLS.prometheus,
  kafkaUiUrl: process.env.NEXT_PUBLIC_KAFKA_UI_URL || DEFAULT_OBSERVABILITY_URLS.kafkaUi,
  argoCdUrl: process.env.NEXT_PUBLIC_ARGOCD_URL || DEFAULT_OBSERVABILITY_URLS.argoCd,
};
