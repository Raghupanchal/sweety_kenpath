/**
 * Clinical glucose classification utility with soft modern health aesthetic
 */
export function getGlucoseCategory(value) {
  const val = Number(value);
  if (isNaN(val)) return { label: 'Unknown', color: 'bg-slate-100 text-slate-700', badgeColor: 'bg-slate-100 text-slate-700', dotColor: 'bg-slate-400' };

  if (val < 70) {
    return {
      label: 'Low (Hypo)',
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      badgeColor: 'bg-[#FFF8E6] text-[#D97706] border border-[#FDE68A]/60',
      dotColor: 'bg-[#F59E0B]',
      chipBg: 'bg-[#FFF8E6]',
      textColor: 'text-[#D97706]',
      description: 'Below target (under 70 mg/dl)',
    };
  }

  if (val <= 140) {
    return {
      label: 'In Target',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      badgeColor: 'bg-[#EDFCF2] text-[#059669] border border-[#A7F3D0]/60',
      dotColor: 'bg-[#10B981]',
      chipBg: 'bg-[#EDFCF2]',
      textColor: 'text-[#059669]',
      description: 'Ideal range (70–140 mg/dl)',
    };
  }

  if (val <= 180) {
    return {
      label: 'Elevated',
      color: 'bg-orange-50 text-orange-700 border-orange-200',
      badgeColor: 'bg-[#FFF4ED] text-[#EA580C] border border-[#FDBA74]/60',
      dotColor: 'bg-[#F97316]',
      chipBg: 'bg-[#FFF4ED]',
      textColor: 'text-[#EA580C]',
      description: 'Slightly elevated (141–180 mg/dl)',
    };
  }

  return {
    label: 'High (Hyper)',
    color: 'bg-rose-50 text-rose-700 border-rose-200',
    badgeColor: 'bg-[#FFF1F2] text-[#E11D48] border border-[#FECDD3]/60',
    dotColor: 'bg-[#EF4444]',
    chipBg: 'bg-[#FFF1F2]',
    textColor: 'text-[#E11D48]',
    description: 'High blood glucose (>180 mg/dl)',
  };
}

export const SLOTS = [
  'Morning (fasting)',
  'After breakfast',
  'After lunch',
  'After dinner',
];

export function getTodayString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateDisplay(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  const date = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
