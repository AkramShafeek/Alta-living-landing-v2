import { ContactCard } from "@/components/ContactCard"

// The home page's contact band. All of the card's content now lives in
// ContactCard so the property page can render the same form with its own copy.
export const ContactSection = () => (
  <section id="contact" className="px-8 py-19 md:py-22 bg-background">
    <div className="text-center mb-12 flex flex-col items-center">
      <p className="cedarville-cursive-regular text-2xl text-black/65 mb-1">talk to a human</p>
      <h2 className="font-semibold text-4xl md:text-6xl leading-none tracking-tight">
        Contact Us
      </h2>
    </div>
    <ContactCard />
  </section>
)
