import { BrandSection } from './BrandSection';
import { FooterGroup } from './FooterGroup';
import { SocialLinks } from './SocialLinks';
import { SupportSection } from './SupportSection';

export function Footer() {
  return (
    <footer className="mt-12 border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-7xl px-14 pt-10 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          <div className="border-b border-gray-200 pb-6 lg:col-span-3 lg:border-r lg:border-b-0 lg:pr-6 lg:pb-0">
            <BrandSection />
          </div>

          <FooterGroup />

          <div className="lg:col-span-2">
            <SupportSection />
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-gray-200 pt-6 text-sm text-gray-500 md:flex-row">
          <small>
            © {new Date().getFullYear()} PickMa. All rights reserved.
          </small>
          <SocialLinks />
        </div>
      </div>
    </footer>
  );
}
