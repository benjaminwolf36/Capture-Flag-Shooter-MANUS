import React from 'react';
import './_group.css';

export function MainUI() {
  const heroes = [
    {
      name: "Vanguard",
      role: "Assault",
      color: "orange",
      image: "/__mockup/images/vanguard.png",
      primary: "Heavy Pulse Rifle",
      abilities: [
        { name: "Tactical Barrage", desc: "Volley of grenades in targeted area" },
        { name: "Reinforce", desc: "Deploys temporary destructible shield" }
      ],
      ultimate: { name: "Overcharge", desc: "Greatly increases fire rate and damage" }
    },
    {
      name: "Specter",
      role: "Scout / Flanker",
      color: "cyan",
      image: "/__mockup/images/specter.png",
      primary: "Silenced SMG",
      abilities: [
        { name: "Phase Shift", desc: "Teleports short distance, briefly invulnerable" },
        { name: "Wall Run", desc: "Temporary traversal on vertical surfaces" }
      ],
      ultimate: { name: "Shadow Veil", desc: "Large stealth area for teammates" }
    },
    {
      name: "Aegis",
      role: "Support",
      color: "green",
      image: "/__mockup/images/aegis.png",
      primary: "Healing Beam",
      abilities: [
        { name: "Barrier Field", desc: "Stationary energy barrier blocking projectiles" },
        { name: "Restoration Drone", desc: "Drone that heals nearby allies" }
      ],
      ultimate: { name: "Resurrection Protocol", desc: "Revives fallen teammate with partial health" }
    },
    {
      name: "Phantom",
      role: "Tactician / Controller",
      color: "purple",
      image: "/__mockup/images/phantom.png",
      primary: "Recon Sniper Rifle",
      abilities: [
        { name: "Sensor Mine", desc: "Places mine that reveals nearby enemies" },
        { name: "Null Field", desc: "Creates zone slowing enemy movement" }
      ],
      ultimate: { name: "System Override", desc: "Disables enemy abilities in area for 5 seconds" }
    }
  ];

  return (
    <div className="nexus-theme min-h-screen relative selection:bg-[#00f0ff] selection:text-[#050508]">
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between bg-[#050508]/80 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-8">
          <div className="font-display font-black text-2xl tracking-widest text-white uppercase glitch-wrapper">
            <span className="glitch text-[#00f0ff]" data-text="NEXUS">NEXUS</span> BLITZ
          </div>
          <nav className="hidden md:flex gap-6 font-display text-sm tracking-wider font-semibold text-white/70">
            <a href="#heroes" className="hover:text-[#00f0ff] transition-colors uppercase">Heroes</a>
            <a href="#modes" className="hover:text-[#00f0ff] transition-colors uppercase">Game Modes</a>
            <a href="#maps" className="hover:text-[#00f0ff] transition-colors uppercase">Maps</a>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <button className="font-display text-sm font-bold tracking-widest uppercase hover:text-[#9d4edd] transition-colors hidden sm:block">Log In</button>
          <button className="nexus-btn nexus-btn-primary text-sm px-6 py-2">Play Free</button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050508]/60 to-[#050508] z-10"></div>
          <img src="/__mockup/images/hero-banner.png" alt="Nexus Blitz Battlefield" className="w-full h-full object-cover animate-float" style={{ transformOrigin: 'center center' }} />
          <div className="scanlines"></div>
        </div>

        <div className="container mx-auto px-6 relative z-20">
          <div className="max-w-3xl">
            <div className="inline-block px-3 py-1 mb-6 border border-[#00f0ff]/30 bg-[#00f0ff]/10 text-[#00f0ff] font-display font-bold text-sm tracking-[0.3em] uppercase clip-angle-top-left animate-pulse-glow">
              Status: Deployment Ready
            </div>
            <h1 className="font-display font-black text-6xl md:text-8xl lg:text-9xl tracking-tighter uppercase leading-none mb-6">
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">Capture</span>
              <span className="block text-[#00f0ff] glitch" data-text="The Future">The Future</span>
            </h1>
            <p className="font-body text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl leading-relaxed">
              Drop into the ultimate 5v5 hero shooter. Master diverse archetypes, dominate multi-layered sci-fi arenas, and claim the flag in high-octane warfare.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="nexus-btn nexus-btn-primary text-lg px-8 py-4">Play Now</button>
              <button className="nexus-btn nexus-btn-secondary text-lg px-8 py-4 flex items-center gap-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="arcs"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                Watch Trailer
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Heroes Section */}
      <section id="heroes" className="py-32 relative bg-[#0a0b10]">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#00f0ff]/50 to-transparent"></div>
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <h2 className="font-display font-black text-4xl md:text-6xl uppercase tracking-wider text-white mb-4">Choose Your <span className="text-[#9d4edd]">Operative</span></h2>
              <p className="font-body text-gray-400 text-lg max-w-xl">Four distinct archetypes. Infinite tactical possibilities. Find the playstyle that matches your chaos.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {heroes.map((hero) => (
              <div key={hero.name} className={`hero-card relative bg-[#050508] border border-white/5 p-6 clip-angle-bottom-right group accent-${hero.color} text-white`}>
                <div className={`absolute top-0 left-0 w-2 h-full bg-accent-${hero.color}`}></div>
                
                <div className="aspect-[3/4] mb-6 overflow-hidden relative clip-angle-top-left bg-[#10121b]">
                  <img src={hero.image} alt={hero.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className={`absolute inset-0 bg-accent-${hero.color} mix-blend-overlay opacity-20 group-hover:opacity-0 transition-opacity`}></div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
                    <div className={`text-xs font-display font-bold tracking-widest uppercase accent-${hero.color}`}>{hero.role}</div>
                    <div className="font-display font-black text-3xl uppercase tracking-wider">{hero.name}</div>
                  </div>
                </div>

                <div className="space-y-4 font-body">
                  <div>
                    <div className="text-gray-500 text-xs uppercase tracking-widest font-bold mb-1">Primary Weapon</div>
                    <div className="text-gray-200">{hero.primary}</div>
                  </div>
                  
                  <div className="h-px w-full bg-white/10"></div>
                  
                  <div>
                    <div className="text-gray-500 text-xs uppercase tracking-widest font-bold mb-2">Tactical Abilities</div>
                    <ul className="space-y-2">
                      {hero.abilities.map((ability, idx) => (
                        <li key={idx} className="text-sm">
                          <span className={`font-bold accent-${hero.color}`}>{ability.name}:</span> <span className="text-gray-400">{ability.desc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="h-px w-full bg-white/10"></div>
                  
                  <div>
                    <div className={`text-xs uppercase tracking-widest font-bold mb-1 accent-${hero.color}`}>Ultimate</div>
                    <div className="text-sm">
                      <span className="font-bold text-white">{hero.ultimate.name}:</span> <span className="text-gray-400">{hero.ultimate.desc}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Game Modes & Maps */}
      <section id="modes" className="py-32 relative bg-[#050508] overflow-hidden">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#9d4edd]/5 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-20">
            {/* Modes */}
            <div>
              <h2 className="font-display font-black text-4xl md:text-5xl uppercase tracking-wider text-white mb-10">Combat <span className="text-[#00f0ff]">Protocols</span></h2>
              
              <div className="space-y-6">
                <div className="bg-[#0a0b10] border-l-4 border-[#00f0ff] p-8 clip-angle-bottom-right group hover:bg-[#10121b] transition-colors cursor-pointer">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-display font-bold text-2xl uppercase tracking-wider text-white group-hover:text-[#00f0ff] transition-colors">Nexus Blitz (CTF)</h3>
                    <div className="px-2 py-1 bg-[#00f0ff]/20 text-[#00f0ff] text-xs font-bold tracking-widest uppercase">Ranked</div>
                  </div>
                  <p className="font-body text-gray-400 text-lg leading-relaxed">
                    The core experience. Infiltrate the enemy base, secure their datocore flag, and return it to your nexus. Coordination and speed are paramount.
                  </p>
                </div>

                <div className="bg-[#0a0b10] border-l-4 border-[#ff5400] p-8 clip-angle-bottom-right group hover:bg-[#10121b] transition-colors cursor-pointer">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-display font-bold text-2xl uppercase tracking-wider text-white group-hover:text-[#ff5400] transition-colors">Prop Hunt Blitz</h3>
                    <div className="px-2 py-1 bg-[#ff5400]/20 text-[#ff5400] text-xs font-bold tracking-widest uppercase">Party Mode</div>
                  </div>
                  <p className="font-body text-gray-400 text-lg leading-relaxed">
                    Pure chaos. One team disguises themselves as map environment objects, while the heavily-armed seekers hunt them down before the timer expires.
                  </p>
                </div>
              </div>
            </div>

            {/* Maps Showcase */}
            <div id="maps">
               <h2 className="font-display font-black text-4xl md:text-5xl uppercase tracking-wider text-white mb-10">The <span className="text-[#39ff14]">Arenas</span></h2>
               
               <div className="space-y-4">
                 {[
                   { name: "Sky-City Citadel", desc: "Vertical combat among the neon-drenched skyscrapers.", color: "cyan" },
                   { name: "Ancient Ruins", desc: "Overgrown alien architecture meets high-tech military gear.", color: "green" },
                   { name: "Industrial Complex", desc: "Tight corridors and hazardous machinery environments.", color: "orange" }
                 ].map((map, i) => (
                   <div key={i} className={`relative h-32 bg-[#10121b] border border-white/10 flex items-center p-6 overflow-hidden group clip-angle group cursor-pointer`}>
                      <div className={`absolute inset-0 bg-accent-${map.color} opacity-0 group-hover:opacity-10 transition-opacity z-10`}></div>
                      <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-black/80 to-transparent z-10"></div>
                      
                      <div className="relative z-20">
                        <h4 className={`font-display font-bold text-xl uppercase tracking-wider text-white mb-1 group-hover:text-accent-${map.color} transition-colors`}>{map.name}</h4>
                        <p className="font-body text-sm text-gray-400">{map.desc}</p>
                      </div>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="relative bg-[#050508] pt-32 pb-10 overflow-hidden border-t border-white/5">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[#00f0ff]/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="scanlines opacity-50"></div>
        
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h2 className="font-display font-black text-5xl md:text-7xl uppercase tracking-tighter text-white mb-6">
            Join the <span className="text-[#00f0ff]">Blitz</span>
          </h2>
          <p className="font-body text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Download free today and claim your spot on the leaderboards. Available on PC, PS5, and Xbox Series X|S.
          </p>
          
          <button className="nexus-btn nexus-btn-primary text-xl px-12 py-5 shadow-[0_0_40px_rgba(0,240,255,0.3)] animate-pulse-glow mb-20">
            Download Now - Free
          </button>
          
          <div className="border-t border-white/10 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="font-display font-black text-xl tracking-widest text-white uppercase opacity-50">
              Nexus Blitz
            </div>
            <div className="flex gap-6 font-body text-sm text-gray-500 uppercase tracking-widest">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Support</a>
              <a href="#" className="hover:text-white transition-colors">Press</a>
            </div>
            <div className="font-body text-sm text-gray-600">
              © 2024 Null Void Studios. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
