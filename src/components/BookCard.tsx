import { motion } from "framer-motion";

interface BookCardProps {
  title: string;
  subtitle: string;
  description: string;
  coverImage: string;
  price: string;
  format: string;
  amazonUrl: string;
  benefits: string[];
  reversed?: boolean;
}

const BookCard = ({
  title,
  subtitle,
  description,
  coverImage,
  price,
  format,
  amazonUrl,
  benefits,
  reversed = false,
}: BookCardProps) => {
  return (
    <div className={`flex flex-col ${reversed ? "lg:flex-row-reverse" : "lg:flex-row"} gap-12 lg:gap-20 items-center`}>
      {/* Book Cover */}
      <motion.div
        initial={{ opacity: 0, x: reversed ? 40 : -40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="flex-shrink-0"
      >
        <div className="relative group">
          <div className="absolute -inset-4 bg-primary/10 rounded-2xl blur-2xl group-hover:bg-primary/20 transition-all duration-500" />
          <img
            src={coverImage}
            alt={title}
            className="relative w-64 md:w-72 rounded-lg shadow-2xl animate-float"
          />
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, x: reversed ? -40 : 40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="flex-1"
      >
        <p className="text-primary font-body uppercase tracking-[0.2em] text-xs mb-3">
          {subtitle}
        </p>
        <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 leading-tight">
          {title}
        </h2>
        <p className="text-muted-foreground font-body leading-relaxed mb-6">
          {description}
        </p>

        <div className="space-y-3 mb-8">
          {benefits.map((benefit, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="flex items-start gap-3"
            >
              <span className="text-primary mt-0.5 text-lg">✦</span>
              <span className="text-foreground/80 font-body text-sm leading-relaxed">{benefit}</span>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <a
            href={amazonUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-body font-semibold rounded-lg hover:bg-gold-light transition-colors duration-300"
          >
            Get It on Amazon
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
          <span className="text-muted-foreground font-body text-sm">
            {format} — <span className="text-primary font-semibold">{price}</span>
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export default BookCard;
