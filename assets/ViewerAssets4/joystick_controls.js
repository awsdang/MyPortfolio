     //JoystickScript get value and change camera position
     var joy1X = document.getElementById("joy1X");
     var joy1Y = document.getElementById("joy1Y");


     var Joy1 = new JoyStick('joy1Div', {}, function(stickData) {
         joy1X.value = stickData.x;
         joy1Y.value = stickData.y;

         if (joy1X.value > 0) {
             viewer.context.ifcCamera.cameraControls.truck(0.0007 * joy1X.value + 0.0001, 0, true)
             joy1X.value + 10
         } else if (joy1X.value < 0) {
             viewer.context.ifcCamera.cameraControls.truck(0.0007 * joy1X.value + 0.0001, 0, true)
             joy1X.value - 10
         }


         if (joy1Y.value > 0) {
             viewer.context.ifcCamera.cameraControls.forward(0.0007 * joy1Y.value + 0.0001, 0, true)
             joy1Y.value + 10;
         } else if (joy1Y.value < 0) {
             viewer.context.ifcCamera.cameraControls.forward(0.0007 * joy1Y.value + 0.0001, 0, true)
             joy1Y.value - 10
         }
     });


     //make it active for mobile only

     if (window.navigator.userAgent.match(/Android/i) ||
         window.navigator.userAgent.match(/iPhone/i) ||
         window.navigator.userAgent.match(/iPad/i)) {
         document.getElementsByClassName('columnLateral')[0].style.display = 'block';
     } else {
         document.getElementsByClassName('columnLateral')[0].style.display = 'none';
     }

     //Slider for up and down
     var Slid1Y = document.getElementById("Slid1Y");
     var Slid1 = new Slider('Slid1Div', {}, function(SliderStatus) {
         Slid1Y.value = SliderStatus.y;

         if (Slid1Y.value > 0) {
             viewer.context.ifcCamera.cameraControls.truck(0, -0.0007 * Slid1Y.value, true)

         } else {
             viewer.context.ifcCamera.cameraControls.truck(0, -0.0007 * Slid1Y.value, true)

         }

     });

     //make it active for mobile only

     if (window.navigator.userAgent.match(/Android/i) ||
         window.navigator.userAgent.match(/iPhone/i) ||
         window.navigator.userAgent.match(/iPad/i)) {
         document.getElementsByClassName('columnLateral2')[0].style.display = 'block';
     } else {
         document.getElementsByClassName('columnLateral2')[0].style.display = 'none';
     }


     //Slider for up and down
     var Slid2Y = document.getElementById("Slid2Y");
     var Slid2 = new Slider('Slid2Div', {}, function(SliderStatus) {
         Slid2Y.value = SliderStatus.y;

         if (Slid2Y.value > 0) {
             viewer.context.ifcCamera.cameraControls.zoomTo(0.3 + (Slid2Y.value * 0.004), true)

         } else if (Slid2Y.value < 0) {
             viewer.context.ifcCamera.cameraControls.zoomTo(0.3 + (Slid2Y.value * 0.001), true)

         } else {}
     });

     //make it active for mobile only

     if (window.navigator.userAgent.match(/Android/i) ||
         window.navigator.userAgent.match(/iPhone/i) ||
         window.navigator.userAgent.match(/iPad/i)) {
         document.getElementsByClassName('columnLateral3')[0].style.display = 'block';
     } else {
         document.getElementsByClassName('columnLateral3')[0].style.display = 'none';
     }