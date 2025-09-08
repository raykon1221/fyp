import Link from "next/link";
import Image from "next/image";

export function Footer() {
  const footerSections = [
    {
      title: "Product",
      links: [
        { name: "Use Cases", href: "#" },
        { name: "Developers", href: "#" },
        { name: "Roadmap", href: "#" },
        { name: "Ecosystem", href: "#" },
      ],
    },
    {
      title: "Resources",
      links: [
        { name: "Documentation", href: "#" },
        { name: "Blog", href: "#" },
        { name: "Community", href: "#" },
        { name: "Support", href: "#" },
      ],
    },
    {
      title: "Company",
      links: [
        { name: "About Us", href: "#" },
        { name: "Careers", href: "#" },
        { name: "Press", href: "#" },
        { name: "Contact", href: "#" },
      ],
    },
  ];

  return (
    <footer className="bg-purple-300 text-black py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="relative w-[120px] h-[48px] sm:w-[140px] sm:h-[56px] md:w-[160px] md:h-[60px]">
              <Image
                src="/blackop.png"
                alt="openscore logo"
                fill
                className="object-contain"
              />
            </div>
            <p className="text-black leading-relaxed">
              Building the future of decentralized applications with relational
              blockchain technology.
            </p>
          </div>

          {footerSections.map((section, index) => (
            <div key={index}>
              <h4 className="font-semibold mb-4">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      href={link.href}
                      className="text-black/70 hover:text-black transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-black pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-black/70 font-bold text-sm">
            © 2025 OpenScore. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link
              href="#"
              className="text-black/70 font-bold hover:text-white text-sm"
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              className="text-black/70 font-bold hover:text-white text-sm"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}