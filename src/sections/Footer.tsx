import { footerLinks, socials } from "@/content/site"

const FooterColumn = ({ title, links }: { title: string; links: string[] }) => (
  <div className="flex flex-col gap-2.5">
    <p className="mb-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.18em]">{title}</p>
    {links.map((label) => (
      <a key={label} href="#" className="text-sm hover:text-red-900 hover:underline">
        {label}
      </a>
    ))}
  </div>
)

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
            Serviced rentals · bangalore<br />hello@altaliving.in · +91 80 4000 1212
          </p>
          <div className="flex gap-2.5 mt-1.5">
            {socials.map((s) => (
              <a
                key={s}
                href="#"
                className="w-10 h-10 flex items-center justify-center border-2 border-black bg-white shadow-[3px_3px_0_#000] hover:bg-black hover:text-background transition-colors"
              >
                <span className="font-mono text-xs tracking-[0.08em]">{s}</span>
              </a>
            ))}
          </div>
        </div>
        <FooterColumn title="Stays" links={footerLinks.stays} />
        <FooterColumn title="Company" links={footerLinks.company} />
        <FooterColumn title="Guests" links={footerLinks.guests} />
      </div>
      <div className="border-t-2 border-black px-8 py-4 flex justify-between gap-4 flex-wrap font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        <span>© 2026 Alta Living · bangalore</span>
        <span>Privacy · Terms</span>
      </div>
    </footer>
  )
}
