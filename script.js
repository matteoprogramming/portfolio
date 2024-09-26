// Selects the menu icon and navbar elements from the DOM.
let menuIcon = document.querySelector('#menu-icon');
let navbar = document.querySelector('.navbar');

// Selects all section elements and navigation links for scroll functionality.
let sections = document.querySelectorAll('section');
let navLinks = document.querySelectorAll('header nav a');

window.onscroll = () => {
    sections.forEach(sec => {
        let top = window.scrollY;
        let offset = sec.offsetTop - 150;
        let height = sec.offsetHeight;
        let id = sec.getAttribute('id');

        if (top >= offset && top < offset + height) {
            navLinks.forEach(link => link.classList.remove('active'));
            document.querySelector('header nav a[href*=' + id + ']').classList.add('active');
        }
    });
};

menuIcon.onclick = () => {
    menuIcon.classList.toggle('bx-x');
    navbar.classList.toggle('active');
};

let canvas, ctx;
let mouseX, mouseY, mouseDown = false;
let touchX, touchY;
let lastX, lastY;

function init() {
    canvas = document.getElementById('sketchpad');
    ctx = canvas.getContext('2d');
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    resizeCanvas();

    if (ctx) {
        canvas.addEventListener('mousedown', sketchpad_mouseDown, false);
        canvas.addEventListener('mousemove', sketchpad_mouseMove, false);
        window.addEventListener('mouseup', sketchpad_mouseUp, false);
        canvas.addEventListener('touchstart', sketchpad_touchStart, false);
        canvas.addEventListener('touchmove', sketchpad_touchMove, false);
    }
}

function resizeCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
}


function draw(x, y, isDown) {
    if (isDown) {
        ctx.beginPath();
        ctx.strokeStyle = "white";
        ctx.lineWidth = 15;
        ctx.lineJoin = ctx.lineCap = 'round';
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.closePath();
        ctx.stroke();
    }
    lastX = x;
    lastY = y;
}


function sketchpad_mouseDown(e) {
    mouseDown = true;
    getMousePos(e);
    draw(mouseX, mouseY, false);
}

function sketchpad_mouseUp() {
    mouseDown = false;
}

function sketchpad_mouseMove(e) {
    getMousePos(e);
    if (mouseDown) {
        draw(mouseX, mouseY, true);
    }
}


function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    mouseX = Math.max(0, Math.min(canvas.width, mouseX));
    mouseY = Math.max(0, Math.min(canvas.height, mouseY));
}


function sketchpad_touchStart(e) {
    getTouchPos(e);
    draw(touchX, touchY, false);
    e.preventDefault();
}

function sketchpad_touchMove(e) {
    getTouchPos(e);
    draw(touchX, touchY, true);
    e.preventDefault();
}

function getTouchPos(e) {
    if (e.touches.length === 1) { 
        const rect = canvas.getBoundingClientRect(); 
        const touch = e.touches[0];

        touchX = (touch.clientX - rect.left) * (canvas.width / rect.width);
        touchY = (touch.clientY - rect.top) * (canvas.height / rect.height);

        touchX = Math.max(0, Math.min(canvas.width, touchX));
        touchY = Math.max(0, Math.min(canvas.height, touchY));
    }
}

document.getElementById('clear_button').addEventListener("click", function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
});


let model;
(async function() {
    console.log("Caricamento del modello...");
    model = await tf.loadLayersModel("model/model.json");
    console.log("Modello caricato.");
})();


function preprocessCanvas() {
    let tensor = tf.browser.fromPixels(canvas).resizeNearestNeighbor([28, 28]).mean(2).expandDims(2).expandDims().toFloat();
    return tensor.div(255.0);
}


document.getElementById('predict_button').addEventListener("click", async function() {
    let tensor = preprocessCanvas();
    let predictions = await model.predict(tensor).data();
    let results = Array.from(predictions);
    displayLabel(results);
});


function displayLabel(data) {
    let maxIndex = data.indexOf(Math.max(...data));
    let confidence = data[maxIndex];
    document.getElementById('prediction_result').innerHTML = `${maxIndex}`;
    document.getElementById('confidence').innerHTML = "Confidence: " + (confidence * 100).toFixed(2) + "%";
}


function toggleText() {
    var shortText = document.getElementById("short-text");
    var fullText = document.getElementById("full-text");
    var btn = document.getElementById("read-more-btn");

    if (fullText.style.display === "none") {
        shortText.style.display = "none";
        fullText.style.display = "block";
        btn.textContent = "Read Less"; 
    } else {
        shortText.style.display = "block";
        fullText.style.display = "none";
        btn.textContent = "Read More"; 
    }
}

const btn = document.querySelector('.btn');
const confirmationMessage = document.getElementById('confirmation-message');

document.getElementById('contact-form').addEventListener('submit', function(event) {
    event.preventDefault();

    btn.value = 'Sending...';
    btn.disabled = true; // Disabilita il pulsante
    confirmationMessage.style.visibility = 'hidden'; 

    const serviceID = 'service_t2m491c';
    const templateID = 'template_n53k175';

    emailjs.sendForm(serviceID, templateID, this)
        .then(() => {
            btn.value = 'Message Sent'; 
            confirmationMessage.textContent = 'Message sent successfully!'; 
            confirmationMessage.style.visibility = 'visible';
        }, (err) => {
            btn.value = 'Send Message';
            btn.disabled = false; // Riabilita il pulsante in caso di errore
            confirmationMessage.textContent = 'Error: Message not sent. Please try again.';
            confirmationMessage.style.visibility = 'visible'; 
        });
});
