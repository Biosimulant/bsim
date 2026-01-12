import React, { useEffect, useMemo, useState } from 'react'
import { useUi, useModuleNames, useVisualsByModule } from '../app/ui'
import ModuleVisuals from './ModuleVisuals'

function EmptyState({ message, description }: { message: string; description?: string }) {
  return (
    <div className="empty-state">
      <div className="empty-content">
        <h3>{message}</h3>
        {description && <p>{description}</p>}
      </div>
    </div>
  )
}

function Tabs({ modules, active, onChange }: { modules: string[]; active: number; onChange: (i: number) => void }) {
  if (modules.length === 0) return null
  return (
    <nav className="tab-navigation" role="tablist">
      <div className="tab-list">
        {modules.map((m, i) => (
          <button key={m} role="tab" aria-selected={active === i} className={`tab-button ${active === i ? 'active' : ''}`} onClick={() => onChange(i)}>
            {m}
          </button>
        ))}
      </div>
    </nav>
  )
}

export default function MainContent() {
  const { state } = useUi()
  const allModules = useModuleNames()
  const [active, setActive] = useState(0)
  const available = useMemo(() => state.visibleModules.size ? allModules.filter((m) => state.visibleModules.has(m)) : allModules, [allModules, state.visibleModules])
  const visualsByModule = useVisualsByModule()

  useEffect(() => { if (active >= available.length) setActive(0) }, [available, active])
  if (allModules.length === 0) return <div className="main-content"><EmptyState message="No modules found" description="The simulation doesn't have any modules to display yet." /></div>
  if (available.length === 0) return <div className="main-content"><EmptyState message="No modules selected" description="Select modules from the sidebar to view their visualizations." /></div>

  return (
    <div className="main-content">
      <div className="tabs-container">
        <Tabs modules={available} active={active} onChange={setActive} />
        <div className="tab-content">
          {available.map((m, i) => (
            <div key={m} className={`tab-panel ${i === active ? 'active' : ''}`} hidden={i !== active}>
              <ModuleVisuals moduleName={m} visuals={visualsByModule.get(m) || []} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

