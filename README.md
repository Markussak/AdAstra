# 🚀 Star Dust Voyager: Galaxy Wanderer

**Retro 16-bit kosmická hra napsaná v TypeScript**

Ponořte se do nekonečné galaxie plné tajemství, dobrodružství a nekonečných možností. Staňte se piloty vesmírné lodi a prozkoumejte hvězdy v tomto klasickém 2D space exploration simulátoru.

![Game Version](https://img.shields.io/badge/version-2.0.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.1+-blue)
![HTML5](https://img.shields.io/badge/HTML5-Canvas-orange)

## ✨ Nové Funkce v 2.0.0

### 🎮 Kompletní Menu Systém
- **Úvodní Načítací Obrazovka**: Efektní loading screen s animacemi
- **Hlavní Menu**: Krásné menu s background obrázky
- **New Game Setup**: Vícekolový setup nové hry
- **Pause Menu**: Kompletní pause menu během hraní

### 🚢 Výběr Lodí a Customizace
- **5 Typů Lodí**: Scout, Fighter, Explorer, Cargo, Battleship
- **Jedinečné Statistiky**: Každá loď má jiné vlastnosti
- **Speciální Schopnosti**: Unikátní bonusy pro každý typ

### 🎯 Systém Obtížnosti
- **4 Úrovně**: Easy, Normal, Hard, Extreme
- **Dynamické Nastavení**: Ovlivňuje zdroje, damage, experience
- **Startovní Zdroje**: Různé množství paliva, energie a kreditů

### 🎨 Vylepšená Vizuální Stránka
- **Background Obrázky**: Podpora pro custom pozadí
- **Animace a Efekty**: Smooth přechody a efekty
- **Moderne UI**: Čistší a intuitivnější rozhraní

## 🎮 Funkce Hry

### 🌌 Procedurální Galaxie
- Nekonečně generované hvězdné systémy
- Unikátní planety, měsíce a asteroidy
- Realistická orbitální mechanika

### 🚀 Pokročilá Fyzika & Efekty
- Newtonovská mechanika pohybu
- Gravitační síly od nebeských těles
- Realistické ovládání kosmické lodi
- **Warp Drive**: Pokročilý FTL systém s multi-fázovou animací
- **Engine Effects**: Realistické plazmové a ionové motory
- **Particle Systems**: Pokročilé vizuální efekty pro všechny systémy

### ⚔️ Bojový Systém  
- **11 typů zbraní**: Lasery, Plasma Cannon, Torpéda, Railgun, Ion Beam, EMP
- **Weapon Data**: Detailní stats pro každou zbraň (damage, range, fire rate)
- **Pokročilé štíty**: Hexagonální energetické štíty s regenerací
- **Visual Effects**: Realistické efekty dopadů, výbuchů a zásahů štítů
- Systém přehřívání zbraní
- Damage systém s prioritou štítů před hull

### 🎯 Quest & Mission Systém
- **Dynamické úkoly**: Delivery, Combat, Exploration, Mining, Story quests
- **Objective tracking**: Real-time sledování pokroku
- **Časové limity**: Některé mise mají deadline
- **Reward systém**: Credits, XP a special items
- **Difficulty scaling**: Quests přizpůsobené player level

### 💾 Save/Load Systém
- **Multiple save slots**: Až 5 save slotů
- **Auto-save**: Automatické ukládání každých 5 minut
- **Export/Import**: Možnost zálohování saves jako soubory
- **Version compatibility**: Migrace saves mezi verzemi
- **Settings persistence**: Ukládání všech nastavení

### ⚙️ Settings & Customization
- **Graphics**: Fullscreen, rozlišení, pixel perfect, FPS counter
- **Audio**: Separátní hlasitosti pro music/SFX, mute option
- **Gameplay**: Autosave interval, tutorials, pause na focus loss
- **Controls**: Key bindings (plánováno pro budoucí verze)

### 🔧 Správa Systémů Lodi
- Reaktor, motory, štíty, zbraně
- Spotřeba energie a paliva
- Poškození a opravy komponentů

## 🚀 Rychlý Start

### Požadavky
- Node.js 16+
- npm 8+
- Moderní webový prohlížeč

### Instalace
```bash
# Klonování repozitáře
git clone https://github.com/your-username/space-explorer-typescript.git
cd space-explorer-typescript

# Instalace závislostí
npm install

# Přidání obrázků (volitelné)
# Umístěte main-menu-bg.jpg a setup-bg.jpg do složky assets/

# Spuštění ve vývojářském módu
npm run dev

# Nebo build pro produkci
npm run build
npm start
```

### Rychlé Spuštění
```bash
# Pro rychlé testování
npm run dev
```

Hra se otevře na `http://localhost:3000`

## 🎮 Ovládání

### Základní Ovládání
- **WASD / Šipky**: Pohyb lodi (W/↑ - zrychlení, S/↓ - brždění)
- **A/D nebo ←/→**: Rotace doleva/doprava
- **MEZERNÍK**: Střelba
- **ESC**: Pause menu / návrat zpět

### Menu Navigace
- **↑/↓**: Navigace v menu
- **ENTER**: Potvrdit výběr
- **ESC**: Zpět / zavřít menu

### Pokročilé Ovládání
- **Q**: Quest log (aktivní úkoly)
- **F5**: Quick save
- **F9**: Quick load
- **J**: Warp Drive (při plném nabití)
- **H**: Test damage (pro testování štítů)
- **TAB**: Inventář (plánováno)
- **M**: Mapa (plánováno)
- **1-4**: Výběr zbraní (plánováno)

## 🏗️ Struktura Projektu

```
space-explorer-typescript/
├── src/                    # TypeScript zdrojové kódy
│   ├── types.ts           # Typy a interfacy + nové Quest/Save typy
│   ├── main.ts            # Hlavní engine a game states + Settings
│   ├── renderer.ts        # Rendering systém
│   ├── input.ts           # Správa vstupů
│   ├── player.ts          # Player ship implementace
│   ├── celestial.ts       # Nebeská tělesa
│   ├── scenes.ts          # Scény a světy
│   ├── camera.ts          # Kamerový systém
│   ├── utils.ts           # Utility funkce
│   ├── gameData.ts        # Konfigurační data + nové lodě a zbraně
│   ├── saveSystem.ts      # 💾 Save/Load systém + AutoSave
│   ├── questSystem.ts     # 🎯 Quest a Mission systém
│   └── effectSystem.ts    # ✨ Pokročilé vizuální efekty
├── assets/                # Obrázky, zvuky, atd.
├── dist/                  # Zkompilované soubory
├── index.html            # Hlavní HTML soubor
├── package.json          # npm konfigurace
├── tsconfig.json         # TypeScript konfigurace
└── vite.config.ts        # Vite build konfigurace
```

## 🎨 Assets a Customizace

### Požadované Obrázky
Umístěte tyto obrázky do složky `assets/`:

- **main-menu-bg.jpg**: Pozadí hlavního menu (cockpit view)
- **setup-bg.jpg**: Pozadí setup obrazovek (control room)

### Volitelné Assets
- Zvukové efekty (*.ogg, *.mp3)
- Hudební stopy (*.ogg, *.mp3)
- Vlastní sprites lodí
- UI elementy

## 🔧 Vývoj

### Dostupné Scripty
```bash
npm run build          # Zkompilování TypeScript
npm run build:watch    # Kontinuální kompilace
npm run dev            # Vývojářský server (Vite)
npm run preview        # Preview produkční build
npm start              # Build a spuštění
npm run clean          # Vyčištění dist složky
npm run lint           # ESLint kontrola
npm run format         # Prettier formátování
npm run type-check     # TypeScript type checking
```

### Debug a Testování
- Otevřete Developer Tools v prohlížeči
- Použijte `window.game` objekt pro debug
- Všechny herní objekty jsou dostupné přes console

## 🎯 Plánované Funkce

### 🌟 Prioritní
- [ ] Systém ukládání/načítání hry
- [ ] Nastavení (Settings menu)
- [ ] Kredity a about obrazovka
- [ ] Zvukové efekty a hudba
- [ ] Tutorial pro nové hráče

### 🚀 Rozšířené
- [x] **Quest systém** - ✅ Dokončeno v2.1.0
- [x] **Save/Load systém** - ✅ Dokončeno v2.1.0  
- [x] **Pokročilé nastavení** - ✅ Dokončeno v2.1.0
- [x] **Effect System** - ✅ Dokončeno v2.1.0
- [x] **Shield Mechanics** - ✅ Dokončeno v2.1.0
- [x] **Warp Drive** - ✅ Dokončeno v2.1.0
- [ ] **Sound System** - 🔄 V přípravě v2.2.0
- [ ] Obchodní systém
- [ ] Vícehráčový mód
- [ ] Modding podpora
- [ ] Rozšířené customizace lodí

### 🌌 Dlouhodobé
- [ ] Komplexní příběhová kampaň
- [ ] Frakce a diplomacie
- [ ] Kolonie a výstavba
- [ ] PvP arény
- [ ] Mobilní verze

## 🐛 Známé Problémy

- Textový input v character creation potřebuje vylepšení
- Obrazce lodí jsou zatím jednoduché (placeholder)
- Chybí zvukové efekty (v přípravě v2.2.0)
- Performance optimalizace pro starší zařízení
- Controls settings tab není zatím implementován

## 🤝 Přispívání

Uvítáme příspěvky! Prosím:

1. Forkněte repozitář
2. Vytvořte feature branch (`git checkout -b feature/nova-funkce`)
3. Commitněte změny (`git commit -am 'Přidat novou funkci'`)
4. Pushněte branch (`git push origin feature/nova-funkce`)
5. Vytvořte Pull Request

## 📄 Licence

Tento projekt je licencován pod MIT licencí - viz [LICENSE](LICENSE) soubor pro detaily.

## 🌟 Inspirace

Tato hra byla inspirována klasickými space opera hrami:
- **Elite: Dangerous** - za inspiraci k volnému průzkumu
- **Star Citizen** - za vizi budoucnosti space simů
- **EVE Online** - za komplexnost ekonomiky a vztahů
- **No Man's Sky** - za nekonečnost prozkoumávání

## 📞 Kontakt

- **GitHub Issues**: [Issues page](https://github.com/your-username/space-explorer-typescript/issues)
- **Discord**: [Join our community](#) (Coming soon)
- **Email**: space.explorer.dev@gmail.com

---

**Užijte si svou cestu mezi hvězdami! 🌌**

Made with ❤️ and lots of ☕ by the Space Explorer Development Team
