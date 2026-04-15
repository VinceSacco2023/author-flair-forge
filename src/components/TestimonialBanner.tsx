import { motion } from "framer-motion";

const TestimonialBanner = () => {
  return (
    <section className="py-16 px-6 bg-secondary/50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-3xl mx-auto text-center"
      >
        <div className="flex justify-center gap-1 mb-6">
          {[...Array(5)].map((_, i) => (
            <svg key={i} className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
        <blockquote className="text-xl md:text-2xl font-display italic text-foreground/90 mb-4 leading-relaxed">
          "These books are a must-read for anyone serious about breaking free from the grind 
          and building something meaningful."
        </blockquote>
        <p className="text-muted-foreground font-body text-sm">— Amazon Verified Reviewer</p>
      </motion.div>
    </section>
  );
};

export default TestimonialBanner;
