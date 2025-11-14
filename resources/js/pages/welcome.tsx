import { Header } from '../components/welcome/Header';
import { WelcomeHero } from '../components/welcome/WelcomeHero';
import { FeaturesSection } from '../components/welcome/FeaturesSection';
import { AppShowcase } from '../components/welcome/AppShowcase';
import { BenefitsSection } from '../components/welcome/BenefitsSection';
import { HowItWorks } from '../components/welcome/HowItWorks';
import { TestimonialsSection } from '../components/welcome/TestimonialsSection';
import { PricingSection } from '../components/welcome/PricingSection';
import { CTASection } from '../components/welcome/CTASection';
import { Footer } from '../components/welcome/Footer';
import { Head } from '@inertiajs/react';

export default function Welcome() {
  return (
    <>
      <Head title="NutriCoach - Tu Coach de Transformación Corporal">
        <link rel="preconnect" href="https://fonts.bunny.net" />
        <link
          href="https://fonts.bunny.net/css?family=inter:400,500,600,700,800&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div data-page="nutricouch" className="min-h-screen bg-black">
        <Header />
        <WelcomeHero />
        <FeaturesSection />
        <AppShowcase />
        <BenefitsSection />
        <HowItWorks />
        <TestimonialsSection />
        <PricingSection />
        <CTASection />
        <Footer />
      </div>
    </>
  );
}
