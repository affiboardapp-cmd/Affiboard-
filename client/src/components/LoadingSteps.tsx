export function LoadingSteps({ step }: { step: number }) {
  const steps = [
    "Carregando página...",
    "Extraindo elementos...",
    "Analisando copy...",
    "Calculando riscos...",
    "Gerando relatório final..."
  ];

  const progress = Math.min((step / 4) * 100, 100);

  return (
    <div className="p-4 text-center opacity-80">
      <p className="text-gray-400">{steps[step] ?? steps[0]}</p>
      <div className="mt-4 h-1 bg-gray-800 rounded">
        <div
          className="h-1 bg-[#1BC1A1] transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
