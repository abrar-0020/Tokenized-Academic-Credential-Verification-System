import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface NavLink {
  label: string;
  href: string;
}

interface Project {
  title: string;
  description: string;
  tags: string[];
  imageContent?: React.ReactNode;
}

interface Stat {
  value: string;
  label: string;
}

export interface PortfolioPageProps {
  logo?: { initials: React.ReactNode; name: React.ReactNode };
  navLinks?: NavLink[];
  resume?: { label: string; onClick?: () => void };
  hero?: { titleLine1: React.ReactNode; titleLine2Gradient: React.ReactNode; subtitle: React.ReactNode };
  ctaButtons?: {
    primary: { label: string; onClick?: () => void };
    secondary: { label: string; onClick?: () => void };
  };
  projects?: Project[];
  stats?: Stat[];
  showAnimatedBackground?: boolean;
  hideInternalNav?: boolean;
}

const AuroraBackground: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const currentMount = mountRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({ alpha: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.position = 'fixed';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.zIndex = '0';
    renderer.domElement.style.display = 'block';
    currentMount.appendChild(renderer.domElement);

    const material = new THREE.ShaderMaterial({
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      },
      vertexShader: 'void main() { gl_Position = vec4(position, 1.0); }',
      fragmentShader: `
        uniform float iTime; uniform vec2 iResolution;
        #define NUM_OCTAVES 3
        float rand(vec2 n) { return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453); }
        float noise(vec2 p){ vec2 ip=floor(p);vec2 u=fract(p);u=u*u*(3.0-2.0*u);float res=mix(mix(rand(ip),rand(ip+vec2(1.0,0.0)),u.x),mix(rand(ip+vec2(0.0,1.0)),rand(ip+vec2(1.0,1.0)),u.x),u.y);return res*res; }
        float fbm(vec2 x) { float v=0.0;float a=0.3;vec2 shift=vec2(100);mat2 rot=mat2(cos(0.5),sin(0.5),-sin(0.5),cos(0.50));for(int i=0;i<NUM_OCTAVES;++i){v+=a*noise(x);x=rot*x*2.0+shift;a*=0.4;}return v;}
        void main() {
          vec2 p=((gl_FragCoord.xy)-iResolution.xy*0.5)/iResolution.y*mat2(6.,-4.,4.,6.);vec4 o=vec4(0.);float f=2.+fbm(p+vec2(iTime*5.,0.))*.5;
          for(float i=0.;i++<35.;){vec2 v=p+cos(i*i+(iTime+p.x*.08)*.025+i*vec2(13.,11.))*3.5;float tailNoise=fbm(v+vec2(iTime*.5,i))*.3*(1.-(i/35.));vec4 auroraColors=vec4(.1+.3*sin(i*.2+iTime*.4),.3+.5*cos(i*.3+iTime*.5),.7+.3*sin(i*.4+iTime*.3),1.);vec4 currentContribution=auroraColors*exp(sin(i*i+iTime*.8))/length(max(v,vec2(v.x*f*.015,v.y*1.5)));float thinnessFactor=smoothstep(0.,1.,i/35.)*.6;o+=currentContribution*(1.+tailNoise*.8)*thinnessFactor;}
          o=tanh(pow(o/100.,vec4(1.6)));gl_FragColor=o*1.25;
        }
      `,
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      material.uniforms.iTime.value += 0.016;
      renderer.render(scene, camera);
    };

    const handleResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      material.uniforms.iResolution.value.set(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (currentMount.contains(renderer.domElement)) currentMount.removeChild(renderer.domElement);
      renderer.dispose();
      material.dispose();
      geometry.dispose();
    };
  }, []);

  return <div ref={mountRef} aria-hidden="true" />;
};

const defaultData = {
  logo: { initials: 'SL', name: 'Scholar Ledger' },
  navLinks: [
    { label: 'About', href: '#about' },
    { label: 'Credentials', href: '#projects' },
    { label: 'Impact', href: '#skills' },
  ],
  resume: { label: 'Connect Wallet', onClick: undefined },
  hero: {
    titleLine1: 'Tokenized Academic',
    titleLine2Gradient: 'Credential Verification',
    subtitle:
      'Issue, verify, and validate educational achievements on-chain with tamper-proof trust and instant public verification.',
  },
  ctaButtons: {
    primary: { label: 'Verify Credentials', onClick: undefined },
    secondary: { label: 'Issue Credential', onClick: undefined },
  },
  projects: [
    {
      title: 'Institution Issues',
      description: 'Authorized institutions issue non-transferable digital credentials as Soulbound NFTs to students.',
      tags: ['✓'],
      imageContent: (
        <img
          src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80"
          alt="Academic credentials"
          className="w-full h-full object-cover rounded-xl"
          loading="lazy"
        />
      ),
    },
    {
      title: 'Student Owns',
      description: 'Students permanently own their credentials. Credentials cannot be transferred, ensuring authenticity.',
      tags: ['✓'],
      imageContent: (
        <img
          src="https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=800&q=80"
          alt="Verification flow"
          className="w-full h-full object-cover rounded-xl"
          loading="lazy"
        />
      ),
    },
    {
      title: 'Anyone Verifies',
      description: 'Employers and third parties can instantly verify credentials on-chain without intermediaries.',
      tags: ['✓'],
      imageContent: (
        <img
          src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80"
          alt="Dashboard analytics"
          className="w-full h-full object-cover rounded-xl"
          loading="lazy"
        />
      ),
    },
  ],
  stats: [
    { value: '100%', label: 'Integrity by Design' },
    { value: '24/7', label: 'Public Access' },
    { value: 'On-Chain', label: 'Proof & Traceability' },
  ],
};

const PortfolioPage: React.FC<PortfolioPageProps> = ({
  logo = defaultData.logo,
  navLinks = defaultData.navLinks,
  resume = defaultData.resume,
  hero = defaultData.hero,
  ctaButtons = defaultData.ctaButtons,
  projects = defaultData.projects,
  stats = defaultData.stats,
  showAnimatedBackground = true,
  hideInternalNav = false,
}) => {
  return (
    <div className="starfall-surface text-[#e7e5e4] font-body relative overflow-hidden rounded-2xl border border-[#484848]/20">
      {showAnimatedBackground && <AuroraBackground />}
      <div className="relative z-10">
        {!hideInternalNav && (
          <nav className="w-full px-6 py-4">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-[#252626] border border-[#484848]/30 flex items-center justify-center">
                  <span className="geist-font text-sm font-bold text-[#e7e5e4]">{logo.initials}</span>
                </div>
                <span className="geist-font text-lg font-medium text-[#e7e5e4]">{logo.name}</span>
              </div>
              <div className="hidden md:flex items-center space-x-8">
                {navLinks.map((link) => (
                  <a key={link.label} href={link.href} className="text-[#acabaa] hover:text-[#e7e5e4] transition-colors inter-font text-sm">
                    {link.label}
                  </a>
                ))}
              </div>
              <button onClick={resume.onClick} className="glass-button px-4 py-2 rounded-lg text-[#e7e5e4] text-sm font-medium inter-font">
                {resume.label}
              </button>
            </div>
          </nav>
        )}

        <div className="divider" />

        <main id="about" className="w-full min-h-[80vh] flex flex-col items-center justify-center px-6 py-20">
          <div className="max-w-6xl mx-auto text-center">
            <div className="mb-8 float-animation">
              <h1 className="md:text-6xl lg:text-7xl leading-[1.1] geist-font text-5xl font-light text-[#e7e5e4] tracking-tight mb-4">
                {hero.titleLine1}
                <span className="gradient-text block tracking-tight">{hero.titleLine2Gradient}</span>
              </h1>
              <p className="md:text-xl max-w-3xl leading-relaxed inter-font text-lg font-light text-[#acabaa] mx-auto">{hero.subtitle}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <button onClick={ctaButtons.primary.onClick} className="primary-button px-6 py-3 text-[#001661] rounded-lg font-medium text-sm min-w-[160px]">
                {ctaButtons.primary.label}
              </button>
              <button onClick={ctaButtons.secondary.onClick} className="glass-button min-w-[160px] inter-font text-sm font-medium text-[#e7e5e4] rounded-lg px-6 py-3">
                {ctaButtons.secondary.label}
              </button>
            </div>
            <div className="divider mb-16" />
            <h2 className="text-2xl md:text-3xl font-semibold geist-font text-[#e7e5e4] text-center mb-8">
              How It Works
            </h2>
            <div id="projects" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-16">
              {projects.map((project, index) => (
                <div key={index} className="glass-card rounded-2xl p-6 text-left">
                  <div className="project-image rounded-xl h-32 mb-4 flex items-center justify-center overflow-hidden">
                    {project.imageContent}
                  </div>
                  <h3 className="text-lg font-medium text-[#e7e5e4] mb-2 geist-font">{project.title}</h3>
                  <p className="text-[#acabaa] text-sm inter-font mb-4">{project.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <span key={tag} className="skill-badge px-2 py-1 rounded text-xs text-[#c6c6c7]">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="divider mb-16" />
            <div id="skills" className="flex flex-col sm:flex-row justify-center items-center gap-8 text-center">
              {stats.map((stat, index) => (
                <React.Fragment key={stat.label}>
                  <div>
                    <div className="text-3xl md:text-4xl font-light text-[#e7e5e4] mb-1 geist-font tracking-tight">{stat.value}</div>
                    <div className="text-[#acabaa] text-sm inter-font font-normal">{stat.label}</div>
                  </div>
                  {index < stats.length - 1 && <div className="hidden sm:block w-px h-12 bg-gradient-to-b from-transparent via-[#484848] to-transparent" />}
                </React.Fragment>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export { PortfolioPage };
