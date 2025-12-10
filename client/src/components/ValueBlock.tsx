type Props = {
  label: string;
  value: number;
  variant?: 'normal' | 'warning' | 'muted';
  note?: string;
};

export default function ValueBlock({ label, value, variant = 'normal', note }: Props) {
  const valueColor = 
    variant === 'warning' ? 'text-yellow-400' : 
    variant === 'muted' ? 'text-gray-300' : 
    'text-[#1BC1A1]';

  return (
    <div className="p-4 rounded-lg bg-[#0F1F1D] border border-[#1BC1A1]/15">
      <div className="text-sm text-gray-400">{label}</div>
      <div className={`text-2xl font-bold ${valueColor} mt-1`}>{value}%</div>
      {note && <div className="text-xs text-gray-500 mt-2">{note}</div>}
    </div>
  );
}
