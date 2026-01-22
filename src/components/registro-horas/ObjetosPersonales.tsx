interface ObjetosPersonalesProps {
  value: string[];
  onChange: (value: string[]) => void;
}

const OPCIONES = [
  { value: 'BANDA/RELOJ INTELIGENTE', label: 'BANDA/RELOJ INTELIGENTE' },
  { value: 'CELULAR CORPORATIVO', label: 'CELULAR CORPORATIVO' },
  { value: 'CELULAR PERSONAL', label: 'CELULAR PERSONAL' },
  { value: 'COMPUTADORA PORTÁTIL', label: 'COMPUTADORA PORTÁTIL' },
  { value: 'NO INGRESA NADA', label: 'NO INGRESA NADA' },
] as const;

const OPCION_NINGUNO = 'NO INGRESA NADA';

export function ObjetosPersonales({ value, onChange }: ObjetosPersonalesProps) {
  const toggle = (opcion: string) => {
    const isActive = value.includes(opcion);

    // “NO INGRESA NADA” es excluyente
    if (opcion === OPCION_NINGUNO) {
      onChange(isActive ? [] : [OPCION_NINGUNO]);
      return;
    }

    const next = isActive ? value.filter((v) => v !== opcion) : [...value.filter((v) => v !== OPCION_NINGUNO), opcion];
    onChange(next);
  };

  return (
    <div className="kiosk-panel">
      <div className="kiosk-panel-title">OBJETOS PERSONALES</div>
      <div className="space-y-2">
        {OPCIONES.map((op) => (
          <label key={op.value} className="kiosk-radio-row">
            <input
              type="checkbox"
              name="objetos_personales"
              value={op.value}
              checked={value.includes(op.value)}
              onChange={() => toggle(op.value)}
              className="kiosk-radio"
            />
            <span className="kiosk-radio-label">{op.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
