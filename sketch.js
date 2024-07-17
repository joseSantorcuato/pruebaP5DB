let video;
let poseNet;
let poses = [];
let startTime = null;
let timeInZone = 0;
let totalEntries = 0;
let totalTimesInZone = 0;
let averageTimeInZone = 0;

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(width, height);

  // Cargar el modelo PoseNet
  poseNet = ml5.poseNet(video, modelReady);
  poseNet.on('pose', function(results) {
    poses = results;
  });

  video.hide();
}

function modelReady() {
  console.log('Model Loaded');
}

function draw() {
  image(video, 0, 0, width, height);
  
  // Definir una zona en el canvas
  let zoneX = width / 4;
  let zoneY = height / 4;
  let zoneWidth = width / 2;
  let zoneHeight = height / 2;
  noFill();
  stroke(255, 0, 0);
  rect(zoneX, zoneY, zoneWidth, zoneHeight);
  
  // Verificar si la cabeza o la cara está en la zona con confianza > 0.5
  let personInZone = false;
  for (let i = 0; i < poses.length; i++) {
    let pose = poses[i].pose;
    let nose = pose.keypoints.find(kp => kp.part === 'nose');
    let leftEye = pose.keypoints.find(kp => kp.part === 'leftEye');
    let rightEye = pose.keypoints.find(kp => kp.part === 'rightEye');

    if (nose.score > 0.5 || leftEye.score > 0.5 || rightEye.score > 0.5) {
      if (nose.position.x > zoneX && nose.position.x < zoneX + zoneWidth &&
          nose.position.y > zoneY && nose.position.y < zoneY + zoneHeight) {
        personInZone = true;
        break;
      }
    }
  }
  
  // Actualizar el tiempo en la zona
  if (personInZone) {
    if (startTime === null) {
      startTime = millis();
      totalEntries++;
    } else {
      timeInZone = (millis() - startTime) / 1000;
    }
  } else {
    if (startTime !== null) {
      let timeSpent = (millis() - startTime) / 1000;
      totalTimesInZone += timeSpent;
      startTime = null;
      timeInZone = 0;
      
      // Calcular el promedio del tiempo en la zona
      averageTimeInZone = totalTimesInZone / totalEntries;
      
      // Enviar datos al servidor
      let data = {
        timeInZone: timeSpent,
        totalEntries: totalEntries,
        averageTimeInZone: averageTimeInZone
      };

      httpPost('save_data.php', 'json', data, (result) => {
        console.log(result);
      }, (error) => {
        console.error(error);
      });
    }
  }

  // Mostrar el tiempo actual que la persona lleva en la zona, el número de entradas y el tiempo promedio en la zona
  fill(255);
  textSize(24);
  text('Current: ' + nf(timeInZone, 1, 2) + 's', 10, height - 80);
  text('Entries: ' + totalEntries, 10, height - 50);
  text('Average: ' + nf(averageTimeInZone, 1, 2) + 's', 10, height - 20);
}
