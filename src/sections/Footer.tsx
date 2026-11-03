import { Link } from "react-router-dom"
import { MailIcon, MessageCircleIcon } from "lucide-react"
import { contact, enquiryWhatsApp, footer, footerLinks, type FooterLink } from "@/content/site"
import { whatsappTextLink } from "@/lib/whatsapp"

const whatsappHref = whatsappTextLink(enquiryWhatsApp, "Hi Alta, ")

/** In-site links route without a reload; mail links stay plain anchors. */
const FooterAnchor = ({ link }: { link: FooterLink }) =>
  link.href.startsWith("/") ? (
    <Link to={link.href} className="text-sm hover:text-red-900 hover:underline">
      {link.label}
    </Link>
  ) : (
    <a href={link.href} className="text-sm hover:text-red-900 hover:underline">
      {link.label}
    </a>
  )

const FooterColumn = ({ title, links }: { title: string; links: FooterLink[] }) => (
  <div className="flex flex-col gap-2.5">
    <p className="mb-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.18em]">{title}</p>
    {links.map((link) => (
      <FooterAnchor key={link.label} link={link} />
    ))}
  </div>
)

const iconButton =
  "w-10 h-10 flex items-center justify-center border-2 border-black bg-white shadow-[3px_3px_0_#000] hover:bg-black hover:text-background transition-colors"

export const Footer = () => {
  return (
    <footer className="bg-background">
      <div
        className="h-14 border-b-2 border-black opacity-15 bg-repeat"
        style={{ backgroundImage: "url('/pattern.jpg')", backgroundSize: "220px 220px" }}
      />
      <div className="px-8 py-12 grid grid-cols-2 md:grid-cols-[1.4fr_1fr_1fr_1fr] gap-8">
        <div className="flex flex-col gap-3.5 col-span-2 md:col-span-1">
          <span className="alta-living-title text-6xl uppercase leading-none">Alta Living</span>
          <p className="font-mono text-[11px] leading-loose uppercase tracking-[0.18em] text-muted-foreground">
            {footer.tagline}
            <br />
            <a href={`mailto:${contact.email}`} className="normal-case hover:text-black hover:underline">
              {contact.email}
            </a>
            {" · "}
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="hover:text-black hover:underline">
              {contact.phone}
            </a>
          </p>
          <div className="flex gap-2.5 mt-1.5">
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp Alta Living" className={iconButton}>
              <MessageCircleIcon size={18} aria-hidden />
            </a>
            <a href={`mailto:${contact.email}`} aria-label="Email Alta Living" className={iconButton}>
              <MailIcon size={18} aria-hidden />
            </a>
          </div>
        </div>
        <FooterColumn title="Homes" links={footerLinks.homes} />
        <FooterColumn title="Company" links={footerLinks.company} />
        <FooterColumn title="Guests" links={footerLinks.guests} />
      </div>
      <div className="border-t-2 border-black px-8 py-4 flex justify-between gap-4 flex-wrap font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        <span>{footer.copyright}</span>
        <span>Privacy · Terms</span>
      </div>
    </footer>
  )
}
