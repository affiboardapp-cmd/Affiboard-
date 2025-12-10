type ComparisonProps = {
  categoryAvg: number;
  current: number;
  metricLabel: string;
};

export function ComparisonBlock({ categoryAvg, current, metricLabel }: ComparisonProps) {
  return (
    <div className="rounded-lg border border-[#1BC1A1]/15 p-4 bg-[#0F1F1D]">
      <div className="text-sm text-gray-400">{metricLabel}</div>
      <div className="mt-2 flex items-end gap-4">
        <div>
          <div className="text-xl font-bold text-gray-300">{categoryAvg}%</div>
          <div className="text-xs text-gray-500">Média do mercado</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-[#1BC1A1]">{current}%</div>
          <div className="text-xs text-gray-500">Esta oferta</div>
        </div>
      </div>
    </div>
  );
}
