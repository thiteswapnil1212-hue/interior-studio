import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const TESTIMONIALS = [
  {
    quote:
      "Interior Studio Pune transformed our home into a modern masterpiece.",
    author: "Rajesh Sharma",
    location: "Bhosari, Pune",
  },
  {
    quote:
      "Exceptional modular kitchen design with quality materials and sharp execution.",
    author: "Priya Patel",
    location: "Pimple Saudagar, Pune",
  },
  {
    quote:
      "From concept to completion, the experience felt clear, reliable, and premium.",
    author: "Amit Kumar",
    location: "Wakad, Pune",
  },
];

export default function HomePage() {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  console.log("HomePage rendering...");

  useEffect(() => {
    document.title = "Interior Studio Pune - Modern Home Interior Solutions";
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    // This replaces the vanilla JS testimonial timer.
    const timerId = window.setInterval(() => {
      setActiveTestimonial((current) => (current + 1) % TESTIMONIALS.length);
    }, 5000);

    return () => {
      window.clearInterval(timerId);
    };
  }, []);

  function handleEnquirySubmit(event) {
    event.preventDefault();

    if (!event.currentTarget.checkValidity()) {
      event.currentTarget.reportValidity();
      return;
    }

    event.currentTarget.reset();
    setShowSuccess(true);
    window.setTimeout(() => setShowSuccess(false), 5000);
  }

  return (
    <>
      <div style={{ color: 'white', fontSize: '24px', padding: '20px' }}>
        Interior Studio Pune - App is loading!
      </div>

      <a
        href="https://wa.me/919921260926"
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-float"
      >
        <img
          src="https://img.icons8.com/color/48/000000/whatsapp.png"
          alt="WhatsApp"
        />
      </a>

      <header>
        <nav className={`navbar${isScrolled ? " scrolled" : ""}`}>
          <div className="container">
            <div className="logo">
              <a className="brand" href="#home">
                Interior Studio Pune
              </a>
            </div>

            <ul className={`nav-links${menuOpen ? " active" : ""}`}>
              <li>
                <a href="#home" onClick={() => setMenuOpen(false)}>
                  Home
                </a>
              </li>
              <li>
                <a href="#services" onClick={() => setMenuOpen(false)}>
                  Our Services
                </a>
              </li>
              <li>
                <a href="#products" onClick={() => setMenuOpen(false)}>
                  Our Products
                </a>
              </li>
              <li>
                <a href="#contact" onClick={() => setMenuOpen(false)}>
                  Contact
                </a>
              </li>
              <li>
                <Link className="auth-link" to={user ? "/dashboard" : "/login"}>
                  {user ? "Dashboard" : "Login"}
                </Link>
              </li>
              <li>
                <Link className="auth-link" to="/signup">
                  Sign Up
                </Link>
              </li>
            </ul>

            <button
              type="button"
              className={`hamburger${menuOpen ? " active" : ""}`}
              aria-label="Toggle navigation"
              onClick={() => setMenuOpen((current) => !current)}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </nav>
      </header>

      <main>
        <section id="home" className="hero">
          <div className="hero-overlay"></div>
          <div className="container">
            <div className="hero-content fade-in-up">
              <div className="hero-badge">Interior Studio Pune</div>
              <h1>Design Your Dream Interior in Pune</h1>
              <p className="hero-subtitle">
                Modern, Affordable &amp; Custom Interior Solutions
              </p>
              <div className="hero-buttons">
                <a href="#gallery" className="btn primary-btn">
                  Explore Designs
                </a>
                <a href="#contact" className="btn secondary-btn">
                  Get Free Quote
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id="services" className="services">
          <div className="container">
            <div className="section-header">
              <h2>Services</h2>
              <p>
                End-to-end interior design for Pune homes, planned and executed by
                experts.
              </p>
            </div>
            <div className="services-grid">
              <article className="service-card">
                <div className="service-content">
                  <h3>Modular Kitchen Design</h3>
                  <p>
                    Premium modular kitchens with clean layouts and smart storage.
                  </p>
                </div>
              </article>
              <article className="service-card">
                <div className="service-content">
                  <h3>Living Room Interior Setup</h3>
                  <p>
                    Comfortable, high-impact living spaces that feel modern and warm.
                  </p>
                </div>
              </article>
              <article className="service-card">
                <div className="service-content">
                  <h3>Bedroom Design Solutions</h3>
                  <p>
                    Restful bedroom concepts with custom wardrobes and premium detail.
                  </p>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section id="products" className="products">
          <div className="container">
            <div className="section-header">
              <h2>Our Premium Products</h2>
              <p>Discover curated furniture and decor for modern homes.</p>
            </div>
            <div className="products-grid">
              {[
                "Modern L-Shaped Sofa",
                "Premium Wooden Dining Table",
                "Space-Saving Sliding Wardrobe",
              ].map((title) => (
                <article className="product-card" key={title}>
                  <div className="product-image">
                    <div className="product-overlay">
                      <div className="product-info">
                        <h3>{title}</h3>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="gallery" className="gallery">
          <div className="container">
            <div className="section-header">
              <h2>Our Interior Designs</h2>
              <p>Inspiring spaces crafted with sharp planning and premium finishes.</p>
            </div>
          </div>
        </section>

        <section id="testimonials" className="testimonials">
          <div className="container">
            <div className="section-header">
              <h2>Client Testimonials</h2>
              <p>What our customers say about the experience.</p>
            </div>

            <div className="testimonials-slider">
              {TESTIMONIALS.map((testimonial, index) => (
                <article
                  key={testimonial.author}
                  className={`testimonial-card${
                    index === activeTestimonial ? " active" : ""
                  }`}
                >
                  <div className="testimonial-content">
                    <p>{testimonial.quote}</p>
                    <div className="testimonial-author">
                      <h4>{testimonial.author}</h4>
                      <span>{testimonial.location}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="testimonial-dots">
              {TESTIMONIALS.map((testimonial, index) => (
                <button
                  key={testimonial.author}
                  type="button"
                  className={`dot${index === activeTestimonial ? " active" : ""}`}
                  aria-label={`Show testimonial ${index + 1}`}
                  onClick={() => setActiveTestimonial(index)}
                ></button>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="contact">
          <div className="container">
            <div className="contact-content">
              <div className="contact-info">
                <h2>Get In Touch</h2>
                <p>Ready to transform your space? Contact us today.</p>
                <div className="contact-details">
                  <div className="contact-item">
                    <h4>Address</h4>
                    <p>Godawn Chowk, Bhosari, Pune, Maharashtra, India</p>
                  </div>
                  <div className="contact-item">
                    <h4>Phone</h4>
                    <p>
                      <a href="tel:9921260926">9921260926</a>
                    </p>
                  </div>
                  <div className="contact-item">
                    <h4>Email</h4>
                    <p>
                      <a href="mailto:thiteswapnil1212@gmail.com">
                        thiteswapnil1212@gmail.com
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              <div className="contact-form">
                <h2>Send Enquiry</h2>
                <form onSubmit={handleEnquirySubmit}>
                  <div className="form-group">
                    <label htmlFor="name">Name *</label>
                    <input id="name" type="text" name="name" required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email *</label>
                    <input id="email" type="email" name="email" required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="message">Message *</label>
                    <textarea
                      id="message"
                      name="message"
                      rows="5"
                      placeholder="Tell us about your space, timeline, and budget..."
                      required
                    ></textarea>
                  </div>
                  <div className="form-success" hidden={!showSuccess}>
                    Thanks! Your enquiry has been received. We&apos;ll get back to you shortly.
                  </div>
                  <button type="submit" className="btn primary-btn">
                    Send Enquiry
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>Interior Studio Pune</h3>
              <p>Your trusted partner for modern home interior solutions in Pune.</p>
            </div>
            <div className="footer-section">
              <h3>Links</h3>
              <ul className="footer-links">
                <li>
                  <a href="#home">Home</a>
                </li>
                <li>
                  <a href="#services">Services</a>
                </li>
                <li>
                  <a href="#contact">Contact</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
