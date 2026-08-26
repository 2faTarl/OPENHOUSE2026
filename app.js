const video = document.getElementById("video");

const canvas = document.getElementById("canvas");

const captureBtn =
    document.getElementById("captureBtn");

const switchCameraBtn =
    document.getElementById("switchCameraBtn");

const clearBtn =
    document.getElementById("clearBtn");

const countdown =
    document.getElementById("countdown");

const flash =
    document.getElementById("flash");

const gallery =
    document.getElementById("gallery");

const gallerySection =
    document.getElementById("gallerySection");

const cameraMessage =
    document.getElementById("cameraMessage");

const cameraMessageText =
    document.getElementById("cameraMessageText");

const retryCameraBtn =
    document.getElementById("retryCameraBtn");

const fullscreenBtn =
    document.getElementById("fullscreenBtn");


const previewModal =
    document.getElementById("previewModal");

const previewImage =
    document.getElementById("previewImage");

const closeModalBtn =
    document.getElementById("closeModalBtn");

const modalBackdrop =
    document.getElementById("modalBackdrop");

const downloadBtn =
    document.getElementById("downloadBtn");

const deletePhotoBtn =
    document.getElementById("deletePhotoBtn");


let stream = null;

let facingMode = "user";

let isTakingPhoto = false;

let photos = [];

let selectedPhotoId = null;


/* =====================================
   START CAMERA
===================================== */

async function startCamera() {

    stopCamera();

    cameraMessage.classList.add("hidden");

    captureBtn.disabled = true;

    try {

        const constraints = {

            audio: false,

            video: {

                facingMode: {
                    ideal: facingMode
                },

                width: {
                    ideal: 1920
                },

                height: {
                    ideal: 1080
                }

            }

        };


        stream =
            await navigator.mediaDevices.getUserMedia(
                constraints
            );


        video.srcObject = stream;


        await video.play();


        captureBtn.disabled = false;


        updateMirror();

    }

    catch (error) {

        console.error(
            "Camera Error:",
            error
        );

        captureBtn.disabled = true;

        showCameraError(error);

    }

}


/* =====================================
   STOP CAMERA
===================================== */

function stopCamera() {

    if (!stream) return;


    stream
        .getTracks()
        .forEach(track => {

            track.stop();

        });


    stream = null;

}


/* =====================================
   CAMERA ERROR
===================================== */

function showCameraError(error) {

    cameraMessage.classList.remove("hidden");


    let message =
        "Kamera tidak dapat dibuka.";


    if (
        error.name === "NotAllowedError" ||
        error.name === "PermissionDeniedError"
    ) {

        message =
            "Akses kamera ditolak. Izinkan kamera pada browser lalu tekan Coba Lagi.";

    }

    else if (
        error.name === "NotFoundError"
    ) {

        message =
            "Tidak ada kamera yang ditemukan pada perangkat ini.";

    }

    else if (
        error.name === "NotReadableError"
    ) {

        message =
            "Kamera sedang digunakan aplikasi lain. Tutup aplikasi kamera lain lalu coba kembali.";

    }

    else if (
        location.protocol !== "https:" &&
        location.hostname !== "localhost"
    ) {

        message =
            "Kamera membutuhkan HTTPS. Buka website melalui koneksi HTTPS.";

    }


    cameraMessageText.textContent =
        message;

}


/* =====================================
   MIRROR FRONT CAMERA
===================================== */

function updateMirror() {

    if (facingMode === "user") {

        video.style.transform =
            "scaleX(-1)";

    }

    else {

        video.style.transform =
            "scaleX(1)";

    }

}


/* =====================================
   SWITCH CAMERA
===================================== */

async function switchCamera() {

    if (isTakingPhoto) return;


    facingMode =
        facingMode === "user"
            ? "environment"
            : "user";


    await startCamera();

}


switchCameraBtn.addEventListener(
    "click",
    switchCamera
);


/* =====================================
   RETRY CAMERA
===================================== */

retryCameraBtn.addEventListener(
    "click",
    startCamera
);


/* =====================================
   COUNTDOWN
===================================== */

function sleep(ms) {

    return new Promise(resolve => {

        setTimeout(resolve, ms);

    });

}


async function runCountdown() {

    countdown.classList.remove("hidden");


    const numbers = [3, 2, 1];


    for (const number of numbers) {

        countdown.textContent =
            number;


        countdown.style.animation =
            "none";


        void countdown.offsetWidth;


        countdown.style.animation =
            "countdownPop 0.45s ease";


        await sleep(1000);

    }


    countdown.classList.add("hidden");

}


/* =====================================
   TAKE PHOTO
===================================== */

async function takePhoto() {

    if (isTakingPhoto) return;

    if (!stream) return;


    if (
        video.readyState <
        HTMLMediaElement.HAVE_CURRENT_DATA
    ) {

        return;

    }


    isTakingPhoto = true;

    captureBtn.disabled = true;

    switchCameraBtn.disabled = true;


    await runCountdown();


    flash.classList.remove("active");

    void flash.offsetWidth;

    flash.classList.add("active");


    captureImage();


    if (
        navigator.vibrate
    ) {

        navigator.vibrate(80);

    }


    await sleep(350);


    captureBtn.disabled = false;

    switchCameraBtn.disabled = false;

    isTakingPhoto = false;

}


captureBtn.addEventListener(
    "click",
    takePhoto
);


/* =====================================
   CAPTURE CANVAS
===================================== */

function captureImage() {

    const width =
        video.videoWidth;

    const height =
        video.videoHeight;


    if (!width || !height) {

        console.error(
            "Camera belum siap."
        );

        return;

    }


    canvas.width = width;

    canvas.height = height;


    const ctx =
        canvas.getContext("2d");


    ctx.save();


    /*
        Kamera depan di-mirror.

        Supaya hasil foto sama seperti
        yang dilihat pengguna.
    */

    if (facingMode === "user") {

        ctx.translate(
            width,
            0
        );

        ctx.scale(
            -1,
            1
        );

    }


    ctx.drawImage(
        video,
        0,
        0,
        width,
        height
    );


    ctx.restore();


    const imageData =
        canvas.toDataURL(
            "image/jpeg",
            0.95
        );


    const photo = {

        id: Date.now(),

        src: imageData,

        date: new Date()

    };


    // Hanya simpan foto paling baru.
    // Foto sebelumnya dilepas dari memory browser.
    photos = [photo];

    renderGallery();

    openPreview(
        photo.id
    );

}


/* =====================================
   RENDER GALLERY
===================================== */

function renderGallery() {

    gallery.innerHTML = "";


    if (photos.length === 0) {

        gallerySection.classList.add(
            "hidden"
        );

        return;

    }


    gallerySection.classList.remove(
        "hidden"
    );


    photos.forEach(photo => {

        const item =
            document.createElement("div");


        item.className =
            "photo-item";


        const img =
            document.createElement("img");


        img.src =
            photo.src;


        img.alt =
            "Photo Booth";


        item.appendChild(img);


        item.addEventListener(
            "click",
            () => {

                openPreview(
                    photo.id
                );

            }
        );


        gallery.appendChild(
            item
        );

    });

}


/* =====================================
   OPEN PHOTO
===================================== */

function openPreview(id) {

    const photo =
        photos.find(
            item => item.id === id
        );


    if (!photo) return;


    selectedPhotoId =
        photo.id;


    previewImage.src =
        photo.src;


    previewModal.classList.remove(
        "hidden"
    );


    document.body.style.overflow =
        "hidden";

}


/* =====================================
   CLOSE PHOTO
===================================== */

function closePreview() {

    previewModal.classList.add(
        "hidden"
    );


    previewImage.src = "";


    selectedPhotoId = null;


    document.body.style.overflow =
        "";

}


closeModalBtn.addEventListener(
    "click",
    closePreview
);


modalBackdrop.addEventListener(
    "click",
    closePreview
);


/* =====================================
   DOWNLOAD PHOTO
===================================== */

downloadBtn.addEventListener(
    "click",
    () => {

        const photo =
            photos.find(
                item =>
                    item.id ===
                    selectedPhotoId
            );


        if (!photo) return;


        const link =
            document.createElement("a");


        const now =
            new Date();


        const fileName =
            "OpenHouse2026_" +
            now.getFullYear() +
            "-" +
            String(
                now.getMonth() + 1
            ).padStart(2, "0") +
            "-" +
            String(
                now.getDate()
            ).padStart(2, "0") +
            "_" +
            String(
                now.getHours()
            ).padStart(2, "0") +
            "-" +
            String(
                now.getMinutes()
            ).padStart(2, "0") +
            "-" +
            String(
                now.getSeconds()
            ).padStart(2, "0") +
            ".jpg";


        link.href =
            photo.src;


        link.download =
            fileName;


        document.body.appendChild(
            link
        );


        link.click();


        link.remove();

    }
);


/* =====================================
   DELETE ONE PHOTO
===================================== */

deletePhotoBtn.addEventListener(
    "click",
    () => {

        if (!selectedPhotoId) return;


        photos =
            photos.filter(
                photo =>
                    photo.id !==
                    selectedPhotoId
            );


        closePreview();


        renderGallery();

    }
);


/* =====================================
   CLEAR ALL PHOTOS
===================================== */

clearBtn.addEventListener(
    "click",
    () => {

        if (
            photos.length === 0
        ) {

            return;

        }


        const confirmed =
            confirm(
                "Hapus semua hasil foto?"
            );


        if (!confirmed) return;


        photos = [];


        closePreview();


        renderGallery();

    }
);


/* =====================================
   FULLSCREEN
===================================== */

fullscreenBtn.addEventListener(
    "click",
    async () => {

        try {

            if (
                !document.fullscreenElement
            ) {

                await document
                    .documentElement
                    .requestFullscreen();

            }

            else {

                await document
                    .exitFullscreen();

            }

        }

        catch (error) {

            console.log(
                "Fullscreen tidak tersedia:",
                error
            );

        }

    }
);


/* =====================================
   KEYBOARD
===================================== */

document.addEventListener(
    "keydown",
    event => {

        /*
            SPACE = FOTO
        */

        if (
            event.code === "Space" &&
            previewModal.classList.contains(
                "hidden"
            )
        ) {

            event.preventDefault();

            takePhoto();

        }


        /*
            ESC = CLOSE
        */

        if (
            event.key === "Escape"
        ) {

            closePreview();

        }

    }
);


/* =====================================
   PAGE VISIBILITY
===================================== */

document.addEventListener(
    "visibilitychange",
    () => {

        /*
        Saat browser kembali aktif
        dan kamera terputus,
        coba aktifkan lagi.
        */

        if (
            document.visibilityState === "visible" &&
            !stream
        ) {

            startCamera();

        }

    }
);


/* =====================================
   CLEANUP
===================================== */

window.addEventListener(
    "beforeunload",
    () => {

        stopCamera();

    }
);


/* =====================================
   INITIALIZE
===================================== */

function initialize() {

    /*
        Cek browser support.
    */

    if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
    ) {

        cameraMessage.classList.remove(
            "hidden"
        );

        cameraMessageText.textContent =
            "Browser ini tidak mendukung akses kamera.";

        captureBtn.disabled = true;

        return;

    }


    startCamera();

}


initialize();