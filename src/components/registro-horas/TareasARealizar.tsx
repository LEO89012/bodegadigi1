interface TareasARealizarProps {
  selected: string[];
  onToggle: (value: string) => void;
}
const TAREAS = [{
  value: 'TAREAS_DIARIAS',
  label: 'TAREAS DIARIAS DIGIT...'
}, {
  value: 'APOYO_TAREAS',
  label: 'APOYO TAREAS DIGI'
}, {
  value: 'INVENTARIO',
  label: 'INVENTARIO'
}, {
  value: 'INVENTARIO_SELECTIVO',
  label: 'INVENTARIO SELECTIVO'
}, {
  value: 'SISTEMAS',
  label: 'SISTEMAS'
}, {
  value: 'REVISION_PROCESOS',
  label: 'REVISIÓN DE PROCESOS'
}, {
  value: 'SUPERVISOR_ADMIN',
  label: 'SUPERVISOR / ADMIN'
}, {
  value: 'MANTENIMIENTO',
  label: 'MANTENIMIENTO'
}, {
  value: 'PERSONAL_EXTERNO',
  label: 'PERSONAL EXTERNO'
}, {
  value: 'COORDINADOR',
  label: 'COORDINADOR'
}, {
  value: 'JEFE_TIENDA',
  label: 'JEFE DE TIENDA'
}, {
  value: 'SST_PERSONAL',
  label: 'SST PERSONAL'
}, {
  value: 'SEGURIDAD',
  label: 'SEGURIDAD'
}, {
  value: 'CAJEROS',
  label: 'CAJEROS'
}] as const;
export function TareasARealizar({
  selected,
  onToggle
}: TareasARealizarProps) {
  return <div className="kiosk-panel">
      <div className="kiosk-panel-title">TAREAS A REALIZAR</div>
      <div className="kiosk-chip-grid rounded-lg shadow-2xl">
        {TAREAS.map(t => {
        const active = selected.includes(t.value);
        return <button key={t.value} type="button" onClick={() => onToggle(t.value)} className={active ? 'kiosk-chip kiosk-chip-active' : 'kiosk-chip kiosk-chip-inactive'} aria-pressed={active}>
              {t.label}
            </button>;
      })}
      </div>
    </div>;
}