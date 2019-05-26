export class Utily {
  static $ = document.querySelector.bind(document);
  static $$ = document.querySelectorAll.bind(document);

  static MR = function(X) {
    return Math.random() * X;
  };
}
