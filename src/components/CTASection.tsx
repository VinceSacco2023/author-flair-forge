import { motion } from "framer-motion";

const CTASection = () => {
  return (
    <section className="py-24 md:py-32 px-6 relative overflow-hidden">
      {/* Decorative */}
      <div className="absolute inset-0 bg-gradient-section" />
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gold to-transparent opacity-20" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative z-10 max-w-3xl mx-auto text-center"
      >
        <h2 className="text-3xl md:text-5xl font-display font-bold mb-6 leading-tight">
          Your Transformation{" "}
          <span className="text-gradient-gold">Starts Today</span>
        </h2>
        <p className="text-muted-foreground font-body text-lg mb-10 leading-relaxed">
          Don't wait for the "right time." Every day spent stuck in the productivity trap 
          is a day of freedom lost. Grab both books and start building the life you deserve.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="https://a.co/d/05pZYH9f"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-body font-semibold rounded-lg hover:bg-gold-light transition-colors duration-300 text-lg"
          >
            Get Escape Productivity Trap
          </a>
          <a
            href="https://a.co/d/04noNrFP"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-primary/30 text-foreground font-body font-medium rounded-lg hover:border-primary hover:bg-primary/5 transition-all duration-300 text-lg"
          >
            Get Entrepreneur's Blueprint
          </a>
        </div>
      </motion.div>
    </section>
  );
};

export default CTASection;
