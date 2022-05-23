let SliderStatus = {
    y: 0,
};


var Slider1 = (function(container, parameters, callback) {
    parameters = parameters || {};
    var title = (typeof parameters.title === "undefined" ? "joystick" : parameters.title),
        width = (typeof parameters.width === "undefined" ? 0 : parameters.width),
        height = (typeof parameters.height === "undefined" ? 0 : parameters.height),
        internalFillColor = (typeof parameters.internalFillColor === "undefined" ? "#fff" : parameters.internalFillColor),
        internalLineWidth = (typeof parameters.internalLineWidth === "undefined" ? 2 : parameters.internalLineWidth),
        internalStrokeColor = (typeof parameters.internalStrokeColor === "undefined" ? "#D3D3D3" : parameters.internalStrokeColor),
        externalLineWidth = (typeof parameters.externalLineWidth === "undefined" ? 2 : parameters.externalLineWidth),
        externalStrokeColor = (typeof parameters.externalStrokeColor === "undefined" ? "#D3D3D3" : parameters.externalStrokeColor),
        autoReturnToCenter = (typeof parameters.autoReturnToCenter === "undefined" ? true : parameters.autoReturnToCenter);

    callback = callback || function(SliderStatus) {};

    // Create Canvas element and add it in the Container object
    var objContainer = document.getElementById(container);

    // Fixing Unable to preventDefault inside passive event listener due to target being treated as passive in Chrome [Thanks to https://github.com/artisticfox8 for this suggestion]
    objContainer.style.touchAction = "none";

    var canvas = document.createElement("canvas");
    canvas.id = title;
    if (width === 0) { width = objContainer.clientWidth; }
    if (height === 0) { height = objContainer.clientHeight; }
    canvas.width = width;
    canvas.height = height;
    objContainer.appendChild(canvas);
    var context = canvas.getContext("2d");

    var pressed = 0;
    var internalRadius = (canvas.width - ((canvas.width / 2) + 10)) / 2;
    var maxMoveStick = internalRadius + 5;
    var centerX = canvas.width / 2;
    var centerY = canvas.height / 2;
    var directionHorizontalLimitPos = canvas.width / 10;
    var directionHorizontalLimitNeg = directionHorizontalLimitPos * -1;
    var directionVerticalLimitPos = canvas.height / 10;
    var directionVerticalLimitNeg = directionVerticalLimitPos * -1;
    // Used to save current position of stick
    var movedX = centerX;
    var movedY = centerY;

    // Check if the device support the touch or not
    if ("ontouchstart" in document.documentElement) {
        canvas.addEventListener("touchstart", onTouchStart, false);
        document.addEventListener("touchmove", onTouchMove, false);
        document.addEventListener("touchend", onTouchEnd, false);
    } else {
        canvas.addEventListener("mousedown", onMouseDown, false);
        document.addEventListener("mousemove", onMouseMove, false);
        document.addEventListener("mouseup", onMouseUp, false);
    }
    // Draw the object
    drawExternal();
    drawInternal();

    /******************************************************
     * Private methods
     *****************************************************/

    /**
     * @desc Draw the external circle used as reference position
     */
    function drawExternal() {

        context.beginPath();
        context.rect(20, 10, 65, 85);

        var grd = context.createRadialGradient(0, 0, 0, 0, 0, 0);
        // Light color
        grd.addColorStop(0, internalFillColor);
        // Dark color
        grd.addColorStop(1, internalStrokeColor);
        context.fillStyle = grd;
        context.fill();
        context.lineWidth = internalLineWidth;
        context.strokeStyle = internalStrokeColor;
        context.stroke()

    }

    /**
     * @desc Draw the internal stick in the current position the user have moved it
     */

    function drawInternal() {
        context.beginPath();
        if (movedY < internalRadius) { movedY = maxMoveStick; }
        if ((movedY + internalRadius) > canvas.height) { movedY = canvas.height - (maxMoveStick); }

        context.strokeStyle = '#D3D3D3';
        context.lineWidth = 25;
        context.moveTo(movedX - 20, movedY);
        context.lineTo(movedX + 20, movedY);
        context.stroke();
        // create radial gradient
        var grd = context.createRadialGradient(0, 0, 0, 0, 0, 0);
        // Light color
        grd.addColorStop(0, internalFillColor);
        // Dark color
        grd.addColorStop(1, internalStrokeColor);
        context.fillStyle = grd;
        context.fill();
        context.lineWidth = internalLineWidth;
        context.strokeStyle = internalStrokeColor;
        context.stroke();
    }

    /**
     * @desc Events for manage touch
     */
    function onTouchStart(event) {
        pressed = 1;
    }

    function onTouchMove(event) {
        if (pressed === 1 && event.targetTouches[0].target === canvas) {
            movedY = event.targetTouches[0].pageY;
            // Manage offset
            if (canvas.offsetParent.tagName.toUpperCase() === "BODY") {
                movedY -= canvas.offsetTop;
            } else {
                movedY -= canvas.offsetParent.offsetTop;
            }
            // Delete canvas
            context.clearRect(0, 0, canvas.width, canvas.height);
            // Redraw object
            drawExternal();
            drawInternal();
            // Set attribute of callback
            SliderStatus.y = ((100 * ((movedY - centerY) / maxMoveStick)) * -1).toFixed();
            callback(SliderStatus);
        }
    }

    function onTouchEnd(event) {
        pressed = 0;
        // If required reset position store variable
        if (autoReturnToCenter) {
            movedY = centerY;
        }
        // Delete canvas
        context.clearRect(0, 0, canvas.width, canvas.height);
        // Redraw object
        drawExternal();
        drawInternal();

        // Set attribute of callback
        SliderStatus.y = ((100 * ((movedY - centerY) / maxMoveStick)) * -1).toFixed();
        callback(SliderStatus);
    }

    /**
     * @desc Events for manage mouse
     */
    function onMouseDown(event) {
        pressed = 1;
    }

    /* To simplify this code there was a new experimental feature here: https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/offsetX , but it present only in Mouse case not metod presents in Touch case :-( */
    function onMouseMove(event) {
        if (pressed === 1) {
            movedY = event.pageY;
            // Manage offset
            if (canvas.offsetParent.tagName.toUpperCase() === "BODY") {

                movedY -= canvas.offsetTop;
            } else {
                movedY -= canvas.offsetParent.offsetTop;
            }
            // Delete canvas
            context.clearRect(0, 0, canvas.width, canvas.height);
            // Redraw object
            drawExternal();
            drawInternal();

            // Set attribute of callback
            SliderStatus.y = ((100 * ((movedY - centerY) / maxMoveStick)) * -1).toFixed();

            callback(SliderStatus);
        }
    }

    function onMouseUp(event) {
        pressed = 0;
        // If required reset position store variable
        if (autoReturnToCenter) {
            movedY = centerY;
        }
        // Delete canvas
        context.clearRect(0, 0, canvas.width, canvas.height);
        // Redraw object
        drawExternal();
        drawInternal();
        // Set attribute of callback
        SliderStatus.y = ((100 * ((movedY - centerY) / maxMoveStick)) * -1).toFixed();

        callback(SliderStatus);
    }

    this.GetWidth = function() {
        return canvas.width;
    };

    this.GetHeight = function() {
        return canvas.height;
    };

    this.GetPosY = function() {
        return movedY;
    };

    this.GetY = function() {
        return ((100 * ((movedY - centerY) / maxMoveStick)) * -1).toFixed();
    };


});


var Slider2 = (function(container, parameters, callback) {
    parameters = parameters || {};
    var title = (typeof parameters.title === "undefined" ? "joystick" : parameters.title),
        width = (typeof parameters.width === "undefined" ? 0 : parameters.width),
        height = (typeof parameters.height === "undefined" ? 0 : parameters.height),
        internalFillColor = (typeof parameters.internalFillColor === "undefined" ? "#fff" : parameters.internalFillColor),
        internalLineWidth = (typeof parameters.internalLineWidth === "undefined" ? 2 : parameters.internalLineWidth),
        internalStrokeColor = (typeof parameters.internalStrokeColor === "undefined" ? "#D3D3D3" : parameters.internalStrokeColor),
        externalLineWidth = (typeof parameters.externalLineWidth === "undefined" ? 2 : parameters.externalLineWidth),
        externalStrokeColor = (typeof parameters.externalStrokeColor === "undefined" ? "#D3D3D3" : parameters.externalStrokeColor),
        autoReturnToCenter = (typeof parameters.autoReturnToCenter === "undefined" ? true : parameters.autoReturnToCenter);

    callback = callback || function(SliderStatus) {};

    // Create Canvas element and add it in the Container object
    var objContainer = document.getElementById(container);

    // Fixing Unable to preventDefault inside passive event listener due to target being treated as passive in Chrome [Thanks to https://github.com/artisticfox8 for this suggestion]
    objContainer.style.touchAction = "none";

    var canvas = document.createElement("canvas");
    canvas.id = title;
    if (width === 0) { width = objContainer.clientWidth; }
    if (height === 0) { height = objContainer.clientHeight; }
    canvas.width = width;
    canvas.height = height;
    objContainer.appendChild(canvas);
    var context = canvas.getContext("2d");

    var pressed = 0;
    var internalRadius = (canvas.width - ((canvas.width / 2) + 10)) / 2;
    var maxMoveStick = internalRadius + 5;
    var centerX = canvas.width / 2;
    var centerY = canvas.height / 2;
    var directionHorizontalLimitPos = canvas.width / 10;
    var directionHorizontalLimitNeg = directionHorizontalLimitPos * -1;
    var directionVerticalLimitPos = canvas.height / 10;
    var directionVerticalLimitNeg = directionVerticalLimitPos * -1;
    // Used to save current position of stick
    var movedX = centerX;
    var movedY = centerY;

    // Check if the device support the touch or not
    if ("ontouchstart" in document.documentElement) {
        canvas.addEventListener("touchstart", onTouchStart, false);
        document.addEventListener("touchmove", onTouchMove, false);
        document.addEventListener("touchend", onTouchEnd, false);
    } else {
        canvas.addEventListener("mousedown", onMouseDown, false);
        document.addEventListener("mousemove", onMouseMove, false);
        document.addEventListener("mouseup", onMouseUp, false);
    }
    // Draw the object
    drawExternal();
    drawInternal();

    /******************************************************
     * Private methods
     *****************************************************/

    /**
     * @desc Draw the external circle used as reference position
     */
    function drawExternal() {

        context.beginPath();
        context.rect(20, 10, 65, 85);

        var grd = context.createRadialGradient(0, 0, 0, 0, 0, 0);
        // Light color
        grd.addColorStop(0, internalFillColor);
        // Dark color
        grd.addColorStop(1, internalStrokeColor);
        context.fillStyle = grd;
        context.fill();
        context.lineWidth = internalLineWidth;
        context.strokeStyle = internalStrokeColor;
        context.stroke()

    }

    /**
     * @desc Draw the internal stick in the current position the user have moved it
     */

    function drawInternal() {
        context.beginPath();
        if (movedY < internalRadius) { movedY = maxMoveStick; }
        if ((movedY + internalRadius) > canvas.height) { movedY = canvas.height - (maxMoveStick); }

        context.strokeStyle = '#D3D3D3';
        context.lineWidth = 25;
        context.moveTo(movedX - 20, movedY);
        context.lineTo(movedX + 20, movedY);
        context.stroke();
        // create radial gradient
        var grd = context.createRadialGradient(0, 0, 0, 0, 0, 0);
        // Light color
        grd.addColorStop(0, internalFillColor);
        // Dark color
        grd.addColorStop(1, internalStrokeColor);
        context.fillStyle = grd;
        context.fill();
        context.lineWidth = internalLineWidth;
        context.strokeStyle = internalStrokeColor;
        context.stroke();
    }

    /**
     * @desc Events for manage touch
     */
    function onTouchStart(event) {
        pressed = 1;
    }

    function onTouchMove(event) {
        if (pressed === 1 && event.targetTouches[0].target === canvas) {
            movedY = event.targetTouches[0].pageY;
            // Manage offset
            if (canvas.offsetParent.tagName.toUpperCase() === "BODY") {
                movedY -= canvas.offsetTop;
            } else {
                movedY -= canvas.offsetParent.offsetTop;
            }
            // Delete canvas
            context.clearRect(0, 0, canvas.width, canvas.height);
            // Redraw object
            drawExternal();
            drawInternal();
            // Set attribute of callback
            SliderStatus.y = ((100 * ((movedY - centerY) / maxMoveStick)) * -1).toFixed();
            callback(SliderStatus);
        }
    }

    function onTouchEnd(event) {
        pressed = 0;
        // If required reset position store variable
        if (autoReturnToCenter) {
            movedY = centerY;
        }
        // Delete canvas
        context.clearRect(0, 0, canvas.width, canvas.height);
        // Redraw object
        drawExternal();
        drawInternal();

        // Set attribute of callback
        SliderStatus.y = ((100 * ((movedY - centerY) / maxMoveStick)) * -1).toFixed();
        callback(SliderStatus);
    }

    /**
     * @desc Events for manage mouse
     */
    function onMouseDown(event) {
        pressed = 1;
    }

    /* To simplify this code there was a new experimental feature here: https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/offsetX , but it present only in Mouse case not metod presents in Touch case :-( */
    function onMouseMove(event) {
        if (pressed === 1) {
            movedY = event.pageY;
            // Manage offset
            if (canvas.offsetParent.tagName.toUpperCase() === "BODY") {

                movedY -= canvas.offsetTop;
            } else {
                movedY -= canvas.offsetParent.offsetTop;
            }
            // Delete canvas
            context.clearRect(0, 0, canvas.width, canvas.height);
            // Redraw object
            drawExternal();
            drawInternal();

            // Set attribute of callback
            SliderStatus.y = ((100 * ((movedY - centerY) / maxMoveStick)) * -1).toFixed();

            callback(SliderStatus);
        }
    }

    function onMouseUp(event) {
        pressed = 0;
        // If required reset position store variable
        if (autoReturnToCenter) {
            movedY = centerY;
        }
        // Delete canvas
        context.clearRect(0, 0, canvas.width, canvas.height);
        // Redraw object
        drawExternal();
        drawInternal();
        // Set attribute of callback
        SliderStatus.y = ((100 * ((movedY - centerY) / maxMoveStick)) * -1).toFixed();

        callback(SliderStatus);
    }

    this.GetWidth = function() {
        return canvas.width;
    };

    this.GetHeight = function() {
        return canvas.height;
    };

    this.GetPosY = function() {
        return movedY;
    };

    this.GetY = function() {
        return ((100 * ((movedY - centerY) / maxMoveStick)) * -1).toFixed();
    };


});