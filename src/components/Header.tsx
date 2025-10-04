import { Link } from 'react-router-dom'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/demo', label: 'Demo' },
]

function Header() {
  return (
    <header className="border-b p-4 shadow-sm">
      <nav className="flex justify-between items-center max-w-5xl mx-auto">
        <Link to="/" className="text-lg font-semibold">
          shadcn-starter
        </Link>
        <div className="flex gap-4">
          {navLinks.map(({ href, label }) => (
            <Link key={href} to={href} className="text-muted-foreground hover:underline">
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  )
}

export default Header
