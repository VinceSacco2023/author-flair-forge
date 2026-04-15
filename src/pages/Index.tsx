import HeroSection from "@/components/HeroSection";
import BookCard from "@/components/BookCard";
import TestimonialBanner from "@/components/TestimonialBanner";
import AuthorSection from "@/components/AuthorSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import bookProductivity from "@/assets/book-productivity-trap.png";
import bookEntrepreneur from "@/assets/book-entrepreneur-blueprint.png";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />

      {/* Books Section */}
      <section id="books" className="py-24 md:py-32 px-6">
        <div className="max-w-6xl mx-auto space-y-32">
          <BookCard
            title="Escape Productivity Trap"
            subtitle="A True Story — Reclaim Your Freedom"
            description="Do you feel stressed, overworked, or financially stuck? This practical book reveals how to quit sacrificing time for money and instead create a life of time, health, and financial independence."
            coverImage={bookProductivity}
            price="$9.99 Kindle / $27.99 Paperback"
            format="133 Pages"
            amazonUrl="https://a.co/d/05pZYH9f"
            benefits={[
              "Eliminate burnout and stress — gain control over your time, energy, and peace of mind",
              "Transform your productivity from busy to strategic with effective time management",
              "Create multiple income sources and shift from active income to passive wealth",
              "Automate and delegate using AI and smart systems to minimize workload",
              "Implement morning and nightly rituals, strong routines, and boundary-setting techniques",
              "Follow a step-by-step plan from overwork to complete freedom",
            ]}
          />

          <div className="h-[1px] bg-gradient-to-r from-transparent via-border to-transparent" />

          <BookCard
            title="Entrepreneur's Blueprint to Success"
            subtitle="Lean Six Sigma — For Optimal Growth & Profitability"
            description="A comprehensive guide to revolutionize your startup using Lean Six Sigma. Navigate the stormy sea of entrepreneurship with powerful strategies, real-world challenges, and proven methodologies."
            coverImage={bookEntrepreneur}
            price="$24.75 Hardcover"
            format="162 Pages"
            amazonUrl="https://a.co/d/04noNrFP"
            reversed
            benefits={[
              "Conquer inefficiencies and fears with battle-tested frameworks",
              "Customize Lean Six Sigma principles as the bedrock for your startup",
              "Enhance product development from ideation to market release",
              "Refine sales & marketing with streamlined pipelines and efficiency",
              "Optimize operations and supply chain for seamless value flow",
              "Fuel continuous improvement momentum across your entire organization",
            ]}
          />
        </div>
      </section>

      <TestimonialBanner />
      <AuthorSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
