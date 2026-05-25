import type { FieldZone } from '../types';

const ZONES: { id: FieldZone; label: string; short: string }[] = [
  { id: 'full',      label: 'Full Field',  short: 'Full'   },
  { id: 'opp_22',   label: 'Opp 22',      short: 'O22'    },
  { id: 'opp_half', label: 'Opp Half',    short: 'OHalf'  },
  { id: 'own_half', label: 'Own Half',    short: 'HHalf'  },
  { id: 'own_22',   label: 'Own 22',      short: 'H22'    },
  { id: 'lineout_l',label: 'Lineout L',   short: 'LO-L'   },
  { id: 'lineout_r',label: 'Lineout R',   short: 'LO-R'   },
];

interface ZoneSelectorProps {
  active: FieldZone;
  onChange: (z: FieldZone) => void;
}

export function ZoneSelector({ active, onChange }: ZoneSelectorProps) {
  return (
    <div className="flex gap-1 flex-wrap">
      {ZONES.map(z => (
        <button
          key={z.id}
          onClick={() => onChange(z.id)}
          title={z.label}
          className={`px-2.5 py-1 rounded text-xs font-medium border transition-all min-h-9 ${
            active === z.id
              ? 'bg-white text-[#0a0f1a] border-white'
              : 'border-white/20 text-white/50 hover:text-white hover:border-white/40'
          }`}
        >
          {z.short}
        </button>
      ))}
    </div>
  );
}
