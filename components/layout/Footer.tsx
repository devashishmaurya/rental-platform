import Link from 'next/link'

const footerLinks = {
  tenants: [
    { name: 'Search Properties', href: '/search' },
    { name: 'How It Works', href: '/about-tenants' },
    { name: 'Help Center', href: '/help-center' },
  ],
  landlords: [
    { name: 'List Your Property', href: '/landlords/add-listing' },
    { name: 'Pricing', href: '/pricing/property-advertising' },
    { name: 'Services', href: '/what-we-do' },
  ],
  company: [
    { name: 'About Us', href: '/what-we-are' },
    { name: 'Contact', href: '/contact' },
    { name: 'Blog', href: '/what-we-are' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy-policy' },
    { name: 'Terms & Conditions', href: '/terms' },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="text-2xl font-bold text-white mb-4 block">
              Rent Setu
            </Link>
            <p className="text-gray-400 mb-4">
              The destination for finding, advertising, and managing rental property.
            </p>
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} Rent Setu. All rights reserved.
            </p>
          </div>

          {/* Tenants */}
          <div>
            <h3 className="text-white font-semibold mb-4">For Tenants</h3>
            <ul className="space-y-2">
              {footerLinks.tenants.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Landlords */}
          <div>
            <h3 className="text-white font-semibold mb-4">For Landlords</h3>
            <ul className="space-y-2">
              {footerLinks.landlords.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company & Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2 mb-6">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}
