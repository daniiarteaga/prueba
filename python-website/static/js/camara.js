
// Our input frames will come from here.
const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const canvasCtx = canvasElement.getContext('2d');

// Optimization: Turn off animated spinner after its hiding animation is done.
const spinner = document.querySelector('.loading');
spinner.ontransitionend = () => {
  spinner.style.display = 'none';
};

var lastSignalTime = 0; // datetime of last signal
const waitTime = 10 * 1000; // wait time between signals

function onResults(results) {
  // Hide the spinner.
  document.body.classList.add('loaded');

  // Draw the overlays.
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
  if (results.multiHandLandmarks && results.multiHandedness) {
    for (let index = 0; index < results.multiHandLandmarks.length; index++) {
      const classification = results.multiHandedness[index];
      const isRightHand = classification.label === 'Right';
      const landmarks = results.multiHandLandmarks[index];
      const dx = (landmarks[4].x - landmarks[8].x),
            dy = (landmarks[4].y - landmarks[8].y),
            dist = Math.sqrt(dx*dx + dy*dy);
      const dx2 = (landmarks[12].x - landmarks[8].x),
            dy2 = (landmarks[12].y - landmarks[8].y),
            dist2 = Math.sqrt(dx2*dx2 + dy2*dy2);
      if (dist < 0.05 && dist2 > 0.1 && (Date.now() - lastSignalTime) > waitTime) {
        lastSignalTime = Date.now();
        console.log("Closed fingers: ", dist);

        fetch(new Request("https://maker.ifttt.com/trigger/fingers_closed/with/key/hoh9xWbqlvvYjr5_cIJ2ozevc-AQ8H760vhXNv4_cWu")).then((data) => {
          console.log("Got: " + data);
        });
      }
      drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS,
          {color: isRightHand ? '#00FF00' : '#FF0000'});
      drawLandmarks(canvasCtx, landmarks, {
        color: isRightHand ? '#00FF00' : '#FF0000',
        fillColor: isRightHand ? '#FF0000' : '#00FF00'
      });
    }
  }
  canvasCtx.restore();
}

const hands = new Hands({locateFile: (file) => {
  return `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.1/${file}`;
}});
hands.onResults(onResults);

/**
 * Instantiate a camera. We'll feed each frame we receive into the solution.
 */
var toggle = true;

const camera = new Camera(videoElement, {
  onFrame: async () => {
    toggle = !toggle;
    if (toggle)
    await hands.send({image: videoElement});
  },
  width: 640,
  height: 360
});
camera.start();
