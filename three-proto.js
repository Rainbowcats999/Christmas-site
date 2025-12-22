/* three-proto.js
 * Minimal three.js prototype for the snowman game.
 * Exposes: initThree(), removeNextPart3D(), resetThreeSnowman(), playConfetti3D()
 */
(function () {
  if (typeof THREE === 'undefined') {
    console.warn('three.js not loaded; 3D prototype unavailable');
    window.threeActive = false;
    return;
  }

  var root = document.querySelector('#three-root');
  var scene, camera, renderer, clock, parts = [];
  var confettiParticles = [];
  var running = false;

  function initThree() {
    if (!root) return;
    // create renderer
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setSize(root.clientWidth, root.clientHeight);
    renderer.setClearColor(0x000000, 0); // transparent
    root.appendChild(renderer.domElement);

    // scene and camera
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, root.clientWidth / root.clientHeight, 0.1, 1000);
    camera.position.set(0, 50, 220);

    // lights
    var amb = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(amb);
    var dir = new THREE.DirectionalLight(0xffffff, 0.6);
    dir.position.set(0.5, 1, 0.5);
    scene.add(dir);

    clock = new THREE.Clock();

    buildSnowman();

    window.addEventListener('resize', onResize);
    animate();

    window.threeActive = true;
    running = true;
  }

  function onResize() {
    if (!renderer) return;
    var w = root.clientWidth, h = root.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  function buildSnowman() {
    // clear existing
    parts = [];
    while (scene.children.length > 0) scene.remove(scene.children[0]);

    // add lights again
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    var dir = new THREE.DirectionalLight(0xffffff, 0.6);
    dir.position.set(0.5, 1, 0.5);
    scene.add(dir);

    // materials
    var whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, flatShading: true });
    var blackMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
    var orangeMat = new THREE.MeshStandardMaterial({ color: 0xff8c42 });
    var scarfMat = new THREE.MeshStandardMaterial({ color: 0xD96459 });
    var hatMat = new THREE.MeshStandardMaterial({ color: 0x1F2D3D });

    // bodies (bottom, middle, top)
    var bottom = new THREE.Mesh(new THREE.SphereGeometry(48, 24, 24), whiteMat);
    bottom.position.set(0, -12, 0);
    scene.add(bottom);
    parts.push({ name: 'body-bottom', mesh: bottom });

    var middle = new THREE.Mesh(new THREE.SphereGeometry(36, 22, 22), whiteMat);
    middle.position.set(0, 36, 0);
    scene.add(middle);
    parts.push({ name: 'body-middle', mesh: middle });

    var top = new THREE.Mesh(new THREE.SphereGeometry(26, 18, 18), whiteMat);
    top.position.set(0, 78, 0);
    scene.add(top);
    parts.push({ name: 'body-top', mesh: top });

    // eyes
    var leftEye = new THREE.Mesh(new THREE.SphereGeometry(3.6, 8, 8), blackMat);
    var rightEye = leftEye.clone();
    leftEye.position.set(-8, 82, 22);
    rightEye.position.set(8, 82, 22);
    scene.add(leftEye); scene.add(rightEye);
    parts.unshift({ name: 'face', mesh: leftEye }); // we group face elements under 'face' removal
    parts.unshift({ name: 'face', mesh: rightEye });

    // nose
    var nose = new THREE.Mesh(new THREE.ConeGeometry(4, 18, 10), orangeMat);
    nose.position.set(0, 78, 28);
    nose.rotation.x = Math.PI / 2;
    scene.add(nose);
    parts.unshift({ name: 'face', mesh: nose });

    // mouth (small spheres)
    for (var i = -2; i <= 2; i++) {
      var m = new THREE.Mesh(new THREE.SphereGeometry(1.8, 8, 8), blackMat);
      m.position.set(i * 4, 74 + Math.abs(i)*0.1, 22);
      scene.add(m);
      parts.unshift({ name: 'face', mesh: m });
    }

    // scarf (torus)
    var scarf = new THREE.Mesh(new THREE.TorusGeometry(28, 6, 8, 60), scarfMat);
    scarf.position.set(0, 62, 2);
    scarf.rotation.x = Math.PI / 2;
    scene.add(scarf);
    parts.push({ name: 'scarf', mesh: scarf });

    // hat (cylinder + box)
    var brim = new THREE.Mesh(new THREE.CylinderGeometry(32, 32, 6, 32), hatMat);
    brim.position.set(0, 105, 0);
    scene.add(brim);
    var topHat = new THREE.Mesh(new THREE.CylinderGeometry(18, 18, 30, 24), hatMat);
    topHat.position.set(0, 123, 0);
    scene.add(topHat);
    parts.unshift({ name: 'hat', mesh: brim });
    parts.unshift({ name: 'hat', mesh: topHat });

    // hands (simple cylinders)
    var handGeo = new THREE.CylinderGeometry(3.5, 3.5, 60, 8);
    var leftHand = new THREE.Mesh(handGeo, hatMat);
    leftHand.position.set(-90, 36, 0);
    leftHand.rotation.z = Math.PI/6;
    scene.add(leftHand);
    var rightHand = leftHand.clone();
    rightHand.position.set(90, 36, 0);
    rightHand.rotation.z = -Math.PI/6;
    scene.add(rightHand);
    parts.push({ name: 'hands', mesh: leftHand });
    parts.push({ name: 'hands', mesh: rightHand });

    // ground subtle plane
    var plane = new THREE.Mesh(new THREE.PlaneGeometry(450, 300), new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0, transparent: true }));
    plane.rotation.x = -Math.PI/2;
    plane.position.y = -80;
    scene.add(plane);
  }

  // removal animation: scale down and fall/rotate
  function animateRemoval(mesh, done) {
    var duration = 700;
    var start = performance.now();
    var sx = mesh.scale.x, sy = mesh.scale.y, sz = mesh.scale.z;
    var startPos = mesh.position.clone();
    function tick(now) {
      var t = (now - start) / duration;
      if (t >= 1) {
        try { scene.remove(mesh); } catch (e) {}
        if (done) done();
        return;
      }
      var ease = 1 - Math.pow(1 - t, 3);
      mesh.scale.setScalar(1 - ease);
      mesh.position.y = startPos.y - ease * 90;
      mesh.rotation.x += 0.08;
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function removeNextPart3D() {
    // Pop the next part from the end of parts order that matches the logical order
    // We'll follow a removal order similar to the CSS game: hat, face, scarf, hands, body-top, body-middle, body-bottom
    var order = ['hat', 'face', 'scarf', 'hands', 'body-top', 'body-middle', 'body-bottom'];
    for (var i = 0; i < order.length; i++) {
      var name = order[i];
      // find a mesh with this name
      for (var j = 0; j < parts.length; j++) {
        if (parts[j] && parts[j].name === name) {
          var mesh = parts[j].mesh;
          parts.splice(j,1);
          animateRemoval(mesh);
          return;
        }
      }
    }
  }

  function resetThreeSnowman() {
    // clear scene and rebuild
    while (scene.children.length > 0) scene.remove(scene.children[0]);
    buildSnowman();
    onResize();
  }

  // simple confetti - spawn small boxes with random velocities
  function playConfetti3D(opts) {
    opts = opts || {};
    var count = opts.count || 72;
    var colors = opts.colors || ['#FFD166', '#F94144', '#06D6A0', '#118AB2', '#F4A261', '#8338EC'];
    for (var i = 0; i < count; i++) {
      var g = new THREE.BoxGeometry(6,2,1);
      var m = new THREE.MeshStandardMaterial({ color: colors[Math.floor(Math.random()*colors.length)]});
      var p = new THREE.Mesh(g,m);
      p.position.set((Math.random()-0.5)*220, 140 + Math.random()*30, (Math.random()-0.5)*80);
      p.userData.vel = new THREE.Vector3((Math.random()-0.5)*4, -2 - Math.random()*6, (Math.random()-0.5)*4);
      p.userData.rot = new THREE.Vector3(Math.random()*0.2, Math.random()*0.2, Math.random()*0.2);
      scene.add(p);
      confettiParticles.push(p);
    }
  }

  function animate() {
    if (!running) return;
    requestAnimationFrame(animate);
    var dt = clock.getDelta();
    // update confetti
    for (var i = confettiParticles.length - 1; i >= 0; i--) {
      var p = confettiParticles[i];
      p.position.addScaledVector(p.userData.vel, dt*30);
      p.rotation.x += p.userData.rot.x;
      p.rotation.y += p.userData.rot.y;
      p.rotation.z += p.userData.rot.z;
      p.userData.vel.y -= dt * 6; // gravity
      if (p.position.y < -120) {
        scene.remove(p);
        confettiParticles.splice(i,1);
      }
    }
    renderer.render(scene, camera);
  }

  // expose functions
  window.initThree = initThree;
  window.removeNextPart3D = removeNextPart3D;
  window.resetThreeSnowman = resetThreeSnowman;
  window.playConfetti3D = playConfetti3D;

})();
