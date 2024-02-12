import Cookie from "./cookie.js";
import { create2DArray } from "./utils.js";

/* Classe principale du jeu, c'est une grille de cookies. Le jeu se joue comme
Candy Crush Saga etc... c'est un match-3 game... */
export default class Grille {

  /**
   * Constructeur de la grille
   * @param {number} l nombre de lignes
   * @param {number} c nombre de colonnes
   */
  constructor(l, c) {
    this.c = c;
    this.l = l;
    this.cookiesCliquees = [];
    this.tabcookies = this.remplirTableauDeCookies(6)
    this.score = 0; // Ajout de la variable score
  }

  updateScore(nbCookiesAlignes) {
    if (nbCookiesAlignes === 3) {
      this.score += 1;
    } else if (nbCookiesAlignes === 4) {
      this.score += 2;
    } else if (nbCookiesAlignes === 5) {
      this.score += 3;
    }
  }

  updateScoreDisplay() {
    const scoreElement = document.getElementById("score");
    if (scoreElement) {
      scoreElement.textContent = "Score : " + this.score;
    }
  }


  /**
   * parcours la liste des divs de la grille et affiche les images des cookies
   * correspondant à chaque case. Au passage, à chaque image on va ajouter des
   * écouteurs de click et de drag'n'drop pour pouvoir interagir avec elles
   * et implémenter la logique du jeu.
   */
  showCookies() {
    let caseDivs = document.querySelectorAll("#grille div");

    caseDivs.forEach((div, index) => {
      let ligne = Math.floor(index / this.c);
      let colonne = index % this.c;

      let cookie = this.tabcookies[ligne][colonne];
      let img = cookie.htmlImage;

      img.onclick = (event) => {
        console.log("On a cliqué sur la ligne " + cookie.ligne + " et la colonne " + cookie.colonne);
        if (img.classList.contains("cookies-selected")) {
          cookie.deselectionnee();
        } else {
          img.classList.add("cookies-selected");
          cookie.selectionnee();
        }

        if (!this.cookiesCliquees.includes(cookie)) {
          this.cookiesCliquees.push(cookie);
          cookie.selectionnee();
        }
        if (this.cookiesCliquees.length === 2) {
          let cookie1 = this.cookiesCliquees[0];
          let cookie2 = this.cookiesCliquees[1];
          this.essayerDeSwapper(cookie1, cookie2);
          this.ajusterDispositionCookies();
        }
      };

      img.ondragstart = (evt) => {
        let imgClickee = evt.target;
        evt.dataTransfer.setData("pos", JSON.stringify({ ligne: cookie.ligne, colonne: cookie.colonne }));
        evt.dataTransfer.setData("cookieType", cookie.getType());
      };

      img.ondrop = (evt) => {
        evt.preventDefault();
        evt.target.classList.remove("grilleDragOver");
        let position = JSON.parse(evt.dataTransfer.getData("pos"));
        let cookie1 = this.getCookieFromLigneColonne(position.ligne, position.colonne);
        let cookieType = parseInt(evt.dataTransfer.getData("cookieType"));
        let cookie2 = this.getCookieFromLigneColonne(ligne, colonne);
        this.essayerDeSwapper(cookie1, cookie2);
      };

      div.appendChild(img);
    });
  }


  essayerDeSwapper(cookie1, cookie2) {
    if (this.swap(cookie1, cookie2)) {
      cookie2.deselectionnee();
      this.cookiesCliquees = [];
    } else {
      cookie2.deselectionnee();
      this.cookiesCliquees.splice(1, 1);
    }
  }

  swap(cookie1, cookie2) {
    // vérifier si la distance est égale à 1
    if (!Cookie.swapDistancePossible(cookie1, cookie2)) return false;

    // la distance est égale à 1, on swappe
    Cookie.swapCookies(cookie1, cookie2);

    let nbCookiesAlignes = 0;

    if (this.checkCinqCookiesAlignes()) {
      console.log("Cinq cookies alignés trouvés dans la première ligne !");
      nbCookiesAlignes = 5;
    } else if (this.checkQuatreCookiesAlignes()) {
      console.log("Quatre cookies alignés trouvés dans la première ligne !");
      nbCookiesAlignes = 4;
    } else if (this.checkTroisCookiesAlignes()) {
      console.log("Trois cookies alignés trouvés dans la première ligne !");
      nbCookiesAlignes = 3;
    }

    if (nbCookiesAlignes > 0) {
      this.updateScore(nbCookiesAlignes);
      this.updateScoreDisplay(); // Mettre à jour l'affichage du score
    }

    return true;
  }


  getCookieFromLigneColonne(l, c) {
    return this.tabcookies[l][c];
  }

  remplirTableauDeCookies(nbDeCookiesDifferents) {
    let tab = create2DArray(9);

    for (let l = 0; l < this.l; l++) {
      for (let c = 0; c < this.c; c++) {
        // on génère un nombre aléatoire entre 0 et nbDeCookiesDifferents-1
        const type = Math.floor(Math.random() * nbDeCookiesDifferents);
        //console.log(type)
        tab[l][c] = new Cookie(type, l, c);
      }
    }

    return tab;
  }

  checkCinqCookiesAlignes() {
    let alignementsTrouves = true;

    while (alignementsTrouves) {
      alignementsTrouves = false;

      // Vérification des lignes et colonnes
      for (let ligne = 0; ligne < this.l; ligne++) {
        for (let colonne = 0; colonne < this.c; colonne++) {
          // Vérification des lignes
          if (colonne < this.c - 4 &&
              this.tabcookies[ligne][colonne] &&
              this.tabcookies[ligne][colonne + 1] &&
              this.tabcookies[ligne][colonne + 2] &&
              this.tabcookies[ligne][colonne + 3] &&
              this.tabcookies[ligne][colonne + 4] &&
              this.tabcookies[ligne][colonne].getType() === this.tabcookies[ligne][colonne + 1].getType() &&
              this.tabcookies[ligne][colonne].getType() === this.tabcookies[ligne][colonne + 2].getType() &&
              this.tabcookies[ligne][colonne].getType() === this.tabcookies[ligne][colonne + 3].getType() &&
              this.tabcookies[ligne][colonne].getType() === this.tabcookies[ligne][colonne + 4].getType()) {
            // Cinq cookies alignés trouvés dans la ligne
            console.log(`Cinq cookies alignés trouvés dans la ligne ${ligne}`);
            // Supprimer les images des cookies alignés
            for (let i = 0; i < 5; i++) {
              const cookie = this.tabcookies[ligne][colonne + i];
              if (cookie) {
                const img = cookie.htmlImage;
                img.parentNode.removeChild(img); // Supprimer l'élément image du DOM
                // Réinitialiser les valeurs dans le tableau de cookies
                this.tabcookies[ligne][colonne + i] = null;
              }
            }
            alignementsTrouves = true;
          }

          // Vérification des colonnes
          if (ligne < this.l - 4 &&
              this.tabcookies[ligne][colonne] &&
              this.tabcookies[ligne + 1][colonne] &&
              this.tabcookies[ligne + 2][colonne] &&
              this.tabcookies[ligne + 3][colonne] &&
              this.tabcookies[ligne + 4][colonne] &&
              this.tabcookies[ligne][colonne].getType() === this.tabcookies[ligne + 1][colonne].getType() &&
              this.tabcookies[ligne][colonne].getType() === this.tabcookies[ligne + 2][colonne].getType() &&
              this.tabcookies[ligne][colonne].getType() === this.tabcookies[ligne + 3][colonne].getType() &&
              this.tabcookies[ligne][colonne].getType() === this.tabcookies[ligne + 4][colonne].getType()) {
            // Cinq cookies alignés trouvés dans la colonne
            console.log(`Cinq cookies alignés trouvés dans la colonne ${colonne}`);
            // Supprimer les images des cookies alignés
            for (let i = 0; i < 5; i++) {
              const cookie = this.tabcookies[ligne + i][colonne];
              if (cookie) {
                const img = cookie.htmlImage;
                img.parentNode.removeChild(img); // Supprimer l'élément image du DOM
                // Réinitialiser les valeurs dans le tableau de cookies
                this.tabcookies[ligne + i][colonne] = null;
              }
            }
            alignementsTrouves = true;
          }
        }
      }
    }
  }

  checkQuatreCookiesAlignes() {
    let alignementsTrouves = true;

    while (alignementsTrouves) {
      alignementsTrouves = false;

      // Vérification des lignes et colonnes
      for (let ligne = 0; ligne < this.l; ligne++) {
        for (let colonne = 0; colonne < this.c; colonne++) {
          // Vérification des lignes
          if (colonne < this.c - 3 &&
              this.tabcookies[ligne][colonne] &&
              this.tabcookies[ligne][colonne + 1] &&
              this.tabcookies[ligne][colonne + 2] &&
              this.tabcookies[ligne][colonne + 3] &&
              this.tabcookies[ligne][colonne].getType() === this.tabcookies[ligne][colonne + 1].getType() &&
              this.tabcookies[ligne][colonne].getType() === this.tabcookies[ligne][colonne + 2].getType() &&
              this.tabcookies[ligne][colonne].getType() === this.tabcookies[ligne][colonne + 3].getType()) {
            // Quatre cookies alignés trouvés dans la ligne
            console.log(`Quatre cookies alignés trouvés dans la ligne ${ligne}`);
            // Supprimer les images des cookies alignés
            for (let i = 0; i < 4; i++) {
              const cookie = this.tabcookies[ligne][colonne + i];
              if (cookie) {
                const img = cookie.htmlImage;
                img.parentNode.removeChild(img); // Supprimer l'élément image du DOM
                // Réinitialiser les valeurs dans le tableau de cookies
                this.tabcookies[ligne][colonne + i] = null;
              }
            }
            alignementsTrouves = true;
          }

          // Vérification des colonnes
          if (ligne < this.l - 3 &&
              this.tabcookies[ligne][colonne] &&
              this.tabcookies[ligne + 1][colonne] &&
              this.tabcookies[ligne + 2][colonne] &&
              this.tabcookies[ligne + 3][colonne] &&
              this.tabcookies[ligne][colonne].getType() === this.tabcookies[ligne + 1][colonne].getType() &&
              this.tabcookies[ligne][colonne].getType() === this.tabcookies[ligne + 2][colonne].getType() &&
              this.tabcookies[ligne][colonne].getType() === this.tabcookies[ligne + 3][colonne].getType()) {
            // Quatre cookies alignés trouvés dans la colonne
            console.log(`Quatre cookies alignés trouvés dans la colonne ${colonne}`);
            // Supprimer les images des cookies alignés
            for (let i = 0; i < 4; i++) {
              const cookie = this.tabcookies[ligne + i][colonne];
              if (cookie) {
                const img = cookie.htmlImage;
                img.parentNode.removeChild(img); // Supprimer l'élément image du DOM
                // Réinitialiser les valeurs dans le tableau de cookies
                this.tabcookies[ligne + i][colonne] = null;
              }
            }
            alignementsTrouves = true;
          }
        }
      }
    }
  }

  checkTroisCookiesAlignes() {
    let alignementsTrouves = true;

    while (alignementsTrouves) {
      alignementsTrouves = false;

      // Vérification des lignes et colonnes
      for (let ligne = 0; ligne < this.l; ligne++) {
        for (let colonne = 0; colonne < this.c; colonne++) {
          // Vérification des lignes
          if (colonne < this.c - 2 &&
              this.tabcookies[ligne][colonne] &&
              this.tabcookies[ligne][colonne + 1] &&
              this.tabcookies[ligne][colonne + 2] &&
              this.tabcookies[ligne][colonne].getType() === this.tabcookies[ligne][colonne + 1].getType() &&
              this.tabcookies[ligne][colonne].getType() === this.tabcookies[ligne][colonne + 2].getType()) {
            // Trois cookies alignés trouvés dans la ligne
            console.log(`Trois cookies alignés trouvés dans la ligne ${ligne}`);
            // Supprimer les images des cookies alignés
            for (let i = 0; i < 3; i++) {
              const cookie = this.tabcookies[ligne][colonne + i];
              if (cookie) {
                const img = cookie.htmlImage;
                img.parentNode.removeChild(img); // Supprimer l'élément image du DOM
                // Réinitialiser les valeurs dans le tableau de cookies
                this.tabcookies[ligne][colonne + i] = null;
              }
            }
            alignementsTrouves = true;
          }

          // Vérification des colonnes
          if (ligne < this.l - 2 &&
              this.tabcookies[ligne][colonne] &&
              this.tabcookies[ligne + 1][colonne] &&
              this.tabcookies[ligne + 2][colonne] &&
              this.tabcookies[ligne][colonne].getType() === this.tabcookies[ligne + 1][colonne].getType() &&
              this.tabcookies[ligne][colonne].getType() === this.tabcookies[ligne + 2][colonne].getType()) {
            // Trois cookies alignés trouvés dans la colonne
            console.log(`Trois cookies alignés trouvés dans la colonne ${colonne}`);
            // Supprimer les images des cookies alignés
            for (let i = 0; i < 3; i++) {
              const cookie = this.tabcookies[ligne + i][colonne];
              if (cookie) {
                const img = cookie.htmlImage;
                img.parentNode.removeChild(img); // Supprimer l'élément image du DOM
                // Réinitialiser les valeurs dans le tableau de cookies
                this.tabcookies[ligne + i][colonne] = null;
              }
            }
            alignementsTrouves = true;
          }
        }
      }

    }

  }

//methode qui regarde si il y a des cases vides en dessous et prend sa place instantanément
  ajusterDispositionCookies() {
    for (let colonne = 0; colonne < this.c; colonne++) {
      for (let ligne = this.l - 1; ligne >= 0; ligne--) {
        if (this.tabcookies[ligne][colonne] === null) {
          // Si la case est vide, déplacer les cookies au-dessus vers le bas
          for (let i = ligne - 1; i >= 0; i--) {
            if (this.tabcookies[i][colonne] !== null) {
              const cookie = this.tabcookies[i][colonne];
              this.tabcookies[i][colonne] = null;
              this.tabcookies[ligne][colonne] = cookie;
              cookie.htmlImage.dataset.ligne = ligne; // Mettre à jour la position dans le dataset
              cookie.ligne = ligne; // Mettre à jour la propriété ligne du cookie
              cookie.htmlImage.style.transition = `transform ${(ligne - i) * 0.1}s`;
              cookie.htmlImage.style.transform = `translateY(${(ligne - i) * 80}px)`;
              break;
            }
          }
        }
      }
    }
  }

  //méthode qui remplit les cases vides avec des cookies aléatoires
     remplirZonesVides() {
        for (let ligne = 0; ligne < this.l; ligne++) {
        for (let colonne = 0; colonne < this.c; colonne++) {
            if (this.tabcookies[ligne][colonne] === null) {
            const type = Math.floor(Math.random() * 6);
            this.tabcookies[ligne][colonne] = new Cookie(type, ligne, colonne);
            }
        }
        }
    }


}
