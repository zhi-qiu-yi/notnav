export function reportWebVitals(metric: any) {
  const { id, name, label, value } = metric;

  // 发送到你的分析服务
  console.log(`[Metric] ${name} (${label}): ${value}`);
} 