const Footer = () => {
  return (
    <footer className="py-12 px-6 border-t border-border/50">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="font-display text-lg font-semibold text-foreground">
          Vincenzo Sacco
        </p>
        <p className="text-muted-foreground font-body text-sm">
          © {new Date().getFullYear()} All rights reserved.
        </p>
        <a
          href="https://www.amazon.com/Vincenzo-Sacco/e/B0CPCB4JD5"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary font-body text-sm hover:text-gold-light transition-colors"
        >
          Amazon Author Page →
        </a>
      </div>
    </footer>
  );
};

export default Footer;
