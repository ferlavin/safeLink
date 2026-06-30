import Navbar from './Navbar'
import LandingHeader from './LandingHeader'

export default function AppShell({ children, guest = false }) {
  return (
    <div className="app-shell">
      <div className="app-shell-bg" aria-hidden="true" />
      {guest ? <LandingHeader showNav={false} /> : <Navbar />}
      <main className="app-main">{children}</main>
    </div>
  )
}
