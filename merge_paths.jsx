main();

function main() {
  if ( app.documents.length == 0 ) return;
  var doc = app.activeDocument;

  if ( doc.pathItems.length < 2 ) return;

  var rulerunits = app.preferences.rulerUnits;
  app.preferences.rulerUnits = Units.POINTS;

  try {
    var path1, path2;

    if ( doc.pathItems.length == 2 ) {
      path1 = doc.pathItems[0];
      path2 = doc.pathItems[1];
    } else {
      var names = [], paths = [];
      var w = new Window("dialog");
      w.orientation = "row";
      w.main = w.add("group");
      w.main.orientation = "column";
      w.main.alignChildren = ["left", "top"];
      w.main.margins[2] = 20;
      w.cbs = [];
      var actives = [];
      for ( var n = 0; n < doc.pathItems.length; n++ ) {
        w.cbs.push( w.main.add("checkbox", undefined, doc.pathItems[n].name));
        if ( n == 0 || n == 1 ) {
          w.cbs[ w.cbs.length-1 ].value = true;
          actives.push( n );
        }
        w.cbs[ w.cbs.length-1 ].ix = n;
        w.cbs[ w.cbs.length-1 ].onClick = function() {
          if ( this.value ) {
            if ( actives.length == 0 ) {
              actives.push( this.ix );
            } else if ( actives.length == 1 ) {
              actives.push( this.ix );
            } else {
              $.write( actives[0] + " -> " );
              w.cbs[ actives[0] ].value = false;
              actives.shift();
              actives.push( this.ix );
            }
            $.writeln( this.ix + " / " + actives.toSource());
          } else {
            for ( var n = actives.length -1; n >= 0; n-- ) if ( actives[n] == this.ix ) actives.splice(n,1);
            $.writeln( actives.toSource());
          }
        }

      }
      w.btns = w.add("group");
      w.btns.orientation = "column";
      w.btns.alignChildren = ["fill", "top"];
      w.defaultElement = w.btns.add("button", undefined, "OK")
      w.cancelElement = w.btns.add("button", undefined, "Abbrechen")
      var rs = w.show();
      // alert( rs + ", " + actives.toSource());
      if ( rs == 2 || actives.length != 2 ) return;
      path1 = doc.pathItems[ actives[0] ];
      path2 = doc.pathItems[ actives[1] ];
    }

    var subpaths = [];

    for ( var np = 0; np < 2; np++ ) {
      var path = [path1, path2][np];
      for ( nsp = 0; nsp < path.subPathItems.length; nsp++ ) {
        var spi = path.subPathItems[ nsp ];

        var aux = new SubPathInfo();
        aux.operation = spi.operation;
        aux.closed = spi.closed;

        aux.entireSubPath = [];
        for ( var npp = 0; npp < spi.pathPoints.length; npp++) {
          var pp = spi.pathPoints[npp];
          var pt = new PathPointInfo();
          pt.kind = pp.kind;
          pt.anchor = pp.anchor;
          pt.leftDirection = pp.leftDirection;
          pt.rightDirection = pp.rightDirection;

          aux.entireSubPath.push( pt );
        }   // pathpoint loop
        subpaths.push( aux );
      }  // subpath loop
    }    // path loop

    if ( subpaths.length == 2 ) {
      subpaths[1].operation = ShapeOperation.SHAPEXOR;
    }
    var name = path1.name;
    path1.remove();
    path2.remove();
    doc.pathItems.add(name, subpaths);
  } catch(e) {
    alert(e);
  }
  app.preferences.rulerUnits = rulerunits;


}