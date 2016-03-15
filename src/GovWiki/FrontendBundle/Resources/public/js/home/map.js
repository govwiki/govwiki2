
//cdb.geo.SubLayerFactory.createSublayer = function(type, layer, position) {
//  type = type && type.toLowerCase();
//  if (!type || type === 'mapnik' || type === 'cartodb') {
//    return new CartoDBSubLayer(layer, position);
//  } else if (type === 'http') {
//    return new HttpSubLayer(layer, position);
//  } else {
//    throw 'Sublayer type not supported';
//  }
//};

//CartoDBSubLayer.prototype.setInteraction = function(active) {
//    debugger;
//    this._parent.setInteraction(this._position, active);
//};