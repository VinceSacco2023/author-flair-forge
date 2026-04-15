import { motion } from "framer-motion";

const AuthorSection = () => {
  return (
    <section id="author" className="py-24 md:py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          {/* Author visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex-shrink-0"
          >
            <div className="w-48 h-48 md:w-56 md:h-56 rounded-full bg-secondary flex items-center justify-center border-gradient-gold overflow-hidden">
              <span className="text-6xl font-display font-bold text-primary">VS</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-primary font-body uppercase tracking-[0.2em] text-xs mb-3">
              About the Author
            </p>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
              Vincenzo Sacco
            </h2>
            <div className="space-y-4 text-muted-foreground font-body leading-relaxed">
              <p>
                Vincenzo Sacco is an entrepreneur, Lean Six Sigma expert, and author who has lived the struggles 
                he writes about. After years of navigating the relentless cycle of overwork, stress, and financial 
                pressure, he discovered a better way — and now shares that blueprint with the world.
              </p>
              <p>
                His books combine real-world experience with proven methodologies, offering actionable strategies 
                for professionals and entrepreneurs who refuse to settle for the status quo. With a 5-star rating 
                on Amazon, his work has already begun transforming how people think about productivity, business, 
                and freedom.
              </p>
            </div>
            <a
              href="https://www.amazon.com/Vincenzo-Sacco/e/B0CPCB4JD5"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-6 text-primary font-body font-medium hover:text-gold-light transition-colors"
            >
              Follow on Amazon
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AuthorSection;
