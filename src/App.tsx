import { useEffect, useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Code2, Instagram, Linkedin, LogIn, Menu, Play, Rocket, UserCog, UserPlus, Users, X } from 'lucide-react';
import { Link, Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';

const queryClient = new QueryClient();
const remote = 'https://nmimsindore.acm.org';

export function getAssetUrl(path: string): string {
  const base = import.meta.env.BASE_URL || '/';
  const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
}

const logoPath = getAssetUrl('/assets/acm-chapter-logo.png');

type IconComponent = typeof Code2;

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/about/', label: 'About' },
  { href: '/events/', label: 'Events' },
  { href: '/team/', label: 'Team' },
  { href: '/gallery/', label: 'Gallery' },
];

function SiteNav() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (href: string) => (href === '/' ? location === '/' : location.startsWith(href));

  return (
    <nav className={`navbar${scrolled ? ' scrolled' : ''}`} id="mainNavbar">
      <div className="container">
        <Link className="navbar-brand" href="/" data-testid="link-brand" onClick={() => setOpen(false)}>
          <img className="brand-logo" src={logoPath} alt="ACM NMIMS Indore Student Chapter logo" />
          <span>ACM NMIMS Indore</span>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={open}
          data-testid="button-toggle-navigation"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={21} /> : <Menu size={21} />}
        </button>
        <div className={`navbar-collapse${open ? ' open' : ''}`} id="navbarNav">
          <ul className="navbar-nav">
            {navItems.map((item) => (
              <li className="nav-item" key={item.href}>
                <Link
                  className={`nav-link${isActive(item.href) ? ' active' : ''}`}
                  href={item.href}
                  data-testid={`link-nav-${item.label.toLowerCase()}`}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="nav-item nav-login">
              <a
                className="login-btn"
                href="https://nmimsindore.acm.org:2096/"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="link-login"
              >
                <LogIn size={15} />
                &nbsp;Login
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="content-section" id="contact">
      <div className="container">
        <div className="col-12 text-center">
          <div className="social-links">
            <a
              href="https://www.instagram.com/acm_nmimsindore/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              data-testid="link-instagram"
            >
              <Instagram size={18} />
            </a>
            <a
              href="https://www.linkedin.com/company/svkm-s-nmims-indore-acm-student-chapter"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              data-testid="link-linkedin"
            >
              <Linkedin size={18} />
            </a>
          </div>
          <ul className="navbar-nav flex-row justify-content-center mt-3">
            {navItems.map((item) => (
              <li className="nav-item" key={`footer-${item.href}`}>
                <Link className="nav-link" href={item.href} data-testid={`link-footer-${item.label.toLowerCase()}`}>
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="nav-item">
              <a className="nav-link" href={`${remote}/`} target="_blank" rel="noopener noreferrer" data-testid="link-official-website">
                Official website
              </a>
            </li>
          </ul>
          <p>© ACM NMIMS Indore. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

function Layout({ children }: { children: ReactNode }) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);
  return (
    <>
      <SiteNav />
      {children}
      <Footer />
    </>
  );
}

function Home() {
  const [joinOpen, setJoinOpen] = useState(false);

  useEffect(() => {
    document.title = 'ACM NMIMS Indore — Official Student Chapter';
  }, []);

  return (
    <Layout>
      <section className="hero" id="home">
        <div className="hero-media" aria-hidden="true">
          <img src={getAssetUrl('/assets/home-photo-2.jpg')} alt="ACM NMIMS Indore Chapter" loading="eager" />
        </div>
        <div className="container">
          <div className="hero-content">
            <div className="hero-kicker">Official student chapter / NMIMS Indore</div>
            <h1>
              ACM NMIMS <span className="hero-emphasis">Indore</span>
            </h1>
            <p>Advancing Computing as a Science &amp; Profession</p>
            <div className="d-flex flex-wrap justify-content-center align-items-center gap-3 mt-4">
              <div className={`dropdown${joinOpen ? ' open' : ''}`}>
                <button
                  className="cta-button dropdown-toggle"
                  type="button"
                  aria-expanded={joinOpen}
                  data-testid="button-join-us"
                  onClick={() => setJoinOpen((value) => !value)}
                >
                  <UserPlus size={16} />
                  &nbsp;Join Us
                </button>
                <ul className="custom-dropdown-menu" aria-label="Join ACM NMIMS Indore">
                  <li>
                    <a className="dropdown-item" href={`${remote}/join/`} data-testid="link-general-member">
                      <Users className="dropdown-item-icon" size={15} />
                      General Member
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item" href={`${remote}/oc/`} data-testid="link-operational-committee">
                      <UserCog className="dropdown-item-icon" size={15} />
                      Operational Committee
                    </a>
                  </li>
                </ul>
              </div>
              <Link href="/gallery/" className="cta-button" id="ctaButton" data-testid="link-explore-journey">
                <Rocket size={16} />
                &nbsp;Explore Our Journey
              </Link>
            </div>
            <div className="hero-caption">Community · Innovation · Learning</div>
          </div>
        </div>
        <div className="hero-credit" aria-hidden="true">
          ACM NMIMS Indore / Official chapter
        </div>
      </section>
    </Layout>
  );
}

function SectionIntro({ label, title, emphasis }: { label: string; title: string; emphasis: string }) {
  return (
    <>
      <div className="section-label">{label}</div>
      <h1 className="section-title">
        {title} <span className="title-emphasis">{emphasis}</span>
      </h1>
    </>
  );
}

function About() {
  useEffect(() => {
    document.title = 'About – ACM NMIMS Indore';
  }, []);

  const pillars: Array<{ icon: IconComponent; title: string; body: string }> = [
    {
      icon: Code2,
      title: 'Coding Culture',
      body: '24-hour hackathons, competitive programming sprints, and system design labs to sharpen practical engineering skills.',
    },
    {
      icon: Users,
      title: 'Community & Inclusion',
      body: 'An inclusive developer ecosystem bringing together builders across all engineering domains, skill levels, and years.',
    },
    {
      icon: Play,
      title: 'Global Research',
      body: "Direct access to ACM's international Digital Library, research journals, and global expert keynote speakers.",
    },
    {
      icon: UserCog,
      title: 'Career Launchpad',
      body: 'Mock technical interviews, alumni sessions, and direct referral opportunities for chapter members.',
    },
  ];

  const milestones = [
    ['Q3 2024 / Inception', 'Chapter Charter', 'Founded at NMIMS Indore with 50 student developers and 4 faculty mentors. Received official ACM charter recognition globally.'],
    ['Q4 2024 / HackACM 2.0', 'Smart Campus Hackathon', '120+ hackers, 26 teams, and live industry mentorship sessions over 24 hours. ₹50,000+ in prizes were distributed.'],
    ['Q1 2025 / Growth', '500 Members Milestone', 'Crossed 500 active members and launched 8 specialized technical domains with dedicated domain leads and mentorship.'],
    ['Q3 2025 / ACM-W Charter', 'Women in Computing', 'Official launch of the ACM-W sub-chapter with 40+ female student leaders. The first mentorship cohort of 80+ members completed.'],
    ['Q4 2025 / CodeSprint', 'National Level Contest', 'CodeSprint expanded nationally with 300+ participants from 15+ colleges. National coverage earned chapter recognition.'],
    ['2026 / Next chapter', 'AI Symposium & Grants', 'Expanding research, national hackathons, and competing for global ACM chapter excellence and international grants.'],
  ];

  return (
    <Layout>
      <section className="content-section" id="about" style={{ paddingTop: '8rem' }}>
        <div className="container">
          <SectionIntro label="01 / Chapter" title="About ACM" emphasis="NMIMS Indore" />
          <div className="row mt-5 align-items-center">
            <div className="col-lg-5 mb-4">
              <figure className="editorial-photo">
                <img src={getAssetUrl('/assets/about-event-photo.webp')} alt="Students attending an ACM event" loading="lazy" />
                <figcaption>Learning together, building what comes next.</figcaption>
              </figure>
            </div>
            <div className="col-lg-7">
              <div className="feature-card">
                <h3 className="text-center">The chapter at NMIMS Indore</h3>
                <p>
                  The official student chapter of the world's largest educational and scientific computing society — powering hackathons, AI research, cybersecurity, and open-source innovation at NMIMS Indore.
                </p>
              </div>
            </div>
          </div>
          <div className="section-label section-label--spaced">02 / Strategic pillars</div>
          <h2 className="section-title mt-5">
            How we build <span className="title-emphasis">tech leaders</span>
          </h2>
          <div className="row">
            {pillars.map(({ icon: Icon, title, body }) => (
              <div className="col-lg-3 mb-4" key={title}>
                <div className="feature-card h-100">
                  <div className="feature-icon">
                    <Icon size={36} />
                  </div>
                  <h4>{title}</h4>
                  <p>{body}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="section-label section-label--spaced">03 / Chapter journey</div>
          <h2 className="section-title mt-5">
            Milestones &amp; <span className="title-emphasis">roadmap</span>
          </h2>
          <div className="row mt-5">
            {milestones.map(([eyebrow, title, body]) => (
              <div className="col-lg-6 mb-4" key={title}>
                <div className="feature-card">
                  <div className="eyebrow">{eyebrow}</div>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}

function Events() {
  useEffect(() => {
    document.title = 'Events – ACM NMIMS Indore';
  }, []);

  const formats = [
    [Code2, 'Hackathons & Coding Sprints', '24-hour developer hackathons, team coding sprints, and algorithmic challenges designed to build real-world software solutions.', 'Hackathons · DSA · Projects'],
    [Play, 'Technical Bootcamps', 'Hands-on workshops spanning Web Development, AI/ML, Cybersecurity, App Development, and Data Science led by domain leads.', 'Workshops · Hands-on · Mentorship'],
    [Users, 'Keynotes & Tech Talks', 'Interactive sessions with faculty advisors, research scholars, and industry professionals sharing career and technical insights.', 'Keynotes · Industry · Career'],
  ] as const;

  const archive = [
    ['December 19–20, 2025 / Completed', 'ACM Summit 2025', 'Two-day flagship summit with keynote speakers from industry, an AI panel, a live hackathon, and student project showcases.', '200+ attendees · 8 speakers · 2 days'],
    ['September 22, 2025 / Completed', 'ACM-W Launch', 'Official inauguration of the ACM Women sub-chapter with the first cohort of 40+ student members, faculty mentors, and an inaugural networking session.', 'ACM Women sub-chapter'],
    ['July 2025 / Completed', 'CodeSprint 2025', 'Three-round competitive programming event with 80+ participants covering graphs, dynamic programming, and greedy algorithms. Three winners were felicitated by a faculty panel.', 'Graphs · DP · Greedy algorithms'],
    ['May 2025 / Completed', 'Intro to ML Workshop', 'Hands-on beginner workshop on Machine Learning basics using Python, covering scikit-learn, pandas, and model evaluation with live Jupyter demos.', 'Python · scikit-learn · pandas'],
    ['November 2024 / Completed', 'HackACM 2.0', 'Second edition of the inter-college hackathon with the theme “Smart Campus”. 120+ participants, 26 teams, and 3 finalists invited to present at an industry panel.', 'Smart Campus · 120+ participants · 26 teams'],
  ];

  return (
    <Layout>
      <section className="content-section" id="events" style={{ paddingTop: '8rem' }}>
        <div className="container">
          <SectionIntro label="01 / Calendar" title="Missions &" emphasis="milestones" />
          <div className="events-feature">
            <div className="events-feature-media">
              <img
                src={getAssetUrl('/assets/figma_images/event_detail_hero.webp')}
                alt="Hackathons and coding sprints at ACM NMIMS Indore"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src = `${remote}/assets/figma_images/event_detail_hero.webp`;
                }}
              />
            </div>
            <div className="events-feature-copy">
              <div className="eyebrow">Scheduled missions / 2026</div>
              <h2>No active events right now.</h2>
              <p>The official chapter calendar currently has no active events live. Check back for the next hackathon, bootcamp, or technical talk.</p>
            </div>
          </div>
          <div className="section-label">02 / What we run</div>
          <h2 className="section-title mt-5">
            Flagship <span className="title-emphasis">formats</span>
          </h2>
          <div className="row justify-content-center">
            {formats.map(([Icon, title, body, small]) => (
              <div className="col-lg-4 mb-4" key={title}>
                <div className="feature-card h-100">
                  <div className="feature-icon">
                    <Icon size={36} />
                  </div>
                  <h4>{title}</h4>
                  <p>{body}</p>
                  <small>{small}</small>
                </div>
              </div>
            ))}
          </div>
          <div className="section-label section-label--spaced">03 / Mission archive</div>
          <h2 className="section-title mt-5">
            Completed <span className="title-emphasis">events</span>
          </h2>
          <div className="row justify-content-center">
            {archive.map(([eyebrow, title, body, small]) => (
              <div className="col-lg-6 mb-4" key={title}>
                <div className="feature-card h-100">
                  <div className="feature-icon">
                    <Code2 size={36} />
                  </div>
                  <div className="eyebrow">{eyebrow}</div>
                  <h4>{title}</h4>
                  <p>{body}</p>
                  <small>{small}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}

const faculty = [
  ['Dr. Vikas Khare', 'Faculty Coordinator', 'Dr.%20Vikas%20Khare%20-%20Faculty%20Coordinator.webp'],
  ['Dr. Shruti Sharma', 'Faculty Coordinator', 'Dr.%20Shruti%20Sharma%20-%20Faculty%20Coordinator.webp'],
  ['Dr. Ankur Ratmele', 'Faculty Coordinator', 'Dr.%20Ankur%20Ratmele%20-%20Faculty%20Coordinator.webp'],
  ['Dr. Abhaydeep Deth', 'Faculty Coordinator', 'Dr.%20Abhaydeep%20Deth%20-%20Faculty%20Coordinator.webp'],
];

const leadership = [
  ['Heyramb Damle', 'Chairperson', 'Heyramb%20Damle%20-%20Chairperson.webp'],
  ['Anupam Kanoongo', 'Vice-Chairperson', 'Anupam%20Kanoongo%20-%20Vice%20Chairperson.webp'],
  ['Toshan Dubey', 'Treasurer', 'Toshan%20Dubey%20-%20Treasurer.webp'],
  ['Vanshika Jaiswal', 'Secretary', 'Vanshika%20Jaiswal%20-%20Secretary.webp'],
  ['Pari Batra', 'Web-Master', 'Pari%20Batra%20-%20Web%20Master.webp'],
  ['Maithli Singh Tomar', 'Membership Chair', 'Maithli%20Singh%20-%20Membership%20Chair.webp'],
  ['Nandini Namdeo', 'Membership Chair', 'Nandini%20Namdeo%20-%20Membership%20Chair.webp'],
];

const specialistLeads: Array<{
  name: string;
  role: string;
  detail: string;
  icon: IconComponent;
  portraitHook?: string;
}> = [
  { name: 'Priyansh Saxena', role: 'Technical Lead', detail: 'Engineering & Code', icon: Code2, portraitHook: '/assets/portraits/priyansh-saxena.jpg' },
  { name: 'Kashvi Sethi', role: 'Social Media Lead', detail: 'Branding & Outreach', icon: Users, portraitHook: '/assets/portraits/kashvi-sethi.jpg' },
  { name: 'Devan Modi', role: 'Social Media Lead', detail: 'Branding & Outreach', icon: Users, portraitHook: '/assets/portraits/devan-modi.jpg' },
  { name: 'Mahi Yadav', role: 'Media Production Lead', detail: 'Video & Creative', icon: Play, portraitHook: '/assets/portraits/mahi-yadav.jpg' },
];

function Team() {
  useEffect(() => {
    document.title = 'Team – ACM NMIMS Indore';
  }, []);

  return (
    <Layout>
      <section className="content-section" id="team-members" style={{ paddingTop: '8rem' }}>
        <div className="container">
          <div className="section-label">01 / People</div>
          <h2 className="team-subtitle">
            Faculty <span className="title-emphasis">Coordinators</span>
          </h2>
          <div className="row justify-content-center">
            {faculty.map(([name, role, image]) => (
              <div className="col-lg-4 mb-4" key={name}>
                <div className="feature-card text-center h-100">
                  <img
                    className="team-member-img"
                    src={getAssetUrl(`/assets/team/${image}`)}
                    alt={`${name}, ${role}`}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = `${remote}/assets/team/${image}`;
                    }}
                  />
                  <p className="eyebrow">{role}</p>
                  <h4>{name}</h4>
                </div>
              </div>
            ))}
          </div>

          <div className="section-label section-label--spaced">02 / Executive leadership</div>
          <h2 className="team-subtitle">
            The people behind <span className="title-emphasis">ACM</span>
          </h2>
          <div className="row justify-content-center">
            {leadership.map(([name, role, image]) => (
              <div className="col-lg-4 mb-4" key={name}>
                <div className="feature-card text-center h-100">
                  <img
                    className="team-member-img"
                    src={getAssetUrl(`/assets/team/${image}`)}
                    alt={`${name}, ${role}`}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = `${remote}/assets/team/${image}`;
                    }}
                  />
                  <h4>{name}</h4>
                  <p>{role}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="section-label section-label--spaced">03 / Domain specialists</div>
          <h2 className="team-subtitle">
            Specialist <span className="title-emphasis">leads</span>
          </h2>
          <div className="row justify-content-center">
            {specialistLeads.map(({ name, role, detail, icon: Icon, portraitHook }) => (
              <div className="col-lg-4 mb-4" key={name}>
                <div className="feature-card text-center h-100">
                  {portraitHook ? (
                    <img className="team-member-img" src={getAssetUrl(portraitHook)} alt={`${name}, ${role}`} />
                  ) : (
                    <div className="portrait-placeholder" data-testid={`portrait-hook-${name.toLowerCase().replaceAll(' ', '-')}`}>
                      Portrait pending
                    </div>
                  )}
                  <div className="feature-icon">
                    <Icon size={36} />
                  </div>
                  <h4>{name}</h4>
                  <p>
                    {role}
                    <br />
                    <small>{detail}</small>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}

const galleryEvents = [
  {
    date: 'December 19–20, 2025',
    title: 'ACM Summit 2025',
    description: 'Two-day flagship summit with keynote speakers from industry, an AI panel, a live hackathon, and student project showcases.',
    images: [
      ['Summit stage', 'gallery_photo_09.webp'],
      ['Keynote session', 'gallery_photo_23.webp'],
      ['Hackathon floor', 'event_detail_hero.webp'],
      ['Project demo', 'gallery_photo_26.webp'],
    ],
    stats: ['200+ Attendees', '8 Speakers', '2 Days'],
    four: true,
  },
  {
    date: 'September 22, 2025',
    title: 'ACM-W Sub-Chapter Launch',
    description: 'Official inauguration of the ACM Women sub-chapter with the first cohort of 40+ student members, faculty mentors, and an inaugural networking session.',
    images: [
      ['ACM-W launch', 'gallery_05.webp'],
      ['Women in tech circle', 'gallery_photo_27.webp'],
      ['Networking circle', 'gallery_photo_07.webp'],
      ['Chapter assembly', 'gallery_photo_05.webp'],
    ],
    stats: ['40+ Student Members', 'Faculty Mentors', 'Networking Session'],
    four: true,
  },
  {
    date: 'November 2024',
    title: 'HackACM 2.0',
    description: 'Second edition of the inter-college hackathon with the theme “Smart Campus”.',
    images: [
      ['Hackathon floor', 'event_detail_hero.webp'],
      ['HackACM winners', 'gallery_48.webp'],
    ],
    stats: ['120+ Participants', '26 Teams', '3 Finalists'],
  },
  {
    date: 'July 2025',
    title: 'CodeSprint 2025',
    description: 'Three-round competitive programming event covering graphs, dynamic programming, and greedy algorithms.',
    images: [
      ['CodeSprint contest', 'gallery_photo_21.webp'],
      ['Competitive programming sprint', 'gallery_photo_03.webp'],
    ],
    stats: ['80+ Participants', '3 Rounds', '3 Winners'],
  },
];

function Gallery() {
  const [modalImage, setModalImage] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Gallery – ACM NMIMS Indore';
  }, []);

  return (
    <Layout>
      <header className="gallery-header">
        <div className="section-label">Media / Chapter moments</div>
        <h1>
          Chapter <span className="title-emphasis">Moments</span>
        </h1>
        <p>High-resolution event media from the ACM NMIMS Indore community.</p>
      </header>
      <div className="timeline">
        {galleryEvents.map((event) => (
          <div className="timeline-item" key={event.title}>
            <div className="timeline-date">{event.date}</div>
            <div className="timeline-content">
              <h3 className="event-title">{event.title}</h3>
              <p className="event-description">{event.description}</p>
              <div className={`photo-grid ${event.four ? 'photo-grid--four' : 'photo-grid--two'}`}>
                {event.images.map(([caption, image], index) => {
                  const localUrl = getAssetUrl(`/assets/figma_images/${image}`);
                  return (
                    <button
                      className={`photo-item${index === 0 ? ' photo-item--feature' : ''}`}
                      type="button"
                      key={caption}
                      data-testid={`button-gallery-${event.title.toLowerCase().replaceAll(' ', '-')}-${index}`}
                      onClick={() => setModalImage(localUrl)}
                    >
                      <img
                        src={localUrl}
                        alt={caption}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src = `${remote}/assets/figma_images/${image}`;
                        }}
                      />
                    </button>
                  );
                })}
              </div>
              <div className="event-stats">
                {event.stats.map((stat) => (
                  <div className="stat-item" key={stat}>
                    {stat}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div
        className={`modal${modalImage ? ' open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Enlarged gallery image"
        onClick={() => setModalImage(null)}
      >
        <button className="close" type="button" aria-label="Close image" data-testid="button-close-gallery" onClick={() => setModalImage(null)}>
          ×
        </button>
        {modalImage && (
          <div className="modal-content" onClick={(event) => event.stopPropagation()}>
            <img src={modalImage} alt="Gallery image enlarged" />
          </div>
        )}
      </div>
    </Layout>
  );
}

function NotFoundPage() {
  useEffect(() => {
    document.title = '404 Not Found – ACM NMIMS Indore';
  }, []);

  return (
    <Layout>
      <main className="content-section" style={{ minHeight: '70vh', paddingTop: '10rem' }}>
        <div className="container text-center">
          <div className="section-label">404 / Page</div>
          <h1 className="section-title">Not found</h1>
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>
            The page you are looking for does not exist or has moved.
          </p>
          <div className="mt-4">
            <Link href="/" className="cta-button">
              Return Home
            </Link>
          </div>
        </div>
      </main>
    </Layout>
  );
}

function Router() {
  const [location] = useLocation();
  return (
    <ErrorBoundary resetKey={location}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/about/" component={About} />
        <Route path="/about" component={About} />
        <Route path="/events/" component={Events} />
        <Route path="/events" component={Events} />
        <Route path="/team/" component={Team} />
        <Route path="/team" component={Team} />
        <Route path="/gallery/" component={Gallery} />
        <Route path="/gallery" component={Gallery} />
        <Route path="/join/" component={NotFoundPage} />
        <Route path="/join" component={NotFoundPage} />
        <Route path="/oc/" component={NotFoundPage} />
        <Route path="/oc" component={NotFoundPage} />
        <Route component={NotFoundPage} />
      </Switch>
    </ErrorBoundary>
  );
}

function App() {
  const baseUrl = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={baseUrl}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
