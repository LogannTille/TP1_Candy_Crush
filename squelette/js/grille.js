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
      // on calcule la ligne et la colonne de la case
      // index est le numéro de la case dans la grille
      // on sait que chaque ligne contient this.c colonnes
      // er this.l lignes
      // on peut en déduire la ligne et la colonne
      // par exemple si on a 9 cases par ligne et qu'on
      // est à l'index 4
      // on est sur la ligne 0 (car 4/9 = 0) et
      // la colonne 4 (car 4%9 = 4)
      let ligne = Math.floor(index / this.l);
      let colonne = index % this.c;

      console.log("On remplit le div index=" + index + " l=" + ligne + " col=" + colonne);

      // on récupère le cookie correspondant à cette case
      let cookie = this.tabcookies[ligne][colonne];
      // on récupère l'image correspondante
      let img = cookie.htmlImage;

      img.onclick = (event) => {
        console.log("On a cliqué sur la ligne " + ligne + " et la colonne " + colonne);

        //let cookieCliquee = this.getCookieFromLC(ligne, colonne);
        console.log("Le cookie cliqué est " + cookie.ligne + " " + cookie.colonne);
        // highlight + changer classe CSS

        //on va verifier l'état de la classe, si la classe est deja selectionnée, on la deselectionne
        //sinon on la selectionne
        if(img.classList.contains("cookies-selected")){
          cookie.deselectionnee();
        }else{img.classList.add("cookies-selected");
        cookie.selectionnee();}

        if (!this.cookiesCliquees.includes(cookie)) {
          this.cookiesCliquees.push(cookie);
          cookie.selectionnee();
        }
        if (this.cookiesCliquees.length == 2) {
          let cookie1 = this.cookiesCliquees[0];
          let cookie2 = this.cookiesCliquees[1];

          this.essayerDeSwapper(cookie1, cookie2);
        }
      }

      img.ondragstart = (evt) => {
        console.log("drag start");
        let imgClickee = evt.target;


        // Save the type along with the position
        evt.dataTransfer.setData("pos", JSON.stringify(imgClickee.dataset));
        evt.dataTransfer.setData("cookieType", cookie.getType());
      };


      img.ondragover = (evt) => {
        evt.preventDefault();
      };

      img.ondragenter = (evt) => {
        evt.target.classList.add("grilleDragOver");
      };

      img.ondragleave = (evt) => {
        evt.target.classList.remove("grilleDragOver");
      };


      img.ondrop = (evt) => {
        evt.preventDefault();
        evt.target.classList.remove("grilleDragOver");

       let position = JSON.parse(evt.dataTransfer.getData("pos"));
        let cookie1 = this.getCookieFromLigneColonne(position.ligne, position.colonne);
        let cookieType = parseInt(evt.dataTransfer.getData("cookieType"));
        //second cookie à déplacer
        let cookie2 = this.getCookieFromLigneColonne(ligne, colonne);

        this.essayerDeSwapper(cookie1, cookie2);
        this.ajusterDispositionCookies();
      };


      // A FAIRE : ecouteur de drag'n'drop

      // on affiche l'image dans le div pour la faire apparaitre à l'écran.
      div.appendChild(img);
    });
  }
  essayerDeSwapper(cookie1, cookie2)  {
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

    // Ajoutez ici la vérification des trois cookies alignés dans la première ligne
    if (this.checkTroisCookiesAlignes()) {
      console.log("Trois cookies alignés dans la première ligne !");
      // Ajoutez ici votre logique pour traiter le cas des trois cookies alignés
    }

    return true;
  }


  getCookieFromLigneColonne(l, c) {
    return this.tabcookies[l][c];
  }

  remplirTableauDeCookies(nbDeCookiesDifferents) {

    let tab = create2DArray(9);

    for(let l = 0; l < this.l; l++) {
      for(let c =0; c < this.c; c++) {

        // on génère un nombre aléatoire entre 0 et nbDeCookiesDifferents-1
        const type = Math.floor(Math.random()*nbDeCookiesDifferents);
        //console.log(type)
        tab[l][c] = new Cookie(type, l, c);
      }
    }

    return tab;
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


}
