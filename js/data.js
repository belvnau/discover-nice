/* =========================================================
   Places data in Nice + opening hours helper functions.
   Single source of truth used by Home, Explore, and Itinerary.
   Data collected October 2026; hours and prices subject to change.
   Map coordinates are approximate.
   ========================================================= */
(function () {
  "use strict";

  var DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  /* Build weekly schedule from day groups.
     week({ "1-5": ["09:00-12:00","14:00-18:00"], 6: [...], 7: [...] })
     Unlisted days are considered closed ([]). */
  function week(groups) {
    var out = {};
    Object.keys(groups).forEach(function (key) {
      var parts = String(key).split("-");
      var from = parseInt(parts[0], 10);
      var to = parts[1] ? parseInt(parts[1], 10) : from;
      for (var d = from; d <= to; d++) out[d] = groups[key];
    });
    return out;
  }

  /* Current month in Nice (1-12) for seasonal opening hours. */
  var M = parseInt(new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Paris", month: "numeric" }).format(new Date()), 10);
  var chagallClose = (M >= 5 && M <= 10) ? "18:00" : (M === 3 ? "16:30" : "17:00");
  var villaWinter = (M === 11 || M === 12 || M === 1);

  var PLACES = [
    {
      id: "vieux-nice",
      name: "Vieux Nice",
      category: "Culture & History",
      photo: "images/vieux-nice.jpg",
      alt: "Pastel alleys and historic architecture in Vieux Nice",
      summary: "Old town maze of narrow alleys and pastel facades, perfect for leisurely wandering.",
      description: "Vieux Nice is the historic heart of Nice: narrow streets, warm pastel buildings, bustling cafes, artisan boutiques, and ornate baroque churches. Nice only joined France in 1860, so its ambiance is an intoxicating blend of French charm and Italian flair. The best place to simply get lost without a map.",
      hoursType: "open-air",
      price: "Free",
      cost: 0,
      tips: ["Arrive early in the morning before crowds arrive.", "Wear comfortable shoes for the cobblestones."],
      lat: 43.6954, lng: 7.2757, popular: true
    },
    {
      id: "cours-saleya",
      name: "Cours Saleya Market",
      category: "Food & Shopping",
      photo: "images/cours-saleya.jpg",
      alt: "Cours Saleya market in old town Nice",
      summary: "Vibrant daily market for fresh produce, flowers, and warm socca pancakes.",
      description: "Daily open-air market in the heart of Vieux Nice packed with colorful fruit, vegetable, and fragrant flower stalls. Try hot socca, the iconic Niçois chickpea crepe. On Mondays, it transforms into an eclectic antique flea market.",
      hours: week({ 1: ["07:00-18:00"], "2-7": ["06:00-13:30"] }),
      dayNotes: { 1: "antique market" },
      price: "Free admission",
      cost: 0,
      tips: ["The food market is liveliest before noon.", "Mondays feature antique flea stalls instead of food."],
      lat: 43.6955, lng: 7.2754, popular: true
    },
    {
      id: "sainte-reparate",
      name: "Cathédrale Sainte-Réparate",
      category: "Culture & History",
      photo: "images/sainte-reparate.jpg",
      alt: "Cathédrale Sainte-Réparate at Place Rossetti, Vieux Nice",
      summary: "Charming 17th-century baroque cathedral set in lively Place Rossetti.",
      description: "Baroque cathedral in Place Rossetti, Old Nice, dedicated to the city's patron saint. After admiring the dome and interior, treat yourself to artisanal ice cream from Fenocchio across the square.",
      hours: week({ "1-5": ["09:00-12:00", "14:00-18:00"], 6: ["09:00-12:00", "14:00-19:30"], 7: ["09:00-13:00", "15:00-18:00"] }),
      price: "Free (check site)",
      cost: 0,
      tips: ["Hours may change during church services.", "Please dress respectfully."],
      lat: 43.6962, lng: 7.2751
    },
    {
      id: "puces-de-nice",
      name: "Puces de Nice",
      category: "Food & Shopping",
      photo: "images/puces-de-nice.webp",
      alt: "Vintage stalls at Puces de Nice flea market",
      summary: "Flea and antiques market by the old harbor, a vintage treasure trove.",
      description: "Antiques and flea market tucked near the harbor, ideal for hunting vintage curios, artwork, and retro posters. Winter operating hours apply from October through May.",
      hours: week({ "2-7": ["10:00-18:00"] }),
      price: "Free admission",
      cost: 0,
      tips: ["Closed on Mondays.", "Bring cash and bargain politely."],
      lat: 43.6958, lng: 7.2848
    },
    {
      id: "palais-lascaris",
      name: "Palais Lascaris",
      category: "Culture & History",
      photo: "images/palais-lascaris.jpg",
      alt: "Palais Lascaris on Rue Droite in Vieux Nice",
      summary: "17th-century baroque aristocratic mansion with historic musical instruments.",
      description: "A hidden baroque jewel on Rue Droite in Vieux Nice featuring frescoed ceilings, grand marble staircases, and a collection of rare historic musical instruments. Admission is around €5 to €6.20.",
      hours: week({ "1": ["10:00-18:00"], "3-7": ["10:00-18:00"] }),
      price: "Approx. €5 - €6.20",
      cost: 6,
      tips: ["Closed on Tuesdays."],
      lat: 43.6959, lng: 7.2762
    },
    {
      id: "musee-matisse",
      name: "Musée Matisse",
      category: "Culture & History",
      photo: "images/musee-matisse.jpg",
      alt: "Musée Matisse in the Cimiez district of Nice",
      summary: "Monographic museum of Henri Matisse's works set atop peaceful Cimiez hill.",
      description: "Housed in a 17th-century red Genoese villa surrounded by olive groves in Cimiez. Showcases the artistic evolution of Henri Matisse, who spent much of his life in Nice.",
      hours: week({ "1": ["10:00-18:00"], "3-7": ["10:00-18:00"] }),
      price: "€12",
      cost: 12,
      tips: ["Closed on Tuesdays.", "Located on Cimiez hill; easily reachable by bus from central Nice."],
      lat: 43.7197, lng: 7.2766
    },
    {
      id: "tram-t1",
      name: "Tram T1 & Transit Tickets",
      category: "Transport",
      photo: "images/tram-nice.jpg",
      alt: "Tram T1 gliding through downtown Nice",
      summary: "Nice trams and buses share the same unified ticketing network.",
      description: "Operated by Lignes d'Azur, Nice's trams and local buses use unified tickets. Tickets cannot be bought on board the tram, so purchase them at platform vending machines or via the official app.",
      hoursType: "none",
      price: "From €1.70",
      cost: 0,
      steps: [
        "Head to the Masséna tram station at Place Masséna.",
        "Purchase a rechargeable 'La Carte' card and ticket at the automated platform machine.",
        "Board Tram T1 and tap to validate your ticket inside the tram.",
        "Alight at Liberation station, with Gare du Sud just across the street."
      ],
      fares: [
        "Single journey: €1.70 (includes 74-minute transfer window)",
        "1-Day Pass: €7",
        "2-Day Pass: €13",
        "7-Day Pass: €20",
        "Rechargeable 'La Carte' card: €2 (refundable)"
      ],
      tips: ["Transit fares are excluded from itinerary cost estimates."],
      lat: 43.6969, lng: 7.2711
    },
    {
      id: "petit-train-nice",
      name: "Petit Train de Nice",
      category: "Transport",
      photo: "images/petit-train-nice.jpg",
      alt: "Petit Train de Nice electric tourist train along Promenade des Anglais",
      summary: "Electric tourist train touring the city, stopping atop Castle Hill.",
      description: "Electric tourist train touring central Nice with multi-language audio commentary (8 languages). Offers city circuit and Château circuit options with a photo pause at the top of Colline du Château. Departs from Jardin Albert 1er.",
      hoursType: "check",
      hoursNote: "Full schedule (10:00 - 18:00 hourly except 13:00) runs April 5 - September 30. During off-season, check francevoguette.fr. Purchase tickets at the departure kiosk before boarding.",
      price: "Adults €12, Children (4-12) €5-6",
      cost: 12,
      tips: [
        "Tour lasts about 45-50 minutes.",
        "Children under 4 ride free. Family passes available.",
        "The Château tour pauses for 10-15 minutes at the summit for photos."
      ],
      lat: 43.6950, lng: 7.2680
    },
    {
      id: "gare-du-sud",
      name: "Gare du Sud",
      category: "Food & Shopping",
      photo: "images/gare-du-sud.jpg",
      alt: "Gare du Sud, former railway station transformed into a food hall",
      summary: "Historic glass-vaulted train station transformed into a modern food hall.",
      description: "A former 1892 train station reimagined into a lively gourmet food hall with diverse food stalls, cocktail bars, and vintage shops. Catch Tram T1 and hop off at Liberation.",
      hours: week({ "1-7": ["11:00-23:00"] }),
      hoursNote: "Hours vary around 11:00 - 23:00. Check lagaredusud.com for current schedule.",
      price: "Free admission",
      cost: 0,
      tips: ["Great spot for lunch or casual dinner.", "Check the official website for event nights."],
      lat: 43.7036, lng: 7.2573, popular: true
    },
    {
      id: "colline-du-chateau",
      name: "Colline du Château (Castle Hill)",
      category: "Sights & Views",
      photo: "images/colline-du-chateau.jpg",
      alt: "Panoramic sea and city views from Colline du Château",
      summary: "Hilltop park with iconic vistas over the bay, city, and a free elevator.",
      description: "Take the free elevator or walk up the winding steps to Castle Hill for Nice's signature postcard viewpoint of the Baie des Anges and port. Relax by the man-made cascade waterfall.",
      hoursType: "check",
      hoursNote: "Open daily according to seasonal park gate hours.",
      price: "Free (free elevator included)",
      cost: 0,
      tips: ["Spectacular during golden hour before sunset.", "Bring a bottle of water for walking the stairs."],
      lat: 43.6951, lng: 7.2810, popular: true
    },
    {
      id: "place-massena",
      name: "Place Masséna",
      category: "Culture & History",
      photo: "images/place-massena.jpg",
      alt: "Place Masséna, Nice's vibrant main plaza",
      summary: "Grand central square with neoclassical red facades and checkerboard pavement.",
      description: "Nice's grand public square paved with black and white tiles, framed by striking red neoclassical facades and Jaume Plensa's illuminated statues representing the continents.",
      hoursType: "open-air",
      price: "Free",
      cost: 0,
      tips: ["Magical at dusk and evening when the statues glow with changing colors."],
      lat: 43.6969, lng: 7.2711
    },
    {
      id: "i-love-nice",
      name: "“I ♥ Nice” Landmark",
      category: "Sights & Views",
      photo: "images/i-love-nice.webp",
      alt: "I Love Nice sign overlooking the Mediterranean sea",
      summary: "Iconic photo point at Quai Rauba Capèu overlooking the azure sea.",
      description: "Giant colorful '#ILoveNICE' lettering set at Quai Rauba Capèu against the deep blue sea. The quintessential souvenir photo stop.",
      hoursType: "open-air",
      price: "Free",
      cost: 0,
      tips: ["Best saved for late afternoon along with souvenir shopping."],
      lat: 43.6940, lng: 7.2850
    },
    {
      id: "monaco",
      name: "Monaco (Monte Carlo)",
      category: "Day Trips",
      photo: "images/monaco.avif",
      alt: "Monaco skyline and luxury yacht harbor",
      summary: "Glamorous principality perched along the coast, 25 minutes by train.",
      description: "Glittering Mediterranean microstate famed for luxury yacht marinas, the grand Casino de Monte-Carlo, Prince's Palace, and Formula 1 Grand Prix street circuit.",
      hoursType: "none",
      price: "Transit fares not included",
      cost: 0,
      tips: ["Regular TER regional trains run every 15-30 minutes from Nice-Ville."],
      lat: 43.7384, lng: 7.4246
    },
    {
      id: "eze",
      name: "Èze Village",
      category: "Day Trips",
      photo: "images/eze.avif",
      alt: "Medieval hilltop village of Èze",
      summary: "Medieval eagle's-nest village perched high on a cliff above the sea.",
      description: "Perched 427 meters above the Mediterranean, this fairy-tale village features winding stone paths, boutique craft studios, and an exotic cactus garden at the fortress ruins.",
      hoursType: "none",
      price: "Transit fares not included",
      cost: 0,
      tips: ["Wear sturdy walking shoes for steep, cobblestone paths."],
      lat: 43.7270, lng: 7.3620
    },
    {
      id: "cannes",
      name: "Cannes",
      category: "Day Trips",
      photo: "images/cannes.avif",
      alt: "Palms along the seaside promenade in Cannes",
      summary: "Chic seaside resort world-famous for its annual international film festival.",
      description: "World capital of cinema boasting the palm-fringed Boulevard de la Croisette, sandy private beaches, luxury boutiques, and the historic Le Suquet old quarter.",
      hoursType: "none",
      price: "Transit fares not included",
      cost: 0,
      tips: ["Direct 30-minute train ride from Nice-Ville station."],
      lat: 43.5528, lng: 7.0174
    },
    {
      id: "saint-paul-de-vence",
      name: "Saint-Paul-de-Vence",
      category: "Day Trips",
      photo: "images/saint-paul-de-vence.avif",
      alt: "Ramparts and stone alleyways of Saint-Paul-de-Vence",
      summary: "Walled medieval hill town famous for art galleries and cobblestone alleys.",
      description: "Walled medieval hilltop village celebrated as a haven for artists like Chagall, Miró, and Prévert. Filled with contemporary art galleries and panoramic terrace views.",
      hoursType: "none",
      price: "Transit fares not included",
      cost: 0,
      tips: ["Accessible by local bus from Nice or Cagnes-sur-Mer."],
      lat: 43.6959, lng: 7.1226
    },
    {
      id: "promenade-des-anglais",
      name: "Promenade des Anglais",
      category: "Sights & Views",
      photo: "images/promenade-des-anglais.jpg",
      alt: "Promenade des Anglais with palm trees along the Nice coastline",
      summary: "World-famous 7 km seaside promenade framed by palm trees and blue chairs.",
      description: "Nice's legendary seaside boulevard stretching 7 km along the Baie des Anges. Lined with graceful palm trees, dedicated cycling lanes, and the iconic blue chairs facing the waves.",
      hoursType: "open-air",
      price: "Free",
      cost: 0,
      tips: ["Unbeatable at sunset when the light turns amber.", "Rent a bike or rollerblades to explore the full promenade."],
      lat: 43.6948, lng: 7.2590
    },
    {
      id: "port-lympia",
      name: "Port Lympia (Old Port)",
      category: "Sights & Views",
      photo: "images/port-lympia.jpg",
      alt: "Port Lympia harbor with colorful Genoese architecture and boats",
      summary: "Historic harbor lined with warm Genoese buildings, cafes, and yachts.",
      description: "Nice's historic port bordered by ochre and Venetian-red buildings, traditional wooden 'pointu' fishing boats, sleek yachts, and lively quayside seafood restaurants.",
      hoursType: "open-air",
      price: "Free",
      cost: 0,
      tips: ["Terrific golden hour photography.", "Easily paired with Castle Hill and Puces de Nice."],
      lat: 43.6955, lng: 7.2850
    },
    {
      id: "mont-boron",
      name: "Parc du Mont Boron",
      category: "Sights & Views",
      photo: "images/mont-boron.jpg",
      alt: "Panoramic sea view from Mont Boron hill",
      summary: "Tranquil hilltop forest park featuring hiking trails and panoramic sea vistas.",
      description: "A 57-hectare wooded Mediterranean park on the eastern ridge of Nice, offering shaded trails, pine forests, and breathtaking panoramic lookouts over Nice and Villefranche bay.",
      hoursType: "open-air",
      hoursNote: "Open daily year-round without fixed closing times.",
      price: "Free",
      cost: 0,
      tips: ["Wear walking shoes for the incline trails.", "Bring drinking water and a light snack."],
      lat: 43.6935, lng: 7.2990
    },
    {
      id: "musee-chagall",
      name: "Musée National Marc Chagall",
      category: "Culture & History",
      photo: "images/musee-chagall.jpg",
      alt: "Musée National Marc Chagall in Nice",
      summary: "National museum housing Marc Chagall's masterly Biblical Message paintings.",
      description: "Created in the artist's lifetime to house the monumental Biblical Message series. Set in a quiet garden in Cimiez, this serene museum is bathed in natural light through Chagall's stained glass windows.",
      hours: week({ "1": ["10:00-13:00", "14:30-" + chagallClose], "3-7": ["10:00-13:00", "14:30-" + chagallClose] }),
      hoursNote: "Nov 1 - Apr 30 closes at 17:00 (March 16:30); May 2 - Oct 31 closes at 18:00. Closed Jan 1, May 1, and Dec 25. Last ticket entry 30 mins before closing.",
      price: "€10 (€8 concessions; €12 during special exhibitions). Free 1st Sunday of every month & for under 18s",
      cost: 10,
      tips: ["Closed on Tuesdays.", "Easily combined with Musée Matisse in Cimiez.", "Free entry on the first Sunday of each month."],
      lat: 43.7087, lng: 7.2692
    },
    {
      id: "basilique-notre-dame",
      name: "Basilique Notre-Dame de l'Assomption",
      category: "Culture & History",
      photo: "images/basilique-notre-dame.jpg",
      alt: "Basilique Notre-Dame de l'Assomption twin square towers",
      summary: "Striking neo-Gothic basilica with twin square towers on Avenue Jean Médecin.",
      description: "The largest Catholic church in Nice, built between 1864 and 1868 in grand neo-Gothic style with twin 65-meter towers and brilliant rose stained-glass windows.",
      hoursType: "check",
      hoursNote: "Visiting hours subject to religious services. Check notredame-nice.com or stop by during daytime.",
      price: "Free entry",
      cost: 0,
      tips: ["Please dress respectfully.", "A quick 15-minute visit fits easily into a central walking tour."],
      lat: 43.7011, lng: 7.2630
    },
    {
      id: "saint-nicolas",
      name: "Cathédrale Saint-Nicolas",
      category: "Culture & History",
      photo: "images/saint-nicolas.jpg",
      alt: "Russian Orthodox Saint-Nicolas Cathedral with colorful onion domes",
      summary: "Spectacular Russian Orthodox cathedral with colorful onion domes and gilded icons.",
      description: "The largest Russian Orthodox cathedral outside Russia, recognized as a French national monument. Its colorful onion domes, ornate brickwork, and rich iconostasis offer a striking architectural contrast to the French Riviera.",
      hoursType: "check",
      hoursNote: "Generally open Mon-Sat 09:00-12:30 & 14:00-18:00, Sun 13:00-18:00. Subject to change during religious services.",
      price: "Approx. €5 self-guided or €10 guided (check at desk)",
      cost: 5,
      tips: ["Strict dress code: shoulders and knees must be covered.", "No tank tops or swimwear.", "Verify hours on site before visiting."],
      lat: 43.7046, lng: 7.2530
    },
    {
      id: "villa-ephrussi",
      name: "Villa Ephrussi de Rothschild",
      category: "Day Trips",
      photo: "images/villa-ephrussi.jpg",
      alt: "Villa Ephrussi de Rothschild pink mansion and gardens overlooking the sea",
      summary: "Béatrice de Rothschild's pink Belle Époque villa and nine themed gardens.",
      description: "A rose-colored Belle Époque palace set on Saint-Jean-Cap-Ferrat, boasting nine themed landscaped gardens (French, Japanese, Florentine, rose garden) with sweeping views of the Mediterranean.",
      hours: villaWinter
        ? week({ "1-5": ["10:00-16:30"], "6-7": ["10:00-18:00"] })
        : week({ "1-7": ["10:00-" + (M === 7 || M === 8 ? "19:00" : "18:00")] }),
      hoursNote: "Nov 2 - Jan 31: 10:00-16:30 (weekends/holidays until 18:00). Feb 1 - Nov 1: 10:00-18:00 (July-August until 19:00). Free for children under 7.",
      price: "Around €17 (free for under 7s; transit not included)",
      cost: 0,
      tips: ["Book tickets online ahead of time.", "Take bus 15 from Nice towards Port de Saint-Jean.", "Check special closure dates before departing."],
      lat: 43.6905, lng: 7.3310
    },
    {
      id: "villefranche-sur-mer",
      name: "Villefranche-sur-Mer",
      category: "Day Trips",
      photo: "images/villefranche-sur-mer.jpg",
      alt: "Colorful seaside houses of Villefranche-sur-Mer",
      summary: "Charming coastal town with pastel houses along a sheltered deep-water bay.",
      description: "A picturesque coastal village just one train stop east of Nice. Known for its 14th-century citadel, hidden covered street (Rue Obscure), calm pebbled beach, and waterfront bistros.",
      hoursType: "none",
      price: "Transit fares not included",
      cost: 0,
      tips: ["Only 7 minutes by TER train or 20 minutes by bus 15/607 from Nice."],
      lat: 43.7040, lng: 7.3110
    },
    {
      id: "fenocchio",
      name: "Glacier Fenocchio",
      category: "Food & Shopping",
      photo: "images/fenocchio.jpg",
      alt: "Fenocchio artisanal ice cream parlor at Place Rossetti",
      summary: "Legendary ice cream parlor with nearly 100 flavors in the heart of Old Nice.",
      description: "Founded in 1966 on Place Rossetti, Fenocchio is a Riviera institution. Choose from almost 100 ice cream and sorbet flavors ranging from classic pistachio and salted caramel to wild local botanical flavors like lavender, rose, rosemary, and thyme.",
      hours: week({ "1-7": ["10:00-23:30"] }),
      price: "From €2.50 - €3 per scoop",
      cost: 0,
      tips: ["Queues can be long on summer evenings.", "Try distinctive Riviera flavors like lavender (lavande) or orange blossom (fleur d'oranger)."],
      lat: 43.6974, lng: 7.2764
    },
    {
      id: "chez-pipo",
      name: "Chez Pipo",
      category: "Food & Shopping",
      photo: "images/chez-pipo.webp",
      alt: "Plate of hot authentic Niçois socca at Chez Pipo",
      summary: "Legendary eatery since 1923, the ultimate shrine to authentic wood-fired socca.",
      description: "Established in 1923 near Port Lympia, Chez Pipo is Nice's most storied culinary institution. Celebrated for crispy, piping-hot socca baked in traditional wood-fired ovens.",
      hours: week({ "3-7": ["11:30-14:30", "17:30-22:00"] }),
      price: "Dishes from €3 - €8",
      cost: 0,
      tips: ["Closed on Mondays and Tuesdays.", "Eat immediately while hot with a fresh sprinkle of ground black pepper."],
      lat: 43.6983, lng: 7.2842
    },
    {
      id: "tram-t2",
      name: "Tram T2 (Airport – Port Lympia)",
      category: "Transport",
      photo: "images/tram-t2.jpg",
      alt: "Tram T2 connecting Nice Airport to the city center and port",
      summary: "Express direct tram linking Nice Airport to city center and Port Lympia.",
      description: "Lignes d'Azur Tram T2 connects Terminal 1 & 2 of Nice Côte d'Azur Airport directly into the city center (Jean Médecin) and Port Lympia underground without traffic delays.",
      hoursType: "none",
      price: "From €1.70 (or airport pass €10 return)",
      cost: 0,
      steps: [
        "Exit Airport Terminal 1 or 2 following signs to the tram station.",
        "Purchase a rechargeable 'La Carte' and ticket from the platform machine.",
        "Board Tram T2 bound for Port Lympia.",
        "Alight at Jean Médecin for shopping and transfers, or Port Lympia for the harbor."
      ],
      fares: [
        "Standard fare: €1.70 (includes 74-minute transfer window)",
        "Airport return pass: approx. €10",
        "Validate ticket immediately upon boarding"
      ],
      tips: ["Travel time from airport to downtown is just 25-30 minutes.", "Transit costs are excluded from itinerary estimates."],
      lat: 43.6653, lng: 7.2150
    },
    {
      id: "menton",
      name: "Menton",
      category: "Day Trips",
      photo: "images/menton.jpg",
      alt: "Menton old town and pastel beach promenade",
      summary: "Sunny lemon capital on the Italian border with pastel facades and calm bays.",
      description: "Nicknamed the 'Pearl of France', Menton enjoys the warmest microclimate on the French Riviera. Nestled right against Italy, it offers pastel-painted historic houses, exotic botanical gardens, and the famous annual Lemon Festival.",
      hoursType: "none",
      price: "Transit fares not included",
      cost: 0,
      tips: ["Around 35 minutes on the TER train from Nice-Ville station.", "Sample artisan limoncello and citrus delicacies in the old town."],
      lat: 43.7745, lng: 7.5046
    },
    {
      id: "antibes",
      name: "Antibes",
      category: "Day Trips",
      photo: "images/antibes.jpg",
      alt: "Historic coastal ramparts and old town in Antibes",
      summary: "Walled seaside town with the Picasso Museum and luxury yacht marina.",
      description: "Blending maritime heritage and high art, Antibes is surrounded by 16th-century sea ramparts engineered by Vauban. Highlights include the Picasso Museum in Château Grimaldi and Port Vauban, Europe's largest yacht marina.",
      hoursType: "none",
      price: "Transit fares not included",
      cost: 0,
      tips: ["Only 15-20 minutes west by TER train from Nice.", "Visit the vibrant Marché Provençal morning food market."],
      lat: 43.5804, lng: 7.1251
    },
    {
      id: "parc-phoenix",
      name: "Parc Phoenix",
      category: "Sights & Views",
      photo: "images/parc-phoenix.jpg",
      alt: "Giant greenhouse and botanical gardens at Parc Phoenix",
      summary: "7-hectare botanical and zoological park with a giant tropical greenhouse.",
      description: "A 7-hectare park in western Nice featuring one of Europe's largest tropical greenhouses ('The Green Diamond'). Home to thousands of rare plant species, flamingos, tortoises, and tranquil ponds.",
      hours: week({ "1-7": ["09:30-18:00"] }),
      hoursNote: "Open daily. Hours extend to 19:30 during summer season (April - October).",
      price: "Around €5.20 (free for children under 12)",
      cost: 5,
      tips: ["Take Tram T2 toward the airport, get off at Parc Phoenix station.", "Family-friendly and a wonderful break from the bustle of the city."],
      lat: 43.6685, lng: 7.2183
    },
    {
      id: "jardin-albert",
      name: "Jardin Albert 1er",
      category: "Sights & Views",
      photo: "images/jardin-albert.jpg",
      alt: "Jardin Albert 1er park with palm trees and the Arc de Venet sculpture",
      summary: "Nice's oldest public park connecting Place Masséna and the seaside.",
      description: "Inaugurated in the 19th century, Jardin Albert 1er is Nice's oldest public park. Located right between Place Masséna and Promenade des Anglais, with palm alleys, fountains, and Bernar Venet's landmark 19-meter curved steel arch.",
      hoursType: "open-air",
      price: "Free",
      cost: 0,
      tips: ["Departure point for the Petit Train de Nice.", "Often hosts open-air summer concerts and festivals."],
      lat: 43.6961, lng: 7.2687
    },
    {
      id: "opera-de-nice",
      name: "Opéra de Nice",
      category: "Culture & History",
      photo: "images/opera-de-nice.webp",
      alt: "Neoclassical facade of Opéra de Nice near the sea",
      summary: "Historic 19th-century opera house in Old Nice near the waterfront.",
      description: "The city's premier opera hall, rebuilt in 1885 in lavish neoclassical style with an Italian horseshoe auditorium and painted ceiling frescoes. Located steps from the beach and Cours Saleya.",
      hoursType: "check",
      hoursNote: "Interior access depends on scheduled performances. Box office open Tue-Sat 10:00-18:00.",
      price: "Performance ticket required / check site",
      cost: 0,
      tips: ["The exterior facade is wonderfully photogenic for classical architecture lovers.", "Check opera and ballet schedules online if you wish to see the grand hall."],
      lat: 43.6953, lng: 7.2725
    }
  ];

  var CATEGORIES = ["Culture & History", "Sights & Views", "Food & Shopping", "Day Trips", "Transport"];

  /* Gallery "Moments in Nice" */
  var GALLERY = [
    { src: "images/hero-nice.jpg", alt: "Baie des Anges and Promenade des Anglais in Nice", caption: "Baie des Anges & Promenade des Anglais" },
    { src: "images/gare-du-sud.jpg", alt: "Gare du Sud, former railway station transformed into a food hall", caption: "Gare du Sud", place: "gare-du-sud" },
    { src: "images/cours-saleya.jpg", alt: "Cours Saleya market in old town Nice", caption: "Cours Saleya Market", place: "cours-saleya" },
    { src: "images/tram-nice.jpg", alt: "Tram T1 crossing central Nice", caption: "Tram T1 in City Center", place: "tram-t1" },
    { src: "images/eze.avif", alt: "Hilltop village of Èze", caption: "Èze Village", place: "eze" },
    { src: "images/vieux-nice.jpg", alt: "Pastel alleys in Vieux Nice", caption: "Vieux Nice Alleys", place: "vieux-nice" },
    { src: "images/colline-du-chateau.jpg", alt: "View from Colline du Château", caption: "Colline du Château", place: "colline-du-chateau" },
    { src: "images/i-love-nice.webp", alt: "I Love Nice sign", caption: "I ♥ Nice Landmark", place: "i-love-nice" },
    { src: "images/saint-paul-de-vence.avif", alt: "Alleys of Saint-Paul-de-Vence", caption: "Saint-Paul-de-Vence", place: "saint-paul-de-vence" },
    { src: "images/place-massena.jpg", alt: "Place Masséna square", caption: "Place Masséna", place: "place-massena" },
    { src: "images/cannes.avif", alt: "Seaside promenade in Cannes", caption: "Cannes Coastline", place: "cannes" },
    { src: "images/monaco.avif", alt: "View of Monaco harbor", caption: "Monaco Harbor", place: "monaco" }
  ];

  /* ---------- Opening hours helper functions ---------- */
  function toMin(hhmm) {
    var p = hhmm.split(":");
    return parseInt(p[0], 10) * 60 + parseInt(p[1], 10);
  }

  function fmtTime(hhmm) { return hhmm.replace(":", "."); }

  function fmtRanges(ranges) {
    return ranges.map(function (r) {
      var p = r.split("-");
      return fmtTime(p[0]) + " – " + fmtTime(p[1]);
    }).join(" & ");
  }

  /* Current time in Nice (Europe/Paris timezone). */
  function nowInNice() {
    var parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Paris", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false
    }).formatToParts(new Date());
    function get(t) { return parts.filter(function (p) { return p.type === t; })[0].value; }
    var map = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };
    var hh = parseInt(get("hour"), 10);
    if (hh === 24) hh = 0;
    var mm = parseInt(get("minute"), 10);
    return { dow: map[get("weekday")], minutes: hh * 60 + mm, text: DAYS[map[get("weekday")] - 1] + ", " + ("0" + hh).slice(-2) + "." + ("0" + mm).slice(-2) };
  }

  /* Opening status: {state: open|closed|outdoor|check|none, label} */
  function openStatus(place) {
    if (place.hoursType === "none") return { state: "none", label: "" };
    if (place.hoursType === "open-air") return { state: "outdoor", label: "Open-air" };
    if (place.hoursType === "check" || !place.hours) return { state: "check", label: "Check hours" };
    var now = nowInNice();
    var ranges = place.hours[now.dow] || [];
    for (var i = 0; i < ranges.length; i++) {
      var p = ranges[i].split("-");
      if (now.minutes >= toMin(p[0]) && now.minutes < toMin(p[1])) return { state: "open", label: "Open now" };
    }
    return { state: "closed", label: "Closed" };
  }

  /* Opening hours rows grouped by consecutive days. */
  function hoursRows(place) {
    if (!place.hours) return [];
    var rows = [];
    var note = place.dayNotes || {};
    for (var d = 1; d <= 7; d++) {
      var r = place.hours[d] || [];
      var text = r.length ? fmtRanges(r) : "Closed";
      if (note[d]) text += " (" + note[d] + ")";
      var last = rows[rows.length - 1];
      if (last && last.text === text && last.to === d - 1) { last.to = d; }
      else rows.push({ from: d, to: d, text: text });
    }
    return rows.map(function (r) {
      var label = r.from === r.to ? DAYS[r.from - 1] : DAYS[r.from - 1] + " – " + DAYS[r.to - 1];
      return { hari: label, jam: r.text };
    });
  }

  function placeById(id) {
    for (var i = 0; i < PLACES.length; i++) if (PLACES[i].id === id) return PLACES[i];
    return null;
  }

  window.NICE = window.NICE || {};
  window.NICE.data = {
    PLACES: PLACES, CATEGORIES: CATEGORIES, GALLERY: GALLERY, DAYS: DAYS,
    placeById: placeById, openStatus: openStatus, hoursRows: hoursRows, nowInNice: nowInNice
  };
})();
