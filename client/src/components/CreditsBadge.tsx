export default function CreditsBadge({ credits }: { credits: number }) {
  return (
    <div className="flex items-center gap-3 bg-[#0F1F1D] px-3 py-2 rounded-lg border border-[#1BC1A1]/20">
      <div className="text-sm text-gray-400">Análises Disponíveis</div>
      <div className="rounded-full bg-[#1BC1A1] px-3 py-1 text-sm font-semibold text-black">{credits}</div>
    </div>
  );
}
