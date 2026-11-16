import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const navigationGroups = [
  {
    label: 'Workspace',
    items: [
      { id: 'overview', label: 'Overview', icon: 'overview', section: 'overview' },
      { id: 'assessment', label: 'New assessment', icon: 'assessment', section: 'new-assessment' },
      { id: 'resume', label: 'Resume studio', icon: 'resume', section: 'resume-studio' },
      { id: 'projects', label: 'Project analyzer', icon: 'projects', section: 'project-analyzer' },
    ],
  },
  {
    label: 'Library',
    items: [
      { id: 'reports', label: 'All reports', icon: 'reports', to: '/interviewAllreport' },
      { id: 'library', label: 'AI library', icon: 'library', to: '/ai-library' },
    ],
  },
]

function NavigationIcon({ name }) {
  const paths = {
    overview: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    assessment: <><path d="M12 5v14M5 12h14" /><circle cx="12" cy="12" r="9" /></>,
    resume: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M8 13h8m-8 4h6" /></>,
    projects: <><path d="M4 19V5m0 14h16" /><path d="m7 15 3-4 3 2 5-6" /></>,
    reports: <><path d="M7 3h10v4H7zM5 7H4v14h16V7h-1" /><path d="M8 12h8m-8 4h8" /></>,
    library: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 1 4 17.5z" /><path d="M4 17.5A2.5 2.5 0 0 1 6.5 15H20" /></>,
  }

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  )
}

export default function WorkspaceNavigation({ active = 'overview' }) {
  const { pathname, hash } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const activeSection = pathname === '/'
    ? navigationGroups
      .flatMap((group) => group.items)
      .find((item) => item.section && `#${item.section}` === hash)?.id || active
    : active

  return (
    <aside className={`workspace-sidebar${menuOpen ? ' is-menu-open' : ''}`} aria-label="Joblystics workspace navigation">
      <Link className="workspace-sidebar__brand" to="/" aria-label="Joblystics workspace">
        <span className="workspace-sidebar__mark" aria-hidden="true">J</span>
        <span>
          <strong>Joblystics</strong>
          <small>Career intelligence</small>
        </span>
      </Link>

      <div className="workspace-sidebar__controls">
        <button
          className="workspace-sidebar__menu-toggle"
          type="button"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-controls="workspace-primary-navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((isOpen) => !isOpen)}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            {menuOpen ? <path d="m6 6 12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      <nav
        className="workspace-sidebar__navigation"
        id="workspace-primary-navigation"
        aria-label="Main navigation"
      >
        {navigationGroups.map((group) => (
          <div className="workspace-sidebar__group" key={group.label}>
            <p>{group.label}</p>
            {group.items.map((item) => {
              const isActive = activeSection === item.id
              const to = item.to || (pathname === '/' ? `#${item.section}` : `/#${item.section}`)

              return (
                <Link
                  className={`workspace-sidebar__link${isActive ? ' is-active' : ''}`}
                  key={item.id}
                  to={to}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => setMenuOpen(false)}
                >
                  <NavigationIcon name={item.icon} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>
        ))}
      </nav>
    </aside>
  )
}
