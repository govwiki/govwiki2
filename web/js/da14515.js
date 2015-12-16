html, body, #map {
  height: 100%;
  padding: 0;
  margin: 0; }

header,
footer {
  background-color: #0b4d70;
  -webkit-box-shadow: 2px 5px 22px -1px rgba(0, 0, 0, 0.49);
  -moz-box-shadow: 2px 5px 22px -1px rgba(0, 0, 0, 0.49);
  box-shadow: 2px 5px 22px -1px rgba(0, 0, 0, 0.49);
  z-index: 1;
  position: relative; }

header {
  height: 80px;
  padding-top: 10px; }

#map_wrap {
  position: relative;
  width: 500px;
  height: 500px;
  /*map legend circles*/ }
  #map_wrap #map {
    width: 100%;
    height: 100%; }
  #map_wrap #menu {
    position: absolute;
    list-style-type: none;
    width: 130px;
    background: #ffffff;
    font-size: 11px;
    z-index: 10;
    right: 10px;
    padding: 0;
    box-shadow: 0 0 5px gray; }
  #map_wrap #menu li {
    position: relative;
    padding: 8px 8px 8px 19px;
    background-color: #f5f5f5;
    cursor: pointer; }
  #map_wrap #menu li:first-child {
    background-color: #dddddd; }
  #map_wrap #menu li:hover {
    color: #3c763d;
    border-color: #d6e9c6;
    background-color: #dff0d8; }
  #map_wrap #menu li.selected {
    color: #3c763d;
    border-color: #d6e9c6;
    background-color: #dff0d8; }
  #map_wrap #menu a {
    color: gray;
    text-decoration: none;
    outline: none; }
  #map_wrap .marker-circle {
    display: inline-block;
    width: 12px;
    height: 12px;
    margin-left: 4px;
    margin-right: 4px;
    vertical-align: text-top;
    -webkit-border-radius: 50%;
    -moz-border-radius: 50%;
    border-radius: 50%; }
  #map_wrap .red-circle {
    background: #f00; }
  #map_wrap .blue-circle {
    background: #add8e6; }
  #map_wrap .purple-circle {
    background: #800080; }
  #map_wrap .grey-line {
    width: 12px;
    height: 2px;
    background: #808080;
    display: inline-block;
    margin: 0 4px;
    vertical-align: middle; }
  #map_wrap .glyphicon.glyphicon-ok {
    display: none;
    position: absolute;
    left: 8px;
    top: 8px; }
  #map_wrap .selected .glyphicon {
    display: inline; }
  #map_wrap div.cartodb-tooltip {
    min-width: inherit;
    margin-top: 10px;
    margin-left: 10px; }
  #map_wrap div.cartodb-tooltip-content-wrapper {
    background-color: rgba(0, 0, 0, 0.9); }
  #map_wrap div.cartodb-tooltip-content-wrapper p {
    color: white; }
  #map_wrap .leaflet-tile-pane .leaflet-layer:last-child {
    z-index: 1000; }

/*# sourceMappingURL=main.css.map */

{
"version": 3,
"mappings": "AAAA,gBAAiB;EACd,MAAM,EAAE,IAAI;EACZ,OAAO,EAAE,CAAC;EACV,MAAM,EAAE,CAAC;;AAGZ;MACO;EACJ,gBAAgB,EAAE,OAAO;EACzB,kBAAkB,EAAE,qCAAkC;EACtD,eAAe,EAAE,qCAAkC;EACnD,UAAU,EAAE,qCAAkC;EAC9C,OAAO,EAAE,CAAC;EACV,QAAQ,EAAE,QAAQ;;AAGrB,MAAO;EACJ,MAAM,EAAE,IAAI;EACZ,WAAW,EAAE,IAAI;;AAGpB,SAAU;EACP,QAAQ,EAAE,QAAQ;EAClB,KAAK,EAAE,KAAK;EACZ,MAAM,EAAE,KAAK;EAmDb,sBAAsB;EAjDtB,cAAK;IACF,KAAK,EAAE,IAAI;IACX,MAAM,EAAE,IAAI;EAGf,eAAM;IACH,QAAQ,EAAE,QAAQ;IAClB,eAAe,EAAE,IAAI;IACrB,KAAK,EAAE,KAAK;IACZ,UAAU,EAAE,OAAO;IACnB,SAAS,EAAE,IAAI;IACf,OAAO,EAAE,EAAE;IACX,KAAK,EAAE,IAAI;IACX,OAAO,EAAE,CAAC;IACV,UAAU,EAAE,YAAY;EAG3B,kBAAS;IACN,QAAQ,EAAE,QAAQ;IAClB,OAAO,EAAE,gBAAgB;IACzB,gBAAgB,EAAE,OAAO;IACzB,MAAM,EAAE,OAAO;EAGlB,8BAAqB;IAClB,gBAAgB,EAAE,OAAO;EAG5B,wBAAe;IACZ,KAAK,EAAE,OAAO;IACd,YAAY,EAAE,OAAO;IACrB,gBAAgB,EAAE,OAAO;EAG5B,2BAAkB;IACf,KAAK,EAAE,OAAO;IACd,YAAY,EAAE,OAAO;IACrB,gBAAgB,EAAE,OAAO;EAG5B,iBAAQ;IACL,KAAK,EAAE,IAAI;IACX,eAAe,EAAE,IAAI;IACrB,OAAO,EAAE,IAAI;EAOhB,wBAAe;IACZ,OAAO,EAAE,YAAY;IACrB,KAAK,EAAE,IAAI;IACX,MAAM,EAAE,IAAI;IACZ,WAAW,EAAE,GAAG;IAChB,YAAY,EAAE,GAAG;IACjB,cAAc,EAAE,QAAQ;IACxB,qBAAqB,EAAE,GAAG;IAC1B,kBAAkB,EAAE,GAAG;IACvB,aAAa,EAAE,GAAG;EAErB,qBAAY;IACT,UAAU,EAAE,IAAI;EAEnB,sBAAa;IACV,UAAU,EAAE,OAAO;EAEtB,wBAAe;IACZ,UAAU,EAAE,OAAO;EAEtB,oBAAW;IACR,KAAK,EAAE,IAAI;IACX,MAAM,EAAE,GAAG;IACX,UAAU,EAAE,OAAO;IACnB,OAAO,EAAE,YAAY;IACrB,MAAM,EAAE,KAAK;IACb,cAAc,EAAE,MAAM;EAGzB,iCAAwB;IACrB,OAAO,EAAE,IAAI;IACb,QAAQ,EAAE,QAAQ;IAClB,IAAI,EAAE,GAAG;IACT,GAAG,EAAE,GAAG;EAGX,8BAAqB;IAClB,OAAO,EAAE,MAAM;EAGlB,6BAAoB;IACjB,SAAS,EAAE,OAAO;IAClB,UAAU,EAAE,IAAI;IAChB,WAAW,EAAE,IAAI;EAGpB,6CAAoC;IACjC,gBAAgB,EAAE,kBAAkB;EAGvC,+CAAsC;IACnC,KAAK,EAAE,KAAK;EAGf,sDAA4C;IACzC,OAAO,EAAE,IAAI",
"sources": ["main.scss"],
"names": [],
"file": "main.css"
}
html, body, #map {
   height: 100%;
   padding: 0;
   margin: 0;
}

header,
footer {
   background-color: #0b4d70;
   -webkit-box-shadow: 2px 5px 22px -1px rgba(0,0,0,0.49);
   -moz-box-shadow: 2px 5px 22px -1px rgba(0,0,0,0.49);
   box-shadow: 2px 5px 22px -1px rgba(0,0,0,0.49);
   z-index: 1;
   position: relative;
}

header {
   height: 80px;
   padding-top: 10px;
}

#map_wrap {
   position: relative;
   width: 500px;
   height: 500px;

   #map {
      width: 100%;
      height: 100%;
   }

   #menu {
      position: absolute;
      list-style-type: none;
      width: 130px;
      background: #ffffff;
      font-size: 11px;
      z-index: 10;
      right: 10px;
      padding: 0;
      box-shadow: 0 0 5px gray;
   }

   #menu li {
      position: relative;
      padding: 8px 8px 8px 19px;
      background-color: #f5f5f5;
      cursor: pointer;
   }

   #menu li:first-child {
      background-color: #dddddd;
   }

   #menu li:hover {
      color: #3c763d;
      border-color: #d6e9c6;
      background-color: #dff0d8;
   }

   #menu li.selected {
      color: #3c763d;
      border-color: #d6e9c6;
      background-color: #dff0d8;
   }

   #menu a {
      color: gray;
      text-decoration: none;
      outline: none;
   }
   #menu a.selected,
   #menu a:hover {
   }

   /*map legend circles*/
   .marker-circle {
      display: inline-block;
      width: 12px;
      height: 12px;
      margin-left: 4px;
      margin-right: 4px;
      vertical-align: text-top;
      -webkit-border-radius: 50%;
      -moz-border-radius: 50%;
      border-radius: 50%;
   }
   .red-circle {
      background: #f00;
   }
   .blue-circle {
      background: #add8e6;
   }
   .purple-circle {
      background: #800080;
   }
   .grey-line {
      width: 12px;
      height: 2px;
      background: #808080;
      display: inline-block;
      margin: 0 4px;
      vertical-align: middle;
   }

   .glyphicon.glyphicon-ok {
      display: none;
      position: absolute;
      left: 8px;
      top: 8px;
   }

   .selected .glyphicon {
      display: inline;
   }

   div.cartodb-tooltip {
      min-width: inherit;
      margin-top: 10px;
      margin-left: 10px;
   }

   div.cartodb-tooltip-content-wrapper {
      background-color: rgba(0, 0, 0, 0.9);
   }

   div.cartodb-tooltip-content-wrapper p {
      color: white;
   }

   .leaflet-tile-pane .leaflet-layer:last-child{
      z-index: 1000;
   }

}

