import { Link } from 'react-router-dom'
import { SocialLinks } from '@/components/UI/SocialLinks'
import { usePortfolioContent } from '@/hooks/usePortfolioContent'

export function Footer() {
  const { navigation, profile, socialLinks, footer } = usePortfolioContent()

  return (
    <footer className="bg-pine text-mist">
      <div className="mx-auto w-full max-w-page px-5 pt-14 pb-8 sm:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <a href="#home" className="font-serif text-4xl text-ivory italic">
              {profile.preferredName}
            </a>
            <p className="mt-3 text-sm text-sage">{profile.title}</p>
            <p className="mt-1 text-sm text-sage/80">{footer.note}</p>
          </div>

          <nav aria-label="Footer">
            <ul className="grid grid-cols-2 gap-x-10 gap-y-1 xs:grid-cols-3 md:grid-cols-4">
              <li>
                <a href="#home" className="inline-flex min-h-10 items-center text-sm text-mist hover:text-ivory">
                  Home
                </a>
              </li>
              {navigation.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="inline-flex min-h-10 items-center text-sm text-mist hover:text-ivory"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <SocialLinks links={socialLinks} tone="dark" />
        </div>

        <div className="mt-12 border-t border-ivory/12 pt-6">
          <p className="text-center text-sm text-sage md:text-left">
            {footer.copyright}
            <span aria-hidden="true"> · </span>
            <Link
              to={footer.loginHref}
              className="text-sage underline-offset-4 hover:text-ivory hover:underline"
            >
              {footer.loginLabel}
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
