import { ContactCard } from "@/components/ContactCard"

// The home page's contact band. All of the card's content now lives in
// ContactCard so the property page can render the same form with its own copy.
export const ContactSection = () => (
  <section id="contact" className="px-8 py-19 md:py-22 bg-background">
    <ContactCard />
  </section>
)
