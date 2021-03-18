// ------------------------------------------------------------------------------------------------------------------
//  merge-paths.jsx
//Description:Takes 2 Photoshop Paths and merges them into a new one
// [Ver. 1]  
// [Autor: Gerald Singelmann. ] 
// [Lang: DE]  
// [Getestet mit: Photoshop 22.3]  
// [Creat: 21-03-17]  
// Bugs & Feedback : gs@cuppascript.com
// www.cuppascript.com
// ------------------------------------------------------------------------------------------------------------------

main();

function main() {
  // --------------------------------------------------------------------------
  //  No doc or no paths? Nothing to do
  if ( app.documents.length == 0 ) return;
  var doc = app.activeDocument;

  if ( doc.pathItems.length < 2 ) return;

  // --------------------------------------------------------------------------
  //  AFAIK new paths are always created with pt as measurement
  var rulerunits = app.preferences.rulerUnits;
  app.preferences.rulerUnits = Units.POINTS;

  try {
    var path1, path2;

    if ( doc.pathItems.length == 2 ) {
      path1 = doc.pathItems[0];
      path2 = doc.pathItems[1];
    } else {
      // --------------------------------------------------------------------------
      //  More than two paths. Currently this script works on exactly two
      //  -> you need to choose
      //  Peter Kahrel's ScriptUI Guide: https://creativepro.com/files/kahrel/indesign/scriptui.html
      var names = [], paths = [];
      var w = new Window("dialog");
      w.orientation = "row";
      w.main = w.add("group");
      w.main.orientation = "column";
      w.main.alignChildren = ["left", "top"];
      w.main.margins[2] = 20;
      w.cbs = [];
      var checked = [];
      for ( var n = 0; n < doc.pathItems.length; n++ ) {
        w.cbs.push( w.main.add("checkbox", undefined, doc.pathItems[n].name));
        if ( n == 0 || n == 1 ) {
          w.cbs[ w.cbs.length-1 ].value = true;
          checked.push( n );
        }
        w.cbs[ w.cbs.length-1 ].ix = n;
        w.cbs[ w.cbs.length-1 ].onClick = function() {
          if ( this.value ) {
            if ( checked.length == 0 ) {
              checked.push( this.ix );
            } else if ( checked.length == 1 ) {
              checked.push( this.ix );
            } else {
              w.cbs[ checked[0] ].value = false;
              checked.shift();
              checked.push( this.ix );
            }
          } else {
            for ( var n = checked.length -1; n >= 0; n-- ) if ( checked[n] == this.ix ) checked.splice(n,1);
          }
        }

      }
      w.btns = w.add("group");
      w.btns.orientation = "column";
      w.btns.alignChildren = ["fill", "top"];
      w.defaultElement = w.btns.add("button", undefined, "OK")
      w.cancelElement = w.btns.add("button", undefined, "Abbrechen")
      var rs = w.show();
      // alert( rs + ", " + checked.toSource());
      if ( rs == 2 || checked.length != 2 ) return;
      path1 = doc.pathItems[ checked[0] ];
      path2 = doc.pathItems[ checked[1] ];
    }

    // --------------------------------------------------------------------------
    //  Now we have two paths in path1 and path2. Ready to merge
    //  To create a new path: Collect Arrays of PathPointInfo in an Array of SubPathInfo

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

    // --------------------------------------------------------------------------
    //  If you have two paths of one subpath each, how should the paths be combined?
    //  XOR seems to be a common sense default
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