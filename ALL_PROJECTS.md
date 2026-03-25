# Complete Projects Portfolio

---

## 1. 8-Bit Calculator (FPGA)

**Description:** An 8-bit signed calculator capable of performing basic operations on FPGA. Controllable with a remote.

### What
An 8-bit calculator implemented on an Intel DE10-Lite FPGA using VHDL, featuring IR remote input, signed/unsigned arithmetic operations, and multi-modal output including 7-segment displays, LEDs, and audible buzzer feedback.

### How
Decoded NEC protocol IR signals through a FSM for input handling. Implemented dual computation modes: internal VHDL arithmetic and external 74LS283 CLA adder integration via GPIO. Designed custom two's complement signed operation logic. Results displayed through 7-segment displays and buzzer output.

### Result
Fully functional calculator supporting 8 operational modes across signed/unsigned and internal/external configurations. Validated through comprehensive testbenches and 37 documented physical test cases.

### AI Usage (AI-Free)
None. This project was completed in October 2021 as part of an electronics course at ECE Paris, prior to the availability of modern AI coding assistants.

---

## 2. Ace Attorney Guide

**Description:** Guide website made to easily access 'Phoenix Wright: Ace Attorney' Series guides from StrategyWiki.

### What
A lightweight, fast-access guide website for the Phoenix Wright: Ace Attorney game series, providing one-click navigation to specific cases and chapters. Solves the friction of navigating traditional wiki hierarchies during active gameplay by offering direct deep-linking to any game segment.

### How
Built using mdBook (Rust-based static site generator) to transform StrategyWiki content into an instantly accessible reference. Organized 6 mainline games plus spin-offs and crossovers with hierarchical link structure. Deployed via GitHub Pages with automatic CI/CD pipeline. Implemented mobile-first responsive design, tested using ngrok for real device validation during development.

### Result
A zero-latency reference tool with instant page loads and clean URL structure for bookmarking. Community-maintainable through GitHub PRs with Markdown source control. Successfully deployed with comprehensive coverage of the entire Ace Attorney series, including a play order chart for newcomers.

### AI Usage (AI-Free)
None. This is a static site generation project using existing documentation tools (mdBook) and community-sourced content from StrategyWiki, with manual content organization and deployment configuration.

---

## 3. Air Traffic Simulation

**Description:** An air traffic simulation using graph-theory enabling automatic planes, airport management, weather event rerouting.

### What
A graph-theory-based air traffic control simulation in C++ with Allegro 4, featuring autonomous aircraft navigation through a weighted directed graph of airports and flight routes. Aircraft dynamically reroute around weather events while managing airport capacity constraints and collision avoidance.

### How
Implemented Dijkstra's algorithm for optimal pathfinding between airports, with real-time path recalculation when weather disables graph edges. Used finite state machines for aircraft behavior (taxiing, takeoff, cruising, landing) and spatial partitioning for efficient collision detection. Airport systems managed landing queues and runway allocation with FIFO scheduling. Event bus pattern broadcast route changes to affected aircraft for immediate rerouting.

### Result
Fully functional simulation handling multiple simultaneous flights with autonomous navigation and dynamic adaptation. Demonstrated practical application of graph algorithms and OOP design patterns (State, Observer, Factory) in a real-time system. Achieved efficient performance through spatial indexing and algorithm optimization, reducing collision checks from O(n²) to O(n log n).

### AI Usage (AI-Free)
None. This project was completed as a computer science coursework assignment, implementing fundamental algorithms and design patterns through manual coding and architecture design. Art style and UI were completely designed by me, inspired by Animal Crossing: New Horizons.

---

## 4. Autonomous Racing Car

**Description:** Led a team of 30 students in developing a fully autonomous vehicle and implemented Edge AI for race trajectory.

### What
An AI-powered trajectory planning system for ARECE, an autonomous racing vehicle competing in Formula Student Driverless competitions. Reduced trajectory computation time from 17.31 seconds to <1ms per segment using machine learning.

### How
Generated synthetic racing circuits and computed optimal baselines using minimum curvature algorithms based on vehicle dynamics. Designed and trained a feed-forward neural network on track/trajectory pairs, with input features of normal vectors and angular changes at track boundaries. Integrated real-time inference (<1ms) into ROS2 pipeline, receiving cone positions from perception and publishing waypoint commands to vehicle control.

### Result
Production-ready system achieving real-time operation for competitive autonomous racing. Successfully replaced computationally expensive iterative optimization with neural network inference, validated through simulation and team integration. Created reusable synthetic track generation framework for training data augmentation as technical lead coordinating across Manufacturing, Perception, Trajectory, and DevOps teams.

### AI Usage (Automation)
AI tools (like code assistants) were used for boilerplate code, formatting, scripting, and automation tasks. The core ML work (state-of-the-art trajectory optimization research, synthetic data generation pipeline, neural network architecture design, model training, and real-time inference implementation) was designed and developed by the team from scratch.

---

## 5. Autonomous Robot (ECECUP)

**Description:** Built a fully autonomous robot from scratch with computer vision, state machine and graph-based pathfinding.

### What
A competition-grade autonomous robot built from scratch for ECE-CUP tournaments, featuring web-based WiFi teleoperation, 3D-printed PETG gripper mechanism, and real-time embedded control. Navigates a 2m×3m arena to collect and stack containers on scoring craters within 90-second matches.

### How
ESP8266 hosts HTML5/JavaScript web interface for real-time joystick control via AJAX (<10ms latency). Differential drive system uses PWM motor control with 8-directional zone detection for movement. Custom dual-jaw gripper actuated by SG90 servo through 3D-printed gear train designed in Tinkercad. Automated flag deployment at 90s via onboard timer triggered on first joystick input.

### Result
Successfully competed in 3 ECE-CUP tournaments with reliable autonomous operation. Achieved 100% flag deployment reliability, 120+ minute battery life, and zero disqualifications. Complete electromechanical system designed and integrated by 4-person team, rapid prototyping with 3D printing, and WiFi protocol implementation.

### AI Usage (AI-Free)
None. This project was completed in 2020-2021, before modern LLMs. Development relied on tutorial videos, ESP8266 documentation, trial-and-error iteration, and adapting existing examples through hands-on experimentation until achieving functional results.

---

## 6. Chaotics Slice (AI Video Editor)

**Description:** An AI-powered silence remover that uses Silero VAD to detect speech and automatically cut non-speech segments.

### What
Chaotics Slice is a self-hosted, AI-powered silence remover for video editors. Users upload a video, choose an aggression preset from Chill to Savage, and the app detects speech using Silero VAD while removing non-speech segments. An interactive timeline preview shows all cuts before rendering. Exports include a fully sliced video or professional cut lists in EDL, FCPXML, and Premiere XML formats for seamless integration into major NLEs. Unlike simple volume-threshold trimmers, detection is based on voice activity modeling, enabling more reliable and precise silence removal.

### How
Built in Python with Flask handling both frontend and backend routing. Audio is extracted via FFmpeg, converted to 16 kHz mono PCM, and processed with Silero VAD for frame-level speech detection. Cut segments are computed using configurable padding and minimum silence thresholds, then rendered through FFmpeg CLI orchestration. The system supports macOS, Windows, and Linux with automatic CUDA or Apple Silicon MPS detection and CPU fallback. Model weights download once and are cached locally, allowing fully offline operation after first use.

### Result
A fully functional self-hosted application that accelerates video editing by accurately removing silence, previewing edits before rendering, and exporting directly to professional editing software. It reduces repetitive manual trimming while preserving precision and workflow control. Free and open source, it is designed for long-term local use without cloud dependency.

### AI Usage (Situational Autonomy)
AI was primarily used to accelerate frontend development and assist with code completion. The original command-line MVP integrating Silero VAD and FFmpeg, along with the core editing logic and system architecture, were engineered and implemented independently.

---

## 7. Cluedo Knight

**Description:** A digital adaptation of the classic Cluedo board game, featuring a hollow knight theme and interactive gameplay.

### What
A thematic digital reimagining of Cluedo (Clue) set in Hollow Knight's underground kingdom of Hallownest. Players navigate interconnected caverns as iconic characters, deducing which character committed murder, with which weapon, and in which location through strategic interrogation and elimination—all rendered in custom pixel art faithful to the game's monochromatic aesthetic.

### How
Built in C++ with Allegro 4 using OOP design patterns (State, Observer, Factory, Strategy). Implemented graph-based board navigation, dice roll mechanics, and secret passages. Developed AI opponents using Bayesian inference probability matrices and knowledge tracking across game history. Created full Cluedo ruleset with 216 possible solution combinations (6 characters × 6 weapons × 9 locations) supporting 3-6 players.

### Result
Complete game loop with atmospheric presentation faithful to Hollow Knight's tone. Successfully adapted Victorian mansion mystery to dark fantasy setting through hand-crafted pixel art (50+ hours): character sprites with animations, weapon icons, location backgrounds, and UI merging detective aesthetics with minimalist design. Demonstrated mastery of game AI, state machines, and 2D rendering pipeline.

### AI Usage (AI-Free)
None. This project predates modern LLMs. All pixel art assets (sprites, backgrounds, UI elements) were hand-drawn from scratch over 50+ hours, inspired by Hollow Knight's visual style. Programming followed Allegro 4 documentation and OOP principles through manual implementation.

---

## 8. ECECOPTER (Remote Controlled Drone)

**Description:** Designed and built a fully functional drone and remote system, including PCBs, sensors, and communication protocols.

### What
A fully functional quadcopter drone system built from scratch, including custom PCB design, IMU-based stabilization, Time-of-Flight altitude sensing, and wireless remote control. Complete drone ecosystem spanning electrical engineering, mechanical design, firmware development, and flight control algorithms.

### How
Designed flight controller PCB in KiCad with ATmega328p microcontroller, IMU sensor integration, ToF distance measurement, and wireless transceiver. Implemented sensor fusion using complementary filter combining gyroscope and accelerometer data. Developed PID control loops for roll/pitch/yaw stabilization and altitude hold. Created mechanical frame and motor mounts in Fusion 360 with vibration dampening and weight optimization (<400g total).

### Result
Achieved stable hands-off hover with altitude hold, <50ms control latency, 8-12 minute flight time, and 100m+ wireless range. Successfully integrated multi-sensor system on single microcontroller with real-time control at 100-200Hz. Demonstrated complete hardware-software co-design from schematic to flight-tested hardware.

### AI Usage (AI-Free)
None. My primary contributions were sensor testing and validation (IMU calibration, ToF accuracy verification, vibration analysis) and 3D modeling in Fusion 360 (frame structure, motor mounts with dampening, weight-optimized component placement). Development relied on datasheets, control theory fundamentals, and iterative hardware testing.

---

## 9. Fintech App Development

**Description:** Implemented microservices (fund transfers, transaction history, image compression) into 300M+ users Fintech super app.

### What
Mission-critical microservices for Astra Tech's ultra-app ecosystem (300M+ users), integrating remittance (international money transfer), referral systems, and backend infrastructure during a high-stakes merger of PayBy, Botim, and Rizek. Worked across two consecutive internships (2022-2023) during the $500M-funded transformation into the Middle East's first WeChat-style super-platform.

### How
Built production-grade microservices in Rust with Domain-Driven Design architecture. Implemented remittance service with real-time exchange rates, multi-currency support, and asynchronous processing via AMQP/RabbitMQ. Designed referral/loyalty system with Redis caching for campaign rules, fraud detection, and event-driven reward distribution. Applied DDD patterns: bounded contexts, aggregates, value objects, and domain events for complex financial domain modeling.

### Result
Successfully deployed remittance integration to production in Botim app and referral system driving viral growth. Handled thousands of transactions daily with horizontal scaling, memory-safe concurrent processing, and <1ms Redis lookups. Contributed to $500M M&A technical integration, supporting 300M+ user base across distributed team of 50+ engineers in 2 countries.

### AI Usage (AI-Free)
None. This work occurred in late 2022/early 2023 when LLMs were just emerging. Development focused on learning Domain-Driven Design principles, Rust's ownership/borrowing model through pair programming and code reviews, and enterprise-grade microservices architecture patterns through hands-on implementation and mentorship.

---

## 10. Retro Game Logo Generator

**Description:** A web application that allows users to create beautiful normalized icons for their retro games collection.

### What
A streamlined web application used to produce uniform, high quality game icons for my upcoming cross-platform retro emulation frontend Kioku (きおく), inspired by the iiSU project.

### How
The tool takes a source image, applies a consistent border, color gradient, and system icon either from pre-existing templates or custom-made ones, previews the icon in context, and exports ready to use. It ensures each asset aligns within the layout.

### Result
A fast and reliable workflow for generating cohesive game visuals. Every title in Kioku uses this tool for a clean, unified presentation of the user's game library that improves readability, navigation, and overall frontend polish.

### AI Usage (Situational Autonomy)
The web GUI of the application was generated using AI. The image processing logic was designed and implemented by me, from Photoshop to TypeScript and Flutter (upcoming cross-platform app).

---

## 11. Le Saboteur (French Board Game)

**Description:** A video game adaptation of 'Le Saboteur', a French board game, with a wild-west pixel art theme.

### What
A digital adaptation of the French social deduction board game Saboteur, reimagined with wild-west pixel art theme. Players take hidden roles as gold miners or saboteurs, collaboratively building tunnel paths toward treasure while saboteurs secretly undermine progress through strategic path-building and sabotage mechanics.

### How
Built in C with Allegro 4 using procedural programming and manual memory management. Implemented path validation system with adjacency matrix for connection rules and flood-fill detection for dead ends. Designed turn-based multiplayer with hot-seat play, hidden role screens, and hand management. Created finite state machine for game phases (setup, playing, scoring) with mouse/keyboard input handling and double-buffered rendering for flicker-free graphics.

### Result
Full ruleset implementation supporting 3-10 players with strategic depth through deduction, bluffing, and path optimization. Created 50+ custom wild-west pixel art assets (card sprites, character avatars, UI elements) adapting the medieval theme. Demonstrated low-level C programming proficiency, 2D game development techniques, and modular architecture with separate rendering, logic, and input systems.

### AI Usage (AI-Free)
None. This project predates modern LLMs. All pixel art assets were hand-crafted, game logic implemented through manual C programming, and development relied on Allegro 4 documentation, memory debugging with valgrind, and iterative playtesting for game balance.

---

## 12. PersonaPlay (Netflix Clone)

**Description:** Developed a fullstack Netflix-like application for browsing and watching videos with features like forums, reviews, and search.

### What
A full-stack Netflix-inspired streaming platform built with JavaFX, featuring video browsing, user authentication with email verification, community forums, review system, search with filters, and watchlist management. Demonstrates comprehensive software engineering with MVC architecture, ORM patterns, and RESTful API integration.

### How
Implemented MVC architecture with JavaFX frontend (FXML layouts), Java backend using Hibernate ORM for MySQL database persistence, and OkHttp for external API integration. Built user authentication with BCrypt password hashing and SMTP email verification. Designed relational database schema with entities for users, videos, reviews, and forum posts. Created search system using Hibernate Criteria API with multi-criteria filtering (text, genre, year, rating) and pagination for performance.

### Result
Production-ready desktop application with complete user account management, video catalog populated via external APIs, community forums with upvote system, star rating aggregation, and responsive grid-based UI. Successfully applied enterprise Java patterns (Hibernate, JPA, repository pattern) and multi-layer architecture across full stack from database design to user interface.

### AI Usage (Automation)
Completed shortly after a semester abroad Fullstack course using Spring/Springboot, with strong understanding of MVC, Hibernate, and Maven implementation patterns. AI assisted with code autocompletion, boilerplate generation (entity annotations, repository methods), test database population scripts, and documentation. All architectural decisions, UI design in JavaFX, database schema design, and core business logic were implemented manually.

---

## 13. Porypal

**Description:** Image processing, tileset editor and palette injector for automatic custom graphics in Gen 3 ROM hacks.

### What
A specialized image processing tool for Pokémon Gen 3 ROM hacking, automating conversion of modern graphics into Game Boy Advance-compatible sprites and tilesets. Addresses GBA's tile-based rendering constraints (16-color palettes, 8×8 tile system, JASC-PAL format) that make batch sprite creation tedious and error-prone for ROM hackers working on decompilation projects.

### How
Implemented intelligent color quantization using CIEDE2000 perceptual color distance for 24-bit RGB → 4-bit indexed conversion with transparency slot enforcement. Built tile-based decomposition system with hash-based deduplication, flip/rotate operations, and interactive Qt GUI editor. Created YAML-driven batch processing pipeline supporting multiple output formats (C arrays, binary, assembly) with LZ77 compression, achieving 40-60% size reduction.

### Result
10x faster sprite conversion workflow with zero palette errors and ROM space savings through duplicate tile elimination. Adopted by Pokémon ROM hacking community (pokecommunity, r/PokemonROMhacks) and integrated into popular decompilation projects (pokeemerald, pokefirered). Enables batch processing of 100+ sprites in minutes, now used daily by known developers in the ROM hacking space.

### AI Usage (Collaboration)
Initial proof-of-concept was fully AI-generated to validate feasibility. After seeing community interest, completely reimplemented from scratch following proper MVC architecture. AI assisted with specific GUI components in Qt (custom paint events, drag-and-drop tile rearrangement) and complex image processing functions I struggled with. Core architecture, domain logic for GBA constraints, and batch processing pipeline were manually designed and implemented.

---

## 14. Power Consumption Measurement

**Description:** Developed a measurement board to evaluate product battery life and optimize real-time signal processing to handle billions of data points.

### What
A real-time power consumption analysis tool for Withings' connected health devices, processing up to 13 billion data points per day from dual ADCs to identify firmware bugs and power inefficiencies. Enables engineers to validate battery life optimizations critical for products like ScanWatch (30-day battery vs Apple Watch's 18 hours).

### How
Designed custom binary format using cumulative sum encoding, reducing average calculation from O(n) to O(1) for constant-time downsampling of billions of points. Implemented dual-ADC firmware with automatic switching at 360μA threshold, synchronizing ADS1247 (24-bit @ 2kHz) and LTC2378-18 (18-bit @ 62.5kHz) via pipe markers. Built Qt/PyQtGraph GUI achieving <10ms rendering of 1 billion points downsampled to screen pixels, replacing 46-class legacy system with streamlined 10-class MVC architecture.

### Result
10x GUI responsiveness (<100ms vs 10+ sec), unlimited acquisition length (20+ hours vs <2 hours), and 500 KB/s sustained streaming. Successfully deployed to production, catching critical firmware bugs like weight-on-scale 10× power consumption issue. Enabled Withings teams (embedded, industrialization, SQA) to accelerate development cycles and reduce warranty costs through pre-production power profiling.

### AI Usage (Automation)
Spent 4 months deliberately learning Qt, Python, and embedded C firmware development. AI assisted with documentation generation, debugging edge cases, and test case creation, but core engineering decisions were manual (cumulative sum optimization algorithm, dual-ADC synchronization protocol, etc.). Project's simplicity resulted from extensive architecture head-scratching and multi-tasking simplification, not AI generation.

---

## 15. Neuromorphic Winner-Take-All Circuit

**Description:** A 4 Neuron Head-Direction Cell using a Winner-Take-All Network using thyristor-based electronics spiking LIFs.

### What
A neuromorphic hardware implementation of a Head Direction (HD) cell using Winner-Take-All (WTA) neural networks with thyristor-based spiking neurons. Replicates the fruit fly's internal compass system—where only 8 neurons arranged in a ring maintain stable orientation tracking—using ultra-compact electronic circuits that consume power only during spike events.

### How
Designed thyristor-based Leaky Integrate-and-Fire (LIF) neurons using just three components: resistor (leak), capacitor (integration), and Silicon Controlled Rectifier (threshold/reset). Built modular PCBs for neurons and synapses (exponential/alpha types, excitatory/inhibitory modes) enabling scalable network assembly. Modeled WTA architectures (2, 4, 6, 8 neurons) in LTSpice with custom abstracted components, implementing self-excitation for activity bump stability and global inhibition for winner selection. Control neurons (CW/CCW) shift the bump around the ring by exciting neighboring direction-tuned populations.

### Result
Successfully validated WTA dynamics through LTSpice simulations showing stable activity bumps and smooth propagation during rotational updates. Demonstrated proof-of-concept on breadboard with 2-neuron WTA and Central Pattern Generator circuits. Designed production-ready modular PCBs with visual LED indicators, achieving biologically realistic spiking behavior (spike-frequency adaptation, refractory periods) using orders of magnitude fewer components than traditional LIF implementations.

### AI Usage
None. This was a 6-month fundamental research internship (July-December 2025) at Integrative Neuroscience & Cognition Center (INCC)/Centre National de Recherche Scientifique (CNRS) under CNRS Dr. Marcelo Rozenberg. Work involved deep literature review of neuroscience (EPG neurons, ring attractors, Drosophila central complex), analog electronics design, LTSpice circuit simulation, and hands-on hardware prototyping. All circuit designs, component abstractions, PCB schematics in KiCad, and experimental validation were manually developed through iterative research process combining computational neuroscience theory with practical electronics engineering.

---

## 16. YouTube Video Tracker

**Description:** A Firefox extension that automatically provides real-time progress tracking for educational content and courses.

### What
A lightweight Firefox extension that automatically tracks viewing progress across YouTube playlists and channels for educational content. Provides persistent visual progress indicators without user accounts or external servers, using browser local storage for privacy-focused tracking.

### How
Content script injection monitors YouTube's SPA navigation via MutationObserver and detects video completion through dual triggers: natural ending events and 90% threshold with continuous watch time validation. Batch storage reads fetch all tracking data in single call, using IntersectionObserver for virtual scrolling to render progress bars only for visible playlist items. Extracts playlist metadata through CSS selector chains and regex parsing of YouTube's dynamically generated HTML.

### Result
Delivered a lightweight extension with persistent per-video progress, fast playlist rendering through virtualization, and zero server dependencies. Published on Firefox Add-ons to support course and playlist tracking without accounts or sync.

### AI Usage (Vibe Coding)
This was a 2-hour experiment testing Claude Code (via Atlassian's Rovodev at the time) capabilities for rapid prototyping. Wanted a personal tool for tracking music playlists and course progress on YouTube but dislike frontend/web development. Entire extension generated through copy-pasting and yelling at the AI's outputs; architecture, DOM manipulation, storage logic, performance optimizations. Miserable experience workflow-wise, but functional result validated AI's capability for throwaway utility tools. Great tool I never made.

---

