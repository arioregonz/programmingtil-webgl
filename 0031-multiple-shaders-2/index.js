(function(global) {

  var canvas, gl, shaders = [], points = [];
  var mode = 1   // current shader

  glUtils.SL.init({ callback:function() { main(); } });

  function main() {
    // Get canvas element and check if WebGL enabled
    canvas = document.getElementById("glcanvas");
    gl = glUtils.checkWebGL(canvas);

    // Initialize the shaders and program
    var vertexShader = glUtils.getShader(gl, gl.VERTEX_SHADER, glUtils.SL.Shaders.v1.vertex),
        fragmentShader = glUtils.getShader(gl, gl.FRAGMENT_SHADER, glUtils.SL.Shaders.v1.fragment);
    var vertexShader2 = glUtils.getShader(gl, gl.VERTEX_SHADER, glUtils.SL.Shaders.v2.vertex),
        fragmentShader2 = glUtils.getShader(gl, gl.FRAGMENT_SHADER, glUtils.SL.Shaders.v2.fragment);

    shaders.push(glUtils.createProgram(gl, vertexShader, fragmentShader));
    shaders.push(glUtils.createProgram(gl, vertexShader2, fragmentShader2));

    // UI events
    canvas.addEventListener('mousedown', onmousedown);
    document.onkeydown = keyDown;

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    initBuffers(gl);
  }

  // draw!
  function draw(points) {
    var program = shaders[mode];
    gl.useProgram(program);

    var pointsArray = [], colorsArray = [], triangleArray = [];
    for (var i=0; i<points.length; i++) {
      pointsArray.push(points[i].x);
      pointsArray.push(points[i].y);
      colorsArray.push(triangleArray[i].c[0]);
      colorsArray.push(triangleArray[i].c[1]);
      colorsArray.push(triangleArray[i].c[2]);
      colorsArray.push(triangleArray[i].c[3]);
    }
    var arrays = [
      {name:'aColor', array:colorsArray, size:4},
      {name:'aPosition', array:pointsArray, size:2},
    ];
    var n = pointsArray.length/2;

    // Render the arrays
    renderBuffers(program, arrays);

    gl.clear(gl.COLOR_BUFFER_BIT);
    if (points.length < 3) {
      gl.drawArrays(gl.POINTS, 0, n);
    }
    // gl.drawArrays(gl.LINES, 0, n);
    // gl.drawArrays(gl.LINE_STRIP, 0, n);
    // gl.drawArrays(gl.LINE_LOOP, 0, n);
    //gl.drawArrays(gl.TRIANGLES, 0, n);
    //gl.drawArrays(gl.TRIANGLE_FAN, 0, n);
    else if (points.lenght >= 3) {
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
    }
  }

  // Create and set the buffers
  function initBuffers(gl) {
    for (var j=0; j<shaders.length; j++) {
      var program = shaders[j];
      var attributes = program.vertexShader.attributes;
      for (var i=0; i<attributes.length; i++) {
        program[attributes[i].name] = gl.createBuffer();
      }
    }
  }

  // Render the buffers
  function renderBuffers(program, arrays) {
    var attributes = program.vertexShader.attributes;
    for (var i=0; i<attributes.length; i++) {
      var name = attributes[i].name;
      for (var j=0; j<arrays.length; j++) {
        if (name === arrays[j].name) {
          var attr = gl.getAttribLocation(program, name);
          gl.enableVertexAttribArray(attr);
          gl.bindBuffer(gl.ARRAY_BUFFER, program[name]);
          gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arrays[j].array), gl.STATIC_DRAW);
          gl.vertexAttribPointer(attr, arrays[j].size, gl.FLOAT, false, 0, 0);
        }
      }
    }
  }

  // UI Events
  function onmousedown(event) {
    var point = uiUtils.pixelInputToGLCoord(event, canvas);
    var r = Math.random(0,1)
    var g = Math.random(0,1)
    var b = Math.random(0,1)
    point.c = [r, g, b, 1.0];
    points.push(point);
    draw();
  }

  // keydown callback
  function keyDown(event) {
    if (String.fromCharCode(event.keyCode) == "S") {
      toggleShaders();
    }
    draw()
  }

  // switch between shaders
  function toggleShaders() {
    if (mode >= shaders.length-1) mode = 0;
    else mode++;
  }


})(window || this);
