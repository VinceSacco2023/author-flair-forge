import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Clock, Lock } from "lucide-react";

/**
 * The invitation to answer the survey for the next book. Placed high on the
 * landing page — it is the one thing a visiting reader can do to help.
 */
const SurveyInvite = () => (
  <section id="survey" className="py-20 md:py-28 px-6 relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-section" />
    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gold to-transparent opacity-20" />

    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
      className="relative z-10 max-w-3xl mx-auto text-center"
    >
      <p className="text-xs uppercase tracking-[0.25em] text-primary font-body font-medium mb-4">
        Help with the next book
      </p>
      <h2 className="text-3xl md:text-5xl font-display font-bold mb-6 leading-tight">
        What Will I Do <span className="text-gradient-gold">All Day?</span>
      </h2>
      <p className="text-muted-foreground font-body text-lg mb-8 leading-relaxed">
        Retirement advice is all about money. This book is about the other half —
        the hours. Fifteen questions, four minutes, and no right answers. Your
        answers may be quoted anonymously in the book.
      </p>

      <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground font-body mb-8">
        <span className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" aria-hidden="true" />
          About four minutes
        </span>
        <span className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-primary" aria-hidden="true" />
          Anonymous unless you say otherwise
        </span>
      </div>

      <Link
        to="/survey"
        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-body font-semibold rounded-lg hover:bg-gold-light transition-colors duration-300 text-lg"
      >
        Take the survey
        <ArrowRight className="h-5 w-5" aria-hidden="true" />
      </Link>
    </motion.div>
  </section>
);

export default SurveyInvite;
