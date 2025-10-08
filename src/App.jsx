import React, { Suspense, useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, Float, Text, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

const AnimatedSection = ({ children, id }) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.2 }
    );

    const currentRef = ref.current;
    if (currentRef) observer.observe(currentRef);
    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, []);

  return (
    <section
      ref={ref}
      id={id}
      className={`py-24 md:py-32 transition-all duration-1000 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      {children}
    </section>
  );
};


function InteractiveObject({ children, name, ...props }) {
  const ref = useRef();
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [showName, setShowName] = useState(false);

  useEffect(() => {
    document.body.style.cursor = hovered ? "pointer" : "auto";
  }, [hovered]);

  useFrame((state, delta) => {
    if (ref.current) {
      if (clicked) {
        ref.current.position.y += delta * 4; // Jump up
        if (ref.current.position.y > props.position[1] + 1) setClicked(false);
      } else if (ref.current.position.y > props.position[1]) {
        ref.current.position.y -= delta * 3; // Fall back down
      }
      ref.current.scale.setScalar(hovered ? 1.15 : 1);
    }
  });

  const handleClick = (e) => {
    e.stopPropagation();
    setClicked(true);
    setShowName((prev) => !prev);
  };

  return (
    <group {...props}>
      <group
        ref={ref}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
        onPointerOut={(e) => { e.stopPropagation(); setHovered(false); }}
        onClick={handleClick}
      >
        {children}
      </group>
      {showName && (
        <Text position={[0, props.size ? props.size * 1.5 + 0.5 : 1.5, 0]} fontSize={0.4} color="white" anchorX="center">
          {name}
        </Text>
      )}
    </group>
  );
}

function AnimatedAstronaut(props) {
    const group = useRef();
    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        if (group.current) {
            group.current.rotation.y = Math.sin(t / 2) * 0.3;
            group.current.rotation.x = Math.cos(t) * 0.1;
        }
    });
    return (
        <InteractiveObject name="Explorer" {...props}>
            <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.8}>
                <group ref={group}>
                    {/* Body */}
                    <mesh position={[0, -0.5, 0]}>
                        <boxGeometry args={[0.8, 1, 0.6]} />
                        <meshStandardMaterial color="white" roughness={0.2} />
                    </mesh>
                    {/* Helmet */}
                    <mesh position={[0, 0.3, 0]}>
                        <sphereGeometry args={[0.5, 32, 32]} />
                        <meshStandardMaterial color="white" roughness={0.1}/>
                    </mesh>
                    {/* Visor */}
                    <mesh position={[0, 0.3, 0.3]}>
                        <sphereGeometry args={[0.4, 32, 32]} />
                        <meshStandardMaterial color="black" roughness={0} metalness={1} emissive="purple" emissiveIntensity={0.5}/>
                    </mesh>
                    {/* Backpack */}
                     <mesh position={[0, -0.5, -0.4]}>
                        <boxGeometry args={[0.6, 0.7, 0.3]} />
                        <meshStandardMaterial color="#c0c0c0" roughness={0.3} metalness={0.5}/>
                    </mesh>
                </group>
            </Float>
        </InteractiveObject>
    );
}

function DataServer(props) {
  const light1 = useRef();
  const light2 = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (light1.current) light1.current.material.emissiveIntensity = Math.sin(time * 5) > 0.5 ? 2 : 0.2;
    if (light2.current) light2.current.material.emissiveIntensity = Math.cos(time * 3) > 0.5 ? 2 : 0.2;
  });

  return (
    <InteractiveObject name="Server" {...props}>
      <Float speed={0.8} rotationIntensity={0.3} floatIntensity={0.6}>
        <group>
          <mesh>
            <boxGeometry args={[1.2, 2, 0.8]} />
            <meshStandardMaterial color="#1d3557" metalness={0.9} roughness={0.4} />
          </mesh>
          <mesh ref={light1} position={[0, 0.8, 0.45]}>
            <boxGeometry args={[0.2, 0.1, 0.05]} />
            <meshStandardMaterial color="lime" emissive="lime" />
          </mesh>
          <mesh ref={light2} position={[0, 0.6, 0.45]}>
            <boxGeometry args={[0.2, 0.1, 0.05]} />
            <meshStandardMaterial color="orange" emissive="orange" />
          </mesh>
        </group>
      </Float>
    </InteractiveObject>
  );
}

function Planet({ name, size = 1, color = 'orange', ringColor, ...props }) {
  return (
    <InteractiveObject name={name} size={size} {...props}>
      <Float speed={0.5} rotationIntensity={0.2} floatIntensity={0.5}>
        <group>
            <mesh>
              <sphereGeometry args={[size, 32, 32]} />
              <meshStandardMaterial color={color} roughness={0.6} metalness={0.2} />
            </mesh>
            {ringColor && (
               <mesh rotation-x={Math.PI * 0.5}>
                 <ringGeometry args={[size * 1.4, size * 1.8, 64]} />
                 <meshStandardMaterial color={ringColor} side={THREE.DoubleSide} transparent opacity={0.8} />
               </mesh>
            )}
        </group>
      </Float>
    </InteractiveObject>
  );
}

function Moon({ name, size = 0.5, ...props }) {
   return (
     <InteractiveObject name={name} size={size} {...props}>
       <Float speed={1} rotationIntensity={0.5} floatIntensity={0.2}>
         <mesh>
           <sphereGeometry args={[size, 32, 32]} />
           <meshStandardMaterial color="gray" roughness={0.8} />
         </mesh>
       </Float>
     </InteractiveObject>
   );
}


function Nebula() {
  const points = useRef();
  const count = 7000;
  const particles = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 250;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 250;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 250;
    }
    return arr;
  }, []);

  useFrame((_, delta) => {
    if (points.current) points.current.rotation.y += delta * 0.015;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={particles} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.1} color="#8a2be2" transparent opacity={0.7} />
    </points>
  );
}


const Scene = () => {
  return (
    <Canvas camera={{ position: [0, 2, 20], fov: 60 }}>
      <Suspense fallback={null}>
        <color attach="background" args={["#010014"]} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1.2} />
        <pointLight position={[-10, -10, -10]} intensity={2} color="#8338ec" />
        <Stars radius={200} depth={50} count={8000} factor={6} fade />
        <Nebula />

        <AnimatedAstronaut position={[-8, -2, -10]} scale={1.5} />
        <AnimatedAstronaut position={[7, 3, -8]} scale={1.2} />
        <DataServer position={[-6, 2, -5]} />
        <DataServer position={[5, -3, -4]} />

        <Planet name="Saturn" size={3} color="#e0aA6E" position={[15, 2, -15]} ringColor="#d4a373" />
        <Moon name="Titan" size={0.6} position={[19, 3, -14]} />

        <Planet name="Mars" size={1.8} color="#c1440e" position={[-15, -5, -20]} />

        <Planet name="Neptune" size={2.5} color="#3a86ff" position={[0, 8, -25]} />
        <Moon name="Triton" size={0.4} position={[2, 9, -26]} />
        
        <Planet name="Xylos" size={2} color="#ff006e" position={[-12, 10, -30]} />

        {Array.from({ length: 50 }).map((_, i) => (
          <Float key={i} speed={0.8} rotationIntensity={Math.random()} floatIntensity={1.2}>
            <mesh position={[(Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40]}>
              <icosahedronGeometry args={[0.2, 0]} />
              <meshStandardMaterial color={["#ffbe0b", "#fb5607", "#ff006e", "#8338ec", "#3a86ff"][i % 5]} metalness={0.7} roughness={0.3} />
            </mesh>
          </Float>
        ))}

        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.08} />
      </Suspense>
    </Canvas>
  );
};


export default function App() {
  const [formStatus, setFormStatus] = useState("");

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormStatus("Sending...");
    const formData = new FormData(e.target);

    try {
      const response = await fetch("https://formspree.io/f/xblzapnl", {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        setFormStatus("✅ Thank you! Your message has been sent.");
        e.target.reset();
      } else {
        const data = await response.json();
        if (data.errors) {
            setFormStatus(`❌ ${data.errors.map(e => e.message).join(', ')}`);
        } else {
            setFormStatus("❌ Oops! There was a problem submitting your form.");
        }
      }
    } catch (error) {
      setFormStatus("❌ Network error. Please check your connection.");
    }
  };

  const workData = [
    {
      company: "Mydbops",
      role: "Associate Database Engineer",
      period: "July 2024 - Present",
      description: "Managing large-scale databases (MySQL & PostgreSQL). Experience with replication, AWS RDS, Xtrabackup, and performance tuning.",
      tags: ["MySQL", "PostgreSQL", "AWS", "Linux", "Backup & Recovery"],
    },
    {
      company: "Under 25 Universe",
      role: "Branded Student Cohort",
      period: "June 2024 - June 2025",
      description: "Part of a tech & creativity-focused community. Engaged in design, networking, and collaborative innovation.",
      tags: ["Community", "Figma", "Missions", "Space","UI / UX"],
    },
  ];

  const scrollTo = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="bg-black text-gray-200 font-sans relative">
      <div className="fixed top-0 left-0 w-full h-screen z-0">
        <Scene />
      </div>

      <div className="relative z-10">
        <header className="fixed top-0 left-0 right-0 bg-black/40 backdrop-blur-md border-b border-gray-800/50 z-50">
          <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
            <div className="text-2xl font-bold">A<span className="text-purple-500">.</span></div>
            <div className="space-x-8 hidden md:flex">
              <button onClick={() => scrollTo("about")} className="hover:text-purple-400 transition-colors">About</button>
              <button onClick={() => scrollTo("work")} className="hover:text-purple-400 transition-colors">Work</button>
              <button onClick={() => scrollTo("contact")} className="hover:text-purple-400 transition-colors">Contact</button>
            </div>
          </nav>
        </header>

        <main className="container mx-auto px-6">
          <section className="h-screen flex flex-col justify-center items-center text-center">
            <h1 className="text-6xl md:text-8xl font-extrabold mb-4 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
              Athiban
            </h1>
            <p className="text-xl md:text-2xl text-purple-200">
              Database Engineer & Branded Student Cohort
            </p>
          </section>

          <AnimatedSection id="about">
            <div className="max-w-4xl mx-auto bg-black/70 p-8 rounded-lg border border-purple-800/40 backdrop-blur-sm">
              <h2 className="text-4xl font-bold mb-6 text-center">
                About Me<span className="text-purple-500">.</span>
              </h2>
              <p className="text-lg text-gray-300">
                I am a Database Engineer based in Bengaluru with experience in MySQL and PostgreSQL, including master-slave replication, AWS RDS, and backups using Xtrabackup, mysqldump, and mydumper. I am proficient with Pt-table-checksum and Pt-table-sync, skilled in Linux, web technologies like HTML, CSS, JavaScript, and Express.js, experienced in monitoring tools such as PMM and Sensu, and have expertise in designing web and mobile applications using Figma. I also have experience in machine learning with a focus on natural language processing (NLP) and am a branded Student Cohort at Under25, a platform for learning, earning, and building.
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection id="work">
            <h2 className="text-4xl font-bold text-center mb-12">
              My Experience<span className="text-purple-500">.</span>
            </h2>
            <div className="space-y-8 max-w-4xl mx-auto">
              {workData.map((job, i) => (
                <div key={i} className="bg-gray-900/60 p-6 rounded-lg border border-gray-700 hover:border-purple-500 transition backdrop-blur-sm">
                  <p className="text-purple-400 text-sm mb-2">{job.period}</p>
                  <h3 className="text-2xl font-bold mb-2">
                    {job.role} <span className="text-gray-400">at {job.company}</span>
                  </h3>
                  <p className="text-gray-400 mb-4">{job.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {job.tags.map((t) => (
                      <span key={t} className="bg-purple-900/50 px-3 py-1 rounded-full text-xs">{t}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </AnimatedSection>

          <AnimatedSection id="contact">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-4xl font-bold mb-4">
                Get In Touch<span className="text-purple-500">.</span>
              </h2>
              <p className="text-gray-400 mb-6">
                Want to collaborate or have a question? Send me a message!
              </p>
              <form
                onSubmit={handleFormSubmit}
                className="bg-gray-900/70 p-8 rounded-lg border border-gray-800 text-left space-y-4 backdrop-blur-sm"
              >
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  required
                  className="w-full bg-gray-800 rounded-md p-3 border border-gray-700 focus:ring-2 focus:ring-purple-500 outline-none"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  required
                  className="w-full bg-gray-800 rounded-md p-3 border border-gray-700 focus:ring-2 focus:ring-purple-500 outline-none"
                />
                <textarea
                  name="message"
                  rows="4"
                  placeholder="Message"
                  required
                  className="w-full bg-gray-800 rounded-md p-3 border border-gray-700 focus:ring-2 focus:ring-purple-500 outline-none"
                ></textarea>
                <button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-transform hover:scale-105"
                >
                  Send Message
                </button>
                {formStatus && (
                  <p className="text-purple-300 text-center mt-3">{formStatus}</p>
                )}
              </form>
            </div>
          </AnimatedSection>
        </main>

        <footer className="py-8 mt-10 text-center text-gray-500 border-t border-gray-800/50 backdrop-blur-sm">
          <div className="container mx-auto px-6">
            <div className="flex justify-center items-center space-x-6 mb-4">
              <a href="https://github.com/Athiban-32" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition-colors" aria-label="GitHub">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.168 6.839 9.492.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.031-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.378.203 2.398.1 2.651.64.7 1.03 1.595 1.03 2.688 0 3.848-2.338 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.001 10.001 0 0022 12c0-5.523-4.477-10-10-10z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="https://www.linkedin.com/in/raja-athiban-p-373110230/" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition-colors" aria-label="LinkedIn">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
            <p>© {new Date().getFullYear()} Athiban</p>
          </div>
        </footer>

      </div>
    </div>
  );
}

