# Landing assets

- src/assets/landing/hero.webp: locally generated office-meeting photograph, 2026-10-18, used as a decorative hero background.
- src/assets/landing/owner.webp: locally generated transparent portrait of a fictional shop owner, 2026-10-18. It does not depict a testimonial author.
- src/components/landing/Illustrations.tsx: project-native SVG payment/FAQ illustrations in the TindaPOS indigo/teal palette.
- public/logo.svg and generated PWA icons: local TindaPOS app mark.

The user's screenshots guide composition and section flow. Their navy/orange theme, stock assets, unsupported business statistics and real-customer claims are not copied. The final page uses TindaPOS branding and labels demo testimonials/billing/communication accurately. Images/fonts are served locally and cached with the production app.

Testimonial circles use locally stored 128 × 128 sample portraits from [Pravatar](https://pravatar.cc/) (CC0 Avatar Placeholder): image IDs 47 (Maria), 12 (Carlo), 44 (Ana), and 49 (Liza), downloaded 2026-10-19. These are decorative stand-ins for fictional demo personas, not photos of actual customers or endorsements. No third-party image request is made when visiting the landing page.

## POS product photos

The 25 demo product images in `src/assets/products/photo-*.webp` are real product/reference photographs downloaded on 2026-10-19. See [product-photo-sources.json](product-photo-sources.json) for each source page, image URL and photographed product. Sources include AAA Shopping Center, Rebisco, Asia Brewery, Pinoy Hyper, MX Wholesale, Entrelatas and Bangkok FreshLink. Photographs and trademarks remain their owners' property; no open-license claim is made. Some reference packaging differs in size/flavor from the seeded demo SKU. Catalog prices/units remain the demo values. Users' uploaded SKU photos take priority. The All category basket is a project-native SVG. All images are served locally and included in production offline caching.
