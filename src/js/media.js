/* ── Photos ────────────────────────────────────────────────────────
   There is no file store behind this page, so a photo has to travel
   inside the listing record. Every picture is therefore decoded, scaled
   down and re-encoded as JPEG on the seller's own device before it is
   saved — the original file never leaves the browser.                  */

(function (HO) {
  var MAX_EDGE  = 1100;   /* px on the long side */
  var TARGET    = 90000;  /* bytes per photo, before base64 */
  var HARD_CAP  = 160000; /* give up past this */

  function readAsImage(file) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () { URL.revokeObjectURL(url); resolve(img); };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error("decode")); };
      img.src = url;
    });
  }

  function draw(img, edge) {
    var scale = Math.min(1, edge / Math.max(img.naturalWidth, img.naturalHeight));
    var c = document.createElement("canvas");
    c.width  = Math.max(1, Math.round(img.naturalWidth  * scale));
    c.height = Math.max(1, Math.round(img.naturalHeight * scale));
    var ctx = c.getContext("2d");
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, c.width, c.height);
    return c;
  }

  function bytesOf(dataUrl) {
    var i = dataUrl.indexOf(",");
    return Math.round((dataUrl.length - i - 1) * 0.75);
  }

  /* Resolves a JPEG data URI small enough to store, or rejects. */
  HO.shrinkImage = function (file) {
    return readAsImage(file).then(function (img) {
      var edge = MAX_EDGE;
      var out = null;
      for (var pass = 0; pass < 4; pass++) {
        var canvas = draw(img, edge);
        var q = 0.78;
        for (var i = 0; i < 4; i++) {
          out = canvas.toDataURL("image/jpeg", q);
          if (bytesOf(out) <= TARGET) return out;
          q -= 0.14;
        }
        edge = Math.round(edge * 0.75);
      }
      if (out && bytesOf(out) <= HARD_CAP) return out;
      throw new Error("too-large");
    });
  };

  /* A small cover image that rides inside the listing record itself, so
     the browse grid can draw a photo without fetching the full set. */
  HO.makeThumb = function (dataUrl) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () {
        var c = draw(img, 440);
        resolve(c.toDataURL("image/jpeg", 0.6));
      };
      img.onerror = function () { reject(new Error("decode")); };
      img.src = dataUrl;
    });
  };

  HO.photoBytes = bytesOf;
})(window.HO);
