interface ObjetosPersonalesProps {
  value: string;
  onChange: (value: string) => void;
}

const OPCIONES = [
  { value: 'BANDA_RELOJ', label: 'BANDA/RELOJ INTELIGENTE' },
  { value: 'CELULAR', label: 'CELULAR CORPORATIVO' },
  { value: 'PORTATIL', label: 'COMPUTADORA PORTÁTIL' },
  { value: 'NINGUNO', label: 'NO INGRESA NADA' },
] as const;

export function ObjetosPersonales({ value, onChange }: ObjetosPersonalesProps) {
  return (
    <div className="kiosk-panel">
      <div className="kiosk-panel-title">OBJETOS PERSONALES</div>
      <div className="space-y-2">
        {OPCIONES.map((op) => (
          <label key={op.value} className="kiosk-radio-row">
            <input
              type="radio"
              name="objetos_personales"
              value={op.value}
              checked={value === op.value}
              onChange={() => onChange(op.value)}
              className="kiosk-radio"
            />
            <span className="kiosk-radio-label">{op.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
