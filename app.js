// JavaScript du jeu de décomposition des nombres avec drag and drop

// Améliorer l'expérience tactile sur les appareils mobiles
function enhanceTouchExperience() {
  // Empêcher le zoom sur double-tap pour iOS
  document.addEventListener(
    "touchend",
    function (e) {
      const now = Date.now();
      const DOUBLE_TAP_DELAY = 300;

      if (now - lastTap < DOUBLE_TAP_DELAY) {
        e.preventDefault();
      }
      lastTap = now;
    },
    false
  );

  // Gérer le scroll lors du glisser-déposer sur mobile
  const dragElements = document.querySelectorAll(".digit");
  dragElements.forEach((el) => {
    el.addEventListener(
      "touchmove",
      function (e) {
        // Empêcher le scroll de page pendant le drag sur mobile
        e.preventDefault();
      },
      { passive: false }
    );
  });
}

// Variable pour détecter le double tap
let lastTap = 0;

document.addEventListener("DOMContentLoaded", () => {
  enhanceTouchExperience();

  // Variables globales
  let nombreActuel = 0;
  let score = 0;
  let tentatives = 0;
  let digitElements = [];

  // Éléments du DOM
  const randomNumberElement = document.getElementById("randomNumber");
  const digitContainer = document.getElementById("digitContainer");
  const verifierBtn = document.getElementById("verifierBtn");
  const nouveauBtn = document.getElementById("nouveauBtn");
  const resultatElement = document.getElementById("resultat");
  const scoreElement = document.getElementById("score");
  const tentativesElement = document.getElementById("tentatives");
  const confettiContainer = document.getElementById("confettiContainer");
  const dropZones = document.querySelectorAll(".drop-zone");

  // Fonction pour générer un nombre aléatoire entre 1 et 9999 (sans zéros en tête)
  function genererNombreAleatoire() {
    // Générer un nombre entre 1 et 9999 pour éviter les zéros en tête
    return Math.floor(Math.random() * 9999) + 1;
  }

  // Fonction pour créer les éléments de chiffre glissables
  function creerElementsChiffres(nombre) {
    // Vider le conteneur
    digitContainer.innerHTML = "";
    digitElements = [];

    // Convertir le nombre en chaîne de caractères (sans padStart pour éviter les zéros en tête)
    const nombreString = nombre.toString();
    const chiffresOriginaux = nombreString.split("");

    // Déterminer combien de cellules doivent être visibles selon le nombre de chiffres
    const nombreDeChiffres = nombreString.length;

    // N'afficher que les cellules nécessaires selon le nombre de chiffres
    ajusterAffichageTableau(nombreDeChiffres);

    // Créer un ensemble de chiffres avec des distracteurs
    let tousLesChiffres = [...chiffresOriginaux]; // Commencer par les chiffres originaux

    // Ajouter des chiffres aléatoires comme distracteurs (2-4 chiffres supplémentaires)
    const nombreDeDistracteurs = Math.floor(Math.random() * 3) + 2; // 2 à 4 distracteurs
    for (let i = 0; i < nombreDeDistracteurs; i++) {
      const chiffreAleatoire = Math.floor(Math.random() * 10).toString();
      tousLesChiffres.push(chiffreAleatoire);
    }

    // Mélanger tous les chiffres pour une présentation aléatoire
    for (let i = tousLesChiffres.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tousLesChiffres[i], tousLesChiffres[j]] = [
        tousLesChiffres[j],
        tousLesChiffres[i],
      ];
    }

    // Organiser les chiffres en grille (pour un meilleur affichage si nombreux)
    const conteneurGrille = document.createElement("div");
    conteneurGrille.className = "digit-grid";
    digitContainer.appendChild(conteneurGrille);

    // Créer un élément pour chaque chiffre
    tousLesChiffres.forEach((chiffre, index) => {
      const digitElement = document.createElement("div");
      digitElement.className = "digit";
      digitElement.textContent = chiffre;
      digitElement.setAttribute("draggable", true);
      digitElement.setAttribute("data-digit", chiffre);
      digitElement.id = `digit-${index}`;

      // Événements de drag and drop
      digitElement.addEventListener("dragstart", dragStart);
      // Double-clic pour retourner à la position initiale
      digitElement.addEventListener("dblclick", returnToContainer);

      conteneurGrille.appendChild(digitElement);
      digitElements.push(digitElement);
    });
  }

  // Fonction pour ajuster l'affichage du tableau selon le nombre de chiffres
  function ajusterAffichageTableau(nombreDeChiffres) {
    // On cache toutes les cellules d'en-tête et de drop d'abord
    document
      .querySelectorAll(".milliers-header, #drop-milliers")
      .forEach((el) => {
        el.style.display = nombreDeChiffres >= 4 ? "flex" : "none";
      });

    document
      .querySelectorAll(".centaines-header, #drop-centaines")
      .forEach((el) => {
        el.style.display = nombreDeChiffres >= 3 ? "flex" : "none";
      });

    document
      .querySelectorAll(".dizaines-header, #drop-dizaines")
      .forEach((el) => {
        el.style.display = nombreDeChiffres >= 2 ? "flex" : "none";
      });

    // Les unités sont toujours visibles
  }

  // Fonction pour retourner un chiffre au conteneur
  function returnToContainer(e) {
    // Vérifier si le chiffre est dans une zone de drop
    if (e.target.parentElement.classList.contains("drop-zone")) {
      // Récupérer la zone de drop parente
      const dropZone = e.target.parentElement;

      // Retirer la classe "filled" de la zone
      dropZone.classList.remove("filled");

      // Rendre l'élément à nouveau draggable (au cas où)
      e.target.setAttribute("draggable", true);

      // Réinitialiser le style
      e.target.style.transform = "none";

      // Déplacer le chiffre vers le conteneur de grille
      const grilleContainer = document.querySelector(".digit-grid");
      if (grilleContainer) {
        grilleContainer.appendChild(e.target);
      } else {
        // Si la grille n'existe pas pour une raison quelconque, revenir à l'ancien comportement
        digitContainer.appendChild(e.target);
      }
    }
  }

  // Fonction pour mettre à jour l'affichage du nombre
  function mettreAJourNombre() {
    nombreActuel = genererNombreAleatoire();
    randomNumberElement.textContent = nombreActuel.toString(); // Sans padStart

    // Créer les éléments de chiffres glissables
    creerElementsChiffres(nombreActuel);

    // Réinitialiser les zones de dépôt
    dropZones.forEach((zone) => {
      zone.innerHTML = "";
      zone.classList.remove("filled");
    });

    // Cacher le résultat
    resultatElement.classList.add("hidden");
  }

  // Fonctions pour le drag and drop
  function dragStart(e) {
    e.dataTransfer.setData("text/plain", e.target.id);
    setTimeout(() => {
      e.target.classList.add("dragging");
    }, 0);
  }

  // Initialiser les événements pour les zones de dépôt
  function initDropZones() {
    dropZones.forEach((zone) => {
      zone.addEventListener("dragover", (e) => {
        e.preventDefault();
        zone.classList.add("highlight");
      });

      zone.addEventListener("dragleave", () => {
        zone.classList.remove("highlight");
      });

      zone.addEventListener("drop", (e) => {
        e.preventDefault();
        zone.classList.remove("highlight");

        // Récupérer l'élément glissé
        const id = e.dataTransfer.getData("text/plain");
        const draggedElement = document.getElementById(id);

        // Si la zone contient déjà un chiffre, échanger les positions
        if (zone.querySelector(".digit")) {
          // Récupérer le chiffre déjà présent
          const existingDigit = zone.querySelector(".digit");

          // Le renvoyer au conteneur
          existingDigit.setAttribute("draggable", true);
          digitContainer.appendChild(existingDigit);
        }

        // Ajouter le chiffre à la zone de dépôt
        draggedElement.classList.remove("dragging");
        zone.appendChild(draggedElement);
        zone.classList.add("filled");

        // Garder l'élément draggable pour permettre de le déplacer à nouveau
        draggedElement.setAttribute("draggable", true);
      });
    });
  }

  // Fonction pour vérifier la réponse
  function verifierReponse() {
    // Convertir le nombre actuel en chaîne pour obtenir sa longueur
    const nombreActuelString = nombreActuel.toString();
    const longueurNombre = nombreActuelString.length;

    // Vérifier si toutes les zones visibles sont remplies
    const zonesVisibles = [...dropZones].filter(
      (zone) => zone.style.display !== "none"
    );
    if (zonesVisibles.some((zone) => !zone.querySelector(".digit"))) {
      alert("Place tous les chiffres dans le tableau avant de vérifier !");
      return;
    }

    // Récupérer les chiffres placés uniquement dans les zones visibles
    let chiffresCombines = "";
    if (longueurNombre >= 4) {
      chiffresCombines += dropZones[0].querySelector(".digit").textContent;
    }
    if (longueurNombre >= 3) {
      chiffresCombines += dropZones[1].querySelector(".digit").textContent;
    }
    if (longueurNombre >= 2) {
      chiffresCombines += dropZones[2].querySelector(".digit").textContent;
    }
    // Les unités sont toujours incluses
    chiffresCombines += dropZones[3].querySelector(".digit").textContent;

    // Calculer le nombre décomposé
    const nombreDecompose = parseInt(chiffresCombines);

    // Incrémenter le compteur de tentatives
    tentatives++;
    tentativesElement.textContent = tentatives;

    // Vérifier si la réponse est correcte
    if (nombreDecompose === nombreActuel) {
      // Réponse correcte
      score++;
      scoreElement.textContent = score;

      resultatElement.textContent = "Bravo ! C'est correct ! 🎉";
      resultatElement.classList.remove("hidden", "text-red-600");
      resultatElement.classList.add("text-green-600");

      // Animer les cellules correctes
      dropZones.forEach((zone) => {
        zone.classList.add("correct");
        setTimeout(() => {
          zone.classList.remove("correct");
        }, 1000);
      });

      // Afficher les confettis
      creerConfettis();

      // Générer un nouveau nombre après 3 secondes
      setTimeout(mettreAJourNombre, 3000);
    } else {
      // Réponse incorrecte
      resultatElement.textContent = "Ce n'est pas correct. Essaie encore ! 🤔";
      resultatElement.classList.remove("hidden", "text-green-600");
      resultatElement.classList.add("text-red-600");

      // Animer les cellules incorrectes
      dropZones.forEach((zone) => {
        zone.classList.add("incorrect");
        setTimeout(() => {
          zone.classList.remove("incorrect");
        }, 500);
      });

      // Après 3 tentatives, revenir à l'état initial pour réessayer
      if (tentatives % 3 === 0) {
        // Remettre les chiffres dans leur conteneur d'origine
        digitElements.forEach((digitElement) => {
          if (digitElement.parentElement !== digitContainer) {
            digitElement.setAttribute("draggable", true);
            digitContainer.appendChild(digitElement);
          }
        });

        // Réinitialiser les zones de dépôt
        dropZones.forEach((zone) => {
          zone.innerHTML = "";
          zone.classList.remove("filled");
        });

        // Afficher un indice
        resultatElement.innerHTML = `Indice: Essaie de décomposer ${nombreActuel} en regardant la valeur de chaque position.`;
      }
    }
  }

  // Fonction pour créer des confettis
  function creerConfettis() {
    confettiContainer.innerHTML = "";

    const colors = [
      "#ff0000",
      "#00ff00",
      "#0000ff",
      "#ffff00",
      "#ff00ff",
      "#00ffff",
    ];

    for (let i = 0; i < 100; i++) {
      const confetti = document.createElement("div");
      confetti.className = "confetti";
      confetti.style.left = `${Math.random() * 100}%`;
      confetti.style.backgroundColor =
        colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDuration = `${Math.random() * 3 + 2}s`;
      confetti.style.animationDelay = `${Math.random() * 2}s`;

      confettiContainer.appendChild(confetti);
    }

    // Supprimer les confettis après 5 secondes
    setTimeout(() => {
      confettiContainer.innerHTML = "";
    }, 5000);
  }

  // Configuration des événements
  verifierBtn.addEventListener("click", verifierReponse);
  nouveauBtn.addEventListener("click", mettreAJourNombre);

  // Initialiser les zones de dépôt
  initDropZones();

  // Initialiser le jeu au chargement
  mettreAJourNombre();
});
