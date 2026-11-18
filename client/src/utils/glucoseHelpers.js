/**
 * Clinical glucose classification utility
 */
export function getGlucoseCategory(value) {
  const val = Number(value);
  if (isNaN(val)) return { label: 'Unknown', color: 'bg-gray-100 text-gray-700 border-gray-300' };

  if (val < 70) {
    return {
      label: 'Low (Hypo)',
      color: 'bg-amber-50 text-amber-800 border-amber-300',
      badgeColor: 'bg-amber-100 text-amber-800',
      dotColor: 'bg-amber-500',
      description: 'Below normal target (under 70 mg/dl)',
    };
  }

  if (val <= 140) {
    return {
      label: 'Normal',
      color: 'bg-emerald-50 text-emerald-800 border-emerald-300',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      dotColor: 'bg-emerald-500',
      description: 'Ideal target range (70–140 mg/dl)',
    };
  }

  if (val <= 180) {
    return {
      label: 'Elevated',
      color: 'bg-orange-50 text-orange-800 border-orange-300',
      badgeColor: 'bg-orange-100 text-orange-800',
      dotColor: 'bg-orange-500',
      description: 'Slightly elevated (141–180 mg/dl)',
    };
  }

  return {
    label: 'High (Hyper)',
    color: 'bg-rose-50 text-rose-800 border-rose-300',
    badgeColor: 'bg-rose-100 text-rose-800',
    dotColor: 'bg-rose-500',
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
