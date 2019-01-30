let cursor = { /* Arrow keys */
        rightPressed: false,
        leftPressed: false,
        downPressed: false,
        upPressed: false
};

// Compatibility (IE <= 9 and FF <= 36)
function keyDownHandler(e) { /* Handler for keyup events */
    e.preventDefault();
    switch(e.code) {
        // Right Pressed
        case "ArrowRight":  cursor.rightPressed = true; break;
        case "Right":       cursor.rightPressed = true; break;
        case "KeyD":        cursor.rightPressed = true; break;
        // Left Pressed
        case "ArrowLeft":   cursor.leftPressed = true; break;
        case "Left":        cursor.leftPressed = true; break;
        case "KeyA":        cursor.leftPressed = true; break;
        // Up Pressed
        case "ArrowUp":     cursor.upPressed = true; break;
        case "Up":          cursor.upPressed = true; break;
        case "KeyW":        cursor.upPressed = true; break;
        // Down Pressed
        case "ArrowDown":   cursor.downPressed = true; break;
        case "Down":        cursor.downPressed = true; break;
        case "KeyS":        cursor.downPressed = true; break;
        default:
            return;
    }
}

// Compatibility (IE <= 9 and FF <= 36)
function keyUpHandler(e) { /* Handler for keyup events */
    e.preventDefault();
    switch(e.code) {
        // Right Pressed
        case "ArrowRight":  cursor.rightPressed = false; break;
        case "Right":       cursor.rightPressed = false; break;
        case "KeyD":        cursor.rightPressed = false; break;
        // Left Pressed
        case "ArrowLeft":   cursor.leftPressed = false; break;
        case "Left":        cursor.leftPressed = false; break;
        case "KeyA":        cursor.leftPressed = false; break;
        // Up Pressed
        case "ArrowUp":     cursor.upPressed = false; break;
        case "Up":          cursor.upPressed = false; break;
        case "KeyW":        cursor.upPressed = false; break;
        // Down Pressed
        case "ArrowDown":   cursor.downPressed = false; break;
        case "Down":        cursor.downPressed = false; break;
        case "KeyS":        cursor.downPressed = false; break;
        default:
            return;
    }
}

function clickHandler(e) { /* Handler for click events */
    console.log('Implement me!')
}


