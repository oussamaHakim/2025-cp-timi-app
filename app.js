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
  let niveauActuel = 4; // Par défaut: niveau 4 (milliers, centaines, dizaines, unités)

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

  // Boutons de niveau
  const niveau1Btn = document.getElementById("niveau1");
  const niveau2Btn = document.getElementById("niveau2");
  const niveau3Btn = document.getElementById("niveau3");
  const niveau4Btn = document.getElementById("niveau4");

  // Fonction pour générer un nombre aléatoire selon le niveau
  function genererNombreAleatoire() {
    let min, max;

    switch (niveauActuel) {
      case 1: // Unités seulement (1-9)
        min = 1;
        max = 9;
        break;
      case 2: // Dizaines et Unités (10-99)
        min = 10;
        max = 99;
        break;
      case 3: // Centaines, Dizaines, Unités (100-999)
        min = 100;
        max = 999;
        break;
      case 4: // Milliers, Centaines, Dizaines, Unités (1000-9999)
      default:
        min = 1000;
        max = 9999;
        break;
    }

    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Mise à jour de l'interface selon le niveau
  function mettreAJourNiveau(niveau) {
    niveauActuel = niveau;

    // Mise à jour visuelle des boutons
    [niveau1Btn, niveau2Btn, niveau3Btn, niveau4Btn].forEach((btn) => {
      btn.classList.remove("ring", "ring-offset-2", "ring-blue-400");
    });

    switch (niveau) {
      case 1:
        niveau1Btn.classList.add("ring", "ring-offset-2", "ring-blue-400");
        break;
      case 2:
        niveau2Btn.classList.add("ring", "ring-offset-2", "ring-blue-400");
        break;
      case 3:
        niveau3Btn.classList.add("ring", "ring-offset-2", "ring-blue-400");
        break;
      case 4:
        niveau4Btn.classList.add("ring", "ring-offset-2", "ring-blue-400");
        break;
    }

    // Générer un nouveau nombre adapté au niveau
    mettreAJourNombre();
  }

  // Fonction pour ajuster l'affichage du tableau selon le niveau
  function ajusterAffichageTableau() {
    // On cache toutes les cellules d'en-tête et de drop d'abord
    document
      .querySelectorAll(".milliers-header, #drop-milliers")
      .forEach((el) => {
        el.style.display = niveauActuel >= 4 ? "flex" : "none";
      });

    document
      .querySelectorAll(".centaines-header, #drop-centaines")
      .forEach((el) => {
        el.style.display = niveauActuel >= 3 ? "flex" : "none";
      });

    document
      .querySelectorAll(".dizaines-header, #drop-dizaines")
      .forEach((el) => {
        el.style.display = niveauActuel >= 2 ? "flex" : "none";
      });

    // Les unités sont toujours visibles
  }

  // Fonction pour créer les éléments de chiffre glissables
  function creerElementsChiffres(nombre) {
    // Vider le conteneur
    digitContainer.innerHTML = "";
    digitElements = [];

    // Convertir le nombre en chaîne de caractères
    const nombreString = nombre.toString();
    const chiffresOriginaux = nombreString.split("");

    // Ajuster l'affichage du tableau selon le niveau actuel
    ajusterAffichageTableau();

    // Créer un ensemble de chiffres avec des distracteurs
    let tousLesChiffres = [...chiffresOriginaux];

    // Ajouter des chiffres aléatoires comme distracteurs (2-4 chiffres supplémentaires)
    const nombreDeDistracteurs = Math.floor(Math.random() * 3) + 2;
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

    // Organiser les chiffres en grille
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

      // S'assurer que le chiffre est bien visible
      digitElement.style.position = "relative";
      digitElement.style.display = "flex";
      digitElement.style.visibility = "visible";
      digitElement.style.opacity = "1";

      // Événements de drag and drop
      digitElement.addEventListener("dragstart", dragStart);
      // Double-clic pour retourner à la position initiale
      digitElement.addEventListener("dblclick", returnToContainer);

      conteneurGrille.appendChild(digitElement);
      digitElements.push(digitElement);
    });
  }

  // Fonction pour retourner un chiffre au conteneur
  function returnToContainer(e) {
    // Vérifier si le chiffre est dans une zone de drop
    if (e.target.parentElement.classList.contains("drop-zone")) {
      // Récupérer la zone de drop parente
      const dropZone = e.target.parentElement;

      // Retirer la classe "filled" de la zone
      dropZone.classList.remove("filled");

      // Rendre l'élément à nouveau draggable
      e.target.setAttribute("draggable", true);

      // Réinitialiser le style pour s'assurer que le chiffre est visible
      e.target.style.transform = "none";
      e.target.style.visibility = "visible";
      e.target.style.opacity = "1";

      // Déplacer le chiffre vers le conteneur de grille
      const grilleContainer = document.querySelector(".digit-grid");
      if (grilleContainer) {
        grilleContainer.appendChild(e.target);
      } else {
        // Si la grille n'existe pas pour une raison quelconque, créer une nouvelle
        const nouvelleGrille = document.createElement("div");
        nouvelleGrille.className = "digit-grid";
        digitContainer.appendChild(nouvelleGrille);
        nouvelleGrille.appendChild(e.target);
      }
    }
  }

  // Fonction pour mettre à jour l'affichage du nombre
  function mettreAJourNombre() {
    nombreActuel = genererNombreAleatoire();
    randomNumberElement.textContent = nombreActuel.toString();

    // Créer les éléments de chiffres glissables
    creerElementsChiffres(nombreActuel);

    // Réinitialiser les zones de dépôt
    dropZones.forEach((zone) => {
      zone.innerHTML = "";
      zone.classList.remove("filled");
    });

    // Cacher le résultat
    resultatElement.classList.add("hidden");

    // S'assurer que le conteneur de la grille est visible
    const grilleContainer = document.querySelector(".digit-grid");
    if (grilleContainer) {
      grilleContainer.style.visibility = "visible";
      grilleContainer.style.display = "grid";
    }
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

    if (niveauActuel >= 4 && dropZones[0].style.display !== "none") {
      chiffresCombines += dropZones[0].querySelector(".digit").textContent;
    }
    if (niveauActuel >= 3 && dropZones[1].style.display !== "none") {
      chiffresCombines += dropZones[1].querySelector(".digit").textContent;
    }
    if (niveauActuel >= 2 && dropZones[2].style.display !== "none") {
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

  // Configuration des événements pour les boutons de niveau
  niveau1Btn.addEventListener("click", () => mettreAJourNiveau(1));
  niveau2Btn.addEventListener("click", () => mettreAJourNiveau(2));
  niveau3Btn.addEventListener("click", () => mettreAJourNiveau(3));
  niveau4Btn.addEventListener("click", () => mettreAJourNiveau(4));

  // Configuration des événements
  verifierBtn.addEventListener("click", verifierReponse);
  nouveauBtn.addEventListener("click", mettreAJourNombre);

  // Initialiser les zones de dépôt
  initDropZones();

  // Définir le niveau par défaut (niveau 4 - tous les chiffres)
  mettreAJourNiveau(4);
});
